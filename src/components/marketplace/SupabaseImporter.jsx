import React, { useState } from 'react';
import { Database, DownloadCloud, AlertCircle, Check, Lock, Mail, Key } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useInventoryStore } from '../../store/useInventoryStore';

export default function SupabaseImporter({ showToast }) {
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const fetchProducts = useInventoryStore(state => state.fetchProducts);

    const handleImport = async () => {
        if (!window.confirm("¿Seguro que deseas importar los datos desde 'products'? Esto añadirá SÓLO los artículos nuevos a tu catálogo local, sin borrar tus cambios actuales.")) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setStats(null);

        try {
            // 1. Fetch from source table (We are already authenticated globally in App.jsx)
            const { data: sourceData, error: sourceError } = await supabase
                .from('products')
                .select('*');

            if (sourceError) throw sourceError;

            if (!sourceData || sourceData.length === 0) {
                setError("La tabla original 'products' existe, pero está vacía para este usuario.");
                setIsLoading(false);
                return;
            }

            // 2. Obtener IDs ya existentes en marketplace_products para NO duplicar ni sobreescribir
            const { data: localData, error: localError } = await supabase
                .from('marketplace_products')
                .select('id, name');

            if (localError) throw localError;

            // Conjuntos para verificar existencia local rápida
            const existingIds = new Set(localData.map(row => String(row.id)));
            const existingNames = new Set(
                localData
                    .map(row => row.name ? row.name.toLowerCase().trim() : '')
                    .filter(name => name !== '')
            );

            // 3. Deduplicación Inteligente y Agrupación LIGERA de SKUs
            const uniqueSourceProductsMap = new Map();

            for (const item of sourceData) {
                if (!item.name) continue;

                const normalizedName = item.name.toLowerCase().trim();

                if (!uniqueSourceProductsMap.has(normalizedName)) {
                    // Si es nuevo, lo agregamos y le iniciamos un Set propio de SKUs para ir guardando sus variantes
                    const newItem = { ...item, collectedSkus: new Set() };
                    if (item.sku) newItem.collectedSkus.add(item.sku);
                    uniqueSourceProductsMap.set(normalizedName, newItem);
                } else {
                    // Si ya existe este nombre, simplemente le añadimos su SKU a la colección del producto 'Padre'
                    const existingParent = uniqueSourceProductsMap.get(normalizedName);
                    if (item.sku) existingParent.collectedSkus.add(item.sku);
                }
            }

            const uniqueSourceProducts = Array.from(uniqueSourceProductsMap.values());

            // 4. Filtrar los que YA existen en nuestra App Local
            const newProducts = uniqueSourceProducts.filter(item => {
                const itemId = String(item.id);
                const itemName = item.name || '';
                const normalizedName = itemName.toLowerCase().trim();

                // Es nuevo si el ID no existe localmente Y el nombre no existe localmente
                return !existingIds.has(itemId) && !existingNames.has(normalizedName) && item.id != null;
            });

            if (newProducts.length === 0) {
                setError("Tu catálogo ya está al día. Se filtraron duplicados y no hay productos nuevos para importar.");
                setIsLoading(false);
                return;
            }

            // 5. Mapear la estructura para insertar (Solo los nuevos)
            const mappedData = newProducts.map(item => {
                const skuArray = Array.from(item.collectedSkus);

                return {
                    id: String(item.id), // Respetamos su ID real
                    name: item.name || 'Sin nombre',
                    sku: skuArray.length > 0 ? skuArray.join(', ') : (item.sku || null), // Unimos los SKUs recolectados con comas
                    price: item.sale_price ? String(item.sale_price) : null,
                    original_price: null,
                    condition: 'New',
                    category: null,
                    brand: null,
                    stock: item.stock ? Number(item.stock) : 1,
                    image: item.imagen_url || null,
                    descriptions: [],
                    synced_from_main: true
                };
            });

            // 6. Insertar en base de datos
            const { error: insertError } = await supabase
                .from('marketplace_products')
                .insert(mappedData);

            if (insertError) throw insertError;

            // 6. Update UI
            setStats({ imported: mappedData.length });
            showToast && showToast(`${mappedData.length} productos nuevos sincronizados con éxito`);

            // Refresh global state
            await fetchProducts();

        } catch (err) {
            console.error('Import error:', err);
            setError(err.message || "Error al sincronizar con la base de datos.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-blue-50/50 rounded-[2rem] p-6 border border-blue-100 mt-6 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-blue-100 opacity-50">
                <Database size={100} />
            </div>

            <h2 className="text-lg font-bold text-blue-900 mb-1 flex items-center gap-2 relative z-10">
                <Database size={20} /> Importar Catálogo Antiguo
            </h2>
            <p className="text-sm text-blue-800/70 mb-4 relative z-10 max-w-sm">
                Sincroniza el inventario base original a esta nueva plataforma. Solo se añadirán artículos nuevos.
            </p>

            {error && (
                <div className="mb-4 text-xs font-semibold text-red-600 bg-red-100 p-3 rounded-xl flex items-start gap-2 relative z-10">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
                </div>
            )}

            {stats && (
                <div className="mb-4 text-xs font-semibold text-emerald-700 bg-emerald-100 p-3 rounded-xl flex items-center gap-2 relative z-10">
                    <Check size={16} /> ¡{stats.imported} productos listos en tu catálogo local!
                </div>
            )}

            <div className="space-y-3 mb-6 relative z-10">
                <div className="bg-white/50 border border-blue-200/50 p-4 rounded-xl flex items-center gap-3">
                    <div className="bg-blue-100/50 p-2 rounded-lg text-blue-600">
                        <Database size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700">Conexión Verificada</p>
                        <p className="text-xs text-slate-500">Credenciales validadas por sesión actual.</p>
                    </div>
                </div>
            </div>

            <button
                onClick={handleImport}
                disabled={isLoading}
                className={`w-full relative z-10 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all font-bold ${isLoading
                    ? 'bg-blue-300 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-600/20'
                    }`}
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <DownloadCloud size={18} />
                )}
                {isLoading ? 'Sincronizando bases de datos...' : 'Iniciar Importación Segura'}
            </button>
        </div>
    );
}
