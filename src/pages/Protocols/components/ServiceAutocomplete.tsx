import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { FaSearch, FaChevronDown, FaTimes, FaCheck, FaSpinner } from 'react-icons/fa';

const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    neutral: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0'
};

export interface ServiceOption {
    id: string;
    name: string;
}

interface ServiceAutocompleteProps {
    value: string[];
    onChange: (value: string[]) => void;
    options: ServiceOption[];
    disabled?: boolean;
    placeholder?: string;
    loading?: boolean; // Dodano prop loading
}

export const ServiceAutocomplete: React.FC<ServiceAutocompleteProps> = ({
                                                                            value = [],
                                                                            onChange,
                                                                            options,
                                                                            disabled = false,
                                                                            placeholder = "Wybierz usługi...",
                                                                            loading = false // Dodano loading prop
                                                                        }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOptions = options.filter(option => value.includes(option.id));

    const updateDropdownPosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        setHighlightedIndex(-1);

        if (!isOpen && !loading) { // Nie otwieraj jeśli dane się ładują
            setIsOpen(true);
            updateDropdownPosition();
        }
    };

    const handleOptionToggle = (optionId: string) => {
        const newValue = value.includes(optionId)
            ? value.filter(id => id !== optionId)
            : [...value, optionId];

        onChange(newValue);
        setSearchTerm('');
        setHighlightedIndex(-1);
    };

    const handleRemoveSelected = (optionId: string) => {
        const newValue = value.filter(id => id !== optionId);
        onChange(newValue);
    };

    const handleClearAll = () => {
        onChange([]);
        setSearchTerm('');
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleToggle = () => {
        if (disabled || loading) return; // Zablokuj jeśli ładuje się

        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);

        if (newIsOpen) {
            setSearchTerm('');
            updateDropdownPosition();
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled || loading) return; // Zablokuj podczas ładowania

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    handleOptionToggle(filteredOptions[highlightedIndex].id);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSearchTerm('');
                setHighlightedIndex(-1);
                break;
            case 'Backspace':
                if (!searchTerm && selectedOptions.length > 0) {
                    handleRemoveSelected(selectedOptions[selectedOptions.length - 1].id);
                }
                break;
        }
    };

    // Zamknij dropdown gdy loading się zmieni na true
    useEffect(() => {
        if (loading && isOpen) {
            setIsOpen(false);
            setSearchTerm('');
            setHighlightedIndex(-1);
        }
    }, [loading, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (containerRef.current && containerRef.current.contains(target)) {
                return;
            }

            const dropdownElements = document.querySelectorAll('[data-dropdown-portal]');
            for (const dropdown of dropdownElements) {
                if (dropdown.contains(target)) {
                    return;
                }
            }

            setIsOpen(false);
            setSearchTerm('');
            setHighlightedIndex(-1);
        };

        const handleScroll = () => {
            if (isOpen) {
                updateDropdownPosition();
            }
        };

        const handleResize = () => {
            if (isOpen) {
                updateDropdownPosition();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleResize);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleResize);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && highlightedIndex >= 0 && listRef.current) {
            const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
            if (highlightedElement) {
                highlightedElement.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth'
                });
            }
        }
    }, [highlightedIndex, isOpen]);

    return (
        <Container ref={containerRef}>
            <InputContainer $isOpen={isOpen} $disabled={disabled || loading}>
                <InputWrapper>
                    {loading ? (
                        <LoadingIcon>
                            <FaSpinner />
                        </LoadingIcon>
                    ) : (
                        <SearchIcon>
                            <FaSearch />
                        </SearchIcon>
                    )}

                    <SelectedTags>
                        {selectedOptions.map(option => (
                            <SelectedTag key={option.id}>
                                <TagText>{option.name}</TagText>
                                <TagRemove
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveSelected(option.id);
                                    }}
                                    type="button"
                                    disabled={loading}
                                >
                                    <FaTimes />
                                </TagRemove>
                            </SelectedTag>
                        ))}
                    </SelectedTags>

                    <Input
                        ref={inputRef}
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => !disabled && !loading && setIsOpen(true)}
                        placeholder={
                            loading
                                ? "Ładowanie usług..."
                                : selectedOptions.length === 0
                                    ? placeholder
                                    : ''
                        }
                        disabled={disabled || loading}
                    />
                </InputWrapper>

                <ButtonsContainer>
                    {selectedOptions.length > 0 && !disabled && !loading && (
                        <ClearButton onClick={handleClearAll} type="button">
                            <FaTimes />
                        </ClearButton>
                    )}

                    <ToggleButton
                        onClick={handleToggle}
                        type="button"
                        $isOpen={isOpen}
                        disabled={disabled || loading}
                        $loading={loading}
                    >
                        {loading ? <FaSpinner /> : <FaChevronDown />}
                    </ToggleButton>
                </ButtonsContainer>
            </InputContainer>

            {isOpen && !disabled && !loading && createPortal(
                <DropdownContainer
                    data-dropdown-portal="true"
                    style={{
                        position: 'absolute',
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width
                    }}
                >
                    {filteredOptions.length > 0 ? (
                        <OptionsList ref={listRef}>
                            {filteredOptions.map((option, index) => {
                                const isSelected = value.includes(option.id);
                                return (
                                    <OptionItem
                                        key={option.id}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleOptionToggle(option.id);
                                        }}
                                        $highlighted={index === highlightedIndex}
                                        $selected={isSelected}
                                    >
                                        <OptionContent>
                                            <CheckboxContainer>
                                                <Checkbox $checked={isSelected}>
                                                    {isSelected && <FaCheck />}
                                                </Checkbox>
                                            </CheckboxContainer>
                                            <OptionText>
                                                {searchTerm ? (
                                                    <HighlightedText text={option.name} highlight={searchTerm} />
                                                ) : (
                                                    option.name
                                                )}
                                            </OptionText>
                                        </OptionContent>
                                    </OptionItem>
                                );
                            })}
                        </OptionsList>
                    ) : (
                        <NoResults>
                            {searchTerm ? `Brak wyników dla "${searchTerm}"` : 'Brak dostępnych usług'}
                        </NoResults>
                    )}

                    {selectedOptions.length > 0 && (
                        <DropdownFooter>
                            <SelectedCount>
                                Wybrano: {selectedOptions.length}
                            </SelectedCount>
                            <FooterClearButton
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleClearAll();
                                }}
                                type="button"
                            >
                                Wyczyść wszystkie
                            </FooterClearButton>
                        </DropdownFooter>
                    )}
                </DropdownContainer>,
                document.body
            )}
        </Container>
    );
};

const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
    if (!highlight) return <>{text}</>;

    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, index) =>
                regex.test(part) ? (
                    <HighlightSpan key={index}>{part}</HighlightSpan>
                ) : (
                    part
                )
            )}
        </>
    );
};

const Container = styled.div`
    position: relative;
    width: 100%;
`;

const InputContainer = styled.div<{ $isOpen: boolean; $disabled: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    min-height: 44px;
    background: ${brandTheme.surface};
    border: 2px solid ${props => props.$isOpen ? brandTheme.primary : brandTheme.border};
    border-radius: 8px;
    transition: all 0.2s ease;
    opacity: ${props => props.$disabled ? 0.6 : 1};
    padding: 4px 8px;

    &:hover:not(:has(input:disabled)) {
        border-color: ${brandTheme.primary};
    }

    ${props => props.$isOpen && `
    box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
  `}
`;

const InputWrapper = styled.div`
    display: flex;
    align-items: center;
    flex: 1;
    min-height: 36px;
    flex-wrap: wrap;
    gap: 4px;
    padding: 2px 4px;
`;

const SearchIcon = styled.div`
    color: ${brandTheme.neutral};
    font-size: 14px;
    margin-right: 8px;
    flex-shrink: 0;
`;

// Nowy styled component dla spinnera
const LoadingIcon = styled.div`
    color: ${brandTheme.primary};
    font-size: 14px;
    margin-right: 8px;
    flex-shrink: 0;

    svg {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const SelectedTags = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
`;

const SelectedTag = styled.div`
    display: flex;
    align-items: center;
    background: ${brandTheme.primaryGhost};
    border: 1px solid ${brandTheme.primary};
    border-radius: 16px;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 500;
    color: ${brandTheme.primary};
    max-width: 150px;
`;

const TagText = styled.span`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 4px;
`;

const TagRemove = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: none;
    background: transparent;
    color: ${brandTheme.primary};
    cursor: pointer;
    border-radius: 50%;
    font-size: 8px;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${brandTheme.primary};
        color: white;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const Input = styled.input`
    flex-grow: 1;
    min-width: 120px;
    height: 32px;
    padding: 0 8px;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    font-weight: 500;
    color: #374151;

    &::placeholder {
        color: ${brandTheme.neutral};
        font-weight: 400;
    }

    &:disabled {
        cursor: not-allowed;
    }
`;

const ButtonsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
`;

const ClearButton = styled.button`
    width: 20px;
    height: 20px;
    border: none;
    background: ${brandTheme.surfaceAlt};
    color: ${brandTheme.neutral};
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    transition: all 0.2s ease;

    &:hover {
        background: #ef4444;
        color: white;
        transform: scale(1.1);
    }
`;

const ToggleButton = styled.button<{ $isOpen: boolean; $loading?: boolean }>`
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: ${brandTheme.neutral};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: all 0.2s ease;
    transform: ${props => props.$isOpen && !props.$loading ? 'rotate(180deg)' : 'rotate(0deg)'};

    &:hover:not(:disabled) {
        color: ${brandTheme.primary};
    }

    &:disabled {
        cursor: not-allowed;
    }

    ${props => props.$loading && `
        svg {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `}
`;

const DropdownContainer = styled.div`
    z-index: 9999;
    background: ${brandTheme.surface};
    border: 2px solid ${brandTheme.primary};
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    max-height: 250px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;

const OptionsList = styled.ul`
    margin: 0;
    padding: 4px 0;
    list-style: none;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: ${brandTheme.surfaceAlt};
    }

    &::-webkit-scrollbar-thumb {
        background: ${brandTheme.border};
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: ${brandTheme.neutral};
    }
`;

const OptionItem = styled.li<{ $highlighted: boolean; $selected: boolean }>`
    cursor: pointer;
    transition: all 0.2s ease;
    background: ${props => {
        if (props.$highlighted) return brandTheme.surfaceAlt;
        return 'transparent';
    }};

    &:hover {
        background: ${brandTheme.surfaceAlt};
    }
`;

const OptionContent = styled.div`
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 12px;
`;

const CheckboxContainer = styled.div`
    flex-shrink: 0;
`;

const Checkbox = styled.div<{ $checked: boolean }>`
    width: 18px;
    height: 18px;
    border: 2px solid ${props => props.$checked ? brandTheme.primary : brandTheme.border};
    border-radius: 4px;
    background: ${props => props.$checked ? brandTheme.primary : brandTheme.surface};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    transition: all 0.2s ease;
`;

const OptionText = styled.div`
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
`;

const HighlightSpan = styled.span`
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    font-weight: 700;
    padding: 1px 2px;
    border-radius: 2px;
`;

const NoResults = styled.div`
    padding: 16px;
    text-align: center;
    color: ${brandTheme.neutral};
    font-size: 14px;
    font-style: italic;
`;

const DropdownFooter = styled.div`
    padding: 8px 16px;
    border-top: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const SelectedCount = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${brandTheme.primary};
`;

const FooterClearButton = styled.button`
    background: none;
    border: none;
    color: ${brandTheme.neutral};
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
        background: #ef4444;
        color: white;
    }
`;