// src/hooks/useImageDownload.ts
import {galleryApi, GalleryImage} from '../api/galleryApi';
import {apiClient} from '../shared/api/apiClient';
import {getFileNameWithExtension} from '../utils/galleryUtils';

export const useImageDownload = () => {
    const downloadImage = async (image: GalleryImage, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        try {
            const authToken = apiClient.getAuthToken();
            if (!authToken) {
                console.error('No auth token available');
                return;
            }

            const downloadUrl = galleryApi.getDownloadUrl(image.id);

            const response = await fetch(downloadUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const fileName = getFileNameWithExtension(image.name, image.contentType, image.id);

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    return { downloadImage };
};