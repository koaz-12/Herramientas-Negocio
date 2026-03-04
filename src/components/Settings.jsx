import React, { useState } from 'react';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Download, Upload, Trash2, AlertTriangle, Check, RotateCcw, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useInventoryStore } from '../store/useInventoryStore';
import SupabaseImporter from './marketplace/SupabaseImporter';
import Papa from 'papaparse';

export default function Settings() {
    const { products, setProducts, clearAll, seedInventory, batchUpsertProducts } = useInventoryStore();
    const [toastMessage, setToastMessage] = useState(null);
    const [isLoadingCsv, setIsLoadingCsv] = useState(false);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const exportData = () => {
        if (!products || products.length === 0) {
            showToast('No hay datos para exportar');
            return;
        }
        const data = JSON.stringify(products, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-inventario-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Inventario Exportado');
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                if (!Array.isArray(json)) throw new Error("El archivo no es un array válido");

                setProducts(json);
                showToast('Inventario Restaurado con Éxito');
            } catch {
                alert('Error al leer el archivo: Asegúrate de que es un backup válido JSON.');
            }
        };
        reader.readAsText(file);
    };

    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsLoadingCsv(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const mappedProducts = results.data.map(row => ({
                        id: row.ID || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        name: row.Nombre,
                        brand: row.Marca || 'Otros',
                        sku: row.SKUs || '',
                        price: row.Precio ? parseFloat(row.Precio) : 0,
                        original_price: row['Precio Original'] ? parseFloat(row['Precio Original']) : null,
                        condition: row.Condicion || 'Nuevo',
                        category: row.Categoria || '',
                        stock: row.Stock ? parseInt(row.Stock, 10) : 0,
                        tags: row.Etiquetas || '',
                        media: row.Imagenes ? row.Imagenes.split(',').map(url => url.trim()) : [],
                        titles: [],
                        descriptions: []
                    })).filter(p => p.name); // Solo procesar si hay un nombre dado

                    if (mappedProducts.length === 0) {
                        throw new Error("No se encontraron productos válidos o las columnas no coinciden con la plantilla.");
                    }

                    const result = await batchUpsertProducts(mappedProducts);
                    showToast(`¡Se importaron ${result.count} productos masivamente!`);
                } catch (error) {
                    alert('Error en CSV o conexión: ' + error.message);
                } finally {
                    setIsLoadingCsv(false);
                    e.target.value = null; // reset
                }
            },
            error: (error) => {
                alert('Error al leer CSV: ' + error.message);
                setIsLoadingCsv(false);
                e.target.value = null;
            }
        });
    };

    const downloadCsvTemplate = () => {
        const headers = ['ID', 'Nombre', 'Marca', 'Precio', 'Precio Original', 'Condicion', 'Categoria', 'Stock', 'Etiquetas', 'Imagenes', 'SKUs'];
        // Ejemplos
        const row1 = ',Cámara Drone V2,DJI,459.99,500.0,Nuevo,Drones,15,4k pro drone,https://ejemplo.com/foto1.jpg,SKU-A123';
        const row2 = ',Audífonos ZSX,KZ,45.50,,Usado,Audio,5,,,SKU-ZSX-BLK';
        const csvContent = [headers.join(','), row1, row2].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla_productos_masivos.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const clearData = () => {
        if (window.confirm("⚠️ ADVERTENCIA: ¿Estás seguro de que deseas borrar TODO el inventario? Esta acción no se puede deshacer a menos que tengas un backup.")) {
            if (window.confirm("Ultima oportunidad. ¿Continuar y borrar todo?")) {
                clearAll();
                showToast('Datos borrados completamente');
            }
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-6 md:py-10 pb-28">

            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-[100] font-medium"
                    >
                        <Check size={20} className="text-blue-400" />
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-4 mb-10">
                <div className="bg-gradient-to-tr from-slate-700 to-slate-500 p-3.5 rounded-2xl shadow-xl shadow-slate-500/30">
                    <SettingsIcon size={26} className="text-white" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 tracking-tight">Ajustes Generales</h1>
                    <p className="text-sm text-slate-500 font-bold mt-1 tracking-wide">Gestiona la base de datos de tu Business Hub</p>
                </div>
            </div>

            <div className="space-y-6">

                {/* Subida Masiva CSV */}
                <div className="bg-emerald-50/80 backdrop-blur-2xl rounded-[2rem] p-7 md:p-8 shadow-[0_10px_40px_rgba(16,185,129,0.08)] border border-emerald-100/50 relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl group-hover:bg-emerald-400/30 transition-colors duration-500" />

                    <div className="relative z-10">
                        <h2 className="text-xl font-black text-emerald-800 mb-2 flex items-center gap-2.5 tracking-tight">
                            <FileSpreadsheet size={22} className="text-emerald-500" /> Carga Masiva CSV
                        </h2>
                        <p className="text-sm text-emerald-700/80 mb-8 font-medium leading-relaxed">Utiliza nuestra plantilla para importar decenas de productos simultáneamente a través de un documento Excel o CSV.</p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={downloadCsvTemplate}
                                className="flex-1 bg-white/80 backdrop-blur-sm border border-emerald-200/50 text-emerald-700 font-bold hover:bg-white hover:text-emerald-600 py-3.5 px-5 rounded-[1.25rem] flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                            >
                                <Download size={18} /> 1. Bajar Plantilla
                            </button>
                            <label className={`flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-extrabold hover:to-emerald-600 py-3.5 px-5 rounded-[1.25rem] flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:scale-95 ${isLoadingCsv ? 'opacity-70 pointer-events-none grayscale' : ''}`}>
                                {isLoadingCsv ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                                {isLoadingCsv ? 'Procesando...' : '2. Subir CSV Llena'}
                                <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} disabled={isLoadingCsv} />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Backup Card */}
                <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] p-7 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 relative overflow-hidden group hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)] transition-all duration-500">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500" />

                    <div className="relative z-10">
                        <h2 className="text-xl font-black text-slate-800 mb-2 tracking-tight">Copias de Seguridad (Backups)</h2>
                        <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">Crea un respaldo de todos tus productos para no perderlos si borras los datos de tu navegador local.</p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-5">
                            <button
                                onClick={exportData}
                                className="flex-1 bg-blue-50/50 backdrop-blur-sm border border-blue-100/50 text-blue-700 font-bold hover:bg-white hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 py-3.5 px-5 rounded-[1.25rem] flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-95"
                            >
                                <Download size={18} /> Exportar JSON
                            </button>
                            <label className="flex-1 bg-white/60 backdrop-blur-sm border border-slate-200/50 text-slate-700 font-bold hover:bg-white hover:text-blue-600 hover:border-blue-100 hover:shadow-md hover:-translate-y-0.5 py-3.5 px-5 rounded-[1.25rem] flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm active:scale-95">
                                <Upload size={18} /> Importar JSON
                                <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
                            </label>
                        </div>

                        <button
                            onClick={() => {
                                if (window.confirm("¿Restaurar el catálogo base? Esto añadirá los productos estándar de DJI, KZ, Magcubic, etc.")) {
                                    seedInventory();
                                    showToast('Catálogo Base Restaurado');
                                }
                            }}
                            className="w-full bg-slate-50/80 backdrop-blur-sm border border-slate-200/50 text-slate-600 font-bold hover:bg-white hover:text-slate-800 hover:border-slate-300 hover:shadow-sm py-3.5 px-4 rounded-[1.25rem] flex items-center justify-center gap-2.5 transition-all active:scale-95 mt-2"
                        >
                            <RotateCcw size={18} /> Restaurar Catálogo Base (DJI, KZ...)
                        </button>
                    </div>
                </div>

                {/* Doble Tabla: Importador Seguro de Supabase */}
                <SupabaseImporter showToast={showToast} />

                {/* Danger Zone */}
                <div className="bg-rose-50/80 backdrop-blur-2xl rounded-[2rem] p-7 md:p-8 border border-rose-100/50 mt-6 md:mt-12 relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-400/10 rounded-full blur-3xl group-hover:bg-rose-400/20 transition-colors duration-500" />

                    <div className="relative z-10">
                        <h2 className="text-xl font-black text-rose-600 mb-2 flex items-center gap-2.5 tracking-tight">
                            <AlertTriangle size={22} className="text-rose-500" /> Zona de Peligro
                        </h2>
                        <p className="text-sm text-rose-700/80 mb-8 font-medium leading-relaxed">Estas acciones son irreversibles. Procede con total precaución.</p>

                        <button
                            onClick={clearData}
                            className="w-full bg-white/80 backdrop-blur-sm border border-rose-200/50 text-rose-600 font-extrabold hover:bg-gradient-to-r hover:from-rose-600 hover:to-rose-500 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-rose-500/30 hover:-translate-y-0.5 py-3.5 px-5 rounded-[1.25rem] flex items-center justify-center gap-2.5 transition-all active:scale-95"
                        >
                            <Trash2 size={20} /> Borrar Catálogo Completo
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
