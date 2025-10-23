import React from 'react';
import styled from 'styled-components';
import {FaCubes, FaDatabase, FaImages, FaTags} from 'react-icons/fa';
import {GalleryStats} from '../../api/galleryApi';
import {formatFileSize} from '../../utils/galleryUtils';
import {theme} from '../../styles/theme';

interface GalleryStatsProps {
    stats: GalleryStats;
    availableTagsCount: number;
    totalItems: number;
}

const GalleryStatsComponent: React.FC<GalleryStatsProps> = ({
                                                                stats,
                                                                availableTagsCount,
                                                                totalItems
                                                            }) => {
    if (!stats) {
        return null;
    }

    return (
        <StatsRow>
            <StatItem>
                <StatIcon $color={theme.primary}>
                    <FaImages />
                </StatIcon>
                <StatContent>
                    <StatValue>{stats.totalImages}</StatValue>
                    <StatLabel>Wszystkich zdjęć</StatLabel>
                </StatContent>
            </StatItem>

            <StatDivider />

            <StatItem>
                <StatIcon $color="#0891b2">
                    <FaDatabase />
                </StatIcon>
                <StatContent>
                    <StatValue>{formatFileSize(stats.totalSize)}</StatValue>
                    <StatLabel>Łączny rozmiar</StatLabel>
                </StatContent>
            </StatItem>

            <StatDivider />

            <StatItem>
                <StatIcon $color="#d97706">
                    <FaTags />
                </StatIcon>
                <StatContent>
                    <StatValue>{availableTagsCount}</StatValue>
                    <StatLabel>Dostępnych tagów</StatLabel>
                </StatContent>
            </StatItem>

            <StatDivider />

            <StatItem>
                <StatIcon $color="#059669">
                    <FaCubes />
                </StatIcon>
                <StatContent>
                    <StatValue>{totalItems}</StatValue>
                    <StatLabel>Wyników filtrowania</StatLabel>
                </StatContent>
            </StatItem>
        </StatsRow>
    );
};

const StatsRow = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 20px 24px;

    @media (max-width: 1200px) {
        gap: 16px;
    }

    @media (max-width: 768px) {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        padding: 16px;
    }
`;

const StatItem = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;

    @media (max-width: 768px) {
        flex: none;
    }
`;

const StatIcon = styled.div<{ $color: string }>`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: ${props => props.$color}15;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 18px;
    flex-shrink: 0;
    transition: all 0.2s ease;

    ${StatItem}:hover & {
        transform: scale(1.05);
        background: ${props => props.$color}20;
    }
`;

const StatContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
`;

const StatValue = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${theme.text.primary};
    line-height: 1;
    letter-spacing: -0.01em;
`;

const StatLabel = styled.div`
    font-size: 11px;
    color: ${theme.text.tertiary};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
`;

const StatDivider = styled.div`
    width: 1px;
    height: 32px;
    background: #f0f3f7;
    flex-shrink: 0;

    @media (max-width: 768px) {
        display: none;
    }
`;

export default GalleryStatsComponent;