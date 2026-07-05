import { useState, useEffect } from 'react';
import { Image } from 'react-native';

interface UseImageOptimizationResult {
  uri: string;
  width: number;
  height: number;
  loading: boolean;
  error: boolean;
}

export function useImageOptimization(
  originalUri: string,
  targetWidth: number = 400,
  targetHeight: number = 400
): UseImageOptimizationResult {
  const [optimizedUri, setOptimizedUri] = useState(originalUri);
  const [width, setWidth] = useState(targetWidth);
  const [height, setHeight] = useState(targetHeight);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!originalUri) {
      setError(true);
      setLoading(false);
      return;
    }

    // Si es una URL remota, podrías agregar lógica de optimización aquí
    // Por ahora, solo verificamos que la imagen sea válida
    Image.getSize(
      originalUri,
      (imgWidth, imgHeight) => {
        // Calcular dimensiones manteniendo aspect ratio
        const aspectRatio = imgWidth / imgHeight;
        
        if (aspectRatio > 1) {
          // Imagen más ancha que alta
          setWidth(targetWidth);
          setHeight(targetWidth / aspectRatio);
        } else {
          // Imagen más alta que ancha
          setHeight(targetHeight);
          setWidth(targetHeight * aspectRatio);
        }

        setOptimizedUri(originalUri);
        setLoading(false);
        setError(false);
      },
      (err) => {
        console.warn('[image] Failed to get image size:', err);
        setError(true);
        setLoading(false);
      }
    );
  }, [originalUri, targetWidth, targetHeight]);

  return {
    uri: optimizedUri,
    width,
    height,
    loading,
    error,
  };
}

export function getOptimizedImageUrl(
  originalUrl: string,
  width: number = 400,
  height: number = 400,
  quality: number = 80
): string {
  // Esta función puede ser extendida para integrar con servicios de optimización
  // como Cloudinary, Imgix, o un CDN propio
  
  // Por ahora, solo retornamos la URL original
  // En producción, podrías hacer:
  // return `https://your-cdn.com/resize?url=${encodeURIComponent(originalUrl)}&w=${width}&h=${height}&q=${quality}`;
  
  return originalUrl;
}

export function prefetchImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          Image.prefetch(url)
            .then(() => resolve())
            .catch(() => resolve()); // No fallar si una imagen no se puede prefetchear
        })
    )
  );
}
