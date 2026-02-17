import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import MusicPlayer from './components/MusicPlayer';
import ShareModal from './components/ShareModal';
import MediaLightbox from './components/MediaLightbox';
import FolderSettingsModal from './components/FolderSettingsModal';
import UnlockFolderModal from './components/UnlockFolderModal';
import SettingsView from './components/SettingsView';
import UserManagement from './components/UserManagement';
import SecurityView from './components/SecurityView';
import { dataService } from './lib/dataService';
import { getOptimizedUrl } from './lib/imageUtils';
import {
  Upload, X, FolderPlus, Search, Grid3x3, List, SortAsc, Calendar, Heart, Play, Share2, Menu, ChevronLeft, Download
} from 'lucide-react';

// Initial data is now fetched from Supabase via dataService

function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appSettings, setAppSettings] = useState({
    theme: 'dark',
    accentColor: '#7c3aed',
    secondaryColor: '#db2777',
    language: 'en',
    hoverPreview: true,
  });

  // Load Initial Data from Supabase
  useEffect(() => {
    const initData = async () => {
      try {
        const [fetchedUsers, fetchedFolders, fetchedItems] = await Promise.all([
          dataService.getUsers(),
          dataService.getFolders(),
          dataService.getItems()
        ]);
        setUsers(fetchedUsers);
        setAllFolders(fetchedFolders);
        setItems(fetchedItems);

        // Session
        const savedUser = localStorage.getItem('mediaVaultUser');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          // Settings & Favorites for this user
          const [settings, favs] = await Promise.all([
            dataService.getSettings(parsedUser.id),
            dataService.getFavorites(parsedUser.id)
          ]);
          if (settings) setAppSettings(settings);
          if (favs) setFavorites(favs);
        }
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        setInitError(err.message || "Unknown Connection Error");
      }
    };
    initData();
  }, []);

  useEffect(() => {
    // Apply CSS Variables
    document.documentElement.style.setProperty('--color-accent-primary', appSettings.accentColor);
    document.documentElement.style.setProperty('--color-accent-secondary', appSettings.secondaryColor);
    document.documentElement.setAttribute('data-theme', appSettings.theme);
    document.dir = appSettings.language === 'ar' ? 'rtl' : 'ltr';

    if (user) {
      dataService.updateSettings(user.id, appSettings);
    }
  }, [appSettings, user]);

  const toggleFavorite = async (itemId) => {
    if (!user) return;
    const isFav = favorites.has(itemId);
    const newFavs = new Set(favorites);
    if (isFav) newFavs.delete(itemId);
    else newFavs.add(itemId);
    setFavorites(newFavs);
    await dataService.toggleFavorite(user.id, itemId, !isFav);
  };

  const [activeTab, setActiveTab] = useState('photos');
  const [currentFolder, setCurrentFolder] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // New States
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(null);

  // State for Media Items and Folders
  const [items, setItems] = useState([]);
  const [allFolders, setAllFolders] = useState({});
  const [initError, setInitError] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'name'

  // Security State
  const [folderSettingsModal, setFolderSettingsModal] = useState(null);
  const [unlockModal, setUnlockModal] = useState({ open: false, folder: null });
  const [shareModalItem, setShareModalItem] = useState(null);

  // Calculate dynamic folder counts
  const getFolderCount = (folder_id) => {
    return items.filter(item => item.folder_id === folder_id).length;
  };

  // Check for saved session
  useEffect(() => {
    const savedUser = localStorage.getItem('mediaVaultUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Map tabs to content types
  const TAB_TO_TYPE = {
    photos: 'photo',
    videos: 'video',
    music: 'audio',
    collections: 'collection',
    favorites: 'favorite'
  };

  const folders = allFolders[activeTab] || [];

  const filteredItems = items.filter(item => {
    // 1. Matches Tab Type
    const targetType = TAB_TO_TYPE[activeTab];
    if (activeTab === 'users' || activeTab === 'security') return true; // Handling Admin tabs logic differently

    // Favorites Tab Logic
    if (activeTab === 'favorites') {
      return favorites.has(item.id);
    }

    if (item.type !== targetType) return false;

    // 2. Matches Search
    if (searchQuery) {
      return item.title.toLowerCase().includes(searchQuery.toLowerCase());
    }

    // 3. Matches Folder (Hierarchy)
    if (currentFolder) {
      return item.folder_id === currentFolder.id;
    } else {
      return !item.folder_id;
    }
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.title.localeCompare(b.title);
    } else {
      // Sort by date (newest first)
      return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  if (initError) {
    const handleReset = () => {
      localStorage.removeItem('mediaVaultUser');
      sessionStorage.clear();
      window.location.reload();
    };

    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6">
        <div className="glass p-8 rounded-[2rem] text-center max-w-sm border border-white/5">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell size={32} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Connection Failed</h2>
          <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
            {initError}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 rounded-2xl gradient-bg text-white font-bold shadow-lg shadow-purple-500/20 active:scale-95 transition-transform"
            >
              Retry Connection
            </button>

            <button
              onClick={handleReset}
              className="w-full py-4 rounded-2xl bg-white/5 text-zinc-400 font-bold hover:bg-white/10 active:scale-95 transition-all text-sm"
            >
              Reset App (Clear Session)
            </button>
          </div>

          <p className="mt-6 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
            Check network or Vercel Environment Variables
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login users={users} onLogin={(userData, remember) => {
      setUser(userData);
      if (remember) {
        localStorage.setItem('mediaVaultUser', JSON.stringify(userData));
      }
    }} />;
  }

  const canEdit = user.role === 'Admin' || user.role === 'Editor';
  const isAdmin = user.role === 'Admin';

  const handleCreateFolder = async () => {
    const name = window.prompt("Enter new collection name:");
    if (name && name.trim() !== "") {
      try {
        const newFolderData = {
          name: name.trim(),
          category: activeTab, // Use current tab category directly
          visible_to: 'editor' // Default to Restricted (only staff and explicitly allowed users)
        };
        const newFolder = await dataService.createFolder(newFolderData);
        setAllFolders(prev => {
          const updated = { ...prev };
          const cat = newFolder.category;
          if (!updated[cat]) updated[cat] = [];
          updated[cat] = [newFolder, ...updated[cat]];
          return updated;
        });
      } catch (err) {
        console.error("Create folder failed:", err);
      }
    }
  };

  // Handlers
  const handleRenameFolder = async (e, folder_id, currentName) => {
    e.stopPropagation();
    const newName = window.prompt("Enter new folder name:", currentName);
    if (newName && newName.trim() !== "") {
      try {
        const updatedFolder = await dataService.updateFolder(folder_id, { name: newName.trim() });
        setAllFolders(prev => {
          const updated = { ...prev };
          for (const cat in updated) {
            updated[cat] = updated[cat].map(f => f.id === folder_id ? { ...f, ...updatedFolder } : f);
          }
          return updated;
        });
      } catch (err) {
        console.error("Rename folder failed:", err);
      }
    }
  };

  // Handlers
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const uploadResults = [];
    const errors = [];

    for (const file of files) {
      try {
        // 1. Upload to Storage
        const publicUrl = await dataService.uploadFile(file, activeTab);

        // 2. Insert record into DB
        const newItemData = {
          type: TAB_TO_TYPE[activeTab],
          folder_id: currentFolder ? currentFolder.id : null,
          url: publicUrl,
          title: file.name.split('.')[0],
          category: 'Uploads'
        };

        const newItem = await dataService.createItem(newItemData);
        uploadResults.push(newItem);
      } catch (err) {
        console.error(`Upload failed for ${file.name}:`, err);
        errors.push(`${file.name}: ${err.message || 'Unknown error'}`);
      }
    }

    if (uploadResults.length > 0) {
      setItems(prev => [...uploadResults, ...prev]);
    }

    if (errors.length > 0) {
      alert(`Some uploads failed:\n${errors.join('\n')}\n\nPlease ensure your Supabase "media-vault" bucket exists and has correct storage policies.`);
    }
  };

  // Handlers
  const resetNav = (tab) => {
    setActiveTab(tab);
    setCurrentFolder(null);
    setSelectedItems(new Set());
  };

  const handleSelection = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const handleDoubleClick = (index) => {
    const item = filteredItems[index];
    if (item.type === 'audio') {
      setCurrentTrack(item);
    } else {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };



  // ... (previous handlers)

  const isFolderVisible = (folder) => {
    // 1. Admin always sees everything
    if (user.role === 'Admin') return true;

    // 2. Specific User Permission (Highest Priority)
    if (folder.allowed_users && folder.allowed_users.includes(user.username)) return true;

    // 3. Viewers should NOT see anything by default unless explicitly allowed (above).
    // They are strictly limited to assigned folders only.
    if (user.role === 'Viewer') {
      return false; // Already checked allowed_users above
    }

    // 4. Editors can see everything except folders explicitly locked for others (logic simplified)
    // Actually, Editors should see 'all' and 'editor' folders.
    if (user.role === 'Editor') {
      return !folder.visible_to || folder.visible_to === 'all' || folder.visible_to === 'editor';
    }

    return false; // Hidden otherwise
  };

  const handleFolderClick = (folder) => {
    if (folder.protected && !isAdmin) {
      // Check if user is explicitly allowed, maybe they still need password? 
      // Requirement says "Determine folders that can be viewed". 
      // Usually password is a second layer. Let's keep password requirement even for allowed users if protected.
      setUnlockModal({ open: true, folder });
    } else {
      setCurrentFolder(folder);
    }
  };



  const handleSaveSettings = async (folder_id, newSettings) => {
    try {
      const updatedFolder = await dataService.updateFolder(folder_id, newSettings);
      setAllFolders(prev => {
        const updated = { ...prev };
        for (const cat in updated) {
          updated[cat] = updated[cat].map(f => f.id === folder_id ? { ...f, ...updatedFolder } : f);
        }
        return updated;
      });
      setFolderSettingsModal(null);
    } catch (err) {
      console.error("Save settings failed:", err);
    }
  };

  const handleUnlock = () => {
    setCurrentFolder(unlockModal.folder);
    setUnlockModal({ open: false, folder: null });
  };

  const handleDownload = async () => {
    for (const id of selectedItems) {
      const item = items.find(i => i.id === id);
      if (item) {
        try {
          const response = await fetch(item.url);
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = item.title;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
          console.error("Download failed:", error);
          // Fallback
          const link = document.createElement('a');
          link.href = item.url;
          link.download = item.title;
          link.target = "_blank";
          link.click();
        }
      }
    }
    setSelectedItems(new Set());
  };

  const handleShare = async (item) => {
    setShareModalItem(item);
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const handleGlobalFolderUpdate = async (folder_id, newSettings) => {
    try {
      const updatedFolder = await dataService.updateFolder(folder_id, newSettings);
      setAllFolders(prev => {
        const updated = { ...prev };
        for (const cat in updated) {
          updated[cat] = updated[cat].map(f => f.id === folder_id ? { ...f, ...updatedFolder } : f);
        }
        return updated;
      });
    } catch (err) {
      console.error("Global folder update failed:", err);
    }
  };

  const handleUserFolderAssignment = async (username, selectedFolderIds) => {
    try {
      const flatFolders = Object.values(allFolders).flat();
      const updates = flatFolders.map(async (folder) => {
        const isSelected = selectedFolderIds.includes(folder.id);
        const currentAllowed = folder.allowed_users || [];
        const isInAllowed = currentAllowed.includes(username);

        let newAllowed = [...currentAllowed];
        if (isSelected && !isInAllowed) {
          newAllowed.push(username);
        } else if (!isSelected && isInAllowed) {
          newAllowed = newAllowed.filter(u => u !== username);
        } else {
          return null;
        }

        return dataService.updateFolder(folder.id, { allowed_users: newAllowed });
      });

      await Promise.all(updates.filter(p => p !== null));

      setAllFolders(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(cat => {
          updated[cat] = updated[cat].map(f => {
            const isSelected = selectedFolderIds.includes(f.id);
            const isInAllowed = (f.allowed_users || []).includes(username);
            if (isSelected && !isInAllowed) {
              return { ...f, allowed_users: [...(f.allowed_users || []), username] };
            } else if (!isSelected && isInAllowed) {
              return { ...f, allowed_users: (f.allowed_users || []).filter(u => u !== username) };
            }
            return f;
          });
        });
        return updated;
      });

      alert(`Permissions updated for ${username}`);
    } catch (err) {
      console.error("User-Folder assignment failed:", err);
      alert("Failed to update permissions: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (selectedItems.size === 0) return;

    const count = selectedItems.size;
    if (window.confirm(`Are you sure you want to delete ${count} item(s)?`)) {
      try {
        await dataService.deleteItems([...selectedItems]);
        setItems(prev => prev.filter(item => !selectedItems.has(item.id)));
        setSelectedItems(new Set());
        if (currentTrack && selectedItems.has(currentTrack.id)) {
          setCurrentTrack(null);
        }
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handleRename = async (id, currentTitle) => {
    const newTitle = window.prompt("Enter new file name:", currentTitle);
    if (newTitle && newTitle.trim() !== "") {
      try {
        const updatedItem = await dataService.updateItem(id, { title: newTitle.trim() });
        setItems(prev => prev.map(item =>
          item.id === id ? { ...item, ...updatedItem } : item
        ));
      } catch (err) {
        console.error("Rename failed:", err);
      }
    }
  };

  // View Mode Helpers
  const getGridClass = () => {
    if (viewMode === 'grid-lg') return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2';
    return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
  };

  return (
    <div className="grid-layout bg-[#0a0a0c] text-white overflow-hidden relative">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          resetNav(tab);
          setSidebarOpen(false);
        }}
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCreateFolder={handleCreateFolder}
        totalItems={items.length}
      />

      <main className="flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="flex items-center justify-between p-4 sm:p-8 z-10 gap-4">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 glass rounded-xl text-zinc-400"
            >
              <MoreVertical size={20} />
            </button>
            <div className="relative flex-1 max-w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search files, folders..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 px-4 py-2 glass rounded-2xl">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-[10px] font-bold">
                {user.role[0]}
              </div>
              <div>
                <p className="text-xs font-bold leading-none">{user.username}</p>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">{user.role}</p>
              </div>
              <button
                onClick={() => {
                  setUser(null);
                  localStorage.removeItem('mediaVaultUser');
                }}
                className="ml-2 text-zinc-600 hover:text-pink-500 transition-colors"
              >
                <Lock size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-32">

          {activeTab === 'users' ? (
            <UserManagement
              users={users}
              setUsers={setUsers}
              currentUser={user}
              allFolders={allFolders}
              onAssignFolders={handleUserFolderAssignment}
            />
          ) : activeTab === 'security' ? (
            <SecurityView
              folders={allFolders}
              users={users}
              onUpdateFolder={handleGlobalFolderUpdate}
            />
          ) : activeTab === 'settings' ? (
            <SettingsView
              settings={appSettings}
              onUpdateSettings={(newS) => setAppSettings(prev => ({ ...prev, ...newS }))}
            />
          ) : (
            <>
              {/* Breadcrumbs / Title - Sticky for Mobile */}
              <div className="sticky top-0 bg-[#0a0a0c]/80 backdrop-blur-md z-40 py-4 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold capitalize cursor-pointer hover:text-purple-400 transition-colors" onClick={() => setCurrentFolder(null)}>
                    {activeTab}
                  </h2>
                  {currentFolder && (
                    <>
                      <ChevronRight size={20} className="text-zinc-600" />
                      <h2 className="text-3xl font-bold text-purple-400 truncate max-w-[150px] sm:max-w-none">{currentFolder.name}</h2>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Actions Toolbar */}
                  {selectedItems.size > 0 && (
                    <div className="flex items-center gap-2 mr-4 animate-fade-in">
                      <button
                        onClick={handleDownload}
                        className="glass px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-colors"
                      >
                        <Download size={16} /> <span className="hidden sm:inline">Download ({selectedItems.size})</span>
                        <span className="sm:hidden">{selectedItems.size}</span>
                      </button>
                      {canEdit && (
                        <button
                          onClick={handleDelete}
                          className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
                        </button>
                      )}
                    </div>
                  )}

                  {canEdit && (
                    <>
                      <button
                        onClick={() => document.getElementById('file-upload').click()}
                        className="gradient-bg px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-purple-500/20"
                      >
                        <Upload size={16} /> Upload
                      </button>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        multiple
                        accept={activeTab === 'videos' ? 'video/*' : activeTab === 'music' ? 'audio/*' : 'image/*'}
                      />
                    </>
                  )}

                  <div className="flex items-center glass p-1 rounded-xl">
                    <button
                      onClick={() => setSortBy('name')}
                      className={`p-2 rounded-lg transition-colors ${sortBy === 'name' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                      title="Sort by Name (A-Z)"
                    >
                      <SortAsc size={18} />
                    </button>
                    <button
                      onClick={() => setSortBy('date')}
                      className={`p-2 rounded-lg transition-colors ${sortBy === 'date' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                      title="Sort by Date (Newest)"
                    >
                      <Clock size={18} />
                    </button>
                  </div>

                  <div className="w-px h-6 bg-white/5 mx-1 hidden sm:block"></div>

                  <div className="flex items-center glass p-1 rounded-xl">
                    <button
                      onClick={handleSelectAll}
                      className={`p-2 rounded-lg transition-colors ${selectedItems.size === filteredItems.length && filteredItems.length > 0 ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                      title="Select All"
                    >
                      <CheckSquare size={18} />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1"></div>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <LayoutGrid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('grid-lg')}
                      className={`p-2 rounded-lg transition-colors ${viewMode === 'grid-lg' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <Grid3X3 size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <LayoutList size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Folders Section (Only show if at root and has visible folders) */}
              {!currentFolder && folders.filter(isFolderVisible).length > 0 && (
                <div className="mb-10">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Folders</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {folders.filter(isFolderVisible).map(folder => (
                      <div
                        key={folder.id}
                        onClick={() => handleFolderClick(folder)}
                        className="glass-hover glass flex items-center gap-4 p-4 rounded-2xl cursor-pointer group relative"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${folder.protected ? 'bg-pink-500/10 text-pink-500' : 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white'
                          }`}>
                          {folder.protected ? <Lock size={24} /> : <Folder size={24} fill="currentColor" fillOpacity={0.2} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-sm">{folder.name}</h3>
                              <p className="text-[10px] text-zinc-500 font-bold">{getFolderCount(folder.id)} items</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {isAdmin && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFolderSettingsModal(folder);
                                  }}
                                  className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors"
                                  title="Folder Settings"
                                >
                                  <Settings size={14} />
                                </button>
                              )}
                              {canEdit && (
                                <button
                                  onClick={(e) => handleRenameFolder(e, folder.id, folder.name)}
                                  className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors"
                                  title="Rename"
                                >
                                  <Pencil size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {canEdit && (
                      <div className="glass flex items-center gap-4 p-4 rounded-2xl border-dashed border-zinc-800 hover:border-zinc-600 cursor-pointer group transition-all">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-zinc-600 group-hover:text-zinc-400">
                          <FolderPlus size={24} />
                        </div>
                        <span className="text-zinc-600 text-sm font-medium">New Folder</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Media Items */}
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Files</p>

              {viewMode.startsWith('grid') ? (
                <div className={`grid ${getGridClass()} gap-6 animate-fade-in`}>
                  {filteredItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`group relative rounded-2xl overflow-hidden glass aspect-[4/3] cursor-pointer transition-all duration-300 skeleton ${selectedItems.has(item.id) ? 'ring-2 ring-purple-500 scale-[0.98]' : 'hover:scale-[1.02]'
                        }`}
                      onDoubleClick={() => handleDoubleClick(index)}
                      onClick={() => {
                        if (selectedItems.size > 0) handleSelection(item.id);
                      }}
                    >
                      <button
                        className={`absolute top-3 right-3 z-50 p-2 rounded-full glass hover:scale-110 transition-all ${favorites.has(item.id) ? 'text-red-500 bg-white/10' : 'text-white/70 hover:text-white'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFavorites(prev => {
                            const newFavs = new Set(prev);
                            if (newFavs.has(item.id)) newFavs.delete(item.id);
                            else newFavs.add(item.id);
                            return newFavs;
                          });
                        }}
                      >
                        <Heart size={18} fill={favorites.has(item.id) ? "currentColor" : "none"} />
                      </button>


                      {item.type === 'audio' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/40 to-black p-4 group-hover:scale-110 transition-transform duration-500">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-xl ${currentTrack?.id === item.id ? 'bg-purple-500 text-white animate-pulse' : 'bg-white/10 text-white/50 group-hover:bg-purple-500 group-hover:text-white transition-all'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                          </div>
                          <div className="w-full flex items-center gap-1 opacity-50">
                            <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                              <div className="h-full bg-white/50 w-2/3"></div>
                            </div>
                          </div>

                          {/* Share Button for Audio */}
                          <button
                            className="absolute top-14 right-3 z-50 p-2 rounded-full glass hover:scale-110 transition-all text-white/70 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(item);
                            }}
                          >
                            <Share2 size={18} />
                          </button>
                        </div>
                      ) : (
                        item.type === 'video' ? (
                          <div className="w-full h-full relative cursor-pointer"
                            onMouseEnter={(e) => {
                              const vid = e.currentTarget.querySelector('video');
                              if (vid) vid.play();
                            }}
                            onMouseLeave={(e) => {
                              const vid = e.currentTarget.querySelector('video');
                              if (vid) {
                                vid.pause();
                                vid.currentTime = 0;
                              }
                            }}
                          >
                            <video
                              src={item.url}
                              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                              muted
                              loop
                              playsInline
                              preload="none"
                            />
                            <div
                              className="absolute inset-0 flex items-center justify-center pointer-events-auto z-40"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDoubleClick(index);
                              }}
                            >
                              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform hover:bg-white/30">
                                <Play size={20} fill="white" className="text-white ml-1" />
                              </div>
                            </div>

                            {/* Share Button for Videos */}
                            <button
                              className="absolute top-14 right-3 z-50 p-2 rounded-full glass hover:scale-110 transition-all text-white/70 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(item);
                              }}
                            >
                              <Share2 size={18} />
                            </button>
                          </div>
                        ) : (
                          <img
                            src={getOptimizedUrl(item.url, 'thumbnail')}
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        )
                      )}

                      {/* Share Button for Images (Overlay) */}
                      {item.type !== 'video' && item.type !== 'audio' && (
                        <button
                          className="absolute top-14 right-3 z-50 p-2 rounded-full glass opacity-0 group-hover:opacity-100 transition-all text-white/70 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(item);
                          }}
                        >
                          <Share2 size={18} />
                        </button>
                      )}

                      {/* Checkbox Overlay */}
                      <div
                        className={`absolute top-3 left-3 z-50 transition-all ${selectedItems.has(item.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelection(item.id);
                        }}
                      >
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${selectedItems.has(item.id) ? 'bg-purple-500 border-purple-500' : 'bg-black/40 border-white/50 hover:border-white'
                          }`}>
                          {selectedItems.has(item.id) && <CheckSquare size={14} className="text-white" />}
                        </div>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-1">{item.category}</p>
                            <h3 className="text-sm font-semibold text-white/95">{item.title}</h3>
                          </div>
                          {canEdit && (
                            <div className="flex items-center gap-2 mb-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRename(item.id, item.title);
                                }}
                                className="text-zinc-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Pencil size={14} />
                              </button>
                              <Trash2 size={14} className="text-zinc-500 hover:text-pink-500 opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass rounded-2xl overflow-hidden animate-fade-in">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        <th className="px-6 py-4 w-10">
                          <button onClick={handleSelectAll} className="text-zinc-500 hover:text-white">
                            <CheckSquare size={16} className={selectedItems.size > 0 ? 'text-purple-400' : ''} />
                          </button>
                        </th>
                        <th className="px-6 py-4 font-bold">Name</th>
                        <th className="px-6 py-4 font-bold">Category</th>
                        <th className="px-6 py-4 font-bold">Type</th>
                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredItems.map(item => (
                        <tr
                          key={item.id}
                          className={`hover:bg-white/[0.02] transition-colors group cursor-pointer ${selectedItems.has(item.id) ? 'bg-purple-500/5' : ''
                            }`}
                          onClick={() => handleSelection(item.id)}
                          onDoubleClick={() => handleDoubleClick(filteredItems.indexOf(item))}
                        >
                          <td className="px-6 py-4">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedItems.has(item.id) ? 'bg-purple-500 border-purple-500' : 'border-zinc-700'
                              }`}>
                              {selectedItems.has(item.id) && <CheckSquare size={12} className="text-white" />}
                            </div>
                          </td>
                          <td className="px-6 py-4 flex items-center gap-3">
                            <button
                              className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${favorites.has(item.id) ? 'text-red-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setFavorites(prev => {
                                  const newFavs = new Set(prev);
                                  if (newFavs.has(item.id)) newFavs.delete(item.id);
                                  else newFavs.add(item.id);
                                  return newFavs;
                                });
                              }}
                            >
                              <Heart size={16} fill={favorites.has(item.id) ? "currentColor" : "none"} />
                            </button>
                            <div className="w-10 h-10 rounded-lg overflow-hidden glass bg-zinc-900">
                              <img src={item.type === 'video' ? item.thumbnail : item.url} className="w-full h-full object-cover opacity-60" />
                            </div>
                            <span className="font-medium">{item.title}</span>
                          </td>
                          <td className="px-6 py-4 text-zinc-400 text-xs">{item.category}</td>
                          <td className="px-6 py-4 capitalize text-zinc-500 text-xs">{item.type}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {canEdit && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRename(item.id, item.title);
                                    }}
                                    className="p-2 hover:text-white text-zinc-600 transition-colors"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button className="p-2 hover:text-pink-500 text-zinc-600 transition-colors"><Trash2 size={16} /></button>
                                </>
                              )}
                              <button className="p-2 hover:text-white text-zinc-600 transition-colors"><MoreVertical size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
                  <Folder size={48} strokeWidth={1} className="mb-4 opacity-20" />
                  <p className="font-medium text-sm">No items found in this folder</p>
                </div>
              )}
            </>
          )}
        </div>

        <MusicPlayer
          currentTrack={currentTrack}
          onNext={() => {
            const currentIndex = filteredItems.findIndex(i => i.id === currentTrack?.id);
            if (currentIndex !== -1 && currentIndex < filteredItems.length - 1) {
              setCurrentTrack(filteredItems[currentIndex + 1]);
            }
          }}
          onPrev={() => {
            const currentIndex = filteredItems.findIndex(i => i.id === currentTrack?.id);
            if (currentIndex > 0) {
              setCurrentTrack(filteredItems[currentIndex - 1]);
            }
          }}
        />

        {
          lightboxOpen && (
            <MediaLightbox
              items={filteredItems}
              initialIndex={lightboxIndex}
              onClose={() => setLightboxOpen(false)}
              onShare={handleShare}
            />
          )
        }

        {/* Modals */}
        {
          folderSettingsModal && (
            <FolderSettingsModal
              folder={folderSettingsModal}
              users={users}
              onClose={() => setFolderSettingsModal(null)}
              onSave={handleSaveSettings}
            />
          )
        }

        {
          unlockModal.open && (
            <UnlockFolderModal
              folder={unlockModal.folder}
              onClose={() => setUnlockModal({ open: false, folder: null })}
              onUnlock={handleUnlock}
            />
          )
        }

        {
          shareModalItem && (
            <ShareModal
              item={shareModalItem}
              onClose={() => setShareModalItem(null)}
            />
          )
        }

        {/* Floating Back Button for Mobile */}
        {currentFolder && (
          <button
            onClick={() => setCurrentFolder(null)}
            className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all animate-scale-in"
          >
            <ArrowLeft size={24} />
          </button>
        )}

      </main >
    </div >
  );
}

export default App;
