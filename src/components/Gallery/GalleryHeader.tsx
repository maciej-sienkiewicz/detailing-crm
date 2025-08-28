// src/components/Gallery/GalleryHeader.tsx
import React from 'react';
import {FaImages} from 'react-icons/fa';
import {PageHeader} from '../common/PageHeader';

const GalleryHeader: React.FC = () => {
    return (
        <PageHeader
            icon={FaImages}
            title="Galeria zdjęć"
            subtitle="Przeglądaj i zarządzaj zdjęciami z protokołów"
        />
    );
};

export default GalleryHeader;