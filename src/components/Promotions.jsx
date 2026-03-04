import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, Image as ImageIcon, Copy, Check, Trash2, Edit, Save, X } from 'lucide-react';

const defaultPromos = [
    {
        id: 'promo-1',
        title: 'Oferta de Fin de Semana',
        content: '¡Aprovecha nuestras ofertas especiales de fin de semana! 🚀\n\nDescuentos en toda la tienda para que te lleves lo que necesitas al mejor precio.\n📍 Visítanos en nuestra sucursal o pide a domicilio.',
        tags: '#Ofertas #FinDeSemana #Descuentos #Tecnologia',
        image: 'https://picsum.photos/seed/promo1/600/400'
    }
];

export default function Promotions() {
    const [promos, setPromos] = useState(() => {
        try {
            const saved = localStorage.getItem('business-promos');
            const parsed = saved ? JSON.parse(saved) : null;
            return Array.isArray(parsed) ? parsed : defaultPromos;
        } catch (e) {
            console.error("Error loading promos:", e);
            return defaultPromos;
        }
    });

    const [toastMessage, setToastMessage] = useState(null);
    const [editingPromo, setEditingPromo] = useState(null); // null = no editing, {} = new, {id} = edit

    useEffect(() => {
        localStorage.setItem('business-promos', JSON.stringify(promos));
    }, [promos]);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleCopy = (promo) => {
        const textToCopy = `${promo.content}\n\n${promo.tags}`.trim();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast("¡Texto copiado!");
            }).catch(() => fallbackCopy(textToCopy));
        } else {
            fallbackCopy(textToCopy);
        }
    };

    const fallbackCopy = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast("¡Texto copiado!");
        } catch {
            showToast('Error al copiar');
        }
        document.body.removeChild(textArea);
    };

    const handleDelete = (id) => {
        if (window.confirm("¿Eliminar esta publicación?")) {
            setPromos(promos.filter(p => p.id !== id));
            showToast("Publicación eliminada");
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!editingPromo.title || !editingPromo.content) {
            alert("El título y el contenido son obligatorios");
            return;
        }

        if (editingPromo.id.startsWith('new-')) {
            const newId = 'promo-' + Date.now();
            setPromos([{ ...editingPromo, id: newId }, ...promos]);
        } else {
            setPromos(promos.map(p => p.id === editingPromo.id ? editingPromo : p));
        }
        setEditingPromo(null);
        showToast("Promoción Guardada");
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditingPromo(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-4 md:py-8 min-h-full pb-28">

            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 bg-blue-600/90 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-[100] font-medium backdrop-blur-md"
                    >
                        <Check size={20} className="text-blue-200" />
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        <Megaphone className="text-blue-600" size={24} /> Publicaciones
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">Guarda textos rápidos para redes sociales</p>
                </div>

                <button
                    onClick={() => setEditingPromo({ id: 'new-', title: '', content: '', tags: '', image: '' })}
                    className="flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl font-bold shadow-md shadow-blue-500/20 transition-transform active:scale-95 text-sm"
                >
                    <Plus size={18} /> Crear Promo
                </button>
            </div>

            {promos.length === 0 ? (
                <div className="text-center bg-white border border-slate-200 rounded-3xl p-10 mt-10 shadow-sm">
                    <Megaphone size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium pb-4">No tienes publicaciones guardadas.</p>
                    <button onClick={() => setEditingPromo({ id: 'new-', title: '', content: '', tags: '', image: '' })} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold">Crear la primera</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {promos.map(promo => (
                        <div key={promo.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                            {promo.image && (
                                <div className="w-full h-40 bg-slate-100 border-b border-slate-100 overflow-hidden relative group">
                                    <img src={promo.image} alt="Promo" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                </div>
                            )}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-extrabold text-slate-800 text-lg leading-tight">{promo.title}</h3>
                                    <div className="flex gap-1 shrink-0 bg-slate-50 rounded-full p-1 border border-slate-100">
                                        <button onClick={() => setEditingPromo({ ...promo })} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><Edit size={14} /></button>
                                        <button onClick={() => handleDelete(promo.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                </div>

                                <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4 overflow-hidden relative">
                                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-600 leading-relaxed max-h-32 overflow-y-auto no-scrollbar mask-edges-bottom">
                                        {promo.content}
                                    </pre>
                                </div>

                                {promo.tags && (
                                    <p className="text-xs font-semibold text-blue-600 leading-relaxed mb-4 line-clamp-2">
                                        {promo.tags}
                                    </p>
                                )}

                                <button
                                    onClick={() => handleCopy(promo)}
                                    className="w-full mt-auto py-2.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors active:scale-[0.98]"
                                >
                                    <Copy size={16} /> Copiar Todo el Texto
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- MODAL EDIT/ADD PROMO --- */}
            <AnimatePresence>
                {editingPromo && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] bg-slate-900/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
                    >
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full max-w-lg max-h-[90vh] rounded-t-3xl md:rounded-3xl flex flex-col shadow-2xl overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/80 backdrop-blur-md sticky top-0 z-10">
                                <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                                    <Edit size={18} className="text-blue-500" />
                                    {editingPromo.id.startsWith('new-') ? 'Nueva Publicación' : 'Editar Publicación'}
                                </h3>
                                <button onClick={() => setEditingPromo(null)} className="p-2 bg-slate-200/50 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                                <form id="promoForm" onSubmit={handleSave} className="space-y-4">

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Título Interno</label>
                                        <input required type="text" value={editingPromo.title} onChange={e => setEditingPromo({ ...editingPromo, title: e.target.value })} placeholder="Ej: Especial de San Valentín" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Texto de la Publicación</label>
                                        <textarea required rows="6" value={editingPromo.content} onChange={e => setEditingPromo({ ...editingPromo, content: e.target.value })} placeholder="Escribe el copy para tus redes..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-y leading-relaxed" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Hashtags / Etiquetas</label>
                                        <textarea rows="2" value={editingPromo.tags} onChange={e => setEditingPromo({ ...editingPromo, tags: e.target.value })} placeholder="#Oferta #Tecnologia #SantoDomingo" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm md:text-xs text-blue-600 font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 flex justify-between">
                                            <span>Imagen de Referencia (Opcional)</span>
                                            <label className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold cursor-pointer hover:bg-blue-200 transition-colors">
                                                Subir Archivo
                                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                            </label>
                                        </label>

                                        {editingPromo.image ? (
                                            <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-200 w-full aspect-video bg-slate-100">
                                                <img src={editingPromo.image} className="w-full h-full object-contain" alt="Preview" />
                                                <button type="button" onClick={() => setEditingPromo({ ...editingPromo, image: '' })} className="absolute top-2 right-2 bg-slate-900/60 p-1.5 rounded-full text-white hover:bg-red-500 transition-colors backdrop-blur-md">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <input type="text" value={editingPromo.image} onChange={e => setEditingPromo({ ...editingPromo, image: e.target.value })} placeholder="https://ejemplo.com/foto.jpg o Sube un archivo." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                        )}
                                    </div>

                                </form>
                            </div>

                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
                                <button onClick={() => setEditingPromo(null)} className="px-5 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Cancelar</button>
                                <button type="submit" form="promoForm" className="px-5 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/30 flex items-center gap-2 transition-transform active:scale-95">
                                    <Save size={18} /> Guardar Publicación
                                </button>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
