import React from 'react';
import { Lock, Unlock, Shield, Check, User, Users } from 'lucide-react';

const ROLE_CONFIG = {
    all: { label: 'All Users', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    editor: { label: 'Editors & Admins', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    admin: { label: 'System Admins Only', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' }
};

const SecurityView = ({ folders, users, onUpdateFolder }) => {
    return (
        <div className="space-y-6 animate-fade-in pr-2">
            <div className="flex flex-col gap-1 mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">Security Locks</h2>
                <p className="text-zinc-500 text-sm">Manage folder passwords and user visibility permissions globally.</p>
            </div>

            <div className="space-y-12">
                {Object.entries(folders).map(([category, categoryFolders]) => (
                    <div key={category} className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{category}</h3>
                            <div className="h-px w-10 bg-white/10"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {categoryFolders.map((folder) => {
                                const currentRole = ROLE_CONFIG[folder.visible_to || 'all'];
                                return (
                                    <div key={folder.id} className="glass rounded-[2rem] p-8 border border-white/5 hover:border-purple-500/30 transition-all duration-500 group relative overflow-hidden">
                                        {/* Background Glow */}
                                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/5 blur-[50px] group-hover:bg-purple-500/10 transition-colors"></div>

                                        <div className="flex items-start justify-between mb-8 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${folder.password ? 'bg-purple-500 shadow-lg shadow-purple-500/20 text-white rotate-3' : 'bg-white/5 text-zinc-500 group-hover:bg-white/10 group-hover:rotate-3'}`}>
                                                    {folder.password ? <Lock size={24} /> : <Unlock size={24} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white text-lg group-hover:text-purple-400 transition-colors uppercase tracking-tight leading-tight">{folder.name}</h4>
                                                    <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${currentRole.bg} ${currentRole.color} ${currentRole.border} border`}>
                                                        <Shield size={10} /> {currentRole.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6 relative z-10">
                                            {/* Visibility Role Dropdown (Themed) */}
                                            <div className="space-y-3">
                                                <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                                                    <Users size={12} className="text-zinc-600" /> Visible To (Role)
                                                </label>
                                                <div className="relative group/select">
                                                    <select
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm font-medium focus:outline-none focus:border-purple-500/50 appearance-none transition-all hover:bg-white/[0.07] cursor-pointer"
                                                        value={folder.visible_to || 'all'}
                                                        onChange={(e) => onUpdateFolder(folder.id, { visible_to: e.target.value })}
                                                    >
                                                        <option value="all" className="bg-[#1a1a1c] text-emerald-400">Public: All Users</option>
                                                        <option value="editor" className="bg-[#1a1a1c] text-blue-400">Restricted: Editors & Admins</option>
                                                        <option value="admin" className="bg-[#1a1a1c] text-purple-400">Strict: System Admins Only</option>
                                                    </select>
                                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600 group-focus-within/select:text-purple-400">
                                                        <Users size={16} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Password Field */}
                                            <div className="space-y-3">
                                                <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                                                    <Lock size={12} className="text-zinc-600" /> Access Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="None (Publicly Accessible)"
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm font-medium focus:outline-none focus:border-purple-500/50 placeholder:text-zinc-700 transition-all hover:bg-white/[0.07]"
                                                        defaultValue={folder.password || ''}
                                                        onBlur={(e) => onUpdateFolder(folder.id, { password: e.target.value || null })}
                                                    />
                                                </div>
                                            </div>

                                            {/* Allowed Users Section */}
                                            <div className="space-y-3">
                                                <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                                                    <User size={12} className="text-zinc-600" /> Specific Access
                                                </label>
                                                <div className="flex flex-wrap gap-2 p-4 bg-black/20 rounded-[1.5rem] border border-white/5">
                                                    {users.length > 0 ? users.filter(u => u.username !== 'admin').map(u => {
                                                        const isAllowed = (folder.allowed_users || []).includes(u.username);
                                                        return (
                                                            <button
                                                                key={u.username}
                                                                onClick={() => {
                                                                    const current = folder.allowed_users || [];
                                                                    const updated = current.includes(u.username)
                                                                        ? current.filter(name => name !== u.username)
                                                                        : [...current, u.username];
                                                                    onUpdateFolder(folder.id, { allowed_users: updated });
                                                                }}
                                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${isAllowed
                                                                    ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/20'
                                                                    : 'bg-white/5 border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10'
                                                                    }`}
                                                            >
                                                                <div className={`w-1.5 h-1.5 rounded-full ${isAllowed ? 'bg-white animate-pulse' : 'bg-zinc-700'}`}></div>
                                                                {u.username}
                                                            </button>
                                                        );
                                                    }) : (
                                                        <p className="text-[10px] text-zinc-600 font-bold uppercase py-2 px-1">No other users created</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SecurityView;
