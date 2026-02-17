/**
 * Image Utilities
 * Simple passthrough for now - thumbnails require server-side processing
 */

/**
 * Get optimized URL - currently returns original
 * Future: implement server-side thumbnail generation
 */
export const getOptimizedUrl = (url, type = 'thumbnail') => {
    // For now, return original URL
    // Lazy loading + CSS will handle performance
    return url;
};

/**
 * Generate a thumbnail blob from an image file (for future use)
 */
export const generateThumbnail = (file, maxWidth = 300, maxHeight = 300, quality = 0.6) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target.result;
        };

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calculate new dimensions maintaining aspect ratio
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => blob ? resolve(blob) : reject(new Error('Failed to create thumbnail')),
                'image/jpeg',
                quality
            );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        reader.onerror = () => reject(new Error('Failed to read file'));

        reader.readAsDataURL(file);
    });
};
