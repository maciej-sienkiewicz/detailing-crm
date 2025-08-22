// src/pages/Protocols/form/components/BrandAutocomplete.tsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { FaSearch, FaChevronDown, FaTimes, FaCheck } from 'react-icons/fa';

const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    neutral: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0'
};

// Lista marek samochodów
const carBrands = [
    "Abarth", "Acura", "Aito", "Aiways", "Aixam", "Alfa Romeo", "Alpine",
    "Arcfox", "Asia", "Aston Martin", "Audi", "Austin", "Autobianchi",
    "AVATR", "Baic", "BAW", "Bentley", "Bestune", "Biro", "BMW",
    "BMW-ALPINA", "Brilliance", "Bugatti", "Buick", "BYD", "Cadillac",
    "Casalini", "Caterham", "Cenntro", "Changan", "Chatenet", "Chery",
    "Chevrolet", "Chrysler", "Citroën", "Cupra", "Dacia", "Daewoo",
    "Daihatsu", "DeLorean", "Denza", "DFM", "DFSK", "DKW", "Dodge",
    "Doosan", "DR MOTOR", "DS Automobiles", "e.GO", "Elaris", "FAW",
    "FENDT", "Ferrari", "Fiat", "Fisker", "Ford", "Forthing", "Gaz",
    "Geely", "Genesis", "GMC", "GWM", "HiPhi", "Honda", "Hongqi",
    "Hummer", "Hyundai", "iamelectric", "Ineos", "Infiniti", "Isuzu",
    "Iveco", "JAC", "Jaecoo", "Jaguar", "Jeep", "Jetour", "Jinpeng",
    "Kia", "KTM", "Lada", "Lamborghini", "Lancia", "Land Rover",
    "Leapmotor", "LEVC", "Lexus", "Li", "Ligier", "Lincoln", "Lixiang",
    "Lotus", "LTI", "Lucid", "Lynk & Co", "MAN", "Maserati", "MAXIMUS",
    "Maxus", "Maybach", "Mazda", "McLaren", "Mercedes-Benz", "Mercury",
    "MG", "Microcar", "MINI", "Mitsubishi", "Morgan", "NIO", "Nissan",
    "Nysa", "Oldsmobile", "Omoda", "Opel", "Peugeot", "Piaggio",
    "Plymouth", "Polestar", "Polonez", "Pontiac", "Porsche", "RAM",
    "Renault", "Rolls-Royce", "Rover", "Saab", "SARINI", "Saturn",
    "Seat", "Seres", "Shuanghuan", "Skoda", "Skywell", "Skyworth",
    "Smart", "SsangYong/KGM", "Subaru", "Suzuki", "Syrena", "Tarpan",
    "Tata", "Tesla", "Toyota", "Trabant", "Triumph", "TUATARA", "Uaz",
    "Vauxhall", "VELEX", "Volkswagen", "Volvo", "Voyah", "WALTRA",
    "Warszawa", "Wartburg", "Wey", "Wołga", "Xiaomi", "XPeng",
    "Zaporożec", "Zastava", "ZEEKR", "Zefir", "Zhidou", "Żuk"
];

interface BrandAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    required?: boolean;
    error?: string;
}

export const BrandAutocomplete: React.FC<BrandAutocompleteProps> = ({
                                                                        value = '',
                                                                        onChange,
                                                                        disabled = false,
                                                                        placeholder = "Wybierz lub wpisz markę",
                                                                        required = false,
                                                                        error
                                                                    }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const filteredBrands = carBrands.filter(brand =>
        brand.toLowerCase().includes((searchTerm || value).toLowerCase())
    );

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
        onChange(newValue);
        setHighlightedIndex(-1);

        if (!isOpen) {
            setIsOpen(true);
            updateDropdownPosition();
        }
    };

    const handleBrandSelect = (brand: string) => {
        onChange(brand);
        setSearchTerm('');
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleClear = () => {
        onChange('');
        setSearchTerm('');
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleToggle = () => {
        if (disabled) return;

        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);

        if (newIsOpen) {
            setSearchTerm('');
            updateDropdownPosition();
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredBrands.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredBrands.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredBrands[highlightedIndex]) {
                    handleBrandSelect(filteredBrands[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSearchTerm('');
                setHighlightedIndex(-1);
                break;
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (containerRef.current && containerRef.current.contains(target)) {
                return;
            }

            const dropdownElements = document.querySelectorAll('[data-brand-dropdown-portal]');
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
            <InputContainer $isOpen={isOpen} $disabled={disabled} $hasError={!!error}>
                <InputWrapper>
                    <SearchIcon>
                        <FaSearch />
                    </SearchIcon>

                    <Input
                        ref={inputRef}
                        type="text"
                        value={searchTerm || value}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => !disabled && setIsOpen(true)}
                        placeholder={placeholder}
                        disabled={disabled}
                        required={required}
                        autoComplete="new-password"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                    />
                </InputWrapper>

                <ButtonsContainer>
                    {value && !disabled && (
                        <ClearButton onClick={handleClear} type="button">
                            <FaTimes />
                        </ClearButton>
                    )}

                    <ToggleButton
                        onClick={handleToggle}
                        type="button"
                        $isOpen={isOpen}
                        disabled={disabled}
                    >
                        <FaChevronDown />
                    </ToggleButton>
                </ButtonsContainer>
            </InputContainer>

            {error && <ErrorText>{error}</ErrorText>}

            {isOpen && !disabled && createPortal(
                <DropdownContainer
                    data-brand-dropdown-portal="true"
                    style={{
                        position: 'absolute',
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width
                    }}
                >
                    {filteredBrands.length > 0 ? (
                        <OptionsList ref={listRef}>
                            {filteredBrands.map((brand, index) => (
                                <OptionItem
                                    key={brand}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleBrandSelect(brand);
                                    }}
                                    $highlighted={index === highlightedIndex}
                                >
                                    <OptionContent>
                                        <OptionText>
                                            <HighlightedText text={brand} highlight={searchTerm || value} />
                                        </OptionText>
                                    </OptionContent>
                                </OptionItem>
                            ))}
                        </OptionsList>
                    ) : (
                        <NoResults>
                            Brak wyników dla "{searchTerm || value}"
                        </NoResults>
                    )}
                </DropdownContainer>,
                document.body
            )}
        </Container>
    );
};

const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
    if (!highlight) return <>{text}</>;

    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
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

const InputContainer = styled.div<{ $isOpen: boolean; $disabled: boolean; $hasError: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    min-height: 44px;
    background: ${brandTheme.surface};
    border: 2px solid ${props => {
    if (props.$hasError) return '#dc2626';
    if (props.$isOpen) return brandTheme.primary;
    return brandTheme.border;
}};
    border-radius: 8px;
    transition: all 0.2s ease;
    opacity: ${props => props.$disabled ? 0.6 : 1};
    padding: 4px 8px;

    &:hover:not(:has(input:disabled)) {
        border-color: ${props => props.$hasError ? '#dc2626' : brandTheme.primary};
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
    padding: 2px 4px;
`;

const SearchIcon = styled.div`
    color: ${brandTheme.neutral};
    font-size: 14px;
    margin-right: 8px;
    flex-shrink: 0;
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

const ToggleButton = styled.button<{ $isOpen: boolean }>`
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
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};

    &:hover:not(:disabled) {
        color: ${brandTheme.primary};
    }

    &:disabled {
        cursor: not-allowed;
    }
`;

const ErrorText = styled.div`
    color: #dc2626;
    font-size: 12px;
    font-weight: 500;
    margin-top: 4px;
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
`;

const OptionItem = styled.li<{ $highlighted: boolean }>`
    cursor: pointer;
    transition: all 0.2s ease;
    background: ${props => props.$highlighted ? brandTheme.surfaceAlt : 'transparent'};

    &:hover {
        background: ${brandTheme.surfaceAlt};
    }
`;

const OptionContent = styled.div`
    display: flex;
    align-items: center;
    padding: 12px 16px;
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