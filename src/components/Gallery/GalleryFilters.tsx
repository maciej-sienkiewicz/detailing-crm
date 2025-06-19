// src/components/Gallery/GalleryFilters.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTags, FaTimes, FaFilter } from 'react-icons/fa';
import { GalleryFilters } from '../../api/galleryApi';

// Brand Theme (same as above)
const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',
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
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    },
    transitions: {
        fast: '0.15s ease',
        normal: '0.2s ease',
        slow: '0.3s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }
};

interface GalleryFiltersProps {
    availableTags: string[];
    onFiltersChange: (filters: GalleryFilters) => void;
    isLoading?: boolean;
}

const GalleryFiltersComponent: React.FC<GalleryFiltersProps> = ({
                                                                    availableTags,
                                                                    onFiltersChange,
                                                                    isLoading = false
                                                                }) => {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagSearch, setTagSearch] = useState('');
    const [showTagDropdown, setShowTagDropdown] = useState(false);

    const filteredAvailableTags = availableTags.filter(tag =>
        tag.toLowerCase().includes(tagSearch.toLowerCase()) &&
        !selectedTags.includes(tag)
    );

    const handleTagAdd = (tag: string) => {
        if (!selectedTags.includes(tag)) {
            const newTags = [...selectedTags, tag];
            setSelectedTags(newTags);
            onFiltersChange({ tags: newTags, tagMatchMode: 'ANY' });
            setTagSearch('');
            setShowTagDropdown(false);
        }
    };

    const handleTagRemove = (tag: string) => {
        const newTags = selectedTags.filter(t => t !== tag);
        setSelectedTags(newTags);
        onFiltersChange({ tags: newTags, tagMatchMode: 'ANY' });
    };

    const handleClearAll = () => {
        setSelectedTags([]);
        setTagSearch('');
        onFiltersChange({});
    };

    return (
        <FiltersContainer>
            <FiltersHeader>
                <HeaderLeft>
                    <FilterIcon>
                        <FaFilter />
                    </FilterIcon>
                    <HeaderContent>
                        <FiltersTitle>Filtry wyszukiwania</FiltersTitle>
                        <FiltersSubtitle>Znajdź zdjęcia według tagów</FiltersSubtitle>
                    </HeaderContent>
                </HeaderLeft>

                {selectedTags.length > 0 && (
                    <ClearButton onClick={handleClearAll}>
                        <FaTimes />
                        Wyczyść filtry
                    </ClearButton>
                )}
            </FiltersHeader>

            <FiltersContent>
                {/* Selected Tags Section */}
                {selectedTags.length > 0 && (
                    <SelectedTagsSection>
                        <SectionLabel>
                            <FaTags />
                            Aktywne filtry ({selectedTags.length})
                        </SectionLabel>
                        <SelectedTags>
                            {selectedTags.map(tag => (
                                <SelectedTagBadge key={tag} onClick={() => handleTagRemove(tag)}>
                                    <TagText>{tag}</TagText>
                                    <RemoveIcon><FaTimes /></RemoveIcon>
                                </SelectedTagBadge>
                            ))}
                        </SelectedTags>
                    </SelectedTagsSection>
                )}

                {/* Tag Search Section */}
                <TagSearchSection>
                    <SectionLabel>
                        <FaTags />
                        Wyszukaj tagi
                    </SectionLabel>
                    <TagSearchContainer>
                        <TagSearchInput
                            type="text"
                            placeholder="Wpisz nazwę tagu..."
                            value={tagSearch}
                            onChange={(e) => {
                                setTagSearch(e.target.value);
                                setShowTagDropdown(true);
                            }}
                            onFocus={() => setShowTagDropdown(true)}
                            onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                            disabled={isLoading}
                        />
                        {showTagDropdown && filteredAvailableTags.length > 0 && (
                            <TagDropdown>
                                <DropdownHeader>
                                    Dostępne tagi ({filteredAvailableTags.length})
                                </DropdownHeader>
                                {filteredAvailableTags.slice(0, 10).map(tag => (
                                    <TagDropdownItem
                                        key={tag}
                                        onClick={() => handleTagAdd(tag)}
                                    >
                                        <TagIcon><FaTags /></TagIcon>
                                        {tag}
                                    </TagDropdownItem>
                                ))}
                                {filteredAvailableTags.length > 10 && (
                                    <DropdownFooter>
                                        I {filteredAvailableTags.length - 10} więcej...
                                    </DropdownFooter>
                                )}
                            </TagDropdown>
                        )}
                        {showTagDropdown && tagSearch && filteredAvailableTags.length === 0 && (
                            <TagDropdown>
                                <EmptyDropdown>
                                    <FaTags />
                                    Brak tagów spełniających kryteria
                                </EmptyDropdown>
                            </TagDropdown>
                        )}
                    </TagSearchContainer>
                </TagSearchSection>

                {/* Quick Tags Section */}
                {availableTags.length > 0 && selectedTags.length === 0 && (
                    <QuickTagsSection>
                        <SectionLabel>
                            <FaTags />
                            Popularne tagi
                        </SectionLabel>
                        <QuickTags>
                            {availableTags.slice(0, 8).map(tag => (
                                <QuickTag key={tag} onClick={() => handleTagAdd(tag)}>
                                    {tag}
                                </QuickTag>
                            ))}
                        </QuickTags>
                    </QuickTagsSection>
                )}
            </FiltersContent>
        </FiltersContainer>
    );
};

// Professional Styled Components for Filters
const FiltersContainer = styled.div`
    max-width: 1600px;
    margin: 0;
    padding: 0 ${brandTheme.spacing.xl};
    margin-bottom: ${brandTheme.spacing.lg};

    @media (max-width: 1024px) {
        padding: 0 ${brandTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: 0 ${brandTheme.spacing.md};
    }
`;

const FiltersHeader = styled.div`
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.xl} ${brandTheme.radius.xl} 0 0;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${brandTheme.spacing.lg};
    box-shadow: ${brandTheme.shadow.xs};

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
        flex-direction: column;
        align-items: flex-start;
        gap: ${brandTheme.spacing.md};
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
`;

const FilterIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${brandTheme.surfaceAlt};
    color: ${brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: ${brandTheme.shadow.sm};
    flex-shrink: 0;
`;

const HeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const FiltersTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
    letter-spacing: -0.3px;
`;

const FiltersSubtitle = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.tertiary};
    font-weight: 500;
`;

const ClearButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    border: 1px solid ${brandTheme.status.error}30;
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};

    &:hover {
        background: ${brandTheme.status.error};
        color: white;
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.sm};
    }

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

const FiltersContent = styled.div`
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-top: none;
    border-radius: 0 0 ${brandTheme.radius.xl} ${brandTheme.radius.xl};
    padding: ${brandTheme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xl};
    box-shadow: ${brandTheme.shadow.sm};

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.lg};
        gap: ${brandTheme.spacing.lg};
    }
`;

const SectionLabel = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.secondary};
    margin-bottom: ${brandTheme.spacing.md};
    text-transform: uppercase;
    letter-spacing: 0.5px;

    svg {
        color: ${brandTheme.primary};
    }
`;

const SelectedTagsSection = styled.div`
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.borderLight};
    border-radius: ${brandTheme.radius.lg};
    border-left: 4px solid ${brandTheme.primary};
`;

const SelectedTags = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${brandTheme.spacing.md};
`;

const SelectedTagBadge = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    border-radius: ${brandTheme.radius.md};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all ${brandTheme.transitions.spring};
    box-shadow: ${brandTheme.shadow.sm};

    &:hover {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
        transform: translateY(-2px);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const TagText = styled.span`
    line-height: 1;
`;

const RemoveIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    font-size: 10px;
    transition: all ${brandTheme.transitions.fast};

    &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
    }
`;

const TagSearchSection = styled.div``;

const TagSearchContainer = styled.div`
    position: relative;
`;

const TagSearchInput = styled.input`
    width: 100%;
    height: 48px;
    padding: 0 ${brandTheme.spacing.lg};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    font-size: 16px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all ${brandTheme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }

    &:disabled {
        background: ${brandTheme.surfaceAlt};
        color: ${brandTheme.text.disabled};
        cursor: not-allowed;
    }
`;

const TagDropdown = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${brandTheme.surface};
    border: 2px solid ${brandTheme.borderLight};
    border-top: none;
    border-radius: 0 0 ${brandTheme.radius.lg} ${brandTheme.radius.lg};
    max-height: 320px;
    overflow-y: auto;
    z-index: 100;
    box-shadow: ${brandTheme.shadow.lg};
    animation: slideDown 0.2s ease;

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: ${brandTheme.surfaceAlt};
    }

    &::-webkit-scrollbar-thumb {
        background: ${brandTheme.borderHover};
        border-radius: 3px;
    }
`;

const DropdownHeader = styled.div`
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    font-size: 12px;
    font-weight: 600;
    color: ${brandTheme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid ${brandTheme.borderLight};
`;

const TagDropdownItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: ${brandTheme.text.secondary};
    border-bottom: 1px solid ${brandTheme.borderLight};
    transition: all ${brandTheme.transitions.fast};

    &:hover {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.primary};
        padding-left: ${brandTheme.spacing.xl};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const TagIcon = styled.div`
    color: ${brandTheme.text.muted};
    font-size: 12px;
`;

const DropdownFooter = styled.div`
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    font-size: 12px;
    color: ${brandTheme.text.muted};
    text-align: center;
    font-style: italic;
`;

const EmptyDropdown = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.xl};
    color: ${brandTheme.text.muted};
    font-size: 14px;
    font-style: italic;
`;

const QuickTagsSection = styled.div``;

const QuickTags = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${brandTheme.spacing.sm};
`;

const QuickTag = styled.button`
   padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
   background: ${brandTheme.surfaceAlt};
   border: 1px solid ${brandTheme.borderLight};
   border-radius: ${brandTheme.radius.md};
   font-size: 13px;
   font-weight: 500;
   color: ${brandTheme.text.secondary};
   cursor: pointer;
   transition: all ${brandTheme.transitions.normal};

   &:hover {
       background: ${brandTheme.primaryGhost};
       border-color: ${brandTheme.primary};
       color: ${brandTheme.primary};
       transform: translateY(-1px);
       box-shadow: ${brandTheme.shadow.sm};
   }

   &:active {
       transform: translateY(0);
   }
`;

export default GalleryFiltersComponent;