import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { initialInventory } from '../data/initialInventory';
import { supabase } from '../lib/supabase';

// Helper for formatting data to Supabase schema
const formatForSupabase = (product) => {
    // We map internal product structure to the defined SQL table structure

    // Fallback: until the custom 'media' column (array) is created manually in the DB, 
    // we use the existing 'image' column (text) to save at least the first image/video URL
    const primaryImage = (product.media && product.media.length > 0)
        ? product.media[0]
        : (product.image || null);

    return {
        id: product.id,
        name: product.name,
        brand: product.brand || null,
        sku: product.sku || null,
        price: product.price ? String(product.price) : null,
        original_price: product.original_price ? String(product.original_price) : null,
        condition: product.condition || null,
        category: product.category || null,
        stock: product.stock ? Number(product.stock) : 0,
        tags: product.tags || null,
        image: primaryImage, // Volvemos a usar la columna tradicional
        titles: product.titles || [],
        descriptions: product.descriptions || [],
        synced_from_main: Boolean(product.synced_from_main)
    };
};


export const useInventoryStore = create(
    persist(
        (set, get) => ({
            products: [],
            _hasHydrated: false,
            selectedIds: [],
            searchQuery: '',
            filterBrand: 'All',
            viewMode: localStorage.getItem('inventoryViewMode') || 'grid', // 'grid' | 'list'
            isLoading: false,
            error: null,
            isOffline: false,

            setHasHydrated: (state) => set({ _hasHydrated: state }),

            // Setters for UI state
            setSearchQuery: (query) => set({ searchQuery: query }),
            setFilterBrand: (brand) => set({ filterBrand: brand }),
            setViewMode: (mode) => {
                localStorage.setItem('inventoryViewMode', mode);
                set({ viewMode: mode });
            },

            // Fetch products from Supabase
            fetchProducts: async () => {
                set({ isLoading: true, error: null, isOffline: false });
                try {
                    const { data, error } = await supabase
                        .from('marketplace_products')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (error) throw error;

                    if (data && data.length > 0) {
                        set({ products: data, _hasHydrated: true, isLoading: false, isOffline: false });
                    } else {
                        // If cloud is empty, let's trigger a seed
                        console.log("Cloud inventory empty. Auto-seeding initial catalog...");
                        await get().seedInventory();
                    }
                } catch (error) {
                    console.error('Error fetching products:', error);

                    // Si es un error de red (Failed to fetch) o de timeout, activamos modo Offline
                    const isNetworkError = error.message.includes('Failed to fetch') || error.message.includes('NetworkError');

                    set({
                        error: isNetworkError ? null : error.message,
                        isLoading: false,
                        _hasHydrated: true,
                        isOffline: isNetworkError
                    });
                    // En modo offline, NO limpiamos 'products' porque la Caché Persistente ya los tiene.
                }
            },

            // Product Actions
            addProduct: async (product) => {
                try {
                    const formattedProduct = formatForSupabase(product);
                    const { error } = await supabase
                        .from('marketplace_products')
                        .insert([formattedProduct]);

                    if (error) throw error;

                    // Update local state optimistically
                    set((state) => ({ products: [formattedProduct, ...state.products] }));
                } catch (error) {
                    console.error('Error adding product:', error);
                    throw error; // Let UI handle it
                }
            },

            updateProduct: async (updatedProduct) => {
                try {
                    const formattedProduct = formatForSupabase(updatedProduct);
                    const { error } = await supabase
                        .from('marketplace_products')
                        .update(formattedProduct)
                        .eq('id', updatedProduct.id);

                    if (error) throw error;

                    set((state) => ({
                        products: state.products.map(p => p.id === updatedProduct.id ? formattedProduct : p)
                    }));
                } catch (error) {
                    console.error('Error updating product:', error);
                    throw error;
                }
            },

            deleteProduct: async (id) => {
                try {
                    const { error } = await supabase
                        .from('marketplace_products')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;

                    set((state) => ({
                        products: state.products.filter(p => p.id !== id),
                        selectedIds: state.selectedIds.filter(selectedId => selectedId !== id)
                    }));
                } catch (error) {
                    console.error('Error deleting product:', error);
                    throw error;
                }
            },

            // Media Upload
            uploadMedia: async (file) => {
                try {
                    // Generate a unique filename: timestamp + random string + original extension
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                    const filePath = `uploads/${fileName}`; // Organizamos dentro de una carpeta uploads

                    // Upload the file to the 'product-media' bucket
                    const { error: uploadError } = await supabase.storage
                        .from('product-media')
                        .upload(filePath, file, {
                            cacheControl: '3600',
                            upsert: false // Don't overwrite existing
                        });

                    if (uploadError) throw uploadError;

                    // Get the public URL for the uploaded file
                    const { data: { publicUrl } } = supabase.storage
                        .from('product-media')
                        .getPublicUrl(filePath);

                    return publicUrl;
                } catch (error) {
                    console.error('Error uploading media:', error);
                    throw error;
                }
            },

            // Batch Actions
            toggleSelection: (id) => set((state) => ({
                selectedIds: state.selectedIds.includes(id)
                    ? state.selectedIds.filter(selectedId => selectedId !== id)
                    : [...state.selectedIds, id]
            })),
            clearSelection: () => set({ selectedIds: [] }),

            batchDelete: async () => {
                const { selectedIds } = get();
                if (selectedIds.length === 0) return;

                try {
                    const { error } = await supabase
                        .from('marketplace_products')
                        .delete()
                        .in('id', selectedIds);

                    if (error) throw error;

                    set((state) => ({
                        products: state.products.filter(p => !state.selectedIds.includes(p.id)),
                        selectedIds: []
                    }));
                } catch (error) {
                    console.error('Error batch deleting products:', error);
                    throw error;
                }
            },

            batchUpdateCategory: async (newBrand) => {
                const { selectedIds } = get();
                if (selectedIds.length === 0) return;

                try {
                    const { error } = await supabase
                        .from('marketplace_products')
                        .update({ brand: newBrand })
                        .in('id', selectedIds);

                    if (error) throw error;

                    set((state) => ({
                        products: state.products.map(p =>
                            state.selectedIds.includes(p.id) ? { ...p, brand: newBrand } : p
                        ),
                        selectedIds: []
                    }));
                } catch (error) {
                    console.error('Error batch updating brand:', error);
                    throw error;
                }
            },

            batchUpsertProducts: async (productsToUpsert) => {
                set({ isLoading: true });
                try {
                    const formattedProducts = productsToUpsert.map(formatForSupabase);

                    // Usamos upsert para insertar nuevos o actualizar existentes por el 'id'
                    const { error } = await supabase
                        .from('marketplace_products')
                        .upsert(formattedProducts, { onConflict: 'id' });

                    if (error) throw error;

                    // En lugar de intentar mergear manualmente, recargamos el inventario de Supabase para asegurar consistencia
                    await get().fetchProducts();

                    // El fetchProducts ya pone isLoading en false, así que retornamos éxito
                    return { success: true, count: formattedProducts.length };
                } catch (error) {
                    console.error('Error in batchUpsertProducts:', error);
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            // Utilities
            setProducts: (products) => set({ products }), // Local override

            clearAll: async () => {
                try {
                    // In a real scenario, you probably don't want to delete everything from the cloud without a loop or truncate.
                    // But for this tool:
                    const { error } = await supabase
                        .from('marketplace_products')
                        .delete()
                        .neq('id', 'dummy_value_to_delete_all'); // delete all

                    if (error) throw error;

                    set({ products: [], selectedIds: [] });
                } catch (error) {
                    console.error('Error clearing cloud data:', error);
                }
            },

            seedInventory: async () => {
                set({ isLoading: true });
                try {
                    const formattedInventory = initialInventory.map(formatForSupabase);

                    // Upsert handles both insert and update if conflicts occur on IDs
                    const { error } = await supabase
                        .from('marketplace_products')
                        .upsert(formattedInventory, { onConflict: 'id' });

                    if (error) throw error;

                    set({ products: formattedInventory, selectedIds: [], isLoading: false, _hasHydrated: true });
                } catch (error) {
                    console.error('Error seeding inventory:', error);
                    set({ error: error.message, isLoading: false, _hasHydrated: true });
                }
            }
        }),
        {
            name: 'inventory-offline-cache',
            storage: createJSONStorage(() => localStorage),
            // Solo persistir el array de productos. Los flags de UI (loading, etc) deben resetearse.
            partialize: (state) => ({ products: state.products }),
            onRehydrateStorage: () => (state) => {
                state.setHasHydrated(true);
            }
        }
    )
);
