import { supabase } from './supabaseClient';

export const dataService = {
    // --- USERS ---
    async getUsers() {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        return data;
    },

    async createUser(user) {
        const { data, error } = await supabase.from('users').insert(user).select().single();
        if (error) throw error;
        return data;
    },

    async deleteUser(username) {
        const { error } = await supabase.from('users').delete().eq('username', username);
        if (error) throw error;
    },

    async updatePassword(username, newPassword) {
        const { error } = await supabase.from('users').update({ password: newPassword }).eq('username', username);
        if (error) throw error;
    },

    // --- FOLDERS ---
    async getFolders() {
        const { data, error } = await supabase.from('folders').select('*');
        if (error) throw error;
        // Group by category to match app structure
        const grouped = data.reduce((acc, folder) => {
            if (!acc[folder.category]) acc[folder.category] = [];
            acc[folder.category].push(folder);
            return acc;
        }, {});
        return grouped;
    },

    async updateFolder(folderId, settings) {
        const { data, error } = await supabase.from('folders').update(settings).eq('id', folderId).select().single();
        if (error) throw error;
        return data;
    },

    async createFolder(folder) {
        const { data, error } = await supabase.from('folders').insert(folder).select().single();
        if (error) throw error;
        return data;
    },

    // --- MEDIA ITEMS ---
    async getItems() {
        const { data, error } = await supabase.from('media_items').select('*');
        if (error) throw error;
        return data;
    },

    async createItem(item) {
        const { data, error } = await supabase.from('media_items').insert(item).select().single();
        if (error) throw error;
        return data;
    },

    async deleteItems(ids) {
        const { error } = await supabase.from('media_items').delete().in('id', ids);
        if (error) throw error;
    },

    async updateItem(id, updates) {
        const { data, error } = await supabase.from('media_items').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    // --- FAVORITES ---
    async getFavorites(userId) {
        const { data, error } = await supabase.from('favorites').select('item_id').eq('user_id', userId);
        if (error) throw error;
        return new Set(data.map(f => f.item_id));
    },

    async toggleFavorite(userId, itemId, isFavorite) {
        if (isFavorite) {
            await supabase.from('favorites').insert({ user_id: userId, item_id: itemId });
        } else {
            await supabase.from('favorites').delete().eq('user_id', userId).eq('item_id', itemId);
        }
    },

    // --- SETTINGS ---
    async getSettings(userId) {
        const { data, error } = await supabase.from('app_settings').select('*').eq('user_id', userId).single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"
        return data;
    },

    async updateSettings(userId, settings) {
        const { error } = await supabase.from('app_settings').upsert({ user_id: userId, ...settings });
        if (error) throw error;
    },

    // --- STORAGE ---
    async uploadFile(file, category) {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${category}/${fileName}`;

        const { data, error } = await supabase.storage
            .from('media-vault')
            .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('media-vault')
            .getPublicUrl(filePath);

        return publicUrl;
    }
};
