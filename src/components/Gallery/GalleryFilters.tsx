// src/components/Gallery/GalleryFilters.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaTimes, FaFilter, FaTags } from 'react-icons/fa';
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
    const [filters, setFilters] = useState<GalleryFilters>({
        tags: [],
        tagMatchMode: 'ANY',
        name: '',
        protocolId: '',
        startDate: '',
        endDate: ''
    });

    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagSearch, setTagSearch] = useState('');
    const [showTagDropdown, setShowTagDropdown] = useState(false);

    const filteredAvailableTags = availableTags.filter(tag =>
        tag.toLowerCase().includes(tagSearch.toLowerCase()) &&
        !selectedTags.includes(tag)
    );

    const handleFilterChange = (key: keyof GalleryFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleTagAdd = (tag: string) => {
        if (!selectedTags.includes(tag)) {
            const newTags = [...selectedTags, tag];
            setSelectedTags(newTags);
            handleFilterChange('tags', newTags);
            setTagSearch('');
            setShowTagDropdown(false);
        }
    };

    const handleTagRemove = (tag: string) => {
        const newTags = selectedTags.filter(t => t !== tag);
        setSelectedTags(newTags);
        handleFilterChange('tags', newTags);
    };

    const clearAllFilters = () => {
        const emptyFilters: GalleryFilters = {
            tags: [],
            tagMatchMode: 'ANY',
            name: '',
            protocolId: '',
            startDate: '',
            endDate: ''
        };
        setFilters(emptyFilters);
        setSelectedTags([]);
        setTagSearch('');
        onFiltersChange(emptyFilters);
    };

    return (
        <FiltersContainer>
            <FiltersHeader>
                <FiltersTitle>
                    <FaFilter /> Filtry wyszukiwania
                </FiltersTitle>
                <ClearButton onClick={clearAllFilters}>
                    <FaTimes /> Wyczyść wszystkie
                </ClearButton>
            </FiltersHeader>

            <FiltersGrid>
                {/* Wyszukiwanie po nazwie */}
                <FilterGroup>
                    <FilterLabel>Nazwa zdjęcia</FilterLabel>
                    <FilterInput
                        type="text"
                        placeholder="Wpisz nazwę zdjęcia..."
                        value={filters.name || ''}
                        onChange={(e) => handleFilterChange('name', e.target.value)}
                    />
                </FilterGroup>

                {/* Filtry dat */}
                <FilterGroup>
                    <FilterLabel>Data od</FilterLabel>
                    <FilterInput
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) => handleFilterChange('startDate', e.target.value ? `${e.target.value}T00:00:00` : '')}
                    />
                </FilterGroup>

                <FilterGroup>
                    <FilterLabel>Data do</FilterLabel>
                    <FilterInput
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) => handleFilterChange('endDate', e.target.value ? `${e.target.value}T23:59:59` : '')}
                    />
                </FilterGroup>

                {/* ID protokołu */}
                <FilterGroup>
                    <FilterLabel>ID protokołu</FilterLabel>
                    <FilterInput
                        type="text"
                        placeholder="Wpisz ID protokołu..."
                        value={filters.protocolId || ''}
                        onChange={(e) => handleFilterChange('protocolId', e.target.value)}
                    />
                </FilterGroup>
            </FiltersGrid>

            {/* Filtry tagów */}
            <TagsSection>
                <TagsHeader>
                    <TagsTitle>
                        <FaTags /> Tagi
                    </TagsTitle>
                    {selectedTags.length > 0 && (
                        <TagMatchModeSelector>
                            <label>
                                <input
                                    type="radio"
                                    name="tagMatchMode"
                                    value="ANY"
                                    checked={filters.tagMatchMode === 'ANY'}
                                    onChange={(e) => handleFilterChange('tagMatchMode', e.target.value as 'ANY' | 'ALL')}
                                />
                                Dowolny tag
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="tagMatchMode"
                                    value="ALL"
                                    checked={filters.tagMatchMode === 'ALL'}
                                    onChange={(e) => handleFilterChange('tagMatchMode', e.target.value as 'ANY' | 'ALL')}
                                />
                                Wszystkie tagi
                            </label>
                        </TagMatchModeSelector>
                    )}
                </TagsHeader>

                {/* Wybrane tagi */}
                {selectedTags.length > 0 && (
                    <SelectedTags>
                        {selectedTags.map(tag => (
                            <TagBadge key={tag} onClick={() => handleTagRemove(tag)}>
                                {tag} <FaTimes />
                            </TagBadge>
                        ))}
                    </SelectedTags>
                )}

                {/* Wyszukiwanie tagów */}
                <TagSearchContainer>
                    <TagSearchInput
                        type="text"
                        placeholder="Szukaj tagów..."
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        onFocus={() => setShowTagDropdown(true)}
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
            </TagsSection>
        </FiltersContainer>
    );
};

// Stylowanie komponentów
const FiltersContainer = styled.div`
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FiltersHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
`;

const FiltersTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    color: #2c3e50;
    font-size: 16px;
`;

const ClearButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    
    &:hover {
        background: #c0392b;
    }
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

const FilterLabel = styled.label`
    font-size: 12px;
    font-weight: 500;
    color: #34495e;
    margin-bottom: 5px;
`;

const FilterInput = styled.input`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const TagsSection = styled.div`
    border-top: 1px solid #eee;
    padding-top: 15px;
`;

const TagsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
`;

const TagsTitle = styled.h4`
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    color: #2c3e50;
    font-size: 14px;
`;

const TagMatchModeSelector = styled.div`
    display: flex;
    gap: 15px;
    
    label {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        color: #7f8c8d;
        cursor: pointer;
    }
    
    input[type="radio"] {
        margin: 0;
    }
`;

const SelectedTags = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 15px;
`;

const TagBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 8px;
    background: #3498db;
    color: white;
    border-radius: 12px;
    font-size: 12px;
    cursor: pointer;
    
    &:hover {
        background: #2980b9;
    }
    
    svg {
        font-size: 10px;
    }
`;

const TagSearchContainer = styled.div`
    position: relative;
`;

const TagSearchInput = styled.input`
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const TagDropdown = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-top: none;
    border-radius: 0 0 4px 4px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TagDropdownItem = styled.div`
    padding: 8px 12px;
    cursor: pointer;
    font-size: 14px;
    
    &:hover {
        background: #f8f9fa;
    }
`;

export default GalleryFiltersComponent;