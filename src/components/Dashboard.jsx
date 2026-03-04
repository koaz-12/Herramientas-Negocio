import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, TrendingUp, Tags, PlusCircle, ArrowRight, DollarSign, Activity } from 'lucide-react';
import { useInventoryStore } from '../store/useInventoryStore';

export default function Dashboard() {
    const products = useInventoryStore(state => state.products || []);

    const stats = useMemo(() => {
        const totalProducts = products.length;

        // Sumamos (precio * stock) si existe stock, sino asumimos 1
        const totalValue = products.reduce((sum, p) => sum + ((Number(p.price) || 0) * (Number(p.stock) || 1)), 0);

        const uniqueBrands = new Set(products.map(p => p.brand).filter(Boolean));
        const totalBrands = uniqueBrands.size;

        const prices = products.map(p => Number(p.price) || 0).filter(p => p > 0);
        const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

        // Top 5 marcas por cantidad de productos
        const brandCounts = {};
        products.forEach(p => {
            const b = p.brand || 'Otros';
            brandCounts[b] = (brandCounts[b] || 0) + 1;
        });
        const topBrands = Object.entries(brandCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Maximum count for percentage bars
        const maxBrandCount = topBrands.length > 0 ? topBrands[0][1] : 1;

        return { totalProducts, totalValue, totalBrands, avgPrice, topBrands, maxBrandCount };
    }, [products]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-10 pb-28">
            <div className="flex items-center gap-4 mb-10">
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-3.5 rounded-2xl shadow-xl shadow-blue-500/30">
                    <Activity size={26} className="text-white" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 tracking-tight">Inteligencia de Negocio</h1>
                    <p className="text-sm text-slate-500 font-bold mt-1 tracking-wide">Resumen General de tu Inventario</p>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
            >
                {/* Stats Cards */}
                <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-2xl border border-white/60 p-6 md:p-7 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(59,130,246,0.12)] transition-all duration-500 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors duration-500 ease-out" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Inventario Total</p>
                            <h3 className="text-4xl font-black text-slate-800 tracking-tight">{stats.totalProducts} <span className="text-base font-semibold text-slate-400">ítems</span></h3>
                        </div>
                        <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl border border-blue-100/50 shadow-sm"><Package size={22} /></div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 p-6 md:p-7 rounded-[2rem] shadow-xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-500 text-white">
                    <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/40 transition-colors duration-500" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-extrabold text-indigo-300 uppercase tracking-widest mb-1.5">Valor Estimado</p>
                            <h3 className="text-3xl md:text-3xl font-black tracking-tight">{formatCurrency(stats.totalValue)}</h3>
                        </div>
                        <div className="bg-white/10 text-indigo-300 p-3 rounded-2xl backdrop-blur-md border border-white/5"><DollarSign size={22} /></div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-2xl border border-white/60 p-6 md:p-7 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(168,85,247,0.12)] transition-all duration-500 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors duration-500 ease-out" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Marcas Activas</p>
                            <h3 className="text-4xl font-black text-slate-800 tracking-tight">{stats.totalBrands}</h3>
                        </div>
                        <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl border border-purple-100/50 shadow-sm"><Tags size={22} /></div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-2xl border border-white/60 p-6 md:p-7 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(16,185,129,0.12)] transition-all duration-500 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-500 ease-out" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Precio Promedio</p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(stats.avgPrice)}</h3>
                        </div>
                        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl border border-emerald-100/50 shadow-sm"><TrendingUp size={22} /></div>
                    </div>
                </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Gráfico Simple de Barras (Marcas TOP) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-white/80 backdrop-blur-2xl rounded-[2rem] p-7 md:p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Top 5 Marcas en Inventario</h2>
                        <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg uppercase tracking-wider">Por volumen</span>
                    </div>

                    {stats.topBrands.length > 0 ? (
                        <div className="space-y-5">
                            {stats.topBrands.map(([brand, count], index) => {
                                const percentage = (count / stats.maxBrandCount) * 100;
                                return (
                                    <div key={brand} className="relative group/bar">
                                        <div className="flex justify-between text-sm font-bold text-slate-700 mb-2 z-10 relative">
                                            <span>{brand}</span>
                                            <span>{count}</span>
                                        </div>
                                        <div className="w-full bg-slate-100/50 rounded-full h-4 overflow-hidden shadow-inner border border-slate-200/50">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1.2, delay: 0.4 + (index * 0.1), ease: "easeOut" }}
                                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full shadow-lg group-hover/bar:brightness-110 transition-all"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center text-slate-400 font-medium text-sm">
                            No hay suficientes datos.
                        </div>
                    )}
                </motion.div>

                {/* Acciones Rápidas */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] p-7 md:p-8 shadow-[0_20px_50px_rgba(59,130,246,0.3)] text-white flex flex-col justify-between border border-blue-400/30 relative overflow-hidden group/action"
                >
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover/action:scale-110 transition-transform duration-700" />

                    <div className="relative z-10">
                        <h2 className="text-2xl font-black mb-3 tracking-tight text-white">Acciones Rápidas</h2>
                        <p className="text-blue-100 text-sm mb-8 leading-relaxed font-medium">Gestiona tu catálogo rápidamente accediendo a los módulos principales.</p>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <Link to="/marketplace" className="w-full bg-white text-blue-700 font-bold hover:shadow-lg hover:shadow-white/20 py-4 px-5 rounded-[1.25rem] flex items-center justify-between transition-all active:scale-95 group">
                            <span className="flex items-center gap-2.5"><Package size={20} /> Ver Marketplace</span>
                            <ArrowRight size={20} className="text-blue-300 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                        </Link>

                        <Link to="/settings" className="w-full bg-blue-500/20 text-white font-bold hover:bg-blue-500/40 backdrop-blur-md py-4 px-5 rounded-[1.25rem] flex items-center justify-between transition-all active:scale-95 group border border-white/10 hover:border-white/30">
                            <span className="flex items-center gap-2.5"><PlusCircle size={20} /> Subir CSV/Excel</span>
                            <ArrowRight size={20} className="text-blue-300 group-hover:translate-x-1 group-hover:text-white transition-all" />
                        </Link>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
