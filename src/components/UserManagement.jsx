import React, { useState } from 'react';
import { User, Shield, Trash2, Plus, X, Save, Key, Folder, Check } from 'lucide-react';
import { dataService } from '../lib/dataService';

const UserManagement = ({ users, setUsers, currentUser, allFolders, onAssignFolders }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [assigningUser, setAssigningUser] = useState(null);
    const [selectedFolders, setSelectedFolders] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'Viewer' });

    const flatFolders = Object.values(allFolders || {}).flat();

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password) return;

        if (users.find(u => u.username === newUser.username)) {
            alert('Username already exists');
            return;
        }

        try {
            const userToAdd = {
                username: newUser.username.trim(),
                password: newUser.password.trim(),
                role: newUser.role,
                permissions: newUser.role === 'Admin' ? ['all'] : newUser.role === 'Editor' ? ['upload', 'edit'] : ['view']
            };

            const createdUser = await dataService.createUser(userToAdd);
            setUsers([...users, createdUser]);
            setNewUser({ username: '', password: '', role: 'Viewer' });
            setIsAdding(false);
        } catch (err) {
            console.error("Create user failed:", err);
            alert("Create user failed: " + err.message);
        }
    };

    const handleDeleteUser = async (username) => {
        if (username === currentUser.username) return;
        if (confirm(`Are you sure you want to delete user ${username}?`)) {
            try {
                await dataService.deleteUser(username);
                setUsers(users.filter(u => u.username !== username));
            } catch (err) {
                console.error("Delete user failed:", err);
            }
        }
    };

    const handleUpdatePassword = async (username) => {
        const newPassword = prompt(`Enter new password for ${username}:`);
        if (newPassword && newPassword.trim() !== '') {
            try {
                await dataService.updatePassword(username, newPassword.trim());
                setUsers(users.map(u =>
                    u.username === username ? { ...u, password: newPassword.trim() } : u
                ));
                alert('Password updated successfully');
            } catch (err) {
                console.error("Update password failed:", err);
            }
        }
    };

    const openAssignment = (user) => {
        setAssigningUser(user);
        const userAllowedFolders = flatFolders.filter(f => (f.allowed_users || []).includes(user.username)).map(f => f.id);
        setSelectedFolders(userAllowedFolders);
    };

    const toggleFolder = (folderId) => {
        setSelectedFolders(prev =>
            prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
        );
    };

    const handleSaveAssignment = async () => {
        if (!assigningUser) return;
        await onAssignFolders(assigningUser.username, selectedFolders);
        setAssigningUser(null);
    };

    return (
        <div className="p-8 animate-fade-in pr-2">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2">User Management</h2>
                    <p className="text-zinc-500">Manage access and folder permissions</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="gradient-bg px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-purple-500/20"
                >
                    <Plus size={18} /> Add User
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(user => (
                    <div key={user.username} className="glass p-8 rounded-[2rem] border border-white/5 relative group hover:border-purple-500/30 transition-all duration-500">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
                                <User className="text-zinc-400 group-hover:text-purple-400" size={32} />
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleUpdatePassword(user.username)}
                                    className="text-zinc-600 hover:text-purple-400 transition-colors p-2 rounded-xl hover:bg-white/5"
                                    title="Change Password"
                                >
                                    <Key size={18} />
                                </button>
                                {user.username !== 'admin' && user.username !== currentUser.username && (
                                    <button
                                        onClick={() => handleDeleteUser(user.username)}
                                        className="text-zinc-600 hover:text-pink-500 transition-colors p-2 rounded-xl hover:bg-white/5"
                                        title="Delete User"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold mb-2 text-white">{user.username}</h3>
                        <div className="flex items-center gap-2 mb-6">
                            <Shield size={14} className="text-purple-400" />
                            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">{user.role}</span>
                        </div>

                        <div className="space-y-4">
                            <div className="h-px bg-white/5"></div>
                            <button
                                onClick={() => openAssignment(user)}
                                className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group/btn border border-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <Folder size={16} className="text-zinc-500 group-hover/btn:text-purple-400" />
                                    <span className="text-xs font-bold text-zinc-400 group-hover/btn:text-white uppercase tracking-widest">Assign Folders</span>
                                </div>
                                <div className="text-[10px] font-black bg-white/5 px-2 py-1 rounded text-zinc-600 group-hover/btn:bg-purple-500/20 group-hover/btn:text-purple-400">
                                    {flatFolders.filter(f => (f.allowed_users || []).includes(user.username)).length}
                                </div>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Folder Assignment Modal */}
            {assigningUser && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                    <div className="glass w-full max-w-2xl p-10 rounded-[2.5rem] animate-scale-in relative border border-white/10 shadow-2xl">
                        <button
                            onClick={() => setAssigningUser(null)}
                            className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={28} />
                        </button>

                        <div className="mb-10">
                            <h2 className="text-3xl font-bold text-white mb-2">Folder Permissions</h2>
                            <p className="text-zinc-500">Select which folders <span className="text-purple-400 font-bold">{assigningUser.username}</span> can access.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-4 mb-8">
                            {flatFolders.map(folder => {
                                const isSelected = selectedFolders.includes(folder.id);
                                return (
                                    <button
                                        key={folder.id}
                                        onClick={() => toggleFolder(folder.id)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${isSelected
                                            ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-lg shadow-purple-500/10'
                                            : 'bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10'}`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <Folder size={18} className={isSelected ? 'text-purple-400' : 'text-zinc-600'} />
                                            <span className="text-sm font-bold truncate uppercase tracking-tight">{folder.name}</span>
                                        </div>
                                        {isSelected && <Check size={18} className="text-purple-400 shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setAssigningUser(null)}
                                className="flex-1 bg-white/5 py-4 rounded-2xl font-bold text-zinc-400 hover:bg-white/10 transition-all border border-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAssignment}
                                className="flex-[2] gradient-bg py-4 rounded-2xl font-bold text-white hover:scale-[1.02] transition-all shadow-xl shadow-purple-500/20"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                    <div className="glass w-full max-w-md p-10 rounded-[2.5rem] animate-scale-in relative border border-white/10 shadow-2xl">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="absolute top-8 right-8 text-zinc-500 hover:text-white"
                        >
                            <X size={28} />
                        </button>

                        <h2 className="text-3xl font-bold mb-8">Add New User</h2>

                        <form onSubmit={handleAddUser} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-700"
                                    placeholder="e.g. yasser_aziz"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Password</label>
                                <input
                                    type="text"
                                    required
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-700"
                                    placeholder="Min. 8 characters"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Default Role</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Admin', 'Editor', 'Viewer'].map(role => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setNewUser({ ...newUser, role })}
                                            className={`py-3 rounded-xl text-xs font-bold border transition-all ${newUser.role === role
                                                ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/20'
                                                : 'border-white/5 text-zinc-500 hover:bg-white/5'
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full gradient-bg py-5 rounded-[1.5rem] font-bold mt-4 hover:scale-[1.02] transition-all shadow-2xl shadow-purple-500/30 text-lg"
                            >
                                Create User
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
