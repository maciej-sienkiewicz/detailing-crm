// src/components/Gallery/GalleryFilters.tsx
import React, {useState} from 'react';
import styled from 'styled-components';
import {FaFilter, FaTags, FaTimes} from 'react-icons/fa';
import {GalleryFilters} from '../../api/galleryApi';
import {theme} from '../../styles/theme';
import SelectedTags from './SelectedTags';
import TagDropdown from './TagDropdown';
import QuickTags from './QuickTags';

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
                <SelectedTags selectedTags={selectedTags} onTagRemove={handleTagRemove} />

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
                        {showTagDropdown && (tagSearch || filteredAvailableTags.length > 0) && (
                            <TagDropdown
                                filteredTags={filteredAvailableTags}
                                onTagAdd={handleTagAdd}
                                isEmpty={false}
                            />
                        )}
                    </TagSearchContainer>
                </TagSearchSection>

                <QuickTags
                    availableTags={availableTags}
                    selectedTags={selectedTags}
                    onTagAdd={handleTagAdd}
                />
            </FiltersContent>
        </FiltersContainer>
    );
};

const FiltersContainer = styled.div`
  max-width: 1600px;
  margin: 0;
  margin-top: 10px;
  padding: 0 ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.lg};

  @media (max-width: 1024px) {
    padding: 0 ${theme.spacing.lg};
  }

  @media (max-width: 768px) {
    padding: 0 ${theme.spacing.md};
  }
`;

const FiltersHeader = styled.div`
  background: ${theme.surface};
  border: 1px solid ${theme.border};
  border-radius: ${theme.radius.xl} ${theme.radius.xl} 0 0;
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.lg};
  box-shadow: ${theme.shadow.xs};

  @media (max-width: 768px) {
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.md};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const FilterIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${theme.surfaceAlt};
  color: ${theme.text.secondary};
  border-radius: ${theme.radius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: ${theme.shadow.sm};
  flex-shrink: 0;
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const FiltersTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${theme.text.primary};
  margin: 0;
  letter-spacing: -0.3px;
`;

const FiltersSubtitle = styled.div`
  font-size: 14px;
  color: ${theme.text.tertiary};
  font-weight: 500;
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.status.errorLight};
  color: ${theme.status.error};
  border: 1px solid ${theme.status.error}30;
  border-radius: ${theme.radius.md};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all ${theme.transitions.normal};

  &:hover {
    background: ${theme.status.error};
    color: white;
    transform: translateY(-1px);
    box-shadow: ${theme.shadow.sm};
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const FiltersContent = styled.div`
  background: ${theme.surface};
  border: 1px solid ${theme.border};
  border-top: none;
  border-radius: 0 0 ${theme.radius.xl} ${theme.radius.xl};
  padding: ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  box-shadow: ${theme.shadow.sm};

  @media (max-width: 768px) {
    padding: ${theme.spacing.lg};
    gap: ${theme.spacing.lg};
  }
`;

const SectionLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: 14px;
  font-weight: 600;
  color: ${theme.text.secondary};
  margin-bottom: ${theme.spacing.md};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  svg {
    color: ${theme.primary};
  }
`;

const TagSearchSection = styled.div``;

const TagSearchContainer = styled.div`
  position: relative;
`;

const TagSearchInput = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 ${theme.spacing.lg};
  border: 2px solid ${theme.border};
  border-radius: ${theme.radius.lg};
  font-size: 16px;
  font-weight: 500;
  background: ${theme.surface};
  color: ${theme.text.primary};
  transition: all ${theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px ${theme.primaryGhost};
  }

  &::placeholder {
    color: ${theme.text.muted};
    font-weight: 400;
  }

  &:disabled {
    background: ${theme.surfaceAlt};
    color: ${theme.text.disabled};
    cursor: not-allowed;
  }
`;

export default GalleryFiltersComponent;