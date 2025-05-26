// src/components/Gallery/GalleryFilters.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTags, FaTimes } from 'react-icons/fa';
import { GalleryFilters } from '../../api/galleryApi';

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

    return (
        <FiltersContainer>
            <FiltersHeader>
                <FiltersTitle>
                    <FaTags /> Filtruj według tagów
                </FiltersTitle>
            </FiltersHeader>

            {/* Wybrane tagi */}
            {selectedTags.length > 0 && (
                <SelectedTagsSection>
                    <SelectedTagsLabel>Wybrane tagi:</SelectedTagsLabel>
                    <SelectedTags>
                        {selectedTags.map(tag => (
                            <TagBadge key={tag} onClick={() => handleTagRemove(tag)}>
                                {tag} <FaTimes />
                            </TagBadge>
                        ))}
                    </SelectedTags>
                </SelectedTagsSection>
            )}

            {/* Wyszukiwanie tagów */}
            <TagSearchContainer>
                <TagSearchInput
                    type="text"
                    placeholder="Wyszukaj tagi..."
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    onFocus={() => setShowTagDropdown(true)}
                    onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                />
                {showTagDropdown && filteredAvailableTags.length > 0 && (
                    <TagDropdown>
                        {filteredAvailableTags.slice(0, 10).map(tag => (
                            <TagDropdownItem
                                key={tag}
                                onClick={() => handleTagAdd(tag)}
                            >
                                {tag}
                            </TagDropdownItem>
                        ))}
                    </TagDropdown>
                )}
            </TagSearchContainer>
        </FiltersContainer>
    );
};

// Stylowanie komponentów
const FiltersContainer = styled.div`
    background: white;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e8ecef;
`;

const FiltersHeader = styled.div`
    margin-bottom: 20px;
`;

const FiltersTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    color: #1a1d20;
    font-size: 16px;
    font-weight: 600;
`;

const SelectedTagsSection = styled.div`
    margin-bottom: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e9ecef;
`;

const SelectedTagsLabel = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: #495057;
    margin-bottom: 12px;
`;

const SelectedTags = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

const TagBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #0066cc;
    color: white;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #0052a3;
        transform: translateY(-1px);
    }

    svg {
        font-size: 11px;
        opacity: 0.8;
    }
`;

const TagSearchContainer = styled.div`
    position: relative;
`;

const TagSearchInput = styled.input`
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e9ecef;
    border-radius: 6px;
    font-size: 14px;
    background: white;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #0066cc;
        box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }

    &::placeholder {
        color: #6c757d;
    }
`;

const TagDropdown = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 2px solid #e9ecef;
    border-top: none;
    border-radius: 0 0 6px 6px;
    max-height: 240px;
    overflow-y: auto;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const TagDropdownItem = styled.div`
    padding: 12px 16px;
    cursor: pointer;
    font-size: 14px;
    color: #495057;
    border-bottom: 1px solid #f1f3f4;
    transition: background-color 0.15s ease;

    &:hover {
        background: #f8f9fa;
        color: #0066cc;
    }

    &:last-child {
        border-bottom: none;
    }
`;

export default GalleryFiltersComponent;