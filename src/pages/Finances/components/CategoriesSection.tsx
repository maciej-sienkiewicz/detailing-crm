// src/pages/Finances/components/CategoriesSection.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import {FaPlus, FaFolder, FaChevronDown, FaChevronRight, FaCalendarAlt} from 'react-icons/fa';
import { Category, CategoryService } from '../../../api/statsApi';
import { CategoryServicesTable } from './CategoryServicesTable';

// Brand Theme System - consistent with ClientListTable
const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    accent: '#f8fafc',
    neutral: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0',

    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7',
        error: '#dc2626',
        errorLight: '#fee2e2',
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
    },
};

interface CategoryPanelProps {
    category: Category;
    isExpanded: boolean;
    onToggle: () => void;
    services: CategoryService[];
    loadingServices: boolean;
    onLoadServices: (categoryId: number) => Promise<CategoryService[]>;
    onShowStats: (serviceId: string, serviceName: string) => void;
    onShowCategoryStats: (categoryId: number, categoryName: string) => void;
}

const CategoryPanel: React.FC<CategoryPanelProps> = ({
                                                         category,
                                                         isExpanded,
                                                         onToggle,
                                                         services,
                                                         loadingServices,
                                                         onLoadServices,
                                                         onShowStats,
                                                         onShowCategoryStats
                                                     }) => {
    const handleToggle = async () => {
        if (!isExpanded) {
            // Load services when expanding
            await onLoadServices(category.id);
        }
        onToggle();
    };

    const handleCategoryStatsClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent panel toggle
        onShowCategoryStats(category.id, category.name);
    };

    return (
        <PanelContainer>
            <PanelHeader onClick={handleToggle}>
                <PanelHeaderLeft>
                    <ExpandIcon $expanded={isExpanded}>
                        {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                    </ExpandIcon>
                    <CategoryIcon>
                        <FaFolder />
                    </CategoryIcon>
                    <CategoryInfo>
                        <CategoryName>{category.name}</CategoryName>
                        <CategoryMeta>{category.servicesCount} usług</CategoryMeta>
                    </CategoryInfo>
                </PanelHeaderLeft>
                <PanelHeaderRight>
                    <CategoryStatsButton
                        onClick={handleCategoryStatsClick}
                        title="Statystyki kategorii"
                    >
                        <FaCalendarAlt />
                    </CategoryStatsButton>
                    <CategoryCount>{category.servicesCount}</CategoryCount>
                </PanelHeaderRight>
            </PanelHeader>

            {isExpanded && (
                <PanelContent>
                    <CategoryServicesTable
                        services={services}
                        categoryName={category.name}
                        loading={loadingServices}
                        onShowStats={onShowStats}
                    />
                </PanelContent>
            )}
        </PanelContainer>
    );
};

interface CategoriesSectionProps {
    categories: Category[];
    categoryServices: Record<number, CategoryService[]>;
    loadingCategoryServices: Set<number>;
    onCreateCategory: () => void;
    onFetchCategoryServices: (categoryId: number) => Promise<CategoryService[]>;
    onShowServiceStats: (serviceId: string, serviceName: string) => void;
    onShowCategoryStats: (categoryId: number, categoryName: string) => void;
    creatingCategory: boolean;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
                                                                        categories,
                                                                        categoryServices,
                                                                        loadingCategoryServices,
                                                                        onCreateCategory,
                                                                        onFetchCategoryServices,
                                                                        onShowServiceStats,
                                                                        onShowCategoryStats,
                                                                        creatingCategory
                                                                    }) => {
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

    const toggleCategory = (categoryId: number) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    const expandAll = () => {
        setExpandedCategories(new Set(categories.map(c => c.id)));
    };

    const collapseAll = () => {
        setExpandedCategories(new Set());
    };

    return (
        <CategoriesContainer>
            <SectionHeader>
                <HeaderLeft>
                    <SectionTitle>Utworzone kategorie</SectionTitle>
                    <CategoryCounter>({categories.length})</CategoryCounter>
                </HeaderLeft>
                <HeaderRight>
                    {categories.length > 0 && (
                        <ExpandControls>
                            <ExpandButton onClick={expandAll}>
                                Rozwiń wszystkie
                            </ExpandButton>
                            <ExpandButton onClick={collapseAll}>
                                Zwiń wszystkie
                            </ExpandButton>
                        </ExpandControls>
                    )}
                    <CreateCategoryButton
                        onClick={onCreateCategory}
                        disabled={creatingCategory}
                    >
                        <FaPlus />
                        {creatingCategory ? 'Tworzenie...' : 'Utwórz kategorię'}
                    </CreateCategoryButton>
                </HeaderRight>
            </SectionHeader>

            <PanelsContainer>
                {categories.length === 0 ? (
                    <EmptyState>
                        <EmptyStateIcon>
                            <FaFolder />
                        </EmptyStateIcon>
                        <EmptyStateTitle>Brak utworzonych kategorii</EmptyStateTitle>
                        <EmptyStateDescription>
                            Kliknij "Utwórz kategorię" aby dodać pierwszą kategorię dla swoich usług
                        </EmptyStateDescription>
                    </EmptyState>
                ) : (
                    categories.map((category) => (
                        <CategoryPanel
                            key={category.id}
                            category={category}
                            isExpanded={expandedCategories.has(category.id)}
                            onToggle={() => toggleCategory(category.id)}
                            services={categoryServices[category.id] || []}
                            loadingServices={loadingCategoryServices.has(category.id)}
                            onLoadServices={onFetchCategoryServices}
                            onShowStats={onShowServiceStats}
                            onShowCategoryStats={onShowCategoryStats}
                        />
                    ))
                )}
            </PanelsContainer>
        </CategoriesContainer>
    );
};

// Styled Components
const CategoriesContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: 16px;
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
    }
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
`;

const CategoryCounter = styled.span`
    font-size: 14px;
    color: ${brandTheme.neutral};
    font-weight: 500;
`;

const ExpandControls = styled.div`
    display: flex;
    gap: 8px;

    @media (max-width: 768px) {
        display: none;
    }
`;

const ExpandButton = styled.button`
    padding: 6px 12px;
    background: transparent;
    border: 1px solid ${brandTheme.border};
    border-radius: 6px;
    color: ${brandTheme.neutral};
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryGhost};
        color: ${brandTheme.primary};
        border-color: ${brandTheme.primary};
    }
`;

const CreateCategoryButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: ${brandTheme.primary};
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${brandTheme.primaryLight};
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    svg {
        font-size: 12px;
    }
`;

const PanelsContainer = styled.div`
    background: ${brandTheme.surface};
`;

const PanelContainer = styled.div`
    border-bottom: 1px solid ${brandTheme.border};
    transition: all 0.2s ease;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: ${brandTheme.surfaceAlt};
    }
`;

const PanelHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;

    &:hover {
        background: ${brandTheme.primaryGhost};
    }
`;

const PanelHeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
`;

const PanelHeaderRight = styled.div`
    display: flex;
    align-items: center;
`;

const ExpandIcon = styled.div<{ $expanded: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: ${brandTheme.neutral};
    font-size: 12px;
    transition: all 0.2s ease;
    transform: ${props => props.$expanded ? 'rotate(0deg)' : 'rotate(0deg)'};
`;

const CategoryIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${brandTheme.primaryGhost};
    border-radius: 8px;
    color: ${brandTheme.primary};
    font-size: 14px;
`;

const CategoryInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const CategoryName = styled.div`
    font-weight: 600;
    font-size: 15px;
    color: #1e293b;
    line-height: 1.3;
`;

const CategoryMeta = styled.div`
    font-size: 12px;
    color: ${brandTheme.neutral};
    font-weight: 500;
`;

const CategoryCount = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 24px;
    padding: 0 8px;
    background: ${brandTheme.primaryGhost};
    border: 1px solid ${brandTheme.border};
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    color: ${brandTheme.primary};
`;

const PanelContent = styled.div`
    background: ${brandTheme.surfaceAlt};
    border-top: 1px solid ${brandTheme.border};
    animation: slideDown 0.2s ease-out;

    @keyframes slideDown {
        from {
            opacity: 0;
            max-height: 0;
        }
        to {
            opacity: 1;
            max-height: 500px;
        }
    }
`;

// Empty State
const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 40px;
    text-align: center;
`;

const EmptyStateIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${brandTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: ${brandTheme.neutral};
    margin-bottom: 20px;
`;

const EmptyStateTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 8px 0;
`;

const EmptyStateDescription = styled.p`
    font-size: 16px;
    color: ${brandTheme.neutral};
    margin: 0;
    line-height: 1.5;
    max-width: 400px;
`;

const CategoryStatsButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${brandTheme.status.infoLight};
    color: ${brandTheme.status.info};
    border: 1px solid ${brandTheme.status.info}30;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-right: 8px;
    font-size: 14px;

    &:hover {
        background: ${brandTheme.status.info};
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    &:active {
        transform: translateY(0);
    }
`;