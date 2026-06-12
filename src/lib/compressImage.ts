/**
 * Compresses an image File using the Canvas API.
 * Target: max 600×600 px, JPEG quality 0.65 → typically ~60-100 KB per image.
 */
export async function compressImage(
  file: File,
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.65
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob returned null'));
            return;
          }
          const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
          resolve(new File([blob], newName, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = objectUrl;
  });
}

/**
 * Compresses an image and returns it as a plain base64 string (NO data-URI prefix).
 * Used by the base64 JSON upload endpoint to avoid nginx multipart restrictions.
 */
export async function compressToBase64(
  file: File,
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.65
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      // toDataURL returns "data:image/jpeg;base64,<data>" — strip the prefix
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      const base64 = dataUrl.split(',')[1];
      if (!base64) {
        reject(new Error('Failed to convert canvas to base64'));
        return;
      }
      resolve(base64);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = objectUrl;
  });
}

/**
 * Compresses multiple image files in parallel (returns File[]).
 * Defaults match compressImage defaults (600×600, 65%).
 */
export async function compressImages(
  files: File[],
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.65
): Promise<File[]> {
  return Promise.all(
    files.map((file) => compressImage(file, maxWidth, maxHeight, quality))
  );
}
