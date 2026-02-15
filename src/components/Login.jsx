import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Shield, LogIn, ShieldCheck, CheckSquare } from 'lucide-react';

const Login = ({ onLogin, users }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();

        // Find user in the provided users list
        const foundUser = users.find(u => u.username === username.trim() && u.password === password.trim());

        if (foundUser) {
            onLogin({
                username: foundUser.username,
                role: foundUser.role,
                permissions: foundUser.permissions || []
            }, rememberMe);
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_50%)]">
            <div className="w-full max-w-md animate-fade-in">
                <div className="glass rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 blur-[60px] -ml-16 -mb-16"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col items-center mb-10">
                            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-2xl shadow-purple-500/20 mb-6">
                                <ShieldCheck className="text-white" size={32} />
                            </div>
                            <h1 className="text-3xl font-bold gradient-text tracking-tight mb-2">Secure Access</h1>
                            <p className="text-zinc-500 text-sm">Welcome back to MediaVault</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Username</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-purple-500/30 focus:bg-white/10 transition-all text-sm placeholder:text-zinc-700"
                                        placeholder="Enter your username"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:border-purple-500/30 focus:bg-white/10 transition-all text-sm placeholder:text-zinc-700"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${rememberMe ? 'bg-purple-500 border-purple-500' : 'border-zinc-700 group-hover:border-zinc-500'}`}>
                                        {rememberMe && <CheckSquare size={10} className="text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className={`text-xs ${rememberMe ? 'text-white' : 'text-zinc-500'} transition-colors`}>Remember me</span>
                                </label>
                                <a href="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Forgot password?</a>
                            </div>

                            {error && (
                                <p className="text-pink-500 text-xs font-medium text-center bg-pink-500/5 py-2 rounded-lg border border-pink-500/10 underline-offset-4 decoration-pink-500/20">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="w-full py-4 rounded-2xl gradient-bg text-white font-bold text-sm tracking-wide shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Sign In to Vault
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-zinc-600 text-[10px] uppercase tracking-tighter">
                                Contact Administrator for access
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
