import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { FaPlus, FaSearch, FaMobileAlt, FaTimes, FaCheck, FaEdit, FaStickyNote } from 'react-icons/fa';
import ServiceNoteModalWrapper from "./ServiceNoteModalWrapper";

interface Service {
    id: string;
    name: string;
    price: number;
}

interface SelectedServiceWithPrice extends Service {
    customPrice?: number;
    note?: string;
}

interface ServiceWithNote {
    id: string;
    name: string;
    price: number;
    note?: string; // Upewnij się, że nota jest zdefiniowana w interfejsie
}

interface AddServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddServices: (servicesData: {
        services: Array<{
            id: string;
            name: string;
            price: number;
            note?: string;
        }>;
    }) => void;
    availableServices: Service[];
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
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [selectedServices, setSelectedServices] = useState<SelectedServiceWithPrice[]>([]);

    // State for price editor
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [editingPrice, setEditingPrice] = useState<string>('');
    const [editingPricePosition, setEditingPricePosition] = useState<{x: number, y: number}>({x: 0, y: 0});

    // State for note modal
    const [noteModal, setNoteModal] = useState<{
        visible: boolean;
        serviceId: string;
        serviceName: string;
        currentNote: string;
    }>({
        visible: false,
        serviceId: '',
        serviceName: '',
        currentNote: ''
    });

    // Check if SMS can be sent
    const canSendSMS = !!customerPhone;

    // Error to show when notification cannot be sent
    const canNotifyError = !canSendSMS
        ? "Brak numeru telefonu klienta. Nie będzie możliwe wysłanie powiadomienia SMS."
        : "";

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setSelectedServices([]);
            setEditingServiceId(null);
        }
    }, [isOpen]);

    // Filter services based on search
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredServices(availableServices);
        } else {
            const query = searchQuery.toLowerCase();
            const results = availableServices.filter(service =>
                service.name.toLowerCase().includes(query)
            );
            setFilteredServices(results);
        }
    }, [searchQuery, availableServices]);

    // Toggle service selection
    const toggleServiceSelection = (service: Service) => {
        if (selectedServices.some(s => s.id === service.id)) {
            // If the service is already selected, remove it
            setSelectedServices(selectedServices.filter(s => s.id !== service.id));
        } else {
            // Otherwise add it with default quantity of 1
            setSelectedServices([...selectedServices]);
        }
    };

    // Handle adding custom service
    const handleAddCustomService = () => {
        if (!searchQuery.trim()) return;

        // Check if service with this name is already selected
        if (selectedServices.some(s => s.name.toLowerCase() === searchQuery.trim().toLowerCase())) {
            alert("Usługa o podanej nazwie jest już na liście wybranych usług.");
            return;
        }

        // Check if we're trying to add an existing service
        const existingService = availableServices.find(s =>
            s.name.toLowerCase() === searchQuery.trim().toLowerCase()
        );

        if (existingService) {
            // If it's an existing service, just add it
            toggleServiceSelection(existingService);
            return;
        }

        // Create a new custom service
        const customService: SelectedServiceWithPrice = {
            id: `custom-${Date.now()}`,
            name: searchQuery.trim(),
            price: 0, // Default price is zero
            customPrice: 0
        };

        setSelectedServices([...selectedServices, customService]);
        setSearchQuery(''); // Clear search field
    };

    const handleAddServices = () => {
        if (selectedServices.length === 0) return;

        // Przygotowujemy usługi z uwzględnieniem niestandardowych cen, ilości i notatek
        const servicesWithCustomPrices = selectedServices.map(service => ({
            id: service.id,
            name: service.name,
            price: service.customPrice !== undefined ? service.customPrice : service.price,
            note: service.note
        }));

        console.log('Przygotowane usługi do wysłania:', servicesWithCustomPrices);

        onAddServices({
            services: servicesWithCustomPrices
        });
    };

    // Handle right click on price - open price editor
    const handlePriceRightClick = (e: React.MouseEvent, service: SelectedServiceWithPrice) => {
        e.preventDefault(); // Prevent default browser context menu

        // Find parent element (service row)
        const priceElement = e.currentTarget as HTMLElement;
        const serviceItem = priceElement.closest('.selected-service-item');

        if (serviceItem) {
            const rect = serviceItem.getBoundingClientRect();

            setEditingServiceId(service.id);
            setEditingPrice((service.customPrice !== undefined ? service.customPrice : service.price).toString());

            // Set position of the price editor - centered next to the selected service
            setEditingPricePosition({
                x: Math.max(10, rect.left + (rect.width / 2) - 125), // Centered, min 10px from left edge
                y: rect.top // Aligned with top edge of row
            });
        } else {
            // Fallback - use click position if we can't find the row
            setEditingServiceId(service.id);
            setEditingPrice((service.customPrice !== undefined ? service.customPrice : service.price).toString());

            setEditingPricePosition({
                x: Math.max(10, e.clientX - 125),
                y: e.clientY
            });
        }
    };

    // Handle click on edit price icon
    const handleEditPrice = (e: React.MouseEvent, service: SelectedServiceWithPrice) => {
        // Find parent element (service row)
        const priceElement = e.currentTarget as HTMLElement;
        const serviceItem = priceElement.closest('.selected-service-item');

        if (serviceItem) {
            const rect = serviceItem.getBoundingClientRect();

            setEditingServiceId(service.id);
            setEditingPrice((service.customPrice !== undefined ? service.customPrice : service.price).toString());

            // Set position of price editor - centered next to selected service
            setEditingPricePosition({
                x: Math.max(10, rect.left + (rect.width / 2) - 125), // Centered, min 10px from left edge
                y: rect.top // Aligned with top edge of row
            });
        } else {
            // Fallback if parent element not found
            const rect = priceElement.getBoundingClientRect();

            setEditingServiceId(service.id);
            setEditingPrice((service.customPrice !== undefined ? service.customPrice : service.price).toString());

            setEditingPricePosition({
                x: Math.max(10, rect.left - 100),
                y: rect.top
            });
        }
    };

    // Save edited price
    const handleSavePrice = () => {
        if (!editingServiceId) return;

        const newPrice = parseFloat(editingPrice);
        if (isNaN(newPrice) || newPrice < 0) {
            setEditingServiceId(null);
            return;
        }

        // Update price for selected service
        setSelectedServices(prev => prev.map(service => {
            if (service.id === editingServiceId) {
                return {
                    ...service,
                    customPrice: newPrice
                };
            }
            return service;
        }));

        setEditingServiceId(null);
    };

    // Open note modal
    const handleOpenNoteModal = (service: SelectedServiceWithPrice) => {
        setNoteModal({
            visible: true,
            serviceId: service.id,
            serviceName: service.name,
            currentNote: service.note || ''
        });
    };

    // Save note
    const handleSaveNote = (note: string) => {
        if (!noteModal.serviceId) return;

        console.log('Zapisywanie notatki dla usługi:', noteModal.serviceId);
        console.log('Treść notatki:', note);

        // Aktualizacja notatki dla wybranej usługi
        const updatedServices = selectedServices.map(service => {
            if (service.id === noteModal.serviceId) {
                console.log('Znaleziono usługę do aktualizacji:', service);
                const updatedService = {
                    ...service,
                    note: note
                };
                console.log('Zaktualizowana usługa:', updatedService);
                return updatedService;
            }
            return service;
        });

        console.log('Wszystkie usługi po aktualizacji:', updatedServices);
        setSelectedServices(updatedServices);
        setNoteModal({...noteModal, visible: false});
    };

    // Close price editor when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (editingServiceId && !(e.target as Element).closest('.price-editor')) {
                setEditingServiceId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [editingServiceId]);

    // Handle Enter and Escape keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!editingServiceId) return;

            if (e.key === 'Enter') {
                handleSavePrice();
            } else if (e.key === 'Escape') {
                setEditingServiceId(null);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [editingServiceId, editingPrice]);

    // Check if entered name is a custom service (doesn't exist in available services)
    const isCustomService = searchQuery.trim() !== '' &&
        !filteredServices.some(s => s.name.toLowerCase() === searchQuery.trim().toLowerCase()) &&
        !selectedServices.some(s => s.name.toLowerCase() === searchQuery.trim().toLowerCase());

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>
                        <ModalIcon><FaPlus /></ModalIcon>
                        Dodaj dodatkowe usługi
                    </ModalTitle>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                </ModalHeader>
                <ModalBody>
                    <ModalDescription>
                        Dodaj dodatkowe usługi do protokołu. SMS z prośbą o potwierdzenie zostanie automatycznie wysłany do klienta.
                    </ModalDescription>

                    <SectionTitle>Wybierz usługi</SectionTitle>
                    <SearchContainer>
                        <SearchInputWrapper>
                            <SearchIcon><FaSearch /></SearchIcon>
                            <SearchInput
                                type="text"
                                placeholder="Wyszukaj usługę lub wpisz nazwę niestandardowej usługi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </SearchInputWrapper>

                        {isCustomService && (
                            <CustomServiceInfo>
                                Niestandardowa usługa - po dodaniu należy ustawić cenę
                            </CustomServiceInfo>
                        )}

                        <AddCustomButton
                            onClick={handleAddCustomService}
                            disabled={!searchQuery.trim() || selectedServices.some(s => s.name.toLowerCase() === searchQuery.trim().toLowerCase())}
                        >
                            <FaPlus /> {isCustomService ? "Dodaj niestandardową usługę" : "Dodaj do listy"}
                        </AddCustomButton>
                    </SearchContainer>

                    <ServicesList>
                        {filteredServices.length === 0 && !isCustomService ? (
                            <EmptySearchResults>
                                Nie znaleziono usług spełniających kryteria wyszukiwania
                            </EmptySearchResults>
                        ) : (
                            filteredServices.map(service => (
                                <ServiceItem
                                    key={service.id}
                                    selected={selectedServices.some(s => s.id === service.id)}
                                    onClick={() => toggleServiceSelection(service)}
                                >
                                    <ServiceName>{service.name}</ServiceName>
                                    <ServicePrice>{service.price.toFixed(2)} zł</ServicePrice>
                                    {selectedServices.some(s => s.id === service.id) && (
                                        <ServiceSelectedIcon><FaCheck /></ServiceSelectedIcon>
                                    )}
                                </ServiceItem>
                            ))
                        )}
                    </ServicesList>

                    <SelectedServicesSection>
                        <SelectedServicesTitle>
                            Wybrane usługi ({selectedServices.length})
                        </SelectedServicesTitle>

                        {selectedServices.length === 0 ? (
                            <NoSelectedServices>
                                Nie wybrano żadnych usług
                            </NoSelectedServices>
                        ) : (
                            <SelectedServicesList>
                                {selectedServices.map(service => (
                                    <SelectedServiceItem className="selected-service-item" key={service.id}>
                                        <SelectedServiceNameContainer>
                                            <SelectedServiceName>{service.name}</SelectedServiceName>
                                            {service.note && (
                                                <ServiceNote>{service.note}</ServiceNote>
                                            )}
                                        </SelectedServiceNameContainer>

                                        <SelectedServicePrice
                                            onContextMenu={(e) => handlePriceRightClick(e, service)}
                                        >
                                            {(service.customPrice !== undefined ? service.customPrice : service.price).toFixed(2)} zł
                                            <EditPriceIcon onClick={(e) => handleEditPrice(e, service)}>
                                                <FaEdit />
                                            </EditPriceIcon>
                                        </SelectedServicePrice>
                                        <SelectedServiceActions>
                                            <ActionButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenNoteModal(service);
                                                }}
                                                title="Dodaj notatkę"
                                                note={!!service.note}
                                            >
                                                <FaStickyNote />
                                            </ActionButton>
                                            <ActionButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleServiceSelection(service);
                                                }}
                                                title="Usuń usługę"
                                                danger
                                            >
                                                <FaTimes />
                                            </ActionButton>
                                        </SelectedServiceActions>
                                    </SelectedServiceItem>
                                ))}
                                <TotalPriceRow>
                                    <TotalPriceLabel>Łącznie:</TotalPriceLabel>
                                    <TotalPriceValue>
                                        {selectedServices.reduce((sum, s) =>
                                                sum + (s.customPrice !== undefined ? s.customPrice : s.price),
                                            0).toFixed(2)} zł
                                    </TotalPriceValue>
                                </TotalPriceRow>
                            </SelectedServicesList>
                        )}
                    </SelectedServicesSection>

                    <Divider />

                    <SectionTitle>Powiadomienie SMS</SectionTitle>
                    {canNotifyError ? (
                        <ErrorMessage>{canNotifyError}</ErrorMessage>
                    ) : (
                        <SmsInfo>
                            <SmsIcon><FaMobileAlt /></SmsIcon>
                            <SmsDetails>
                                <SmsTitle>Automatyczne powiadomienie SMS</SmsTitle>
                                <SmsDescription>
                                    Po dodaniu usług klient otrzyma SMS z prośbą o zatwierdzenie na numer: {customerPhone}
                                </SmsDescription>
                                <SmsNote>
                                    Treść wiadomości zostanie wygenerowana automatycznie przez system.
                                </SmsNote>
                            </SmsDetails>
                        </SmsInfo>
                    )}
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={onClose}>
                        <FaTimes /> Anuluj
                    </CancelButton>
                    <ConfirmButton
                        onClick={handleAddServices}
                        disabled={selectedServices.length === 0 || (!canSendSMS && selectedServices.length > 0)}
                    >
                        <FaPlus /> Dodaj usługi
                    </ConfirmButton>
                </ModalFooter>
            </ModalContainer>

            {/* Price editor */}
            {editingServiceId && (
                <EditPricePopup
                    className="price-editor"
                    style={{
                        position: 'fixed',
                        top: editingPricePosition.y,
                        left: editingPricePosition.x
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking editor
                >
                    <PopupTitle>Edytuj cenę</PopupTitle>
                    <EditPriceForm>
                        <EditPriceInput
                            type="text"
                            value={editingPrice}
                            onChange={(e) => {
                                // Allow only digits and period/comma
                                const value = e.target.value;
                                if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
                                    setEditingPrice(value);
                                }
                            }}
                            placeholder="Wprowadź nową cenę"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSavePrice();
                                } else if (e.key === 'Escape') {
                                    e.preventDefault();
                                    setEditingServiceId(null);
                                }
                            }}
                        />
                        <EditPriceButtons>
                            <Button onClick={() => setEditingServiceId(null)}>
                                Anuluj
                            </Button>
                            <Button primary onClick={handleSavePrice}>
                                Zapisz
                            </Button>
                        </EditPriceButtons>
                    </EditPriceForm>
                </EditPricePopup>
            )}

            {/* Service Note Modal */}
            {noteModal.visible && (
                <ServiceNoteModalWrapper
                    isOpen={noteModal.visible}
                    onClose={() => setNoteModal({...noteModal, visible: false})}
                    onSave={handleSaveNote}
                    serviceName={noteModal.serviceName}
                    initialNote={noteModal.currentNote}
                />
            )}
        </ModalOverlay>
    );
};

// Styled components
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const ModalContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 650px;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    z-index: 1001;
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 18px;
    color: #34495e;
    display: flex;
    align-items: center;
`;

const ModalIcon = styled.span`
    color: #3498db;
    margin-right: 10px;
    font-size: 20px;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 22px;
    cursor: pointer;
    color: #7f8c8d;

    &:hover {
        color: #34495e;
    }
`;

const ModalBody = styled.div`
    padding: 20px;
`;

const ModalDescription = styled.p`
    font-size: 14px;
    line-height: 1.5;
    color: #34495e;
    margin-top: 0;
    margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    color: #2c3e50;
    margin: 0 0 15px 0;
`;

const SearchContainer = styled.div`
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const SearchInputWrapper = styled.div`
    position: relative;
    width: 100%;
`;

const SearchIcon = styled.span`
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #95a5a6;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 10px 12px 10px 36px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const CustomServiceInfo = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    font-style: italic;
    margin-top: -5px;
`;

const AddCustomButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #f0f7ff;
    color: #3498db;
    border: 1px solid #d5e9f9;
    border-radius: 4px;
    padding: 8px 15px;
    font-size: 14px;
    cursor: pointer;
    align-self: flex-start;

    &:hover:not(:disabled) {
        background-color: #d5e9f9;
    }

    &:disabled {
        background-color: #f5f5f5;
        color: #bbb;
        border-color: #ddd;
        cursor: not-allowed;
    }
`;

const ServicesList = styled.div`
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 4px;
    margin-bottom: 20px;
`;

const EmptySearchResults = styled.div`
    padding: 15px;
    text-align: center;
    color: #95a5a6;
    font-style: italic;
`;

const ServiceItem = styled.div<{ selected: boolean }>`
    display: flex;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    background-color: ${props => props.selected ? '#eaf6fd' : 'white'};
    position: relative;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background-color: ${props => props.selected ? '#eaf6fd' : '#f9f9f9'};
    }
`;

const ServiceName = styled.div`
    flex: 1;
    font-size: 14px;
    color: #34495e;
`;

const ServicePrice = styled.div`
    font-weight: 500;
    font-size: 14px;
    color: #2980b9;
    margin-right: 10px;
`;

const ServiceSelectedIcon = styled.div`
    color: #2ecc71;
    font-size: 16px;
`;

const SelectedServicesSection = styled.div`
    margin-bottom: 20px;
`;

const SelectedServicesTitle = styled.div`
    font-weight: 500;
    font-size: 14px;
    color: #34495e;
    margin-bottom: 10px;
`;

const NoSelectedServices = styled.div`
    padding: 15px;
    text-align: center;
    background-color: #f8f9fa;
    border-radius: 4px;
    color: #95a5a6;
    font-style: italic;
`;

const SelectedServicesList = styled.div`
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
`;

const SelectedServiceItem = styled.div`
    display: flex;
    align-items: flex-start;
    padding: 10px 15px;
    border-bottom: 1px solid #eee;
    background-color: #f0f7ff;
`;

const SelectedServiceNameContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const SelectedServiceName = styled.div`
    font-weight: normal;
    color: #34495e;
`;

// New component for service note
const ServiceNote = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-top: 4px;
    font-style: italic;
    line-height: 1.4;
    padding-top: 4px;
    border-top: 1px dashed #eee;
    word-break: break-word;
`;

const SelectedServicePrice = styled.div`
    font-weight: 500;
    font-size: 14px;
    color: #2980b9;
    margin: 0 10px;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;

    &:hover {
        text-decoration: underline dotted;
    }
`;

const EditPriceIcon = styled.span`
    color: #3498db;
    font-size: 13px;
    opacity: 0.7;

    &:hover {
        opacity: 1;
    }
`;

const SelectedServiceActions = styled.div`
    display: flex;
    gap: 5px;
    align-items: center;
`;

const ActionButton = styled.button<{ danger?: boolean; note?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background-color: ${props => {
        if (props.danger) return '#fef5f5';
        if (props.note) return '#eafaf1';
        return '#f0f7ff';
    }};
    color: ${props => {
        if (props.danger) return '#e74c3c';
        if (props.note) return '#27ae60';
        return '#3498db';
    }};
    border: 1px solid ${props => {
        if (props.danger) return '#fde8e8';
        if (props.note) return '#d5f5e3';
        return '#d5e9f9';
    }};
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;

    &:hover {
        background-color: ${props => {
            if (props.danger) return '#fde8e8';
            if (props.note) return '#d5f5e3';
            return '#d5e9f9';
        }};
    }
`;

const TotalPriceRow = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 12px 15px;
    background-color: #f8f9fa;
    border-top: 1px solid #eee;
`;

const TotalPriceLabel = styled.div`
    font-weight: 500;
    font-size: 14px;
    color: #34495e;
`;

const TotalPriceValue = styled.div`
    font-weight: 600;
    font-size: 14px;
    color: #2ecc71;
`;

const Divider = styled.hr`
    border: none;
    border-top: 1px solid #eee;
    margin: 20px 0;
`;

const ErrorMessage = styled.div`
    padding: 10px;
    background-color: #fdecea;
    border-left: 3px solid #e74c3c;
    color: #e74c3c;
    font-size: 13px;
    margin-bottom: 15px;
    border-radius: 4px;
`;

const SmsInfo = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 15px;
    background-color: #f0f7ff;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 15px;
`;

const SmsIcon = styled.div`
    color: #3498db;
    font-size: 20px;
`;

const SmsDetails = styled.div``;

const SmsTitle = styled.div`
    font-weight: 500;
    font-size: 14px;
    color: #34495e;
    margin-bottom: 5px;
`;

const SmsDescription = styled.div`
    font-size: 13px;
    color: #7f8c8d;
    margin-bottom: 8px;
`;

const SmsNote = styled.div`
    font-size: 13px;
    color: #95a5a6;
    font-style: italic;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: 15px 20px;
    border-top: 1px solid #eee;
    gap: 10px;
`;

const Button = styled.button<{ primary?: boolean }>`
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;

    ${props => props.primary ? `
        background-color: #3498db;
        color: white;
        border: none;
        
        &:hover {
            background-color: #2980b9;
        }
    ` : `
        background-color: white;
        color: #333;
        border: 1px solid #ddd;
        
        &:hover {
            background-color: #f5f5f5;
        }
    `}
`;

const CancelButton = styled(Button)`
    background-color: white;
    color: #7f8c8d;
    border: 1px solid #ddd;

    &:hover {
        background-color: #f5f5f5;
    }
`;

const ConfirmButton = styled(Button)<{ disabled: boolean }>`
    background-color: ${props => props.disabled ? '#95a5a6' : '#3498db'};
    color: white;
    border: none;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};

    &:hover:not(:disabled) {
        background-color: #2980b9;
    }
`;

// Price editor components
const EditPricePopup = styled.div`
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    padding: 15px;
    width: 250px;
    z-index: 1100;

    // Prevent extending outside the screen
    &.price-editor {
        max-width: calc(100vw - 40px);
    }
`;

const PopupTitle = styled.div`
    font-weight: 500;
    font-size: 15px;
    margin-bottom: 10px;
    color: #34495e;
`;

const EditPriceForm = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const EditPriceInput = styled.input`
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

const EditPriceButtons = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
`;

export default AddServiceModal;