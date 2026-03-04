import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, LayoutGrid, PackageOpen, Search, X, Grid,
  Gamepad2, Headphones, Video, Mic, Zap, ChevronRight, Image as ImageIcon,
  Clipboard, Tag, Trash2, FileJson, ZoomIn, Download, Upload, Settings
} from 'lucide-react';

import { useInventoryStore } from '../store/useInventoryStore';
import InventoryTopBar from './marketplace/InventoryTopBar';
import ProductCard from './marketplace/ProductCard';
import ProductListRow from './marketplace/ProductListRow';
import ProductFormModal from './marketplace/ProductFormModal';

const TEMPLATE_JSON = `{
  "id": "mi-producto-1",
  "brand": "DJI",
  "name": "Nombre de Producto",
  "sku": "SKU-XXX",
  "price": "1,000",
  "condition": "Nuevo",
  "category": "Electrónica",
  "titles": ["Título para Markeplace 1", "Título Opcional 2"],
  "descriptions": [
    { "label": "Detallada", "text": "Cuerpo de la descripción..." }
  ],
  "tags": "etiqueta1, etiqueta2",
  "images": ["url-foto-1.jpg", "url-foto-2.jpg"]
}`;

export default function MarketplacePro() {
  const {
    products, setProducts, addProduct, updateProduct, deleteProduct,
    selectedIds, toggleSelection, clearSelection, batchDelete, batchUpdateCategory,
    clearAll, _hasHydrated, viewMode
  } = useInventoryStore();

  const [activeBrand, setActiveBrand] = useState('TODOS');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [toastMessage, setToastMessage] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isPasting, setIsPasting] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [showCategoryGrid, setShowCategoryGrid] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    const safeProducts = (products || []).filter(p => p && p.brand);
    const brandsList = [...new Set(safeProducts.map(item => item.brand))];
    if (safeProducts.length > 0 && activeBrand !== 'TODOS' && !brandsList.includes(activeBrand)) {
      setActiveBrand('TODOS');
    }
  }, [products, activeBrand, _hasHydrated]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredProducts = (products || []).filter(p => {
    if (!p) return false;
    const matchesBrand = activeBrand === 'TODOS' || p.brand === activeBrand;
    const query = searchQuery ? searchQuery.toLowerCase() : '';
    const matchesSearch = !searchQuery ||
      (p.name || '').toLowerCase().includes(query) ||
      (p.sku || '').toLowerCase().includes(query) ||
      (p.tags || '').toLowerCase().includes(query);
    return matchesBrand && matchesSearch;
  });

  const selectedProduct = (products || []).find(p => p && p.id === selectedProductId) || (filteredProducts.length > 0 ? filteredProducts[0] : null);

  const handleExportBackup = () => {
    const data = JSON.stringify(products, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MarketplacePro_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Copia de seguridad descargada");
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          setProducts(imported);
          showToast(`Importados ${imported.length} productos`);
        } else {
          showToast("Formato de backup inválido", true);
        }
      } catch {
        showToast("Error al leer el archivo", true);
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleResetInventory = () => {
    if (window.confirm("¿Estás seguro de que quieres BORRAR TODO el inventario? Esta acción no se puede deshacer.")) {
      clearAll();
      setIsSelectionMode(false);
      showToast("Inventario limpiado por completo");
    }
  };

  const startNewProduct = () => {
    setEditingProduct({
      id: "prod-" + Date.now(),
      brand: activeBrand === 'TODOS' ? 'Nuevos' : activeBrand,
      name: '',
      sku: '',
      price: '',
      condition: 'Nuevo',
      category: '',
      titles: [''],
      descriptions: [{ label: 'Descripción Principal', text: '' }],
      tags: '',
      images: [],
      isNewRecord: true
    });
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!editingProduct.id || !editingProduct.name) {
      alert("El ID y Nombre son obligatorios");
      return;
    }

    // Clean up internal flag
    const { isNewRecord, ...productToSave } = editingProduct;

    if (isNewRecord) {
      addProduct(productToSave);
    } else {
      updateProduct(productToSave);
    }
    setEditingProduct(null);
    setSelectedProductId(productToSave.id);
    setActiveBrand(productToSave.brand || 'Otros');
    showToast("Producto Guardado");
  };

  const handlePasteSave = async () => {
    try {
      const parsed = JSON.parse(pasteContent);

      // Soportar subida masiva si es un Array de productos
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) throw new Error("El array JSON está vacío.");

        // Validación básica de que tienen ID y Nombre
        const validProducts = parsed.filter(p => p.id && p.name);
        if (validProducts.length === 0) throw new Error("Ningún producto en el array tiene 'id' y 'name' obligatorios.");

        const result = await batchUpsertProducts(validProducts);
        showToast(`¡Se importaron ${result.count} productos vía JSON Masivo!`);

        setIsPasting(false);
        setPasteContent('');
        return;
      }

      // Lógica original para un solo objeto
      if (!parsed.id || !parsed.name) throw new Error("Faltan campos obligatorios (id, name)");

      const existingIdx = products.findIndex(p => p.id === parsed.id);
      if (existingIdx >= 0) {
        updateProduct(parsed);
        showToast("Producto Actualizado vía JSON");
      } else {
        addProduct(parsed);
        showToast("Producto Añadido vía JSON");
      }
      setIsPasting(false);
      setPasteContent('');
      setSelectedProductId(parsed.id);
      setActiveBrand(parsed.brand);
    } catch (err) {
      alert("Error al parsear JSON: " + err.message);
    }
  };

  const handleBatchDelete = () => {
    if (window.confirm(`¿Seguro que quieres borrar ${selectedIds.length} artículos?`)) {
      batchDelete();
      setIsSelectionMode(false);
      showToast(`${selectedIds.length} artículos borrados`);
    }
  };

  const handleBatchCategoryChange = (newBrand) => {
    batchUpdateCategory(newBrand);
    setIsSelectionMode(false);
    showToast(`Categoría cambiada para ${selectedIds.length} artículos`);
  };

  const fallbackCopy = (text, fieldName) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast("¡" + fieldName + " copiado!");
    } catch {
      showToast('Error al copiar');
    }
    document.body.removeChild(textArea);
  };

  const handleCopy = (text, fieldName) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast("¡" + fieldName + " copiado!");
      }).catch(() => fallbackCopy(text, fieldName));
    } else {
      fallbackCopy(text, fieldName);
    }
  };

  const handleWhatsAppShare = (product) => {
    if (!product) return;
    const title = (product.titles && product.titles[0]) || product.name || 'Producto';
    const desc = (product.descriptions && product.descriptions[0] && product.descriptions[0].text) || '';
    const price = product.price || '';
    const message = `*${title}*\n\n${desc}\n\n*Precio: ${price}*`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    setToastMessage('Abriendo WhatsApp...');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const downloadImage = async (url, filename) => {
    try {
      showToast('Descargando imagen...');
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename || ("producto-" + Date.now() + ".jpg");
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(objectUrl);
      document.body.removeChild(a);
    } catch {
      window.open(url, '_blank');
      showToast('Abierta en nueva pestaña (Bloqueo CORS)');
    }
  };

  const handleDeleteProduct = (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    deleteProduct(id);
    setSelectedProductId(null);
    showToast("Producto eliminado");
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    clearSelection();
  };

  const currentBrands = [...new Set((products || []).filter(p => p && p.brand).map(item => item.brand))];
  const getBrandIcon = (b) => {
    switch (b) {
      case 'DJI': return <Mic size={16} />;
      case 'Magcubic': return <Video size={16} />;
      case 'GameSir': return <Gamepad2 size={16} />;
      case 'KZ': return <Headphones size={16} />;
      case 'Otros': return <Zap size={16} />;
      default: return <PackageOpen size={16} />;
    }
  };

  const listVariant = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariant = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 md:py-8 min-h-full pb-28 relative">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 bg-blue-600/90 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-[100] font-medium backdrop-blur-md"
          >
            <Check size={20} className="text-blue-200" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <InventoryTopBar
        isSelectionMode={isSelectionMode}
        setIsSelectionMode={toggleSelectionMode}
        setSelectedIds={clearSelection} // Clear on toggle 
        setIsSettingsOpen={setIsSettingsOpen}
        setIsPasting={setIsPasting}
        startNewProduct={startNewProduct}
      />

      {(products || []).length === 0 ? (
        <div className="text-center bg-white border border-slate-200 rounded-3xl p-10 mt-10 shadow-sm">
          <PackageOpen size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium pb-4">No hay productos en el inventario.</p>
          <button onClick={startNewProduct} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold">Añadir el Primero</button>
        </div>
      ) : (
        <>
          <div className="relative mb-8 group/search">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-blue-500 transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o etiquetas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl py-4 pl-14 pr-12 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white outline-none transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] text-slate-700 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors bg-slate-100 hover:bg-rose-50 p-1.5 rounded-full"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 mb-8">
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 whitespace-nowrap mask-edges flex-1 px-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveBrand('TODOS')}
                className={
                  "flex flex-col items-center justify-center min-w-[5rem] p-3.5 rounded-[1.5rem] transition-all duration-300 " +
                  (activeBrand === 'TODOS' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105" : "bg-white/80 backdrop-blur-sm text-slate-500 shadow-sm border border-slate-200/50 hover:bg-white hover:shadow-md hover:-translate-y-0.5")
                }
              >
                <div className={"mb-1.5 " + (activeBrand === 'TODOS' ? "text-blue-400" : "text-slate-400")}>
                  <LayoutGrid size={18} />
                </div>
                <span className="text-[10px] font-extrabold tracking-widest uppercase">Todos</span>
              </motion.button>
              {currentBrands.map((b) => (
                <motion.button
                  key={b}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setActiveBrand(b);
                    const firstInBrand = (products || []).find(p => p && p.brand === b);
                    if (firstInBrand) setSelectedProductId(firstInBrand.id);
                  }}
                  className={
                    "flex flex-col items-center justify-center min-w-[5rem] p-3.5 rounded-[1.5rem] transition-all duration-300 " +
                    (activeBrand === b ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105" : "bg-white/80 backdrop-blur-sm text-slate-500 shadow-sm border border-slate-200/50 hover:bg-white hover:shadow-md hover:-translate-y-0.5")
                  }
                >
                  <div className={"mb-1.5 " + (activeBrand === b ? "text-blue-200" : "text-slate-400")}>
                    {getBrandIcon(b)}
                  </div>
                  <span className="text-[10px] font-extrabold tracking-widest uppercase">{b}</span>
                </motion.button>
              ))}
            </div>

            <button
              onClick={() => setShowCategoryGrid(true)}
              className="bg-white/80 backdrop-blur-sm p-3.5 rounded-[1.5rem] shadow-sm border border-slate-200/50 text-slate-500 hover:text-blue-600 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all shrink-0 flex flex-col items-center"
            >
              <Grid size={18} className="mb-1.5" />
              <span className="text-[10px] font-extrabold uppercase">Ver</span>
            </button>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar pr-1 -mr-1 mb-6">
              <motion.div
                variants={listVariant}
                initial="hidden"
                animate="visible"
                key={activeBrand + searchQuery}
                className={`grid grid-cols-1 gap-3 ${viewMode === 'list' ? 'flex flex-col gap-2' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}
              >
                {filteredProducts.map(p => (
                  viewMode === 'list' ? (
                    <ProductListRow
                      key={p.id}
                      product={p}
                      isSelected={isSelectionMode && selectedIds.includes(p.id)}
                      onToggleSelection={toggleSelection} // Corrected to toggleSelection
                      onSelectProduct={setSelectedProductId} // Corrected to setSelectedProductId
                      isSelectionMode={isSelectionMode}
                      onDelete={() => handleDeleteProduct(p.id)}
                    />
                  ) : (
                    <motion.button
                      variants={itemVariant}
                      key={p.id}
                      onClick={() => {
                        if (isSelectionMode) toggleSelection(p.id);
                        else setSelectedProductId(p.id);
                      }}
                      className={
                        "text-left p-4 rounded-3xl transition-all border flex items-center justify-between " +
                        (isSelectionMode && selectedIds.includes(p.id) ? "bg-blue-50 border-blue-400 ring-4 ring-blue-500/10 shadow-lg" :
                          selectedProductId === p.id && !isSelectionMode ? "bg-white border-blue-200 ring-4 ring-blue-500/10 shadow-lg shadow-blue-500/10" :
                            "bg-white/60 border-slate-200 shadow-sm hover:bg-white hover:border-slate-300 backdrop-blur-md")
                      }
                    >
                      <div className="flex items-center gap-4">
                        {isSelectionMode && (
                          <div className={"w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors " + (selectedIds.includes(p.id) ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white")}>
                            {selectedIds.includes(p.id) && <Check size={14} className="text-white" />}
                          </div>
                        )}
                        {p.images && p.images[0] ? (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                            <ImageIcon size={20} />
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-bold text-slate-800 truncate leading-tight mb-1">{p.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded uppercase border border-slate-100">{p.brand}</span>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">{p.sku}</span>
                          </div>
                        </div>
                      </div>
                      {!isSelectionMode && (
                        <ChevronRight size={18} className="text-slate-300 shrink-0 ml-2" />
                      )}
                    </motion.button>
                  )
                ))}
              </motion.div>
            </div>
          ) : (
            <div className="bg-white/60 backdrop-blur-sm border border-dashed border-slate-300 p-8 rounded-[2rem] text-center mb-6">
              <Search size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No se encontraron productos{searchQuery ? ` para "${searchQuery}"` : ''}.</p>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="mt-2 text-blue-600 font-bold text-sm">Limpiar búsqueda</button>
              )}
            </div>
          )}

          <ProductCard
            selectedProduct={selectedProduct}
            onEdit={setEditingProduct}
            onDelete={handleDeleteProduct}
            onCopy={handleCopy}
            setFullscreenImage={setFullscreenImage}
            downloadImage={downloadImage}
            handleWhatsAppShare={handleWhatsAppShare}
          />
        </>
      )}

      {/* --- MODALS --- */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setFullscreenImage(null)}
          >
            <button className="absolute top-safe right-4 top-4 bg-white/10 p-2 rounded-full text-white hover:bg-white/20 transition-colors z-[210]">
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring" }}
              src={fullscreenImage}
              alt="Vista completa"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editingProduct && (
          <ProductFormModal
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
            onSave={handleSaveProduct}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* Quick Paste */}
      <AnimatePresence>
        {isPasting && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6"
            onClick={() => setIsPasting(false)}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(e, info) => { if (info.offset.y > 100 || info.velocity.y > 500) setIsPasting(false); }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg h-[80vh] md:h-auto rounded-t-[2rem] md:rounded-3xl flex flex-col shadow-2xl overflow-hidden mt-auto md:mt-0"
            >
              {/* Indicador de arrastre para móviles */}
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-3 md:hidden shrink-0" />

              <div className="flex justify-between items-center p-5 pt-2 md:pt-5 border-b border-slate-100 bg-slate-50/80 backdrop-blur-md sticky top-0 z-10">
                <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                  <FileJson size={18} className="text-amber-500" /> Pegar Formato Mágico
                </h3>
                <button onClick={() => setIsPasting(false)} className="bg-slate-100 p-2 text-slate-500 rounded-full hover:bg-slate-200 transition-colors hidden md:block"><X size={18} /></button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[60vh]">
                <p className="text-xs text-slate-500 mb-3">Pega la estructura JSON del producto. Aquí tienes una plantilla de ejemplo:</p>
                <pre className="bg-amber-50 border border-amber-200 text-amber-900 text-[10px] p-3 rounded-xl overflow-x-auto mb-4 font-mono select-all">
                  {TEMPLATE_JSON}
                </pre>
                <textarea
                  autoFocus
                  value={pasteContent}
                  onChange={e => setPasteContent(e.target.value)}
                  placeholder="Pega aquí el código..."
                  rows="8"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-mono focus:ring-2 focus:ring-amber-500 outline-none resize-y shadow-inner"
                />
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setIsPasting(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Cancelar</button>
                <button onClick={handlePasteSave} className="px-5 py-2.5 rounded-xl font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/30 transition-transform active:scale-95">
                  Guardar Producto
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Batch Actions */}
      <AnimatePresence>
        {isSelectionMode && selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg bg-slate-900 text-white rounded-[2rem] p-4 flex items-center justify-between shadow-2xl border border-slate-800 backdrop-blur-xl"
          >
            <div className="flex flex-col ml-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seleccionados</span>
              <span className="text-lg font-black text-blue-400">{selectedIds.length}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const selectedItems = (products || []).filter(p => p && selectedIds.includes(p.id));
                  handleCopy(JSON.stringify(selectedItems, null, 2), "JSON de selección");
                }}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-amber-400 transition-colors"
                title="Copiar JSON"
              >
                <Clipboard size={18} />
              </button>

              <div className="relative group">
                <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-blue-400 transition-colors flex items-center gap-2">
                  <Tag size={18} />
                  <span className="text-xs font-bold md:block hidden">Mover</span>
                </button>
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-2xl shadow-2xl p-2 hidden group-hover:block border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase px-2 py-1">Elegir Marca</p>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {currentBrands.map(b => (
                      <button
                        key={b}
                        onClick={() => handleBatchCategoryChange(b)}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleBatchDelete}
                className="p-3 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl transition-all flex items-center gap-2"
              >
                <Trash2 size={18} />
                <span className="text-xs font-bold md:block hidden">Borrar</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Grid */}
      <AnimatePresence>
        {showCategoryGrid && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setShowCategoryGrid(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] p-6 shadow-2xl relative max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <Grid size={22} className="text-blue-600" /> Todas las Marcas
                </h3>
                <button onClick={() => setShowCategoryGrid(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto custom-scrollbar pr-1">
                <button
                  onClick={() => { setActiveBrand('TODOS'); setShowCategoryGrid(false); }}
                  className={"p-4 rounded-3xl border transition-all flex flex-col items-center gap-2 " + (activeBrand === 'TODOS' ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 border-slate-100 hover:border-blue-200 text-slate-600")}
                >
                  <LayoutGrid size={24} />
                  <span className="font-bold text-xs uppercase tracking-wider text-center">Todos</span>
                </button>
                {currentBrands.map(b => (
                  <button
                    key={b}
                    onClick={() => { setActiveBrand(b); setShowCategoryGrid(false); const first = (products || []).find(p => p && p.brand === b); if (first) setSelectedProductId(first.id); }}
                    className={"p-4 rounded-3xl border transition-all flex flex-col items-center gap-2 " + (activeBrand === b ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 border-slate-100 hover:border-blue-200 text-slate-600")}
                  >
                    <div className={activeBrand === b ? "text-blue-400" : "text-slate-400"}>
                      {getBrandIcon(b)}
                    </div>
                    <span className="font-bold text-xs uppercase tracking-wider text-center truncate w-full">{b}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <Settings size={22} className="text-blue-600" /> Ajustes
                </h3>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Base de Datos</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={handleExportBackup}
                      className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Download size={18} />
                        </div>
                        <div className="text-left">
                          <span className="block text-sm font-bold text-slate-700">Exportar Backup</span>
                          <span className="block text-[10px] text-slate-400">Descarga todo en JSON</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" />
                    </button>

                    <label className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl transition-all group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                          <Upload size={18} />
                        </div>
                        <div className="text-left">
                          <span className="block text-sm font-bold text-slate-700">Importar Backup</span>
                          <span className="block text-[10px] text-slate-400">Restaura datos desde JSON</span>
                        </div>
                      </div>
                      <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                      <ChevronRight size={16} className="text-slate-300" />
                    </label>

                    <button
                      onClick={handleResetInventory}
                      className="flex items-center justify-between w-full p-4 bg-red-50 hover:bg-red-500 border border-red-100 hover:border-red-500 rounded-2xl transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 text-red-600 rounded-xl group-hover:bg-white group-hover:text-red-600 transition-colors">
                          <RotateCcw size={18} />
                        </div>
                        <div className="text-left">
                          <span className="block text-sm font-bold text-slate-700 group-hover:text-white transition-colors">Limpiar Base de Datos</span>
                          <span className="block text-[10px] text-red-400 group-hover:text-red-100 transition-colors">Borra TODO</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-white" />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-medium">Marketplace Pro v2.0 • Sistema de Gestión Local</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
