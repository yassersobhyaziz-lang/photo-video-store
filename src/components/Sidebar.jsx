import { Image, Film, Music, Library, Heart, Settings, Plus, Users, Shield, X } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, user, isOpen, onClose, onCreateFolder }) => {
  const isAdmin = user?.role === 'Admin';

  const navItems = [
    { id: 'photos', icon: Image, label: 'Photos' },
    { id: 'videos', icon: Film, label: 'Videos' },
    { id: 'music', icon: Music, label: 'Music' },
    { id: 'collections', icon: Library, label: 'Collections' },
    { id: 'favorites', icon: Heart, label: 'Favorites' },
  ];

  const adminItems = [
    { id: 'users', icon: Users, label: 'Manage Users' },
    { id: 'security', icon: Shield, label: 'Security Locks' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed lg:relative inset-y-0 left-0 w-72 glass h-screen flex flex-col p-6 border-r border-white/5 z-[110]
        transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-10 px-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Library className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold gradient-text tracking-tight uppercase">MediaVault</h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-zinc-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-2">
          <div>
            <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Library</p>
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${activeTab === item.id
                    ? 'bg-purple-500/10 text-white border border-purple-500/20'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                    }`}
                >
                  <item.icon
                    size={20}
                    className={`${activeTab === item.id ? 'text-purple-400 stroke-[2.5px]' : 'text-zinc-500 group-hover:text-zinc-300 stroke-[2px]'} transition-colors`}
                  />
                  <span className="font-semibold text-sm">{item.label}</span>
                  {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_purple]"></div>}
                </button>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="mt-8">
              <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Administration</p>
              <div className="space-y-1">
                {adminItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${activeTab === item.id
                      ? 'bg-pink-500/10 text-white border border-pink-500/20'
                      : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                      }`}
                  >
                    <item.icon
                      size={20}
                      className={`${activeTab === item.id ? 'text-pink-400 stroke-[2.5px]' : 'text-zinc-500 group-hover:text-zinc-300 stroke-[2px]'} transition-colors`}
                    />
                    <span className="font-semibold text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-white/5 shrink-0">
          <button
            onClick={onCreateFolder}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/5 text-zinc-400 hover:text-zinc-200 border border-dashed border-zinc-800 hover:border-zinc-700 transition-all text-sm font-bold"
          >
            <Plus size={18} />
            <span>New Collection</span>
          </button>

          <div
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors group rounded-2xl ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}
          >
            <Settings size={20} className="group-hover:rotate-45 transition-transform duration-500" />
            <span className="font-bold text-sm">Settings</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
