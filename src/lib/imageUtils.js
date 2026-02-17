/**
 * Image Utilities for Supabase Storage
 * Provides thumbnail generation and quality optimization
 */

/**
 * Generate a thumbnail URL from a Supabase storage URL
 * @param {string} url - Original Supabase storage URL
 * @param {object} options - Transformation options
 * @returns {string} - Optimized URL
 */
export const getThumbnailUrl = (url, options = {}) => {
    if (!url || !url.includes('supabase')) return url;

    const {
        width = 400,
        height = 300,
        quality = 60,
        format = 'webp'
    } = options;

    // Supabase Image Transformation API
    // Format: /render/image/authenticated/{bucket}/{path}?width=X&height=Y&quality=Z
    const urlParts = url.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) return url;

    const [baseUrl, pathWithBucket] = urlParts;

    // Add transformation parameters
    return `${baseUrl}/storage/v1/render/image/public/${pathWithBucket}?width=${width}&height=${height}&quality=${quality}&format=${format}`;
};

/**
 * Get optimized URL based on use case
 */
export const getOptimizedUrl = (url, type = 'thumbnail') => {
    if (!url) return url;

    // Only optimize images
    if (!url.match(/\.(jpg|jpeg|png|webp|gif)$/i)) return url;

    const presets = {
        thumbnail: { width: 400, height: 300, quality: 60 },
        medium: { width: 800, height: 600, quality: 75 },
        large: { width: 1200, height: 900, quality: 85 },
        original: null // Return original URL
    };

    const preset = presets[type];
    if (!preset) return url;

    return getThumbnailUrl(url, preset);
};
