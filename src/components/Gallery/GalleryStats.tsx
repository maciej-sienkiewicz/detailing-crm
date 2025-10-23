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
        <StatsSection>
            <StatItem>
                <StatIcon>
                    <FaImages />
                </StatIcon>
                <StatContent>
                    <StatValue>{stats.totalImages}</StatValue>
                    <StatLabel>Wszystkich zdjęć</StatLabel>
                </StatContent>
            </StatItem>

            <Divider />

            <StatItem>
                <StatIcon>
                    <FaDatabase />
                </StatIcon>
                <StatContent>
                    <StatValue>{formatFileSize(stats.totalSize)}</StatValue>
                    <StatLabel>Łącznie</StatLabel>
                </StatContent>
            </StatItem>

            <Divider />

            <StatItem>
                <StatIcon>
                    <FaTags />
                </StatIcon>
                <StatContent>
                    <StatValue>{availableTagsCount}</StatValue>
                    <StatLabel>Tagów</StatLabel>
                </StatContent>
            </StatItem>

            <Divider />

            <StatItem>
                <StatIcon>
                    <FaCubes />
                </StatIcon>
                <StatContent>
                    <StatValue>{totalItems}</StatValue>
                    <StatLabel>Wyników</StatLabel>
                </StatContent>
            </StatItem>
        </StatsSection>
    );
};

const StatsSection = styled.div`
    display: flex;
    align-items: center;
    padding: ${theme.spacing.xl};
    border-bottom: 1px solid ${theme.borderLight};
    gap: ${theme.spacing.xl};

    @media (max-width: 1024px) {
        padding: ${theme.spacing.lg};
        gap: ${theme.spacing.lg};
    }

    @media (max-width: 768px) {
        flex-wrap: wrap;
        padding: ${theme.spacing.md};
        gap: ${theme.spacing.md};
    }
`;

const StatItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    flex: 1;
    min-width: 0;

    @media (max-width: 768px) {
        flex: 1 1 calc(50% - ${theme.spacing.sm});
    }
`;

const StatIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: ${theme.radius.md};
    background: ${theme.primary}10;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.primary};
    font-size: ${theme.fontSize.lg};
    flex-shrink: 0;
    transition: all ${theme.transitions.normal};

    ${StatItem}:hover & {
        transform: scale(1.05);
        background: ${theme.primary}15;
    }
`;

const StatContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    min-width: 0;
`;

const StatValue = styled.div`
    font-size: ${theme.fontSize.xl};
    font-weight: 700;
    color: ${theme.text.primary};
    line-height: 1;
    letter-spacing: -0.01em;
`;

const StatLabel = styled.div`
    font-size: ${theme.fontSize.xs};
    color: ${theme.text.tertiary};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.3px;
`;

const Divider = styled.div`
    width: 1px;
    height: 32px;
    background: ${theme.borderLight};
    flex-shrink: 0;

    @media (max-width: 768px) {
        display: none;
    }
`;

export default GalleryStatsComponent;