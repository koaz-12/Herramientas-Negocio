import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clipboard, Edit, Trash2, LayoutGrid, Type, AlignLeft,
    Tag, Image as ImageIcon, ZoomIn, Download, MessageSquare, Package
} from 'lucide-react';

export default function ProductCard({
    selectedProduct,
    onEdit,
    onDelete,
    onCopy,
    setFullscreenImage,
    downloadImage,
    handleWhatsAppShare
}) {
    if (!selectedProduct) return null;

    return (
        <AnimatePresence mode="popLayout">
            <motion.div
                key={selectedProduct.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="group"
            >
                <div className="bg-white/70 backdrop-blur-2xl border border-white/50 p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(59,130,246,0.12)] transition-all duration-500 mb-6 relative overflow-hidden">

                    {/* Subtle Gradient Glow inside the card */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="flex justify-between items-start gap-4 mb-4 relative z-10">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-slate-200/50">
                                    {selectedProduct.brand}
                                </span>
                                {selectedProduct.stock > 0 ? (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-100/50">
                                        <Package size={12} /> {selectedProduct.stock} Stock
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-rose-100/50">
                                        Agotado
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight px-1">
                                {selectedProduct.name}
                            </h2>
                        </div>

                        <div className="flex gap-2 shrink-0">
                            <button onClick={() => onEdit({ ...selectedProduct })} className="p-2.5 bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-slate-200/60 shadow-sm transition-all active:scale-95" title="Editar Producto">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => onDelete(selectedProduct.id)} className="p-2.5 bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl border border-slate-200/60 shadow-sm transition-all active:scale-95" title="Eliminar Producto">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                        {/* Info Grids */}
                        <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-200/50">
                            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5 px-1">
                                <LayoutGrid size={14} className="text-blue-500" /> Detalles Comerciales
                            </h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col justify-center group/card active:scale-[0.98] transition-all cursor-pointer hover:border-blue-300 hover:shadow-blue-500/10" onClick={() => onCopy(selectedProduct.price, 'Precio')}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Precio</span>
                                        <Clipboard size={14} className="text-slate-300 group-hover/card:text-blue-500 transition-colors" />
                                    </div>
                                    <span className="font-black text-xl text-blue-600">${selectedProduct.price}</span>
                                </div>
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col justify-center group/card transition-all relative">
                                    <div className="flex justify-between items-start mb-2 w-full active:scale-[0.98] cursor-pointer" onClick={() => onCopy(selectedProduct.sku, 'Todos los SKUs')}>
                                        <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">SKU / Ref</span>
                                        <Clipboard size={14} className="text-slate-300 group-hover/card:text-blue-500 transition-colors absolute top-4 right-4" title="Copiar todos los SKUs" />
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                                        {selectedProduct.sku ? selectedProduct.sku.split(',').map((s, idx) => (
                                            <button
                                                key={idx}
                                                onClick={(e) => { e.stopPropagation(); onCopy(s.trim(), `SKU: ${s.trim()}`); }}
                                                className="bg-slate-50 hover:bg-blue-500 hover:text-white hover:border-blue-500 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 truncate max-w-full transition-all active:scale-95 cursor-pointer"
                                                title={`Copiar SKU ${idx + 1}`}
                                            >
                                                {s.trim()}
                                            </button>
                                        )) : <span className="text-slate-400 text-xs font-semibold">N/A</span>}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col justify-center group/card active:scale-[0.98] transition-all cursor-pointer hover:border-emerald-300 hover:shadow-emerald-500/10" onClick={() => onCopy(selectedProduct.condition, 'Estado')}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Estado</span>
                                        <Clipboard size={14} className="text-slate-300 group-hover/card:text-emerald-500 transition-colors" />
                                    </div>
                                    <span className="font-bold text-emerald-600 text-sm">{selectedProduct.condition}</span>
                                </div>
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col justify-center group/card active:scale-[0.98] transition-all cursor-pointer hover:border-purple-300 hover:shadow-purple-500/10" onClick={() => onCopy(selectedProduct.category, 'Categoría')}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Categoría</span>
                                        <Clipboard size={14} className="text-slate-300 group-hover/card:text-purple-500 transition-colors shrink-0 ml-1" />
                                    </div>
                                    <span className="font-bold text-slate-700 text-sm line-clamp-1">{selectedProduct.category}</span>
                                </div>
                            </div>
                        </div>

                        {(selectedProduct.titles || []).length > 0 && (
                            <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-200/50">
                                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5 px-1">
                                    <Type size={14} className="text-purple-500" /> Variantes Títulos
                                </h3>
                                <div className="flex flex-col gap-2">
                                    {(selectedProduct.titles || []).map((title, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => onCopy(title, "Título " + (idx + 1))}
                                            className="group/btn flex items-center justify-between text-left w-full p-4 rounded-2xl bg-white border border-slate-200/60 hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5 transition-all active:scale-[0.98]"
                                        >
                                            <span className="text-sm font-bold text-slate-700 leading-snug pr-4">{title}</span>
                                            <div className="bg-slate-50 p-2 rounded-xl text-slate-400 group-hover/btn:bg-blue-50 group-hover/btn:text-blue-600 transition-colors shrink-0">
                                                <Clipboard size={16} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(selectedProduct.descriptions || []).length > 0 && (
                            <div className="px-1">
                                <div className="flex flex-col gap-4">
                                    {(selectedProduct.descriptions || []).map((desc, idx) => (
                                        <div key={idx} className="bg-white rounded-[1.5rem] border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-center bg-slate-50/50 px-5 py-3.5 border-b border-slate-100">
                                                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                                    <AlignLeft size={14} className="text-emerald-500" /> {desc.label || 'Descripción'}
                                                </h3>
                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => onCopy(desc.text || '', "Descripción " + (desc.label || idx))}
                                                    className="flex items-center gap-1.5 bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 px-3 py-1.5 rounded-lg font-bold transition-colors text-xs"
                                                >
                                                    <Clipboard size={14} /> Copiar
                                                </motion.button>
                                            </div>
                                            <div className="p-5 bg-white">
                                                <pre className="whitespace-pre-wrap font-sans text-slate-600 text-[13px] md:text-sm leading-relaxed scrollbar-hide">
                                                    {desc.text || ''}
                                                </pre>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedProduct.tags && (
                            <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-200/50">
                                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5 px-1">
                                    <Tag size={14} className="text-amber-500" /> Etiquetas
                                </h3>
                                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 relative group/tags shadow-sm flex items-center justify-between hover:border-amber-300 transition-colors">
                                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                                        {selectedProduct.tags}
                                    </p>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => onCopy(selectedProduct.tags, 'Etiquetas')}
                                        className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-400 group-hover/tags:text-amber-500 group-hover/tags:bg-amber-50 transition-colors shrink-0"
                                    >
                                        <Clipboard size={16} />
                                    </motion.button>
                                </div>
                            </div>
                        )}

                        {((selectedProduct.media && selectedProduct.media.length > 0) || (selectedProduct.images && selectedProduct.images.length > 0)) && (
                            <div className="mt-8 pt-6 border-t border-slate-100 px-1">
                                <div className="flex justify-between items-end mb-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <ImageIcon size={14} className="text-pink-500" /> Galería Visual
                                    </h3>
                                </div>

                                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 pt-1 -mx-2 px-2 md:-mx-4 md:px-4 snap-x">
                                    {(selectedProduct.media || selectedProduct.images || []).map((mediaUrl, i) => {
                                        const isVideo = mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i);
                                        return (
                                            <div key={i} className="relative min-w-[140px] md:min-w-[160px] aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 snap-center group bg-slate-100">
                                                {isVideo ? (
                                                    <video src={mediaUrl} autoPlay muted loop playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                ) : (
                                                    <img src={mediaUrl} alt={"Foto " + (i + 1)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                )}

                                                <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[1px]">
                                                    <button
                                                        onClick={() => setFullscreenImage(mediaUrl)}
                                                        className="bg-white/90 p-2.5 rounded-full text-slate-800 hover:scale-110 hover:bg-white transition-all shadow-lg"
                                                    >
                                                        <ZoomIn size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => downloadImage(mediaUrl, selectedProduct.sku + (isVideo ? "-vid" : "-img") + (i + 1) + (isVideo ? ".mp4" : ".jpg"))}
                                                        className="bg-white/90 p-2.5 rounded-full text-slate-800 hover:scale-110 hover:bg-white transition-all shadow-lg"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => handleWhatsAppShare(selectedProduct)}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white rounded-[1.5rem] font-extrabold hover:bg-[#1DA851] transition-all shadow-lg shadow-[#25D366]/20 active:scale-[0.98] mb-3"
                        >
                            <MessageSquare size={20} /> Compartir por WhatsApp
                        </button>

                        <button
                            onClick={() => {
                                const title = (selectedProduct.titles && selectedProduct.titles[0]) || selectedProduct.name;
                                const desc = (selectedProduct.descriptions && selectedProduct.descriptions[0] && selectedProduct.descriptions[0].text) || '';
                                const price = selectedProduct.price || '0';
                                onCopy(`${title}\n\n${desc}\n\nPrecio: ${price}`, 'Todo el contenido');
                            }}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-800 text-white rounded-[1.5rem] font-bold hover:bg-slate-900 shadow-md active:scale-[0.98] transition-all"
                        >
                            <Clipboard size={20} /> Copiar Todo el Texto
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
