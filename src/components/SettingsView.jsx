import React from 'react';
import { Settings, Moon, Sun, Palette, Globe, Play, Monitor, Check, Shield } from 'lucide-react';

const SettingsView = ({ settings, onUpdateSettings }) => {
    const accentColors = [
        { name: 'Purple (Default)', value: '#7c3aed', secondary: '#db2777' },
        { name: 'Blue (Ocean)', value: '#2563eb', secondary: '#06b6d4' },
        { name: 'Green (Forest)', value: '#059669', secondary: '#10b981' },
        { name: 'Orange (Sunset)', value: '#ea580c', secondary: '#f59e0b' },
        { name: 'Red (Crimson)', value: '#dc2626', secondary: '#f43f5e' },
    ];

    return (
        <div className="max-w-4xl space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Settings</h2>
                <p className="text-zinc-500 text-sm">Customize your MediaVault experience and preferences.</p>
            </div>

            <div className="grid gap-6">
                {/* Appearance Section */}
                <section className="glass rounded-2xl p-8 border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Palette className="text-purple-400" size={20} />
                        <h3 className="text-lg font-bold text-white">Appearance</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Theme Toggle */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Interface Theme</label>
                            <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5">
                                <button
                                    onClick={() => onUpdateSettings({ theme: 'dark' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${settings.theme === 'dark' ? 'bg-purple-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                                >
                                    <Moon size={16} />
                                    <span className="text-sm font-semibold">Dark</span>
                                </button>
                                <button
                                    onClick={() => onUpdateSettings({ theme: 'light' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${settings.theme === 'light' ? 'bg-purple-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                                >
                                    <Sun size={16} />
                                    <span className="text-sm font-semibold">Light</span>
                                </button>
                            </div>
                        </div>

                        {/* Accent color */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Accent Color</label>
                            <div className="flex flex-wrap gap-3 mt-2">
                                {accentColors.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => onUpdateSettings({ accentColor: color.value, secondaryColor: color.secondary })}
                                        className={`w-8 h-8 rounded-full border-2 p-0.5 transition-all hover:scale-110 ${settings.accentColor === color.value ? 'border-white scale-110' : 'border-transparent'}`}
                                        title={color.name}
                                    >
                                        <div className="w-full h-full rounded-full" style={{ backgroundColor: color.value }}></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Localization & Performance */}
                <section className="glass rounded-2xl p-8 border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Globe className="text-purple-400" size={20} />
                        <h3 className="text-lg font-bold text-white">General & Performance</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Language */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">System Language</label>
                            <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5">
                                <button
                                    onClick={() => onUpdateSettings({ language: 'en' })}
                                    className={`flex-1 py-3 rounded-xl transition-all ${settings.language === 'en' ? 'bg-purple-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                                >
                                    <span className="text-sm font-semibold text-center block">English</span>
                                </button>
                                <button
                                    onClick={() => onUpdateSettings({ language: 'ar' })}
                                    className={`flex-1 py-3 rounded-xl transition-all ${settings.language === 'ar' ? 'bg-purple-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                                >
                                    <span className="text-sm font-semibold text-center block">العربية</span>
                                </button>
                            </div>
                        </div>

                        {/* Video Preview */}
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                    <Play size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Hover Preview</p>
                                    <p className="text-[10px] text-zinc-500 font-medium">Autoplay videos on hover</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onUpdateSettings({ hoverPreview: !settings.hoverPreview })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.hoverPreview ? 'bg-purple-500' : 'bg-zinc-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.hoverPreview ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Advanced Section */}
                <section className="glass rounded-2xl p-8 border border-white/5 space-y-6 opacity-50">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="text-purple-400" size={20} />
                        <h3 className="text-lg font-bold text-white">Advanced</h3>
                    </div>
                    <p className="text-xs text-zinc-500">More advanced settings including Supabase connection status and clear cache will be available soon.</p>
                </section>
            </div>
        </div>
    );
};

export default SettingsView;
