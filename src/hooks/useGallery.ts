// src/hooks/useGallery.ts
import {useEffect, useState} from 'react';
import {galleryApi, GalleryFilters, GalleryImage, GalleryStats} from '../api/galleryApi';
import {carReceptionApi} from '../api/carReceptionApi';

export const useGallery = () => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [stats, setStats] = useState<GalleryStats | null>(null);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<GalleryFilters>({});
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

    const pageSize = 20;

    const loadGalleryStats = async () => {
        try {
            const galleryStats = await galleryApi.getGalleryStats();
            setStats(galleryStats);
        } catch (error) {
            console.error('Error loading gallery stats:', error);
        }
    };

    const loadAvailableTags = async () => {
        try {
            const tags = await galleryApi.getAllTags();
            setAvailableTags(tags);
        } catch (error) {
            console.error('Error loading available tags:', error);
        }
    };

    const searchImages = async () => {
        setIsLoading(true);
        try {
            const response = await galleryApi.searchImages(filters, currentPage, pageSize);

            if (response?.data && Array.isArray(response.data)) {
                setImages(response.data);
                setTotalPages(response.pagination?.totalPages || 0);
                setTotalItems(response.pagination?.totalItems || 0);
            } else {
                setImages([]);
            }
        } catch (error) {
            console.error('Error in searchImages:', error);
            setImages([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchImageUrls = async () => {
        const imagesToFetch = images.filter(img => !imageUrls[img.id]);
        if (imagesToFetch.length === 0) return;

        const fetchPromises = imagesToFetch.map(async (image) => {
            try {
                const imageUrl = await carReceptionApi.fetchVehicleImageAsUrl(image.id);
                return { id: image.id, url: imageUrl };
            } catch (error) {
                console.error(`Error fetching URL for image ${image.id}:`, error);
                return { id: image.id, url: '' };
            }
        });

        const results = await Promise.all(fetchPromises);
        const newUrls = results.reduce((acc, { id, url }) => {
            if (url) acc[id] = url;
            return acc;
        }, {} as Record<string, string>);

        setImageUrls(prev => ({ ...prev, ...newUrls }));
    };

    const handleFiltersChange = (newFilters: GalleryFilters) => {
        setFilters(newFilters);
        setCurrentPage(0);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page - 1);
    };

    const getImageUrl = (imageId: string): string => {
        return imageUrls[imageId] || '';
    };

    useEffect(() => {
        loadGalleryStats();
        loadAvailableTags();
        searchImages();
    }, []);

    useEffect(() => {
        searchImages();
    }, [filters, currentPage]);

    useEffect(() => {
        fetchImageUrls();
    }, [images]);

    return {
        images,
        stats,
        availableTags,
        currentPage: currentPage + 1,
        totalPages,
        totalItems,
        pageSize,
        isLoading,
        handleFiltersChange,
        handlePageChange,
        getImageUrl
    };
};