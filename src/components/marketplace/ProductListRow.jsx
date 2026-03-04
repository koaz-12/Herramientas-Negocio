import React from 'react';
/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { Check, ImageIcon, MoreVertical, Trash2 } from 'lucide-react';

export default function ProductListRow({
    product,
    isSelected,
    onToggleSelection,
    onSelectProduct,
    isSelectionMode,
    onDelete
}) {
    // Helper to get first image or fallback
    const primaryImage = product.media && product.media.length > 0
        ? product.media[0]
        : (product.images && product.images.length > 0 ? product.images[0] : null);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden bg-red-500 mb-0 shadow-sm"
        >
            {/* Background Actions (Delete) */}
            <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-end px-5">
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete && onDelete(); }}
                    className="text-white hover:scale-110 transition-transform flex flex-col items-center"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            {/* Foreground Draggable Row */}
            <motion.div
                drag={isSelectionMode ? false : "x"}
                dragConstraints={{ left: -80, right: 0 }}
                dragElastic={{ left: 0.2, right: 0 }}
                whileTap={{ cursor: "grabbing" }}
                className={`flex items-center gap-3 p-3 bg-white rounded-2xl border transition-all cursor-pointer relative z-10 ${isSelected ? 'border-blue-400 shadow-md bg-blue-50/30' : 'border-slate-100 hover:border-blue-200'}`}
                onClick={() => {
                    if (isSelectionMode) {
                        onToggleSelection(product.id);
                    } else {
                        onSelectProduct(product);
                    }
                }}
            >
                {/* Selección Visual */}
                {isSelectionMode && (
                    <div onClick={(e) => { e.stopPropagation(); onToggleSelection(product.id); }} className={`w-5 h-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer ${isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"}`}>
                        {isSelected && <Check size={14} className="text-white" />}
                    </div>
                )}

                {/* Miniatura súper compacta */}
                <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-400">
                    {primaryImage ? (
                        <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon size={16} />
                    )}
                </div>

                {/* Infos esenciales alineadas horizontalmente */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-[13px] font-bold text-slate-800 truncate leading-tight mb-0.5" title={product.name}>
                        {product.name}
                    </h4>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{product.brand}</span>
                        <span className="text-[9px] font-extrabold text-slate-400 truncate max-w-[100px]">{product.sku ? product.sku.split(',')[0] : 'Sin SKU'}</span>
                    </div>
                </div>

                {/* Precio destacado */}
                <div className="flex-shrink-0 text-right">
                    <span className="block text-sm font-black text-slate-800 dark:text-slate-900">${product.price || '0'}</span>
                </div>

                {/* Acciones Rápidas (Menú de 3 puntos oculto por ahora simulando el Layout Switcher) */}
                {!isSelectionMode && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectProduct(product); // Por ahora abre la tarjeta normal, pero servirá como affordance
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0 ml-1"
                    >
                        <MoreVertical size={16} />
                    </button>
                )}
            </motion.div>
        </motion.div>
    );
}
