import { Settings, FileJson, Plus, LayoutGrid, List } from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore';

export default function InventoryTopBar({
    isSelectionMode,
    setIsSelectionMode,
    setSelectedIds,
    setIsSettingsOpen,
    setIsPasting,
    startNewProduct
}) {
    const { viewMode, setViewMode } = useInventoryStore();

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-20">
            <div className="flex items-center gap-3 w-full md:w-auto">
                <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 tracking-tight">Inventario</h1>

                {/* Layout Switcher */}
                <div className="hidden sm:flex items-center bg-white/60 backdrop-blur-sm p-1.5 rounded-[1.25rem] shadow-sm border border-slate-200/50 ml-3">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-white shadow-md text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                        title="Vista de Tarjetas"
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'list' ? 'bg-white shadow-md text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                        title="Vista Compacta"
                    >
                        <List size={16} />
                    </button>
                </div>

                <div className="flex-1" />

                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2.5 bg-white/80 backdrop-blur-md text-slate-400 hover:text-blue-600 hover:bg-white border border-slate-200/50 rounded-xl shadow-sm hover:shadow-md transition-all md:ml-1 active:scale-95"
                    title="Ajustes y Base de Datos"
                >
                    <Settings size={20} />
                </button>
            </div>

            <div className="flex gap-2.5 w-full md:w-auto overflow-x-auto no-scrollbar pb-1">
                <button
                    onClick={() => {
                        setIsSelectionMode(!isSelectionMode);
                        setSelectedIds(new Set()); // This will be updated to store action
                    }}
                    className={"px-4 py-2.5 rounded-2xl text-[11px] uppercase tracking-wider font-extrabold transition-all shrink-0 border " + (isSelectionMode ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20" : "bg-white/80 backdrop-blur-sm border-slate-200/50 text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm")}
                >
                    {isSelectionMode ? 'Cancelar' : 'Seleccionar'}
                </button>
                <button
                    onClick={() => setIsPasting(true)}
                    className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200/50 text-slate-600 hover:text-blue-600 hover:bg-white hover:border-blue-200 hover:shadow-md px-4 py-2.5 rounded-2xl font-bold transition-all active:scale-95 text-xs shrink-0"
                >
                    <FileJson size={16} className="text-amber-500" /> <span className="hidden sm:inline">Pegar JSON</span>
                </button>
                <button
                    onClick={startNewProduct}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:to-blue-600 px-5 py-2.5 rounded-2xl font-extrabold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all outline-none active:scale-95 text-sm shrink-0"
                >
                    <Plus size={18} /> <span>Añadir</span>
                </button>
            </div>
        </div>
    );
}
