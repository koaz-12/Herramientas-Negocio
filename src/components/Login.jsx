import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Lock, Mail, Key, Loader2, Zap } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            // Si el login es exitoso, App.jsx lo detectará por el listener de estado de sesión
            if (onLoginSuccess) {
                onLoginSuccess();
            }
        } catch (err) {
            console.error('Error de login:', err.message);
            setError('Credenciales inválidas. Verifica tu correo y contraseña.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-white/60 relative z-10">

                <div className="flex flex-col items-center mb-10">
                    <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-4 rounded-3xl shadow-lg shadow-blue-500/30 mb-6">
                        <Zap size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight text-center">
                        Business Hub
                    </h1>
                    <p className="text-sm text-slate-500 font-extrabold tracking-widest uppercase mt-2 text-center">
                        Herramientas Pro
                    </p>
                </div>

                {error && (
                    <div className="mb-6 text-xs font-bold text-rose-600 bg-rose-50/80 backdrop-blur-sm border border-rose-100 p-4 rounded-2xl flex items-center justify-center text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail size={20} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="email"
                                required
                                placeholder="Correo de acceso"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50/80 border border-slate-200/60 rounded-[1.25rem] pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all shadow-inner"
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Key size={20} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="password"
                                required
                                placeholder="Contraseña de Supabase"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50/80 border border-slate-200/60 rounded-[1.25rem] pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold py-4 px-6 rounded-[1.25rem] flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" /> Conectando...
                            </>
                        ) : (
                            <>
                                <Lock size={20} /> Iniciar Sesión Segura
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-400 font-medium mt-8">
                    Conexión directa y encriptada vía Supabase Auth.
                </p>
            </div>
        </div>
    );
}
