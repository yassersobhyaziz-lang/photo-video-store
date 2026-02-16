import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, Shield } from 'lucide-react';

const FolderSettingsModal = ({ folder, users, onClose, onSave }) => {
    const [password, setPassword] = useState(folder.password || '');
    const [showPassword, setShowPassword] = useState(false);
    const [visible_to, setVisibleTo] = useState(folder.visible_to || 'all'); // 'all', 'admin', 'editor'
    const [allowed_users, setAllowedUsers] = useState(folder.allowed_users || []);

    const handleSave = (e) => {
        e.preventDefault();
        onSave(folder.id, {
            password: password.trim(),
            protected: !!password.trim(),
            visible_to,
            allowed_users
        });
        onClose();
    };

    const toggleUser = (username) => {
        setAllowedUsers(prev =>
            prev.includes(username)
                ? prev.filter(u => u !== username)
                : [...prev, username]
        );
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass w-full max-w-md p-8 rounded-3xl animate-scale-in relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-zinc-500 hover:text-white"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Shield className="text-purple-400" />
                    Folder Security
                </h2>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Password Protection */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                            Folder Password (Optional)
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:border-purple-500/50"
                                placeholder="Set a password to lock"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className="text-[10px] text-zinc-500">Leave empty to remove password protection.</p>
                    </div>

                    {/* Visibility Controls */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                            Who can see this folder?
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${visible_to === 'all'
                                ? 'bg-purple-500/20 border-purple-500'
                                : 'border-white/5 hover:bg-white/5'
                                }`}>
                                <input type="radio" name="visibility" value="all" checked={visible_to === 'all'} onChange={(e) => setVisibleTo(e.target.value)} className="hidden" />
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${visible_to === 'all' ? 'border-purple-500' : 'border-zinc-600'}`}>
                                    {visible_to === 'all' && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                                </div>
                                <div><span className="font-bold text-sm">Everyone</span></div>
                            </label>

                            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${visible_to === 'editor'
                                ? 'bg-purple-500/20 border-purple-500'
                                : 'border-white/5 hover:bg-white/5'
                                }`}>
                                <input type="radio" name="visibility" value="editor" checked={visible_to === 'editor'} onChange={(e) => setVisibleTo(e.target.value)} className="hidden" />
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${visible_to === 'editor' ? 'border-purple-500' : 'border-zinc-600'}`}>
                                    {visible_to === 'editor' && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                                </div>
                                <div><span className="font-bold text-sm">Editors & Admins Only</span></div>
                            </label>

                            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${visible_to === 'admin'
                                ? 'bg-purple-500/20 border-purple-500'
                                : 'border-white/5 hover:bg-white/5'
                                }`}>
                                <input type="radio" name="visibility" value="admin" checked={visible_to === 'admin'} onChange={(e) => setVisibleTo(e.target.value)} className="hidden" />
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${visible_to === 'admin' ? 'border-purple-500' : 'border-zinc-600'}`}>
                                    {visible_to === 'admin' && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                                </div>
                                <div>
                                    <span className="font-bold text-sm">Private (Admins + Selected Users)</span>
                                    <p className="text-[10px] text-zinc-500">Only Admins and users selected below see this.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Specific Users */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                            Allow Specific Users
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                            {users.map(user => (
                                <label key={user.username} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${allowed_users.includes(user.username) ? 'bg-purple-500/10 border-purple-500/50' : 'border-white/5 hover:bg-white/5'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        checked={allowed_users.includes(user.username)}
                                        onChange={() => toggleUser(user.username)}
                                        className="hidden"
                                    />
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${allowed_users.includes(user.username) ? 'bg-purple-500 border-purple-500' : 'border-zinc-600'
                                        }`}>
                                        {allowed_users.includes(user.username) && <div className="text-white text-[10px]">✓</div>}
                                    </div>
                                    <span className="text-sm font-medium">{user.username} <span className="text-[10px] text-zinc-500">({user.role})</span></span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full gradient-bg py-3 rounded-xl font-bold mt-4 hover:scale-[1.02] transition-transform"
                    >
                        Save Settings
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FolderSettingsModal;
