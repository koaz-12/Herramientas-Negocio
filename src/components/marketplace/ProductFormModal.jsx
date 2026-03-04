import React from 'react';
// Removido import de framer-motion sin usar
import { Edit, Save, X, Sparkles, Trash2 } from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore';

const generateAutoSku = (name, brand) => {
    if (!name || !brand) return '';
    const brandPart = brand.substring(0, 3).toUpperCase();
    const namePart = name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `${brandPart}-${namePart}-${randomPart}`;
};

export default function ProductFormModal({ editingProduct, setEditingProduct, onSave }) {
    const products = useInventoryStore(state => state.products || []);
    const brands = React.useMemo(() => {
        return [...new Set(products.filter(p => p && p.brand).map(item => item.brand))];
    }, [products]);

    const [isUploading, setIsUploading] = React.useState(false);
    const uploadMedia = useInventoryStore(state => state.uploadMedia);

    const handleMediaUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        try {
            const newUrls = [];
            for (const file of files) {
                // Sube cada archivo a Supabase Storage uno por uno
                const publicUrl = await uploadMedia(file);
                newUrls.push(publicUrl);
            }

            // Agrega las nuevas URLs públicas al array
            setEditingProduct(prev => ({
                ...prev,
                media: [...(prev.media || []), ...newUrls]
            }));
        } catch (error) {
            console.error("Error al subir archivos:", error);
            alert("Hubo un error al subir el archivo. Revisa la consola.");
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Resetear input
        }
    };

    if (!editingProduct) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-slate-900/40 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6"
            onClick={() => setEditingProduct(null)}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.5 }}
                onDragEnd={(e, info) => {
                    if (info.offset.y > 100 || info.velocity.y > 500) {
                        setEditingProduct(null);
                    }
                }}
                className="bg-white/95 backdrop-blur-3xl w-full max-w-2xl h-[92vh] md:h-auto md:max-h-[85vh] rounded-t-[2.5rem] md:rounded-[2rem] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/60 overflow-hidden mt-auto md:mt-0"
            >
                {/* Indicador de arrastre para móviles */}
                < div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3 md:hidden shrink-0" />

                <div className="flex justify-between items-center p-5 pt-2 md:pt-6 border-b border-slate-200/50 bg-white/60 backdrop-blur-xl sticky top-0 z-10 transition-colors">
                    <h3 className="font-black text-xl text-slate-800 flex items-center gap-2.5 tracking-tight">
                        <Edit size={20} className="text-blue-500" />
                        {editingProduct.isNewRecord ? 'Añadir Producto' : 'Editar Producto'}
                    </h3>
                    <button onClick={() => setEditingProduct(null)} className="p-2.5 bg-white shadow-sm border border-slate-100 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-rose-500 transition-all active:scale-95 hidden md:block">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 md:p-6 flex-1 overflow-y-auto custom-scrollbar bg-transparent">
                    <form id="productForm" onSubmit={onSave} className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">ID Único</label>
                                <input required type="text" value={editingProduct.id} onChange={e => setEditingProduct({ ...editingProduct, id: e.target.value })} className="w-full bg-white/70 border border-slate-200 shadow-inner rounded-xl px-3.5 py-2.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all text-slate-700" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Marca / Pestaña</label>
                                <input required list="marcas-list" type="text" value={editingProduct.brand} onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })} className="w-full bg-white/70 border border-slate-200 shadow-inner rounded-xl px-3.5 py-2.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all text-slate-700" />
                                <datalist id="marcas-list">
                                    {brands.map(b => <option key={b} value={b} />)}
                                </datalist>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Nombre Público</label>
                            <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full bg-white/70 border border-slate-200 shadow-inner rounded-xl px-3.5 py-2.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all text-slate-700" />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-blue-50/50 p-5 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full blur-2xl -mr-10 -mt-10" />
                            <div className="md:col-span-2 relative z-10">
                                <label className="block text-[10px] font-extrabold text-blue-500 uppercase tracking-widest mb-2 flex justify-between items-center">
                                    <span>SKUs (Múltiples permitidos)</span>
                                    <button
                                        type="button"
                                        onClick={() => setEditingProduct({ ...editingProduct, sku: generateAutoSku(editingProduct.name, editingProduct.brand) })}
                                        className="text-[10px] bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white px-2 py-1 rounded-lg flex items-center gap-1.5 font-bold transition-all shadow-sm active:scale-95"
                                        title="Generar SKU Automático"
                                    >
                                        <Sparkles size={12} /> Auto
                                    </button>
                                </label>
                                <textarea
                                    rows="2"
                                    value={editingProduct.sku}
                                    onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                                    className="w-full bg-white/90 border border-blue-100 shadow-sm rounded-xl px-3 py-2 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all resize-none custom-scrollbar text-slate-700"
                                    placeholder="Ej: SKU-A, SKU-B, SKU-C..."
                                    title="Puedes separar varios SKUs con comas"
                                />
                            </div>
                            <div className="relative z-10">
                                <label className="block text-[10px] font-extrabold text-blue-500 uppercase tracking-widest mb-2">Precio</label>
                                <input type="text" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })} className="w-full bg-white/90 border border-blue-100 shadow-sm rounded-xl px-3 py-2.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all text-slate-700" />
                            </div>
                            <div className="relative z-10">
                                <label className="block text-[10px] font-extrabold text-blue-500 uppercase tracking-widest mb-2">Estado</label>
                                <input type="text" value={editingProduct.condition} onChange={e => setEditingProduct({ ...editingProduct, condition: e.target.value })} className="w-full bg-white/90 border border-blue-100 shadow-sm rounded-xl px-3 py-2.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all text-slate-700" />
                            </div>
                            <div className="relative z-10 hidden md:block md:col-span-4">
                                <label className="block text-[10px] font-extrabold text-blue-500 uppercase tracking-widest mb-2">Categoría FB</label>
                                <input type="text" value={editingProduct.category} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })} className="w-full bg-white/90 border border-blue-100 shadow-sm rounded-xl px-3 py-2.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all text-slate-700" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Títulos (separados por renglones)</label>
                            <textarea rows="3" value={(editingProduct.titles || []).join('\n')} onChange={e => setEditingProduct({ ...editingProduct, titles: e.target.value.split('\n').filter(t => t.trim() !== '') })} className="w-full bg-white/70 border border-slate-200 shadow-inner rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all resize-y text-slate-700" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Descripciones</label>
                                <button type="button" onClick={() => setEditingProduct({ ...editingProduct, descriptions: [...editingProduct.descriptions, { label: 'Nueva', text: '' }] })} className="text-[10px] bg-white border border-blue-200 text-blue-600 hover:bg-blue-60 px-3 py-1.5 rounded-lg font-bold shadow-sm active:scale-95 transition-all">Añadir</button>
                            </div>
                            {(editingProduct.descriptions || []).map((desc, idx) => (
                                <div key={idx} className="p-4 bg-white/70 shadow-inner border border-slate-200 rounded-2xl flex flex-col gap-3 relative">
                                    <button type="button" onClick={() => setEditingProduct({ ...editingProduct, descriptions: (editingProduct.descriptions || []).filter((_, i) => i !== idx) })} className="absolute top-3 right-3 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                    <input type="text" placeholder="Ej: Detallada" value={desc.label || ''} onChange={e => { const nd = [...(editingProduct.descriptions || [])]; nd[idx].label = e.target.value; setEditingProduct({ ...editingProduct, descriptions: nd }); }} className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-2 text-xs font-bold w-1/2 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all" />
                                    <textarea rows="4" value={desc.text || ''} onChange={e => { const nd = [...(editingProduct.descriptions || [])]; nd[idx].text = e.target.value; setEditingProduct({ ...editingProduct, descriptions: nd }); }} className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-2 text-xs resize-y focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all" />
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Etiquetas (Keywords)</label>
                            <textarea rows="2" value={editingProduct.tags} onChange={e => setEditingProduct({ ...editingProduct, tags: e.target.value })} className="w-full bg-white/70 border border-slate-200 shadow-inner rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all resize-y text-slate-700" />
                        </div>

                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex justify-between items-center">
                                <span>Multimedia (Fotos/Videos)</span>
                                {isUploading ? (
                                    <span className="text-[10px] bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold animate-pulse">Subiendo...</span>
                                ) : (
                                    <label className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg font-bold cursor-pointer hover:bg-blue-600 hover:text-white transition-colors shadow-sm">
                                        Subir a la nube
                                        <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
                                    </label>
                                )}
                            </label>
                            <textarea rows="3" value={(editingProduct.media || []).join('\n')} onChange={e => setEditingProduct({ ...editingProduct, media: e.target.value.split(/,\s*|\n/).map(url => url.trim()).filter(url => url !== '') })} className="w-full bg-white/70 border border-slate-200 shadow-inner rounded-xl px-3.5 py-2.5 text-[10px] font-mono focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all resize-y text-slate-600 whitespace-nowrap overflow-x-auto" placeholder="https://ejemplo.com/foto1.jpg&#10;O usa el botón para subir fotos a Supabase Storage" />
                        </div>
                    </form>
                </div>

                <div className="p-5 border-t border-slate-200/50 bg-white/60 backdrop-blur-xl flex justify-end gap-4 md:rounded-b-[2rem] transition-colors">
                    <button onClick={() => setEditingProduct(null)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all md:block hidden active:scale-95">Cancelar</button>
                    <button type="submit" form="productForm" className="w-full md:w-auto px-6 py-3 md:py-2.5 rounded-xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:to-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 transition-all active:scale-95 text-base md:text-sm">
                        <Save size={18} /> Guardar Cambios
                    </button>
                </div>
            </motion.div>
        </motion.div >
    );
}
