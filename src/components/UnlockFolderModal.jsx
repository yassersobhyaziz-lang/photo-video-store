import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';

const UnlockFolderModal = ({ folder, onClose, onUnlock }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === folder.password) {
            onUnlock();
        } else {
            setError('Incorrect password');
            setPassword('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass w-full max-w-sm p-8 rounded-3xl animate-scale-in relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-zinc-500 hover:text-white"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                        <Lock className="text-purple-400" size={24} />
                    </div>
                    <h2 className="text-xl font-bold">Locked Folder</h2>
                    <p className="text-zinc-500 text-sm">{folder.name} is password protected</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-purple-500/50 text-center tracking-widest placeholder:tracking-normal"
                            placeholder="Enter password"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {error && (
                        <p className="text-pink-500 text-xs text-center font-bold animate-shake">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full gradient-bg py-3 rounded-xl font-bold mt-2 hover:scale-[1.02] transition-transform"
                    >
                        Unlock
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UnlockFolderModal;
