// src/pages/Finances/components/CategoriesSection.tsx
import React, {useState} from 'react';
import styled from 'styled-components';
import {FaCalendarAlt, FaChevronDown, FaChevronRight, FaFolder, FaPlus, FaSync} from 'react-icons/fa';
import {Category, CategoryService} from '../../../api/statsApi';
import {CategoryServicesTable} from './CategoryServicesTable';

const theme = {
    primary: '#1a365d',
    primaryLight: '#2c5aa0',
    primaryGhost: 'rgba(26, 54, 93, 0.04)',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    border: '#e2e8f0',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8'
    },
    status: {
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
    },
    spacing: {
        xs: '3px',
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px'
    },
    radius: {
        sm: '4px',
        md: '6px',
        lg: '8px'
    },
    shadow: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }
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
            await onLoadServices(category.id);
        }
        onToggle();
    };

    const handleCategoryStatsClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onShowCategoryStats(category.id, category.name);
    };

    return (
        <PanelContainer data-expanded={isExpanded}>
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
    onRefresh: () => void;
    loading: boolean;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
                                                                        categories,
                                                                        categoryServices,
                                                                        loadingCategoryServices,
                                                                        onCreateCategory,
                                                                        onFetchCategoryServices,
                                                                        onShowServiceStats,
                                                                        onShowCategoryStats,
                                                                        creatingCategory,
                                                                        onRefresh,
                                                                        loading
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
                {categories.length > 0 && (
                    <HeaderRight>
                        <ExpandControls>
                            <ExpandButton onClick={expandAll}>
                                Rozwiń wszystkie
                            </ExpandButton>
                            <ExpandButton onClick={collapseAll}>
                                Zwiń wszystkie
                            </ExpandButton>
                            <CreateCategoryButton
                                onClick={onCreateCategory}
                                disabled={creatingCategory}
                            >
                                <FaPlus />
                                {creatingCategory ? 'Tworzenie...' : 'Nowa kategoria'}
                            </CreateCategoryButton>
                        </ExpandControls>
                        <RefreshButton onClick={onRefresh} disabled={loading}>
                            <FaSync className={loading ? 'spinning' : ''} />
                        </RefreshButton>
                    </HeaderRight>
                )}
            </SectionHeader>

            <PanelsContainer>
                {categories.length === 0 ? (
                    <EmptyState>
                        <EmptyStateIcon>
                            <FaFolder />
                        </EmptyStateIcon>
                        <EmptyStateTitle>Brak utworzonych kategorii</EmptyStateTitle>
                        <EmptyStateDescription>
                            Utwórz pierwszą kategorię dla swoich usług
                        </EmptyStateDescription>
                        <CreateCategoryButton
                            onClick={onCreateCategory}
                            disabled={creatingCategory}
                        >
                            <FaPlus />
                            {creatingCategory ? 'Tworzenie...' : 'Utwórz pierwszą kategorię'}
                        </CreateCategoryButton>
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

const CategoriesContainer = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.lg};
    border: 1px solid ${theme.border};
    overflow: hidden;
    box-shadow: ${theme.shadow.sm};
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    border-bottom: 1px solid ${theme.border};
    background: ${theme.surfaceAlt};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.sm};
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};

    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
    }
`;

const SectionTitle = styled.h3`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

const CategoryCounter = styled.span`
    font-size: 12px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const ExpandControls = styled.div`
    display: flex;
    gap: ${theme.spacing.xs};
    align-items: center;

    @media (max-width: 768px) {
        display: none;
    }
`;

const ExpandButton = styled.button`
    padding: 4px ${theme.spacing.sm};
    background: transparent;
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.sm};
    color: ${theme.text.secondary};
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.primaryGhost};
        color: ${theme.primary};
        border-color: ${theme.primary};
    }
`;

const CreateCategoryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: 4px ${theme.spacing.sm};
    background: ${theme.primary};
    color: white;
    border: none;
    border-radius: ${theme.radius.sm};
    font-weight: 500;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.primaryLight};
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    svg {
        font-size: 10px;
    }
`;

const RefreshButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.sm};
    color: ${theme.text.secondary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.primaryGhost};
        color: ${theme.primary};
        border-color: ${theme.primary};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const PanelsContainer = styled.div`
    background: ${theme.surfaceAlt};
    padding: ${theme.spacing.md};
`;

const PanelHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    background: ${theme.surface};

    &:hover {
        background: ${theme.primaryGhost};
    }
`;

const PanelContainer = styled.div`
    border-bottom: 1px solid ${theme.border};
    transition: all 0.2s ease;
    background: ${theme.surface};
    margin-bottom: ${theme.spacing.sm};
    border-radius: ${theme.radius.md};
    overflow: hidden;
    box-shadow: ${theme.shadow.sm};

    &:last-child {
        margin-bottom: 0;
    }

    &:hover:not([data-expanded="true"]) {
        background: ${theme.surface};

        ${PanelHeader} {
            background: ${theme.primaryGhost};
        }
    }

    &[data-expanded="true"] {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        border: 1px solid ${theme.border};

        &:not(:last-child) {
            margin-bottom: ${theme.spacing.md};
        }
    }
`;

const PanelHeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    flex: 1;
`;

const PanelHeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
`;

const ExpandIcon = styled.div<{ $expanded: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: ${theme.text.secondary};
    font-size: 10px;
    transition: all 0.2s ease;
`;

const CategoryIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: ${theme.primaryGhost};
    border-radius: ${theme.radius.sm};
    color: ${theme.primary};
    font-size: 12px;
`;

const CategoryInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const CategoryName = styled.div`
    font-weight: 600;
    font-size: 13px;
    color: ${theme.text.primary};
    line-height: 1.3;
`;

const CategoryMeta = styled.div`
    font-size: 11px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const CategoryStatsButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: ${theme.status.infoLight};
    color: ${theme.status.info};
    border: 1px solid ${theme.status.info}30;
    border-radius: ${theme.radius.sm};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 11px;

    &:hover {
        background: ${theme.status.info};
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    &:active {
        transform: translateY(0);
    }
`;

const CategoryCount = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 22px;
    padding: 0 ${theme.spacing.sm};
    background: ${theme.primaryGhost};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 11px;
    font-weight: 600;
    color: ${theme.primary};
`;

const PanelContent = styled.div`
    background: ${theme.surfaceAlt};
    border-top: 1px solid ${theme.border};
    padding: 0;
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

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    text-align: center;
    gap: ${theme.spacing.sm};
`;

const EmptyStateIcon = styled.div`
    width: 42px;
    height: 42px;
    background: ${theme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: ${theme.text.muted};
    margin-bottom: ${theme.spacing.sm};
`;

const EmptyStateTitle = styled.h3`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.xs} 0;
`;

const EmptyStateDescription = styled.p`
    font-size: 12px;
    color: ${theme.text.secondary};
    margin: 0;
    line-height: 1.5;
    max-width: 400px;
`;