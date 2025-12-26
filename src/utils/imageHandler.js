/**
 * Compresses and resizes an image file to ensure it fits in localStorage.
 * Max dimensions: 1920x1080
 * Quality: 0.8
 * Output format: image/jpeg (better compression than png for photos)
 * 
 * @param {File} file - The image file to process
 * @returns {Promise<string>} - The base64 string of the processed image
 */
export const processImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Max dimensions (Optimized for Bottom Logo: 400px is enough for w-40/160px display)
                const MAX_LONG_SIDE = 400;

                // Calculate ratios
                if (width > height) {
                    // Landscape
                    if (width > MAX_LONG_SIDE) {
                        height *= MAX_LONG_SIDE / width;
                        width = MAX_LONG_SIDE;
                    }
                } else {
                    // Portrait / Square
                    if (height > MAX_LONG_SIDE) {
                        width *= MAX_LONG_SIDE / height;
                        height = MAX_LONG_SIDE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Compress to WebP with 0.8 quality (Good balance, supports transparency)
                const dataUrl = canvas.toDataURL('image/webp', 0.8);
                resolve(dataUrl);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};
