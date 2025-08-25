// src/pages/Protocols/form/components/AutocompleteField.tsx
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import styled from 'styled-components';
import {FaCar, FaChevronDown, FaSearch, FaTimes, FaUser} from 'react-icons/fa';
import {ClientExpanded, VehicleExpanded} from "../../../types";

const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    neutral: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8'
    },
    transitions: {
        normal: '0.2s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px'
    },
    shadow: {
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }
};

export interface AutocompleteOption {
    id: string;
    label: string;
    value: string;
    type: 'client' | 'vehicle';
    data: ClientExpanded | VehicleExpanded;
    description?: string;
}

interface AutocompleteFieldProps {
    id: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    type?: 'text' | 'email' | 'phone';
    disabled?: boolean;
    options: AutocompleteOption[];
    onSelectOption: (option: AutocompleteOption) => void;
    fieldType: 'licensePlate' | 'ownerName' | 'email' | 'phone' | 'companyName' | 'taxId';
}

export const AutocompleteField: React.FC<AutocompleteFieldProps> = ({
                                                                        id,
                                                                        name,
                                                                        value,
                                                                        onChange,
                                                                        placeholder = '',
                                                                        required = false,
                                                                        error,
                                                                        type = 'text',
                                                                        disabled = false,
                                                                        options,
                                                                        onSelectOption,
                                                                        fieldType
                                                                    }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Filter options based on current input value and field type
    const filteredOptions = useMemo(() => {
        if (!value || value.length < 1) return []; // Zmienione z 2 na 1

        const searchValue = value.toLowerCase().trim();

        return options.filter(option => {
            const optionValue = option.value.toLowerCase();
            const optionLabel = option.label.toLowerCase();

            // Different filtering logic based on field type
            switch (fieldType) {
                case 'licensePlate':
                    return option.type === 'vehicle' &&
                        (optionValue.includes(searchValue) || optionLabel.includes(searchValue));

                case 'ownerName':
                    return option.type === 'client' &&
                        (optionValue.includes(searchValue) || optionLabel.includes(searchValue));

                case 'email':
                    return option.type === 'client' &&
                        option.data && 'email' in option.data &&
                        option.data.email?.toLowerCase().includes(searchValue);

                case 'phone':
                    return option.type === 'client' &&
                        option.data && 'phone' in option.data &&
                        option.data.phone?.toLowerCase().replace(/\s/g, '').includes(searchValue.replace(/\s/g, ''));

                case 'companyName':
                    return option.type === 'client' &&
                        option.data && 'company' in option.data &&
                        option.data.company?.toLowerCase().includes(searchValue);

                case 'taxId':
                    return option.type === 'client' &&
                        option.data && 'taxId' in option.data &&
                        option.data.taxId?.toLowerCase().includes(searchValue);

                default:
                    return optionValue.includes(searchValue) || optionLabel.includes(searchValue);
            }
        }).slice(0, 10); // Limit to 10 results for performance
    }, [value, options, fieldType]);

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
        onChange(e);
        setHighlightedIndex(-1);

        if (!isOpen && e.target.value.length >= 1) { // Zmienione z 2 na 1
            setIsOpen(true);
            updateDropdownPosition();
        } else if (e.target.value.length < 1) { // Zmienione z 2 na 1
            setIsOpen(false);
        }
    };

    const handleOptionSelect = (option: AutocompleteOption) => {
        // Update the input field with the selected value
        const syntheticEvent = {
            target: {
                name,
                value: option.value,
                type: 'text'
            }
        } as React.ChangeEvent<HTMLInputElement>;

        onChange(syntheticEvent);
        onSelectOption(option);
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!isOpen && value.length >= 1) { // Zmienione z 2 na 1
                    setIsOpen(true);
                    updateDropdownPosition();
                } else {
                    setHighlightedIndex(prev =>
                        prev < filteredOptions.length - 1 ? prev + 1 : 0
                    );
                }
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
                    handleOptionSelect(filteredOptions[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    const handleInputFocus = () => {
        if (!disabled && value.length >= 1) { // Zmienione z 2 na 1
            setIsOpen(true);
            updateDropdownPosition();
        }
    };

    const handleInputBlur = () => {
        // Delay closing to allow for option selection
        setTimeout(() => {
            setIsOpen(false);
            setHighlightedIndex(-1);
        }, 200);
    };

    useEffect(() => {
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

        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleResize);

        return () => {
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

    const getOptionIcon = (option: AutocompleteOption) => {
        return option.type === 'vehicle' ? <FaCar /> : <FaUser />;
    };

    const getOptionDescription = (option: AutocompleteOption) => {
        if (option.type === 'vehicle') {
            const vehicle = option.data as VehicleExpanded;
            return `${vehicle.make} ${vehicle.model} • ${vehicle.year || 'Nieznany rok'}`;
        } else {
            const client = option.data as ClientExpanded;
            const parts = [];
            if (client.email) parts.push(client.email);
            if (client.phone) parts.push(client.phone);
            if (client.company) parts.push(client.company);
            return parts.join(' • ');
        }
    };

    return (
        <Container ref={containerRef}>
            <InputContainer $isOpen={isOpen} $disabled={disabled} $hasError={!!error}>
                <SearchIcon>
                    <FaSearch />
                </SearchIcon>

                <Input
                    ref={inputRef}
                    id={id}
                    name={name}
                    type={type}
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-lpignore="true"
                    data-form-type="other"
                />

                {value && !disabled && (
                    <ClearButton
                        type="button"
                        onClick={() => {
                            const syntheticEvent = {
                                target: { name, value: '', type: 'text' }
                            } as React.ChangeEvent<HTMLInputElement>;
                            onChange(syntheticEvent);
                            setIsOpen(false);
                        }}
                    >
                        <FaTimes />
                    </ClearButton>
                )}

                <DropdownIndicator $isOpen={isOpen}>
                    <FaChevronDown />
                </DropdownIndicator>
            </InputContainer>

            {error && <ErrorText>{error}</ErrorText>}

            {isOpen && !disabled && filteredOptions.length > 0 && createPortal(
                <DropdownContainer
                    style={{
                        position: 'absolute',
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width
                    }}
                >
                    <OptionsList ref={listRef}>
                        {filteredOptions.map((option, index) => (
                            <OptionItem
                                key={`${option.type}-${option.id}`}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleOptionSelect(option);
                                }}
                                $highlighted={index === highlightedIndex}
                            >
                                <OptionIcon>
                                    {getOptionIcon(option)}
                                </OptionIcon>
                                <OptionContent>
                                    <OptionLabel>
                                        <HighlightedText text={option.label} highlight={value} />
                                    </OptionLabel>
                                    <OptionDescription>
                                        {getOptionDescription(option)}
                                    </OptionDescription>
                                </OptionContent>
                            </OptionItem>
                        ))}
                    </OptionsList>
                </DropdownContainer>,
                document.body
            )}
        </Container>
    );
};

const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
    if (!highlight || highlight.length < 2) return <>{text}</>;

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
    height: 44px;
    background: ${brandTheme.surface};
    border: 2px solid ${props => {
        if (props.$hasError) return '#dc2626';
        if (props.$isOpen) return brandTheme.primary;
        return brandTheme.border;
    }};
    border-radius: ${brandTheme.radius.md};
    transition: all ${brandTheme.transitions.normal};
    opacity: ${props => props.$disabled ? 0.6 : 1};

    &:hover:not(:has(input:disabled)) {
        border-color: ${props => props.$hasError ? '#dc2626' : brandTheme.primary};
    }

    ${props => props.$isOpen && `
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    `}
`;

const SearchIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 44px;
    color: ${brandTheme.text.muted};
    font-size: 14px;
    flex-shrink: 0;
`;

const Input = styled.input`
    flex: 1;
    height: 100%;
    padding: 0 ${brandTheme.spacing.sm};
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    font-weight: 500;
    color: ${brandTheme.text.primary};

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }

    &:disabled {
        cursor: not-allowed;
    }
`;

const ClearButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    background: ${brandTheme.surfaceAlt};
    color: ${brandTheme.text.muted};
    border-radius: 50%;
    cursor: pointer;
    margin-right: ${brandTheme.spacing.xs};
    font-size: 10px;
    transition: all ${brandTheme.transitions.normal};

    &:hover {
        background: #ef4444;
        color: white;
        transform: scale(1.1);
    }
`;

const DropdownIndicator = styled.div<{ $isOpen: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 44px;
    color: ${brandTheme.text.muted};
    font-size: 12px;
    transition: all ${brandTheme.transitions.normal};
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const ErrorText = styled.div`
    color: #dc2626;
    font-size: 12px;
    font-weight: 500;
    margin-top: ${brandTheme.spacing.xs};
`;

const DropdownContainer = styled.div`
    z-index: 9999;
    background: ${brandTheme.surface};
    border: 2px solid ${brandTheme.primary};
    border-radius: ${brandTheme.radius.md};
    box-shadow: ${brandTheme.shadow.lg};
    max-height: 300px;
    overflow: hidden;
`;

const OptionsList = styled.ul`
    margin: 0;
    padding: ${brandTheme.spacing.xs} 0;
    list-style: none;
    overflow-y: auto;

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
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};
    background: ${props => props.$highlighted ? brandTheme.surfaceAlt : 'transparent'};

    &:hover {
        background: ${brandTheme.surfaceAlt};
    }
`;

const OptionIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    border-radius: ${brandTheme.radius.sm};
    font-size: 14px;
    flex-shrink: 0;
`;

const OptionContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const OptionLabel = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin-bottom: 2px;
`;

const OptionDescription = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const HighlightSpan = styled.span`
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    font-weight: 700;
    padding: 1px 2px;
    border-radius: 2px;
`;