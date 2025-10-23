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
        <FiltersContainer>
            <SearchRow>
                <SearchWrapper>
                    <SearchIcon>
                        <FaSearch />
                    </SearchIcon>
                    <SearchInput
                        type="text"
                        placeholder="Wyszukaj tagi..."
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
                        <Dropdown>
                            {filteredAvailableTags.slice(0, 6).map(tag => (
                                <DropdownItem key={tag} onClick={() => handleTagAdd(tag)}>
                                    {tag}
                                </DropdownItem>
                            ))}
                        </Dropdown>
                    )}
                </SearchWrapper>

                {selectedTags.length > 0 && (
                    <ClearButton onClick={handleClearAll}>
                        <FaTimes />
                        Wyczyść
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
                        {availableTags.slice(0, 10).map(tag => (
                            <SuggestionTag key={tag} onClick={() => handleTagAdd(tag)}>
                                {tag}
                            </SuggestionTag>
                        ))}
                    </TagsRow>
                )
            )}
        </FiltersContainer>
    );
};

const FiltersContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px 24px;

    @media (max-width: 768px) {
        padding: 16px;
        gap: 12px;
    }
`;

const SearchRow = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 8px;
    }
`;

const SearchWrapper = styled.div`
    position: relative;
    flex: 1;
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${theme.text.muted};
    font-size: 14px;
    pointer-events: none;
`;

const SearchInput = styled.input`
    width: 100%;
    height: 40px;
    padding: 0 12px 0 36px;
    border: 1px solid #e8ecef;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    background: white;
    color: ${theme.text.primary};
    transition: all 0.2s ease;

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

const Dropdown = styled.div`
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e8ecef;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    z-index: 100;
    max-height: 200px;
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
        width: 4px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: #e8ecef;
        border-radius: 2px;
    }
`;

const DropdownItem = styled.button`
    width: 100%;
    padding: 10px 12px;
    text-align: left;
    background: white;
    border: none;
    border-bottom: 1px solid #f5f7fa;
    color: ${theme.text.secondary};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.1s ease;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: ${theme.surfaceHover};
        color: ${theme.primary};
        padding-left: 16px;
    }
`;

const ClearButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    height: 40px;
    padding: 0 16px;
    background: white;
    color: ${theme.status.error};
    border: 1px solid ${theme.status.error}30;
    border-radius: 8px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    svg {
        font-size: 11px;
    }

    &:hover {
        background: ${theme.status.errorLight};
        border-color: ${theme.status.error};
    }

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

const TagsRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

const ActiveTag = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: ${theme.primary};
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

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
    font-size: 9px;
`;

const SuggestionTag = styled.button`
    padding: 6px 12px;
    background: white;
    color: ${theme.text.secondary};
    border: 1px solid #e8ecef;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.primary}08;
        color: ${theme.primary};
        border-color: ${theme.primary}40;
        transform: translateY(-1px);
    }
`;

export default GalleryFiltersComponent;