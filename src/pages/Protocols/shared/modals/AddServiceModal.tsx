import React, {useEffect, useState, useRef} from 'react';
import styled from 'styled-components';
import {FaPlus, FaSearch, FaStickyNote, FaTimes} from 'react-icons/fa';
import {PriceResponse} from "../../../../types/service";
import {DiscountType} from "../../../../features/reservations/api/reservationsApi";
import {calculateLocalFinalPrice} from "../../../../features/services/hooks/useServiceCalculations";

// Professional Brand Theme - Premium Automotive CRM
const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
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
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
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

// Rozszerzone typy rabatu
enum ExtendedDiscountType {
    PERCENTAGE = 'PERCENTAGE',
    AMOUNT_GROSS = 'AMOUNT_GROSS',
    AMOUNT_NET = 'AMOUNT_NET',
    FIXED_PRICE_GROSS = 'FIXED_PRICE_GROSS',
    FIXED_PRICE_NET = 'FIXED_PRICE_NET'
}

const DiscountTypeLabelsExtended: Record<ExtendedDiscountType, string> = {
    [ExtendedDiscountType.PERCENTAGE]: "Procent",
    [ExtendedDiscountType.AMOUNT_GROSS]: "Kwota (brutto)",
    [ExtendedDiscountType.AMOUNT_NET]: "Kwota (netto)",
    [ExtendedDiscountType.FIXED_PRICE_GROSS]: "Cena końcowa (brutto)",
    [ExtendedDiscountType.FIXED_PRICE_NET]: "Cena końcowa (netto)"
};

const mapToStandardDiscountType = (extendedType: ExtendedDiscountType): DiscountType => {
    switch (extendedType) {
        case ExtendedDiscountType.FIXED_PRICE_NET:
            return DiscountType.FIXED_FINAL_NETTO;
        case ExtendedDiscountType.FIXED_PRICE_GROSS:
            return DiscountType.FIXED_FINAL_BRUTTO;
        case ExtendedDiscountType.AMOUNT_NET:
            return DiscountType.FIXED_AMOUNT_OFF_NETTO;
        case ExtendedDiscountType.AMOUNT_GROSS:
            return DiscountType.FIXED_AMOUNT_OFF_BRUTTO;
        case ExtendedDiscountType.PERCENTAGE:
            return DiscountType.PERCENT;
        default:
            return DiscountType.PERCENT;
    }
};

const DEFAULT_VAT_RATE = 23;

interface AddServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddServices: (data: {
        services: Array<{
            id: string;
            name: string;
            basePrice: PriceResponse;
            discountType?: DiscountType;
            discountValue?: number;
            finalPrice: PriceResponse;
            note?: string
        }>
    }) => void;
    availableServices: Array<{ id: string; name: string; price: PriceResponse }>;
    customerPhone?: string;
}

const AddServiceModal: React.FC<AddServiceModalProps> = ({
                                                             isOpen,
                                                             onClose,
                                                             onAddServices,
                                                             availableServices,
                                                             customerPhone
                                                         }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedServices, setSelectedServices] = useState<Array<{
        id: string;
        name: string;
        basePrice: PriceResponse;
        discountType: DiscountType;
        extendedDiscountType: ExtendedDiscountType;
        discountValue: number;
        finalPrice: PriceResponse;
        note?: string;
    }>>([]);
    const [showResults, setShowResults] = useState(false);
    const [searchResults, setSearchResults] = useState<Array<{
        id: string;
        name: string;
        price: PriceResponse;
    }>>([]);
    const [customServiceMode, setCustomServiceMode] = useState(false);
    const [customServiceName, setCustomServiceName] = useState('');
    const [customServicePrice, setCustomServicePrice] = useState('');
    const [addingServiceNote, setAddingServiceNote] = useState<{
        index: number;
        open: boolean;
        note: string;
    }>({ index: -1, open: false, note: '' });

    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Funkcje pomocnicze do kalkulacji cen
    const calculateNetPrice = (grossPrice: number): number => {
        return grossPrice / (1 + DEFAULT_VAT_RATE / 100);
    };

    const calculateGrossPrice = (netPrice: number): number => {
        return netPrice * (1 + DEFAULT_VAT_RATE / 100);
    };

    const calculateTaxAmount = (netPrice: number): number => {
        return netPrice * (DEFAULT_VAT_RATE / 100);
    };

    const formatToTwoDecimals = (value: string): string => {
        let cleaned = value.replace(/[^\d.,]/g, '');
        cleaned = cleaned.replace(',', '.');

        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
        }

        if (parts.length === 2 && parts[1].length > 2) {
            cleaned = parts[0] + '.' + parts[1].substring(0, 2);
        }

        return cleaned;
    };

    const handlePriceBlur = (value: string, setValue: (val: string) => void) => {
        if (value === '' || value === '.') {
            setValue('');
            return;
        }

        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            setValue(numValue.toFixed(2));
        }
    };

    const calculateFinalPrice = (
        basePrice: PriceResponse,
        discountType: DiscountType,
        discountValue: number
    ): PriceResponse => {
        return calculateLocalFinalPrice(basePrice, discountType, discountValue);
    };

    // Obsługa kliknięć poza komponentem
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowResults(false);
                setIsSearchFocused(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen]);

    // Reset state przy zamknięciu
    useEffect(() => {
        if (!isOpen) {
            setSelectedServices([]);
            setSearchQuery('');
            setSearchResults([]);
            setShowResults(false);
            setCustomServiceMode(false);
            setCustomServiceName('');
            setCustomServicePrice('');
            setIsSearchFocused(false);
        }
    }, [isOpen]);

    // ✅ NOWY: Automatyczne przenoszenie wartości z wyszukiwarki do custom service
    useEffect(() => {
        if (customServiceMode && searchQuery.trim() !== '') {
            setCustomServiceName(searchQuery.trim());
            setSearchQuery('');
            setSearchResults([]);
            setShowResults(false);
            setIsSearchFocused(false);
        }
    }, [customServiceMode]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim() === '') {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        if (isSearchFocused) {
            const filteredServices = availableServices.filter(service =>
                service.name.toLowerCase().includes(query.toLowerCase()) &&
                !selectedServices.some(selected => selected.id === service.id)
            );

            setSearchResults(filteredServices);
            setShowResults(true);
        }
    };

    const handleSearchFocus = () => {
        setIsSearchFocused(true);
        if (searchQuery.trim() !== '') {
            const filteredServices = availableServices.filter(service =>
                service.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !selectedServices.some(selected => selected.id === service.id)
            );
            setSearchResults(filteredServices);
            setShowResults(true);
        }
    };

    const handleSearchBlur = () => {
        setTimeout(() => {
            setIsSearchFocused(false);
            setShowResults(false);
        }, 150);
    };

    const handleAddServiceFromSearch = (service: { id: string; name: string; price: PriceResponse }) => {
        const newService = {
            id: service.id,
            name: service.name,
            basePrice: service.price,
            discountType: DiscountType.PERCENT,
            extendedDiscountType: ExtendedDiscountType.PERCENTAGE,
            discountValue: 0,
            finalPrice: service.price
        };

        setSelectedServices([...selectedServices, newService]);
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
        setIsSearchFocused(false);

        setTimeout(() => {
            if (searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }, 100);
    };

    const handleAddCustomService = () => {
        if (customServiceName.trim() === '' || !customServicePrice) return;

        const priceBrutto = parseFloat(customServicePrice);
        if (isNaN(priceBrutto)) return;

        const priceNetto = calculateNetPrice(priceBrutto);
        const taxAmount = calculateTaxAmount(priceNetto);

        const priceResponse: PriceResponse = {
            priceNetto: parseFloat(priceNetto.toFixed(2)),
            priceBrutto: parseFloat(priceBrutto.toFixed(2)),
            taxAmount: parseFloat(taxAmount.toFixed(2))
        };

        const newService = {
            id: `custom-${Date.now()}`,
            name: customServiceName.trim(),
            basePrice: priceResponse,
            discountType: DiscountType.PERCENT,
            extendedDiscountType: ExtendedDiscountType.PERCENTAGE,
            discountValue: 0,
            finalPrice: priceResponse
        };

        setSelectedServices([...selectedServices, newService]);
        setCustomServiceName('');
        setCustomServicePrice('');
        setCustomServiceMode(false);
    };

    // ✅ NOWA: Funkcja zarządzająca przełączaniem trybu custom service
    const toggleCustomServiceMode = (enable: boolean) => {
        if (enable) {
            setCustomServiceMode(true);

            if (searchQuery.trim() !== '') {
                setCustomServiceName(searchQuery.trim());
                setSearchQuery('');
                setSearchResults([]);
                setShowResults(false);
                setIsSearchFocused(false);
            }

            setTimeout(() => {
                const nameInput = document.querySelector<HTMLInputElement>('input[placeholder="Wprowadź nazwę usługi"]');
                if (nameInput) {
                    nameInput.focus();
                    nameInput.setSelectionRange(nameInput.value.length, nameInput.value.length);
                }
            }, 100);
        } else {
            setCustomServiceMode(false);
            setCustomServiceName('');
            setCustomServicePrice('');

            setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }, 100);
        }
    };

    const handleRemoveService = (index: number) => {
        const updatedServices = [...selectedServices];
        updatedServices.splice(index, 1);
        setSelectedServices(updatedServices);
    };

    const handleOpenNoteModal = (index: number) => {
        setAddingServiceNote({
            index,
            open: true,
            note: selectedServices[index].note || ''
        });
    };

    const handleSaveNote = () => {
        if (addingServiceNote.index >= 0) {
            const updatedServices = [...selectedServices];
            updatedServices[addingServiceNote.index] = {
                ...updatedServices[addingServiceNote.index],
                note: addingServiceNote.note
            };
            setSelectedServices(updatedServices);
        }

        setAddingServiceNote({ index: -1, open: false, note: '' });
    };

    const handleCancelNote = () => {
        setAddingServiceNote({ index: -1, open: false, note: '' });
    };

    const handleChangeDiscountType = (index: number, newExtendedType: ExtendedDiscountType) => {
        const updatedServices = [...selectedServices];
        const service = updatedServices[index];
        const standardType = mapToStandardDiscountType(newExtendedType);

        let newDiscountValue = service.discountValue;

        if (service.extendedDiscountType !== newExtendedType) {
            if (standardType === DiscountType.PERCENT) {
                newDiscountValue = 0;
            } else if (standardType === DiscountType.FIXED_AMOUNT_OFF_BRUTTO || standardType === DiscountType.FIXED_AMOUNT_OFF_NETTO) {
                newDiscountValue = 0;
            } else if (standardType === DiscountType.FIXED_FINAL_NETTO || standardType === DiscountType.FIXED_FINAL_BRUTTO) {
                newDiscountValue = newExtendedType === ExtendedDiscountType.FIXED_PRICE_NET
                    ? service.basePrice.priceNetto
                    : service.basePrice.priceBrutto;
            }
        }

        updatedServices[index] = {
            ...service,
            discountType: standardType,
            extendedDiscountType: newExtendedType,
            discountValue: newDiscountValue,
            finalPrice: calculateFinalPrice(service.basePrice, standardType, newDiscountValue)
        };

        setSelectedServices(updatedServices);
    };

    const handleChangeDiscountValue = (index: number, value: number) => {
        const updatedServices = [...selectedServices];
        const service = updatedServices[index];

        let validatedValue = value;

        if (service.discountType === DiscountType.PERCENT && validatedValue > 100) {
            validatedValue = 100;
        }

        if (validatedValue < 0) {
            validatedValue = 0;
        }

        updatedServices[index] = {
            ...service,
            discountValue: validatedValue,
            finalPrice: calculateFinalPrice(
                service.basePrice,
                service.discountType,
                validatedValue
            )
        };

        setSelectedServices(updatedServices);
    };

    const handleSubmit = () => {
        if (selectedServices.length === 0) return;

        const servicesData = selectedServices.map(service => ({
            id: service.id,
            name: service.name,
            basePrice: service.basePrice,
            discountType: service.discountType,
            discountValue: service.discountValue,
            finalPrice: service.finalPrice,
            note: service.note
        }));

        onAddServices({
            services: servicesData
        });
    };

    const calculateTotals = () => {
        const totalBaseNetto = selectedServices.reduce((sum, s) => sum + s.basePrice.priceNetto, 0);
        const totalBaseBrutto = selectedServices.reduce((sum, s) => sum + s.basePrice.priceBrutto, 0);
        const totalFinalNetto = selectedServices.reduce((sum, s) => sum + s.finalPrice.priceNetto, 0);
        const totalFinalBrutto = selectedServices.reduce((sum, s) => sum + s.finalPrice.priceBrutto, 0);
        const totalTax = selectedServices.reduce((sum, s) => sum + s.finalPrice.taxAmount, 0);
        const totalDiscountBrutto = totalBaseBrutto - totalFinalBrutto;
        const totalDiscountNetto = totalBaseNetto - totalFinalNetto;

        return {
            totalBaseNetto,
            totalBaseBrutto,
            totalFinalNetto,
            totalFinalBrutto,
            totalTax,
            totalDiscountBrutto,
            totalDiscountNetto
        };
    };

    const {
        totalBaseNetto,
        totalBaseBrutto,
        totalFinalNetto,
        totalFinalBrutto,
        totalTax,
        totalDiscountBrutto,
        totalDiscountNetto
    } = calculateTotals();

    if (!isOpen) return null;

    const hasSearchResults = showResults && searchResults.length > 0;
    const hasSearchQuery = showResults && searchQuery.trim() !== '';
    const shouldShowNoResults = showResults && searchQuery.trim() !== '' && searchResults.length === 0;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>Dodaj usługi do zlecenia</ModalTitle>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    {customerPhone && (
                        <InfoMessage>
                            Po dodaniu usług, klient otrzyma SMS z prośbą o potwierdzenie na numer <strong>{customerPhone}</strong>.
                        </InfoMessage>
                    )}

                    {/* Wyszukiwarka usług */}
                    <SearchSection>
                        <SectionTitle>Wyszukaj usługę</SectionTitle>
                        <SearchContainer ref={searchContainerRef}>
                            <SearchInputContainer>
                                <SearchIconWrapper>
                                    <FaSearch />
                                </SearchIconWrapper>
                                <SearchInput
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onFocus={handleSearchFocus}
                                    onBlur={handleSearchBlur}
                                    placeholder="Wpisz nazwę usługi..."
                                    disabled={customServiceMode}
                                    $hasResults={hasSearchResults || shouldShowNoResults}
                                />
                            </SearchInputContainer>

                            {/* Wyniki wyszukiwania */}
                            {hasSearchResults && (
                                <SearchResultsContainer>
                                    {searchResults.map(service => (
                                        <SearchResultItem
                                            key={service.id}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleAddServiceFromSearch(service);
                                            }}
                                        >
                                            <SearchResultContent>
                                                <SearchResultName>{service.name}</SearchResultName>
                                                <SearchResultPrices>
                                                    <PriceValue>{service.price.priceBrutto.toFixed(2)} zł</PriceValue>
                                                    <PriceType>brutto</PriceType>
                                                    <PriceValue>{service.price.priceNetto.toFixed(2)} zł</PriceValue>
                                                    <PriceType>netto</PriceType>
                                                </SearchResultPrices>
                                            </SearchResultContent>
                                        </SearchResultItem>
                                    ))}
                                </SearchResultsContainer>
                            )}

                            {shouldShowNoResults && (
                                <NoResultsMessage>
                                    Nie znaleziono usług. Możesz dodać nową usługę.
                                </NoResultsMessage>
                            )}
                        </SearchContainer>
                    </SearchSection>

                    {/* ✅ ZAKTUALIZOWANE: Przyciski toggle */}
                    <ToggleSection>
                        {!customServiceMode ? (
                            <ToggleButton onClick={() => toggleCustomServiceMode(true)}>
                                <FaPlus /> Dodaj niestandardową usługę
                            </ToggleButton>
                        ) : (
                            <ToggleButton secondary onClick={() => toggleCustomServiceMode(false)}>
                                <FaTimes /> Anuluj dodawanie niestandardowej usługi
                            </ToggleButton>
                        )}
                    </ToggleSection>

                    {/* ✅ ZAKTUALIZOWANY: Formularz dodawania niestandardowej usługi */}
                    {customServiceMode && (
                        <CustomServiceSection>
                            <SectionTitle>Nowa usługa</SectionTitle>
                            <FormRow>
                                <FormGroup>
                                    <Label>Nazwa usługi</Label>
                                    <Input
                                        type="text"
                                        value={customServiceName}
                                        onChange={e => setCustomServiceName(e.target.value)}
                                        placeholder="Wprowadź nazwę usługi"
                                        autoFocus
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Cena (brutto)</Label>
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        value={customServicePrice}
                                        onChange={e => {
                                            const formatted = formatToTwoDecimals(e.target.value);
                                            setCustomServicePrice(formatted);
                                        }}
                                        onBlur={() => handlePriceBlur(customServicePrice, setCustomServicePrice)}
                                        placeholder="0.00"
                                    />
                                    {customServicePrice && !isNaN(parseFloat(customServicePrice)) && (
                                        <PriceInfo>
                                            Netto: {calculateNetPrice(parseFloat(customServicePrice)).toFixed(2)} zł
                                        </PriceInfo>
                                    )}
                                </FormGroup>
                            </FormRow>

                            {/* ✅ NOWE: Info message gdy nazwa została przeniesiona */}
                            {customServiceName && (
                                <TransferredValueInfo>
                                    💡 Nazwa usługi została automatycznie przeniesiona z wyszukiwarki
                                </TransferredValueInfo>
                            )}

                            <AddCustomButton
                                onClick={handleAddCustomService}
                                disabled={customServiceName.trim() === '' || !customServicePrice || isNaN(parseFloat(customServicePrice))}
                            >
                                <FaPlus /> Dodaj usługę
                            </AddCustomButton>
                        </CustomServiceSection>
                    )}

                    {/* Lista wybranych usług */}
                    <SelectedServicesSection>
                        <SectionTitle>Wybrane usługi</SectionTitle>

                        {selectedServices.length === 0 ? (
                            <EmptyState>
                                <EmptyStateIcon>
                                    <FaSearch />
                                </EmptyStateIcon>
                                <EmptyStateTitle>Brak wybranych usług</EmptyStateTitle>
                                <EmptyStateDescription>
                                    Wyszukaj lub dodaj niestandardową usługę, aby kontynuować
                                </EmptyStateDescription>
                            </EmptyState>
                        ) : (
                            <ServicesTableContainer>
                                <ServicesTable>
                                    <TableHeader>
                                        <HeaderCell width="35%">Nazwa usługi</HeaderCell>
                                        <HeaderCell width="15%">Cena bazowa</HeaderCell>
                                        <HeaderCell width="25%">Rabat</HeaderCell>
                                        <HeaderCell width="15%">Cena końcowa</HeaderCell>
                                        <HeaderCell width="10%">Akcje</HeaderCell>
                                    </TableHeader>

                                    <TableBody>
                                        {selectedServices.map((service, index) => (
                                            <TableRow key={index}>
                                                <TableCell width="35%">
                                                    <ServiceNameContainer>
                                                        <ServiceName>{service.name}</ServiceName>
                                                        {service.note && (
                                                            <ServiceNote>{service.note}</ServiceNote>
                                                        )}
                                                    </ServiceNameContainer>
                                                </TableCell>
                                                <TableCell width="15%">
                                                    <PriceWrapper>
                                                        <PriceValue>{service.basePrice.priceBrutto.toFixed(2)} zł</PriceValue>
                                                        <PriceType>brutto</PriceType>
                                                        <PriceValue>{service.basePrice.priceNetto.toFixed(2)} zł</PriceValue>
                                                        <PriceType>netto</PriceType>
                                                    </PriceWrapper>
                                                </TableCell>
                                                <TableCell width="25%">
                                                    <DiscountContainer>
                                                        <DiscountTypeSelect
                                                            value={service.extendedDiscountType}
                                                            onChange={(e) => handleChangeDiscountType(
                                                                index,
                                                                e.target.value as ExtendedDiscountType
                                                            )}
                                                        >
                                                            {Object.entries(DiscountTypeLabelsExtended).map(([value, label]) => (
                                                                <option key={value} value={value}>
                                                                    {label}
                                                                </option>
                                                            ))}
                                                        </DiscountTypeSelect>
                                                        <DiscountInputGroup>
                                                            <DiscountInput
                                                                type="text"
                                                                inputMode="decimal"
                                                                min="0"
                                                                max={service.discountType === DiscountType.PERCENT ? 100 : undefined}
                                                                value={service.discountValue}
                                                                onChange={(e) => {
                                                                    const formatted = formatToTwoDecimals(e.target.value);
                                                                    const numValue = parseFloat(formatted) || 0;
                                                                    handleChangeDiscountValue(index, numValue);
                                                                }}
                                                                onBlur={(e) => {
                                                                    const numValue = parseFloat(e.target.value) || 0;
                                                                    handleChangeDiscountValue(index, parseFloat(numValue.toFixed(2)));
                                                                }}
                                                            />
                                                            {service.discountType === DiscountType.PERCENT && (
                                                                <DiscountPercentage>
                                                                    ({(service.basePrice.priceBrutto * service.discountValue / 100).toFixed(2)} zł)
                                                                </DiscountPercentage>
                                                            )}
                                                        </DiscountInputGroup>
                                                    </DiscountContainer>
                                                </TableCell>
                                                <TableCell width="15%">
                                                    <PriceWrapper>
                                                        <PriceValue>{service.finalPrice.priceBrutto.toFixed(2)} zł</PriceValue>
                                                        <PriceType>brutto</PriceType>
                                                        <PriceValue>{service.finalPrice.priceNetto.toFixed(2)} zł</PriceValue>
                                                        <PriceType>netto</PriceType>
                                                    </PriceWrapper>
                                                </TableCell>
                                                <TableCell width="10%">
                                                    <ActionButtons>
                                                        <ActionButton onClick={() => handleOpenNoteModal(index)} title="Dodaj notatkę">
                                                            <FaStickyNote />
                                                        </ActionButton>
                                                        <ActionButton danger onClick={() => handleRemoveService(index)} title="Usuń usługę">
                                                            <FaTimes />
                                                        </ActionButton>
                                                    </ActionButtons>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>

                                    <TableFooter>
                                        <FooterCell width="35%">
                                            <TotalLabel>Razem:</TotalLabel>
                                        </FooterCell>
                                        <FooterCell width="15%">
                                            <PriceWrapper>
                                                <TotalValue>{totalBaseBrutto.toFixed(2)} zł</TotalValue>
                                                <PriceType>brutto</PriceType>
                                                <TotalValue>{totalBaseNetto.toFixed(2)} zł</TotalValue>
                                                <PriceType>netto</PriceType>
                                            </PriceWrapper>
                                        </FooterCell>
                                        <FooterCell width="25%">
                                            <PriceWrapper>
                                                <TotalValue>{totalDiscountBrutto.toFixed(2)} zł</TotalValue>
                                                <PriceType>brutto</PriceType>
                                                <TotalValue>{totalDiscountNetto.toFixed(2)} zł</TotalValue>
                                                <PriceType>netto</PriceType>
                                            </PriceWrapper>
                                        </FooterCell>
                                        <FooterCell width="15%">
                                            <PriceWrapper>
                                                <TotalValue highlight>{totalFinalBrutto.toFixed(2)} zł</TotalValue>
                                                <PriceType>brutto</PriceType>
                                                <TotalValue>{totalFinalNetto.toFixed(2)} zł</TotalValue>
                                                <PriceType>netto</PriceType>
                                            </PriceWrapper>
                                        </FooterCell>
                                        <FooterCell width="10%"></FooterCell>
                                    </TableFooter>
                                </ServicesTable>
                            </ServicesTableContainer>
                        )}
                    </SelectedServicesSection>
                </ModalBody>

                <ModalFooter>
                    <SecondaryButton onClick={onClose}>
                        Anuluj
                    </SecondaryButton>
                    <PrimaryButton
                        onClick={handleSubmit}
                        disabled={selectedServices.length === 0}
                    >
                        Dodaj {selectedServices.length} {
                        selectedServices.length === 1 ? 'usługę' :
                            selectedServices.length < 5 ? 'usługi' : 'usług'
                    }
                    </PrimaryButton>
                </ModalFooter>

                {/* Modal dla notatki */}
                {addingServiceNote.open && (
                    <NoteModalOverlay>
                        <NoteModalContainer>
                            <NoteModalHeader>
                                <NoteModalTitle>Dodaj notatkę do usługi</NoteModalTitle>
                                <CloseButton onClick={handleCancelNote}>
                                    <FaTimes />
                                </CloseButton>
                            </NoteModalHeader>
                            <NoteModalBody>
                                <NoteTextarea
                                    value={addingServiceNote.note}
                                    onChange={(e) => setAddingServiceNote({
                                        ...addingServiceNote,
                                        note: e.target.value
                                    })}
                                    placeholder="Wpisz notatkę dotyczącą usługi..."
                                    rows={5}
                                />
                            </NoteModalBody>
                            <NoteModalFooter>
                                <SecondaryButton onClick={handleCancelNote}>
                                    Anuluj
                                </SecondaryButton>
                                <PrimaryButton onClick={handleSaveNote}>
                                    Zapisz notatkę
                                </PrimaryButton>
                            </NoteModalFooter>
                        </NoteModalContainer>
                    </NoteModalOverlay>
                )}
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components - Professional Automotive CRM Design
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    box-shadow: ${brandTheme.shadow.xl};
    width: 1300px;
    max-width: 95%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease;

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 2px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;

const TransferredValueInfo = styled.div`
    background: linear-gradient(135deg, ${brandTheme.status.successLight} 0%, rgba(5, 150, 105, 0.05) 100%);
    color: ${brandTheme.status.success};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid rgba(5, 150, 105, 0.2);
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    animation: fadeIn 0.3s ease;

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-5px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.025em;
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${brandTheme.surfaceHover};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    color: ${brandTheme.text.muted};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};

    &:hover {
        background: ${brandTheme.status.errorLight};
        border-color: ${brandTheme.status.error};
        color: ${brandTheme.status.error};
        transform: translateY(-1px);
    }
`;

const ModalBody = styled.div`
    padding: ${brandTheme.spacing.xl};
    overflow-y: auto;
    max-height: calc(90vh - 200px);
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xl};

    /* Custom scrollbar */
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

const InfoMessage = styled.div`
    background: linear-gradient(135deg, ${brandTheme.status.infoLight} 0%, rgba(59, 130, 246, 0.05) 100%);
    color: ${brandTheme.status.info};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid rgba(59, 130, 246, 0.2);
    font-size: 14px;
    font-weight: 500;
    box-shadow: ${brandTheme.shadow.xs};

    strong {
        font-weight: 700;
    }
`;

const SearchSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};

    &::before {
        content: '';
        width: 3px;
        height: 16px;
        background: ${brandTheme.primary};
        border-radius: 2px;
    }
`;

const SearchContainer = styled.div`
    position: relative;
`;

const SearchInputContainer = styled.div`
    position: relative;
`;

const SearchIconWrapper = styled.div`
    position: absolute;
    left: ${brandTheme.spacing.md};
    top: 50%;
    transform: translateY(-50%);
    color: ${brandTheme.text.muted};
    font-size: 16px;
    z-index: 2;
`;

const SearchInput = styled.input<{ $hasResults?: boolean }>`
    width: 100%;
    height: 48px;
    padding: 0 ${brandTheme.spacing.md} 0 48px;
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    font-size: 16px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all ${brandTheme.transitions.normal};

    ${props => props.$hasResults && `
       border-bottom-left-radius: 0;
       border-bottom-right-radius: 0;
       border-bottom-color: transparent;
   `}

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};

        ${props => props.$hasResults && `
           border-bottom-color: transparent;
       `}
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }

    &:disabled {
        background: ${brandTheme.surfaceAlt};
        cursor: not-allowed;
        opacity: 0.6;
    }
`;

const SearchResultsContainer = styled.div`
    background: ${brandTheme.surface};
    border: 2px solid ${brandTheme.primary};
    border-top: none;
    border-radius: 0 0 ${brandTheme.radius.lg} ${brandTheme.radius.lg};
    box-shadow: ${brandTheme.shadow.lg};
    max-height: 300px;
    overflow-y: auto;
    position: absolute;
    top: 46px;
    left: 0;
    right: 0;
    z-index: 100;

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

    animation: slideDown 0.2s ease;

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const SearchResultItem = styled.div`
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    cursor: pointer;
    transition: all ${brandTheme.transitions.fast};
    border-bottom: 1px solid ${brandTheme.borderLight};

    &:last-child {
        border-bottom: none;
        border-bottom-left-radius: ${brandTheme.radius.lg};
        border-bottom-right-radius: ${brandTheme.radius.lg};
    }

    &:hover {
        background: ${brandTheme.primaryGhost};
        color: ${brandTheme.primary};
    }

    &:active {
        background: ${brandTheme.primary}20;
    }
`;

const SearchResultContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const SearchResultName = styled.div`
    font-size: 14px;
    color: inherit;
    font-weight: 500;
`;

const SearchResultPrices = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const NoResultsMessage = styled.div`
    color: ${brandTheme.text.muted};
    text-align: center;
    padding: ${brandTheme.spacing.xl};
    font-size: 14px;
    font-style: italic;
    background: ${brandTheme.surfaceAlt};
    border: 2px solid ${brandTheme.primary};
    border-top: none;
    border-radius: 0 0 ${brandTheme.radius.lg} ${brandTheme.radius.lg};
    position: absolute;
    top: 46px;
    left: 0;
    right: 0;
    z-index: 100;
`;

const ToggleSection = styled.div`
    display: flex;
    justify-content: center;
`;

const ToggleButton = styled.button<{ secondary?: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: ${props => props.secondary ? brandTheme.surfaceAlt : brandTheme.primary};
    color: ${props => props.secondary ? brandTheme.text.secondary : 'white'};
    border: 2px solid ${props => props.secondary ? brandTheme.border : 'transparent'};
    border-radius: ${brandTheme.radius.md};
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all ${brandTheme.transitions.normal};
    box-shadow: ${brandTheme.shadow.sm};

    &:hover {
        background: ${props => props.secondary ? brandTheme.surfaceHover : brandTheme.primaryDark};
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }

    svg {
        font-size: 14px;
    }
`;

const CustomServiceSection = styled.div`
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.xl};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.border};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${brandTheme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const Input = styled.input`
    height: 44px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
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
`;

const PriceInfo = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.tertiary};
    margin-top: ${brandTheme.spacing.xs};
    font-weight: 500;
`;

const AddCustomButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    height: 48px;
    background: linear-gradient(135deg, ${brandTheme.status.success} 0%, #059669 100%);
    color: white;
    border: none;
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};
    box-shadow: ${brandTheme.shadow.sm};

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, #047857 0%, ${brandTheme.status.success} 100%);
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        background: ${brandTheme.text.disabled};
    }

    svg {
        font-size: 14px;
    }
`;

const SelectedServicesSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
    border: 2px dashed ${brandTheme.border};
    text-align: center;
`;

const EmptyStateIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${brandTheme.primaryGhost};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: ${brandTheme.spacing.lg};
    font-size: 24px;
    color: ${brandTheme.primary};
`;

const EmptyStateTitle = styled.h4`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.sm} 0;
`;

const EmptyStateDescription = styled.p`
    font-size: 14px;
    color: ${brandTheme.text.muted};
    margin: 0;
    line-height: 1.5;
`;

const ServicesTableContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
`;

const ServicesTable = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`;

const TableHeader = styled.div`
    display: flex;
    background: ${brandTheme.surfaceAlt};
    border-bottom: 2px solid ${brandTheme.border};
`;

const HeaderCell = styled.div<{ width: string }>`
    flex: 0 0 ${props => props.width};
    width: ${props => props.width};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    font-weight: 600;
    font-size: 14px;
    color: ${brandTheme.text.primary};
    border-right: 1px solid ${brandTheme.border};

    &:last-child {
        border-right: none;
    }
`;

const TableBody = styled.div`
    display: flex;
    flex-direction: column;
`;

const TableRow = styled.div`
    display: flex;
    align-items: center;
    border-bottom: 1px solid ${brandTheme.borderLight};
    transition: all ${brandTheme.transitions.fast};

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: ${brandTheme.surfaceHover};
    }
`;

const TableCell = styled.div<{ width: string }>`
    flex: 0 0 ${props => props.width};
    width: ${props => props.width};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    font-size: 14px;
    border-right: 1px solid ${brandTheme.borderLight};

    &:last-child {
        border-right: none;
    }
`;

const ServiceNameContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const ServiceName = styled.span`
    font-weight: 500;
    color: ${brandTheme.text.primary};
    line-height: 1.4;
`;

const ServiceNote = styled.span`
    font-size: 12px;
    color: ${brandTheme.text.tertiary};
    font-style: italic;
    line-height: 1.3;
`;

const PriceWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const PriceValue = styled.span`
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-variant-numeric: tabular-nums;
`;

const PriceType = styled.span`
    font-size: 11px;
    color: ${brandTheme.text.muted};
    text-transform: uppercase;
    font-weight: 500;
`;

const DiscountContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const DiscountTypeSelect = styled.select`
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    font-size: 13px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all ${brandTheme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 2px ${brandTheme.primaryGhost};
    }
`;

const DiscountInputGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const DiscountInput = styled.input`
    width: 80px;
    padding: ${brandTheme.spacing.sm};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    font-size: 13px;
    font-weight: 500;
    text-align: right;
    font-variant-numeric: tabular-nums;
    transition: all ${brandTheme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 2px ${brandTheme.primaryGhost};
    }

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    &[type=number] {
        -moz-appearance: textfield;
    }
`;

const DiscountPercentage = styled.span`
    font-size: 11px;
    color: ${brandTheme.text.tertiary};
    font-weight: 500;
    font-variant-numeric: tabular-nums;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    justify-content: center;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: ${brandTheme.radius.sm};
    cursor: pointer;
    transition: all ${brandTheme.transitions.spring};
    font-size: 14px;

    ${({ danger }) => {
        if (danger) {
            return `
               background: ${brandTheme.status.errorLight};
               color: ${brandTheme.status.error};
               
               &:hover {
                   background: ${brandTheme.status.error};
                   color: white;
                   transform: translateY(-1px);
                   box-shadow: ${brandTheme.shadow.md};
               }
           `;
        }

        return `
           background: ${brandTheme.primaryGhost};
           color: ${brandTheme.primary};
           
           &:hover {
               background: ${brandTheme.primary};
               color: white;
               transform: translateY(-1px);
               box-shadow: ${brandTheme.shadow.md};
           }
       `;
    }}

    &:active {
        transform: translateY(0);
    }
`;

const TableFooter = styled.div`
    display: flex;
    background: ${brandTheme.surfaceAlt};
    border-top: 2px solid ${brandTheme.border};
    font-weight: 600;
`;

const FooterCell = styled.div<{ width: string }>`
    flex: 0 0 ${props => props.width};
    width: ${props => props.width};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    font-size: 14px;
    border-right: 1px solid ${brandTheme.border};

    &:last-child {
        border-right: none;
    }
`;

const TotalLabel = styled.span`
    font-weight: 700;
    color: ${brandTheme.text.primary};
`;

const TotalValue = styled.span<{ highlight?: boolean }>`
    font-weight: ${props => props.highlight ? 700 : 600};
    color: ${props => props.highlight ? brandTheme.primary : brandTheme.text.primary};
    font-variant-numeric: tabular-nums;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-top: 2px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;

const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${brandTheme.transitions.spring};
    min-height: 44px;
    min-width: 120px;

    &:hover {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.text.primary};
        border-color: ${brandTheme.borderHover};
        box-shadow: ${brandTheme.shadow.sm};
    }
`;

const PrimaryButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    border: 2px solid transparent;
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${brandTheme.transitions.spring};
    box-shadow: ${brandTheme.shadow.sm};
    min-height: 44px;
    min-width: 120px;

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        background: ${brandTheme.text.disabled};
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
`;

// Komponenty modalu notatki
const NoteModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
    backdrop-filter: blur(4px);
`;

const NoteModalContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    box-shadow: ${brandTheme.shadow.xl};
    width: 500px;
    max-width: 90%;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease;
`;

const NoteModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 2px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;

const NoteModalTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const NoteModalBody = styled.div`
    padding: ${brandTheme.spacing.xl};
`;

const NoteTextarea = styled.textarea`
    width: 100%;
    padding: ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    resize: vertical;
    font-size: 14px;
    font-family: inherit;
    min-height: 120px;
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
`;

const NoteModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-top: 2px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;

export default AddServiceModal