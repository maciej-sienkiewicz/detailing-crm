// src/features/services/components/ServiceSearch.tsx
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaPlus, FaSearch, FaEuroSign} from 'react-icons/fa';
import PriceEditModal from '../../../pages/Protocols/shared/modals/PriceEditModal';
import {Service, PriceType} from '../../../types';
import {servicesApi} from '../api/servicesApi';

const brandTheme = {
    primary: '#2563eb',
    primaryLight: 'rgba(37, 99, 235, 0.08)',
    border: '#e2e8f0',
    surface: '#ffffff',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8'
    },
    spacing: {
        sm: '8px',
        md: '12px',
        lg: '16px'
    },
    radius: {
        md: '8px',
        lg: '12px'
    },
    shadow: {
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }
};

const EditPriceButton = styled.button.attrs({
    type: 'button',
})`
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: #e0f2fe;
    color: #0ea5e9;
    border: 1px solid #0ea5e9;
    border-radius: 4px;
    font-weight: 500;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    margin-left: 12px;
    white-space: nowrap;

    &:hover {
        background: #0ea5e9;
        color: white;
        border-color: #0ea5e9;
        transform: translateY(-0.5px);
    }
`;

interface ServiceSearchProps {
    searchQuery: string;
    showResults: boolean;
    searchResults: Service[];
    selectedServiceToAdd: Service | null;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectService: (service: Service) => void;
    onAddService: () => void;
    onAddServiceDirect: (service: Service) => void;
    allowCustomService?: boolean;
    onServiceAdded?: () => void;
    onServiceCreated?: (oldId: string, newService: Service) => void;
}

export const ServiceSearch: React.FC<ServiceSearchProps> = ({
                                                                searchQuery,
                                                                showResults,
                                                                searchResults,
                                                                selectedServiceToAdd,
                                                                onSearchChange,
                                                                onSelectService,
                                                                onAddService,
                                                                onAddServiceDirect,
                                                                allowCustomService = true,
                                                                onServiceAdded,
                                                                onServiceCreated
                                                            }) => {
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<(Service & { isNew?: boolean }) | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [isInputFocused, setIsInputFocused] = useState(false);

    useEffect(() => {
        const fetchAllServices = async () => {
            try {
                const services = await servicesApi.fetchServices();
                setAllServices(services);
            } catch (error) {
                console.error('Błąd podczas pobierania wszystkich usług:', error);
            }
        };

        fetchAllServices();
    }, []);

    const isCustomService = searchQuery.trim() !== '' &&
        searchResults.length === 0 &&
        !selectedServiceToAdd;

    const handleServiceClick = (service: Service) => {
        if (service.price.priceNetto === 0 && service.price.priceBrutto === 0) {
            setServiceToEdit({
                ...service,
                isNew: false
            });
            setIsPriceModalOpen(true);
        } else {
            onSelectService(service);
            onAddServiceDirect(service);
        }
    };

    const handleEditPriceClick = (e: React.MouseEvent, service: Service) => {
        e.stopPropagation();

        setServiceToEdit({
            ...service,
            isNew: false
        });
        setIsPriceModalOpen(true);
    };

    const handleAddCustomService = () => {
        if (searchQuery.trim() === '') return;

        if (selectedServiceToAdd) {
            if (selectedServiceToAdd.price.priceNetto === 0 && selectedServiceToAdd.price.priceBrutto === 0) {
                setServiceToEdit({
                    ...selectedServiceToAdd,
                    isNew: false
                });
                setIsPriceModalOpen(true);
            } else {
                onAddService();
            }
        } else if (allowCustomService && isCustomService) {
            const tempId = `custom-${Date.now()}`;
            setServiceToEdit({
                id: tempId,
                name: searchQuery.trim(),
                price: {
                    priceNetto: 0,
                    priceBrutto: 0,
                    taxAmount: 0
                },
                description: '',
                vatRate: 23,
                isNew: true
            });
            setIsPriceModalOpen(true);
        }
    };

    const handleSavePrice = async (inputPrice: number, inputType: PriceType) => {
        if (!serviceToEdit) return;

        try {
            setIsSubmitting(true);

            if (serviceToEdit.isNew) {
                try {
                    const createdService = await servicesApi.createService({
                        name: serviceToEdit.name,
                        description: serviceToEdit.description || '',
                        price: {
                            inputPrice: inputPrice,
                            inputType: inputType
                        },
                        vatRate: serviceToEdit.vatRate || 23
                    });

                    if (onServiceCreated) {
                        onServiceCreated(serviceToEdit.id, createdService);
                    }

                    onSelectService(createdService);
                    onAddServiceDirect(createdService);

                    setTimeout(() => {
                        if (onServiceAdded) {
                            onServiceAdded();
                        }
                    }, 1000);
                } catch (error) {
                    console.error('Błąd podczas dodawania nowej usługi:', error);
                }
            } else {
                try {
                    const updatedService = await servicesApi.updateService(serviceToEdit.id, {
                        name: serviceToEdit.name,
                        description: serviceToEdit.description || '',
                        price: {
                            inputPrice: inputPrice,
                            inputType: inputType
                        },
                        vatRate: serviceToEdit.vatRate || 23
                    });

                    onSelectService(updatedService);
                    onAddServiceDirect(updatedService);

                    if (onServiceAdded) {
                        setTimeout(() => {
                            onServiceAdded();
                        }, 1000);
                    }
                } catch (error) {
                    console.error('Błąd podczas aktualizacji usługi:', error);
                }
            }

        } catch (error) {
            console.error('Błąd podczas przetwarzania usługi:', error);
        } finally {
            setIsPriceModalOpen(false);
            setServiceToEdit(null);
            setIsSubmitting(false);
        }
    };

    const handleInputFocus = () => {
        setIsInputFocused(true);

        if (searchQuery.trim() === '') {
            onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    const handleInputBlur = () => {
        setTimeout(() => {
            setIsInputFocused(false);
        }, 200);
    };

    const shouldShowResults = isInputFocused && (showResults || searchQuery.trim() === '');

    return (
        <SearchContainer>
            <SearchInputGroup>
                <SearchInputWrapper>
                    <SearchIcon>
                        <FaSearch />
                    </SearchIcon>
                    <SearchInput
                        type="text"
                        placeholder="Wyszukaj usługę..."
                        value={searchQuery}
                        onChange={onSearchChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                </SearchInputWrapper>

                {shouldShowResults && (
                    <SearchResultsList>
                        {searchQuery.trim() === '' ? (
                            allServices.length > 0 ? (
                                allServices
                                    .filter(service => !selectedServiceToAdd || service.id !== selectedServiceToAdd.id)
                                    .map(service => (
                                        <SearchResultItem
                                            key={service.id}
                                            onClick={() => handleServiceClick(service)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 1, minWidth: 0 }}>
                                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {service.name}
                                                </div>
                                                <SearchResultPrice>
                                                    {service.price.priceNetto.toFixed(2)} zł
                                                </SearchResultPrice>
                                            </div>

                                            <EditPriceButton
                                                onClick={(e) => handleEditPriceClick(e, service)}
                                            >
                                                <FaEuroSign /> Wstaw z inną ceną
                                            </EditPriceButton>
                                        </SearchResultItem>
                                    ))
                            ) : (
                                <SearchResultItem>
                                    <div>Brak dostępnych usług</div>
                                </SearchResultItem>
                            )
                        ) : searchResults.length > 0 ? (
                            searchResults.map(service => (
                                <SearchResultItem
                                    key={service.id}
                                    onClick={() => handleServiceClick(service)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 1, minWidth: 0 }}>
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {service.name}
                                        </div>
                                        <SearchResultPrice>
                                            {service.price.priceNetto.toFixed(2)} zł
                                        </SearchResultPrice>
                                    </div>

                                    <EditPriceButton
                                        onClick={(e) => handleEditPriceClick(e, service)}
                                    >
                                        <FaEuroSign /> Wstaw z inną ceną
                                    </EditPriceButton>
                                </SearchResultItem>
                            ))
                        ) : (
                            <SearchResultItem>
                                <div>Brak wyników dla "{searchQuery}"</div>
                            </SearchResultItem>
                        )}
                    </SearchResultsList>
                )}

                {isCustomService && allowCustomService && (
                    <CustomServiceInfo>
                        Usługa niestandardowa - po dodaniu zostanie zapisana w bazie usług
                    </CustomServiceInfo>
                )}
            </SearchInputGroup>

            <AddServiceButton
                type="button"
                onClick={handleAddCustomService}
                disabled={!(selectedServiceToAdd || (allowCustomService && searchQuery.trim() !== ''))}
            >
                <FaPlus /> Dodaj usługę
            </AddServiceButton>

            {serviceToEdit && (
                <PriceEditModal
                    isOpen={isPriceModalOpen}
                    onClose={() => {
                        setIsPriceModalOpen(false);
                        setServiceToEdit(null);
                    }}
                    onSave={(inputPrice, inputType) => {
                        void handleSavePrice(inputPrice, inputType);
                    }}
                    serviceName={serviceToEdit.name}
                    isNewService={serviceToEdit.isNew || false}
                    initialPrice={serviceToEdit.price.priceNetto}
                    initialPriceType={PriceType.NET}
                />
            )}
        </SearchContainer>
    );
};

// Styled Components
const SearchContainer = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.md};
    align-items: flex-start;
    margin-bottom: ${brandTheme.spacing.lg};
`;

const SearchInputGroup = styled.div`
    flex: 1;
    position: relative;
`;

const SearchInputWrapper = styled.div`
    position: relative;
    width: 100%;
`;

const SearchIcon = styled.div`
    position: absolute;
    left: ${brandTheme.spacing.md};
    top: 50%;
    transform: translateY(-50%);
    color: ${brandTheme.text.muted};
    font-size: 14px;
    pointer-events: none;
`;

const SearchInput = styled.input`
    width: 100%;
    height: 44px;
    padding: 0 ${brandTheme.spacing.lg} 0 40px;
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

const SearchResultsList = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: ${brandTheme.spacing.sm};
    background: ${brandTheme.surface};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    box-shadow: ${brandTheme.shadow.md};
    max-height: 300px;
    overflow-y: auto;
    z-index: 100;
`;

const SearchResultItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${brandTheme.spacing.md};
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid ${brandTheme.border};

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: ${brandTheme.primaryLight};
    }
`;

const SearchResultPrice = styled.span`
    font-size: 12px;
    font-weight: 600;
    color: ${brandTheme.primary};
    background: ${brandTheme.primaryLight};
    padding: 4px 8px;
    border-radius: 4px;
    white-space: nowrap;
`;

const CustomServiceInfo = styled.div`
    margin-top: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md};
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    color: #92400e;
    font-weight: 500;
`;

const AddServiceButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: ${brandTheme.primary};
    color: white;
    border: none;
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    height: 44px;

    &:hover:not(:disabled) {
        background: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        font-size: 14px;
    }
`;