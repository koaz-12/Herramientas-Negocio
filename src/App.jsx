// Business Hub - App entry point (HMR refresh)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Package, Settings, RotateCcw, Zap as ZapIcon, Megaphone, Construction, Activity, WifiOff } from 'lucide-react';

import { AnimatePresence, motion } from 'framer-motion';
import Dashboard from './components/Dashboard';
import MarketplacePro from './components/MarketplacePro';
import Promotions from './components/Promotions';
import SettingsView from './components/Settings';
import Login from './components/Login';
import { useInventoryStore } from './store/useInventoryStore';
import { supabase } from './lib/supabase';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 p-10 flex flex-col items-center justify-center text-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-red-100 max-w-lg">
            <h1 className="text-2xl font-black text-red-600 mb-4">¡Ups! Algo salió mal</h1>
            <p className="text-slate-600 mb-6 font-medium">Se produjo un error en la aplicación. Esto es lo que pasó:</p>
            <div className="bg-slate-900 text-pink-400 p-4 rounded-xl text-left text-xs font-mono mb-6 overflow-auto max-h-40">
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 transition-all"
            >
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AnimatedOutlet({ children }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex-1 overflow-hidden"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Placeholder Component
function UnderConstruction({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center pb-32">
      <Construction size={48} className="mb-4 text-blue-300" strokeWidth={1.5} />
      <h2 className="text-xl font-bold text-slate-700 mb-2">{title}</h2>
      <p className="max-w-xs text-sm">Esta sección está en construcción. Pronto agregaremos más utilidades aquí.</p>
    </div>
  )
}

function AppLayout({ children }) {
  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col font-sans text-slate-800 overflow-hidden">

      {/* Elegante Sticky Header Glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-white/50 shadow-[0_10px_40px_rgba(0,0,0,0.04)] px-4 py-3 md:px-6 md:py-4 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
            <ZapIcon size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight leading-none">
              Business Hub
            </h1>
            <p className="text-[10px] md:text-xs text-slate-500 font-extrabold tracking-widest uppercase mt-0.5">Herramientas Pro</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              if (window.confirm("¿Seguro que deseas cerrar la sesión?")) {
                await supabase.auth.signOut();
              }
            }}
            className="p-2.5 bg-slate-50/50 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl text-slate-400 hover:text-rose-500 transition-all active:scale-95"
            title="Cerrar Sesión"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Top Navbar for Desktop (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
          <NavLink to="/" end className={({ isActive }) => `px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${isActive ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50 scale-100' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50 scale-95 hover:scale-100'}`}>Inicio</NavLink>
          <NavLink to="/marketplace" className={({ isActive }) => `px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${isActive ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50 scale-100' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50 scale-95 hover:scale-100'}`}>Marketplace</NavLink>
          <NavLink to="/promos" className={({ isActive }) => `px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${isActive ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50 scale-100' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50 scale-95 hover:scale-100'}`}>Promos</NavLink>
          <NavLink to="/settings" className={({ isActive }) => `px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${isActive ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50 scale-100' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50 scale-95 hover:scale-100'}`}>Ajustes</NavLink>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-0 overflow-y-auto custom-scrollbar pb-24 md:pb-6">
        {children}
      </main>

      {/* Floating Bottom Navigation (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 pb-[max(calc(env(safe-area-inset-bottom)+0.75rem),0.75rem)] pt-3 px-4 shadow-[0_-20px_40px_rgba(0,0,0,0.06)] bg-white/90 backdrop-blur-2xl border-t border-white/60">
        <nav className="flex justify-around items-center h-[3.5rem] max-w-md mx-auto relative content-center">

          <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center justify-center w-16 h-full gap-1 transition-all ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            {({ isActive }) => (
              <>
                <motion.div animate={{ y: isActive ? -4 : 0, scale: isActive ? 1.15 : 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                  <Activity size={24} className={isActive ? 'text-blue-600 drop-shadow-md' : ''} />
                </motion.div>
                <span className={`text-[10px] font-extrabold tracking-wide ${isActive ? 'opacity-100 text-blue-700' : 'opacity-70'}`}>Inicio</span>
                {isActive && (
                  <motion.div layoutId="navIndicator" className="absolute -bottom-1 w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                )}
              </>
            )}
          </NavLink>

          <NavLink to="/marketplace" className={({ isActive }) => `flex flex-col items-center justify-center w-16 h-full gap-1 transition-all ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            {({ isActive }) => (
              <>
                <motion.div animate={{ y: isActive ? -4 : 0, scale: isActive ? 1.15 : 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                  <Package size={24} className={isActive ? 'fill-blue-50/50 drop-shadow-md text-blue-600' : ''} />
                </motion.div>
                <span className={`text-[10px] font-extrabold tracking-wide ${isActive ? 'opacity-100 text-blue-700' : 'opacity-70'}`}>Catálogo</span>
                {isActive && (
                  <motion.div layoutId="navIndicator" className="absolute -bottom-1 w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                )}
              </>
            )}
          </NavLink>

          <NavLink to="/promos" className={({ isActive }) => `flex flex-col items-center justify-center w-16 h-full gap-1 transition-all ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            {({ isActive }) => (
              <>
                <motion.div animate={{ y: isActive ? -4 : 0, scale: isActive ? 1.15 : 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                  <Megaphone size={24} className={isActive ? 'fill-blue-50/50 drop-shadow-md text-blue-600' : ''} />
                </motion.div>
                <span className={`text-[10px] font-extrabold tracking-wide ${isActive ? 'opacity-100 text-blue-700' : 'opacity-70'}`}>Promos</span>
                {isActive && (
                  <motion.div layoutId="navIndicator" className="absolute -bottom-1 w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                )}
              </>
            )}
          </NavLink>

          <NavLink to="/settings" className={({ isActive }) => `flex flex-col items-center justify-center w-16 h-full gap-1 transition-all ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            {({ isActive }) => (
              <>
                <motion.div animate={{ y: isActive ? -4 : 0, scale: isActive ? 1.15 : 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                  <Settings size={24} className={isActive ? 'fill-blue-50/50 drop-shadow-md text-blue-600' : ''} />
                </motion.div>
                <span className={`text-[10px] font-extrabold tracking-wide ${isActive ? 'opacity-100 text-blue-700' : 'opacity-70'}`}>Ajustes</span>
                {isActive && (
                  <motion.div layoutId="navIndicator" className="absolute -bottom-1 w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                )}
              </>
            )}
          </NavLink>

        </nav>
      </div>

    </div>
  );
}

// Global error capture for non-react errors
if (typeof window !== 'undefined') {
  window.onerror = (message, source, lineno, colno, error) => {
    console.error("Global Error:", message, error);
    // If it's a persistent crash, maybe auto-clear could be an option, but for now just log
  };
}

function AppContent() {
  const { fetchProducts, _hasHydrated, isLoading, isOffline } = useInventoryStore();
  const [session, setSession] = React.useState(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  React.useEffect(() => {
    // Solo fetchear productos si hay sesion activa
    if (session) {
      fetchProducts();
    }
  }, [fetchProducts, session]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-slate-800 animate-pulse">Verificando seguridad...</h2>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  if (!_hasHydrated || (isLoading && !_hasHydrated)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-slate-800 animate-pulse">Sincronizando con la nube...</h2>
        <p className="text-slate-500 mt-2">Descargando catálogo empresarial</p>
      </div>
    );
  }

  return (
    <Router>
      <AppLayout>
        {isOffline && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-center gap-2 text-rose-700 text-sm font-medium sticky top-0 z-50 shadow-sm">
            <WifiOff size={16} className="flex-shrink-0 animate-pulse" />
            <span className="text-center truncate">Modo Local: Visualizando copia de seguridad (Edición limitada).</span>
          </div>
        )}
        {isOffline && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-center gap-2 text-rose-700 text-sm font-medium sticky top-0 z-50 shadow-sm animate-in slide-in-from-top-4">
            <WifiOff size={16} className="flex-shrink-0 animate-pulse" />
            <span className="text-center truncate">Modo Local: Visualizando copia de seguridad (Edición limitada).</span>
          </div>
        )}
        <AnimatedOutlet>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/marketplace" element={<MarketplacePro />} />
            <Route path="/promos" element={<Promotions />} />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </AnimatedOutlet>
      </AppLayout>
    </Router>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
