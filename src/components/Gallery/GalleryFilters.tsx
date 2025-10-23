import React, {useState} from 'react';
import styled from 'styled-components';
import {FaSearch, FaTimes} from 'react-icons/fa';
import {GalleryFilters} from '../../api/galleryApi';
import {theme} from '../../styles/theme';

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
        <FiltersSection>
            <SearchRow>
                <SearchInputWrapper>
                    <SearchIcon>
                        <FaSearch />
                    </SearchIcon>
                    <SearchInput
                        type="text"
                        placeholder="Szukaj tagów..."
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
                            {filteredAvailableTags.slice(0, 8).map(tag => (
                                <DropdownItem key={tag} onClick={() => handleTagAdd(tag)}>
                                    {tag}
                                </DropdownItem>
                            ))}
                        </TagDropdown>
                    )}
                </SearchInputWrapper>

                {selectedTags.length > 0 && (
                    <ClearButton onClick={handleClearAll}>
                        <FaTimes />
                        Wyczyść ({selectedTags.length})
                    </ClearButton>
                )}
            </SearchRow>

            {selectedTags.length > 0 ? (
                <TagsRow>
                    {selectedTags.map(tag => (
                        <ActiveTag key={tag} onClick={() => handleTagRemove(tag)}>
                            {tag}
                            <RemoveIcon><FaTimes /></RemoveIcon>
                        </ActiveTag>
                    ))}
                </TagsRow>
            ) : (
                availableTags.length > 0 && (
                    <TagsRow>
                        {availableTags.slice(0, 12).map(tag => (
                            <SuggestionTag key={tag} onClick={() => handleTagAdd(tag)}>
                                {tag}
                            </SuggestionTag>
                        ))}
                    </TagsRow>
                )
            )}
        </FiltersSection>
    );
};

const FiltersSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xl};
    border-bottom: 1px solid ${theme.borderLight};

    @media (max-width: 1024px) {
        padding: ${theme.spacing.lg};
        gap: ${theme.spacing.md};
    }

    @media (max-width: 768px) {
        padding: ${theme.spacing.md};
    }
`;

const SearchRow = styled.div`
    display: flex;
    gap: ${theme.spacing.md};
    align-items: center;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${theme.spacing.sm};
    }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const SearchIcon = styled.div`
    position: absolute;
    left: ${theme.spacing.md};
    top: 50%;
    transform: translateY(-50%);
    color: ${theme.text.muted};
    font-size: ${theme.fontSize.sm};
    pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 40px;
  padding: 0 ${theme.spacing.md} 0 ${theme.spacing.xxxl};
  border: 1px solid ${theme.border};
  border-radius: ${theme.radius.md};
  font-size: ${theme.fontSize.base};
  background: ${theme.surface};
  color: ${theme.text.primary};
  transition: all ${theme.transitions.normal};

  &:hover {
    border-color: ${theme.borderActive};
  }

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px ${theme.primary}08;
  }

  &::placeholder {
    color: ${theme.text.muted};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TagDropdown = styled.div`
    position: absolute;
    top: calc(100% + ${theme.spacing.xs});
    left: 0;
    right: 0;
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    box-shadow: ${theme.shadow.lg};
    z-index: 100;
    max-height: 240px;
    overflow-y: auto;
    animation: slideDown 0.15s ease;

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-4px);
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
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: ${theme.border};
        border-radius: 3px;
    }
`;

const DropdownItem = styled.button`
    width: 100%;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    text-align: left;
    background: ${theme.surface};
    border: none;
    border-bottom: 1px solid ${theme.borderLight};
    color: ${theme.text.secondary};
    font-size: ${theme.fontSize.sm};
    font-weight: 500;
    cursor: pointer;
    transition: all ${theme.transitions.fast};

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: ${theme.surfaceHover};
        color: ${theme.primary};
    }
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  height: 40px;
  padding: 0 ${theme.spacing.lg};
  background: ${theme.surface};
  color: ${theme.text.tertiary};
  border: 1px solid ${theme.border};
  border-radius: ${theme.radius.md};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all ${theme.transitions.normal};

  svg {
    font-size: ${theme.fontSize.sm};
  }

  &:hover {
    background: ${theme.status.errorLight};
    color: ${theme.status.error};
    border-color: ${theme.status.error}40;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const TagsRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.sm};
`;

const ActiveTag = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${theme.primary};
    color: white;
    border: none;
    border-radius: ${theme.radius.sm};
    font-size: ${theme.fontSize.sm};
    font-weight: 600;
    cursor: pointer;
    transition: all ${theme.transitions.normal};

    &:hover {
        background: ${theme.primaryDark};
        transform: translateY(-1px);
    }
`;

const RemoveIcon = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    font-size: ${theme.fontSize.xs};
`;

const SuggestionTag = styled.button`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${theme.surfaceAlt};
    color: ${theme.text.secondary};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.sm};
    font-size: ${theme.fontSize.sm};
    font-weight: 500;
    cursor: pointer;
    transition: all ${theme.transitions.normal};

    &:hover {
        background: ${theme.primary}08;
        color: ${theme.primary};
        border-color: ${theme.primary}40;
        transform: translateY(-1px);
    }
`;

export default GalleryFiltersComponent;