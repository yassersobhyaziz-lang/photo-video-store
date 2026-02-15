import React from 'react';
import { Lock, Unlock, Eye, EyeOff, Shield, Check, X } from 'lucide-react';

const SecurityView = ({ folders, users, onUpdateFolder }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-1 mb-8">
                <h2 className="text-3xl font-bold text-white">Security Locks</h2>
                <p className="text-zinc-500 text-sm">Manage folder passwords and user visibility permissions globally.</p>
            </div>

            <div className="grid gap-4">
                {Object.entries(folders).map(([category, categoryFolders]) => (
                    <div key={category} className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest px-2">{category}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categoryFolders.map((folder) => (
                                <div key={folder.id} className="glass rounded-2xl p-6 border border-white/5 hover:border-purple-500/30 transition-all group">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${folder.password ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-zinc-500'}`}>
                                                {folder.password ? <Lock size={20} /> : <Unlock size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors uppercase text-sm">{folder.name}</h4>
                                                <p className="text-[10px] text-zinc-500 font-medium">Unlocked: {folder.password ? 'Password Protected' : 'Public'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Visibility Role */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Visible To (Role)</label>
                                            <select
                                                className="w-full bg-white/5 border border-white/5 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-purple-500/50"
                                                value={folder.visibleTo || 'all'}
                                                onChange={(e) => onUpdateFolder(folder.id, { visibleTo: e.target.value })}
                                            >
                                                <option value="all">All Users</option>
                                                <option value="editor">Editors & Admins</option>
                                                <option value="admin">System Admins Only</option>
                                            </select>
                                        </div>

                                        {/* Password Toggle (Simplified for global view) */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Password</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Set Password (Empty to remove)"
                                                    className="flex-1 bg-white/5 border border-white/5 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-purple-500/50"
                                                    defaultValue={folder.password || ''}
                                                    onBlur={(e) => onUpdateFolder(folder.id, { password: e.target.value || null })}
                                                />
                                            </div>
                                        </div>

                                        {/* Allowed Users Grid */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Specific Users Allowed</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {users.map(u => (
                                                    <button
                                                        key={u.username}
                                                        onClick={() => {
                                                            const current = folder.allowedUsers || [];
                                                            const updated = current.includes(u.username)
                                                                ? current.filter(name => name !== u.username)
                                                                : [...current, u.username];
                                                            onUpdateFolder(folder.id, { allowedUsers: updated });
                                                        }}
                                                        className={`px-2 py-1 rounded-lg text-[10px] border transition-all ${(folder.allowedUsers || []).includes(u.username)
                                                                ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                                                : 'bg-white/5 border-white/5 text-zinc-500 hover:text-white'
                                                            }`}
                                                    >
                                                        {u.username}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SecurityView;
