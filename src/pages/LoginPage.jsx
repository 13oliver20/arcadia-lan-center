import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, LogIn, AlertCircle } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // If already logged in, redirect to admin
        if (localStorage.getItem('arcadia_is_authenticated') === 'true') {
            navigate('/admin');
        }
    }, [navigate]);

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (username === 'arcadia' && password === 'pichicome') {
            localStorage.setItem('arcadia_is_authenticated', 'true');
            navigate('/admin');
        } else {
            setError('Credenciales incorrectas');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
            <ParticleBackground />

            <div className="relative z-10 w-full max-w-md p-8">
                <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-8 animate-fade-in ring-1 ring-purple-500/20">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 mb-4 border border-purple-500/30">
                            <Lock size={32} className="text-purple-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Acceso Admin</h1>
                        <p className="text-slate-400 text-sm">Arcadia Gaming Center</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs uppercase text-slate-500 font-bold mb-2 ml-1">Usuario</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-600 text-white rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                                    placeholder="Usuario"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase text-slate-500 font-bold mb-2 ml-1">Contraseña</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-600 text-white rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
                        >
                            <LogIn size={20} />
                            Ingresar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
