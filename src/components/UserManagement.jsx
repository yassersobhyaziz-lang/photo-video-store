import React, { useState } from 'react';
import { User, Shield, Trash2, Plus, X, Save, Key } from 'lucide-react';
import { dataService } from '../lib/dataService';

const UserManagement = ({ users, setUsers, currentUser }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'Viewer' });

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password) return;

        // Check if username exists
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

    return (
        <div className="p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2">User Management</h2>
                    <p className="text-zinc-500">Manage access and permissions</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="gradient-bg px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                >
                    <Plus size={16} /> Add User
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(user => (
                    <div key={user.username} className="glass p-6 rounded-2xl relative group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                                <User className="text-white" size={24} />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleUpdatePassword(user.username)}
                                    className="text-zinc-600 hover:text-purple-400 transition-colors p-2"
                                    title="Change Password"
                                >
                                    <Key size={18} />
                                </button>
                                {user.username !== 'admin' && user.username !== currentUser.username && (
                                    <button
                                        onClick={() => handleDeleteUser(user.username)}
                                        className="text-zinc-600 hover:text-pink-500 transition-colors p-2"
                                        title="Delete User"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <h3 className="text-lg font-bold mb-1">{user.username}</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <Shield size={14} className="text-purple-400" />
                            <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">{user.role}</span>
                        </div>

                        <div className="text-xs text-zinc-600">
                            Permissions: {user.role === 'Admin' ? 'Full Access' : user.role === 'Editor' ? 'Upload & Edit' : 'View Only'}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add User Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass w-full max-w-md p-8 rounded-3xl animate-scale-in relative">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="absolute top-6 right-6 text-zinc-500 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold mb-6">Add New User</h2>

                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Username</label>
                                <input
                                    type="text"
                                    required
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-purple-500/50"
                                    placeholder="Enter username"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Password</label>
                                <input
                                    type="text"
                                    required
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-purple-500/50"
                                    placeholder="Enter password"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Role</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Admin', 'Editor', 'Viewer'].map(role => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setNewUser({ ...newUser, role })}
                                            className={`p-2 rounded-lg text-sm font-bold border transition-all ${newUser.role === role
                                                ? 'bg-purple-500/20 border-purple-500 text-white'
                                                : 'border-white/10 text-zinc-500 hover:bg-white/5'
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full gradient-bg py-3 rounded-xl font-bold mt-4 hover:scale-[1.02] transition-transform"
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
