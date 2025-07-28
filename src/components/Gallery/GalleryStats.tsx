// src/components/Gallery/GalleryStats.tsx
import React from 'react';
import styled from 'styled-components';
import { FaImages, FaDatabase, FaTags, FaCubes } from 'react-icons/fa';
import { GalleryStats } from '../../api/galleryApi';
import { formatFileSize } from '../../utils/galleryUtils';
import { theme } from '../../styles/theme';

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
    return (
        <StatsSection>
            <StatsGrid>
                <StatCard>
                    <StatIcon $color={theme.text.primary}>
                        <FaImages />
                    </StatIcon>
                    <StatContent>
                        <StatValue>{stats.totalImages}</StatValue>
                        <StatLabel>Zdjęć w galerii</StatLabel>
                    </StatContent>
                </StatCard>

                <StatCard>
                    <StatIcon $color={theme.text.primary}>
                        <FaDatabase />
                    </StatIcon>
                    <StatContent>
                        <StatValue>{formatFileSize(stats.totalSize)}</StatValue>
                        <StatLabel>Rozmiar danych</StatLabel>
                    </StatContent>
                </StatCard>

                <StatCard>
                    <StatIcon $color={theme.text.primary}>
                        <FaTags />
                    </StatIcon>
                    <StatContent>
                        <StatValue>{availableTagsCount}</StatValue>
                        <StatLabel>Dostępnych tagów</StatLabel>
                    </StatContent>
                </StatCard>

                <StatCard>
                    <StatIcon $color={theme.text.primary}>
                        <FaCubes />
                    </StatIcon>
                    <StatContent>
                        <StatValue>{totalItems}</StatValue>
                        <StatLabel>Wyników wyszukiwania</StatLabel>
                    </StatContent>
                </StatCard>
            </StatsGrid>
        </StatsSection>
    );
};

const StatsSection = styled.section`
  max-width: 100%;
  margin: 0 auto;
  padding: ${theme.spacing.lg} ${theme.spacing.xl} 0;

  @media (max-width: 1024px) {
    padding: ${theme.spacing.md} ${theme.spacing.lg} 0;
  }

  @media (max-width: 768px) {
    padding: ${theme.spacing.md} ${theme.spacing.md} 0;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.md};
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
  }
`;

const StatCard = styled.div`
  background: ${theme.surface};
  border: 1px solid ${theme.border};
  border-radius: ${theme.radius.xl};
  padding: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  transition: all ${theme.transitions.spring};
  box-shadow: ${theme.shadow.xs};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadow.lg};
    border-color: ${theme.primary};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
    opacity: 0;
    transition: opacity ${theme.transitions.normal};
  }

  &:hover::before {
    opacity: 1;
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
  border-radius: ${theme.radius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color};
  font-size: 24px;
  flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
`;

const StatContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.text.primary};
  margin-bottom: ${theme.spacing.xs};
  letter-spacing: -0.025em;
  line-height: 1.1;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${theme.text.secondary};
  font-weight: 500;
  line-height: 1.3;
`;

export default GalleryStatsComponent;