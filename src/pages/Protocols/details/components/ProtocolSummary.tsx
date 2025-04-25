import React, {useState} from 'react';
import styled from 'styled-components';
import {
    FaBell,
    FaBuilding,
    FaCarSide,
    FaEnvelope,
    FaFileInvoiceDollar,
    FaIdCard,
    FaPhone,
    FaPlus,
    FaTags,
    FaTimesCircle,
    FaUser,
    FaTrash
} from 'react-icons/fa';
import {
    CarReceptionProtocol,
    DiscountType,
    ProtocolStatus,
    SelectedService,
    ServiceApprovalStatus
} from '../../../../types';
import {fetchAvailableServices} from '../../../../api/mocks/carReceptionMocks';
import {protocolsApi} from '../../../../api/protocolsApi';
import AddServiceModal from "../../shared/modals/AddServiceModal";

interface ProtocolSummaryProps {
    protocol: CarReceptionProtocol;
    onProtocolUpdate?: (updatedProtocol: CarReceptionProtocol) => void;
}

const DEFAULT_VAT_RATE = 23; // Domyślna stawka VAT (23%)

const ProtocolSummary: React.FC<ProtocolSummaryProps> = ({ protocol, onProtocolUpdate }) => {
    const [showAddServiceModal, setShowAddServiceModal] = useState(false);
    const [availableServices, setAvailableServices] = useState<Array<{id: string; name: string; price: number;}>>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Pobierz dostępne usługi podczas otwierania modalu
    const handleOpenAddServiceModal = async () => {
        setIsLoading(true);
        try {
            const services = await fetchAvailableServices();
            setAvailableServices(services);
        } catch (error) {
            console.error('Błąd podczas pobierania listy usług', error);
        } finally {
            setIsLoading(false);
            setShowAddServiceModal(true);
        }
    };

    // Obsługa anulowania usługi w oczekiwaniu
    const handleCancelService = async (serviceId: string) => {
        if (!window.confirm('Czy na pewno chcesz anulować tę usługę?')) return;

        // Filtrujemy usługi, usuwając anulowaną
        const updatedServices = protocol.selectedServices.filter(service => service.id !== serviceId);
        const updatedProtocol = {
            ...protocol,
            selectedServices: updatedServices,
            updatedAt: new Date().toISOString()
        };

        try {
            const savedProtocol = await protocolsApi.updateProtocol(updatedProtocol);

            if (onProtocolUpdate) {
                console.log('Wywołanie onProtocolUpdate po anulowaniu usługi:', savedProtocol);
                onProtocolUpdate(savedProtocol);
            } else {
                console.warn('onProtocolUpdate nie jest dostępna, brak aktualizacji UI');
            }
        } catch (error) {
            console.error('Błąd podczas anulowania usługi', error);
        }
    };

    // Obsługa usuwania usługi (dla wszystkich usług, nie tylko oczekujących)
    const handleDeleteService = async (serviceId: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tę usługę?')) return;

        // Filtrujemy usługi, usuwając wybraną
        const updatedServices = protocol.selectedServices.filter(service => service.id !== serviceId);
        const updatedProtocol = {
            ...protocol,
            selectedServices: updatedServices,
            updatedAt: new Date().toISOString()
        };

        try {
            const savedProtocol = await protocolsApi.updateProtocol(updatedProtocol);

            if (onProtocolUpdate) {
                console.log('Wywołanie onProtocolUpdate po usunięciu usługi:', savedProtocol);
                onProtocolUpdate(savedProtocol);
            } else {
                console.warn('onProtocolUpdate nie jest dostępna, brak aktualizacji UI');
            }
        } catch (error) {
            console.error('Błąd podczas usuwania usługi', error);
        }
    };

    // Obsługa ponownego wysłania powiadomienia
    const handleResendNotification = async (serviceId: string) => {
        // Znajdujemy usługę, dla której wysyłamy ponownie powiadomienie
        const service = protocol.selectedServices.find(s => s.id === serviceId);
        if (!service) return;

        // W rzeczywistym systemie tutaj wysyłalibyśmy żądanie do backendu
        // aby ponownie wysłał SMS do klienta
        alert(`Ponowne wysłanie SMS z prośbą o potwierdzenie usługi: ${service.name}`);
    };

    // Obsługa dodania nowych usług
    const handleAddServices = async (servicesData: {
        services: Array<{
            id: string;
            name: string;
            price: number;
            discountType?: DiscountType;
            discountValue?: number;
            finalPrice: number;
            note?: string
        }>;
    }) => {
        if (servicesData.services.length === 0) return;

        try {
            setIsLoading(true);
            const now = new Date().toISOString();

            // Utworzenie nowych usług z zachowaniem notatek i informacji o rabatach
            const newServices: SelectedService[] = servicesData.services.map(serviceData => {
                const newService: SelectedService = {
                    id: `service_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                    name: serviceData.name,
                    price: serviceData.price,
                    discountType: serviceData.discountType || 'PERCENTAGE',  // Użyj przekazanego typu lub domyślnego
                    discountValue: serviceData.discountValue !== undefined ? serviceData.discountValue : 0, // Użyj przekazanej wartości lub domyślnej
                    finalPrice: serviceData.finalPrice,  // Użyj obliczonej ceny końcowej
                    approvalStatus: ServiceApprovalStatus.PENDING,
                    addedAt: now,
                    confirmationMessage: `Wysłano SMS z prośbą o potwierdzenie usługi`
                };

                // Dodaj notatkę, jeśli istnieje
                if (serviceData.note) {
                    newService.note = serviceData.note;
                }

                return newService;
            });

            console.log('Przygotowane usługi do dodania do protokołu:', newServices);

            // Dodanie usług do protokołu
            const updatedServices = [...protocol.selectedServices, ...newServices];
            const updatedProtocol = {
                ...protocol,
                selectedServices: updatedServices,
                updatedAt: now
            };

            // Zapisz do API
            const savedProtocol = await protocolsApi.updateProtocol(updatedProtocol);

            // Zaktualizuj UI
            onProtocolUpdate(savedProtocol);

            // Zamknij modal
            setShowAddServiceModal(false);

            // Informacja dla użytkownika
            alert(`Dodano ${newServices.length} ${newServices.length === 1 ? 'usługę' : newServices.length < 5 ? 'usługi' : 'usług'}. SMS zostanie wysłany na numer ${protocol.phone}.`);
        } catch (error) {
            console.error('Błąd podczas dodawania nowych usług:', error);
            alert('Wystąpił błąd podczas dodawania usług. Spróbuj ponownie.');
        } finally {
            setIsLoading(false);
        }
    };

    // Funkcje pomocnicze do obliczeń cen netto/brutto
    const calculateNetPrice = (grossPrice: number, vatRate: number = DEFAULT_VAT_RATE): number => {
        return grossPrice / (1 + vatRate / 100);
    };

    const calculateGrossPrice = (netPrice: number, vatRate: number = DEFAULT_VAT_RATE): number => {
        return netPrice * (1 + vatRate / 100);
    };

    // Funkcja obliczająca wszystkie potrzebne ceny dla usługi
    const calculateServicePrices = (service: SelectedService) => {
        const vatRate =  DEFAULT_VAT_RATE;

        // Cena bazowa brutto (podawana przez użytkownika)
        const baseGrossPrice = service.price;
        // Cena bazowa netto
        const baseNetPrice = calculateNetPrice(baseGrossPrice, vatRate);

        // Cena końcowa brutto (po uwzględnieniu rabatu)
        const finalGrossPrice = service.finalPrice;
        // Cena końcowa netto
        const finalNetPrice = calculateNetPrice(finalGrossPrice, vatRate);

        return {
            baseNetPrice,
            baseGrossPrice,
            finalNetPrice,
            finalGrossPrice
        };
    };

    // Oblicz łączne sumy netto i brutto
    const calculateNetGrossTotals = () => {
        let totalNetValue = 0;
        let totalGrossValue = 0;
        let totalBaseNetValue = 0;
        let totalBaseGrossValue = 0;
        let totalDiscountGrossValue = 0;
        let totalDiscountNetValue = 0;

        protocol.selectedServices.forEach(service => {
            const {
                finalNetPrice,
                finalGrossPrice,
                baseNetPrice,
                baseGrossPrice,
            } = calculateServicePrices(service);

            // Obliczanie wartości rabatu
            const discountValueGross = baseGrossPrice - finalGrossPrice;
            const discountValueNet = baseNetPrice - finalNetPrice;

            totalNetValue += finalNetPrice;
            totalGrossValue += finalGrossPrice;
            totalBaseNetValue += baseNetPrice;
            totalBaseGrossValue += baseGrossPrice;
            totalDiscountGrossValue += discountValueGross;
            totalDiscountNetValue += discountValueNet;
        });

        return {
            totalNetValue,
            totalGrossValue,
            totalBaseNetValue,
            totalBaseGrossValue,
            totalDiscountGrossValue,
            totalDiscountNetValue
        };
    };

    // Obliczanie sum
    const allServices = protocol.selectedServices;
    const {
        totalNetValue,
        totalGrossValue,
        totalBaseNetValue,
        totalBaseGrossValue,
        totalDiscountGrossValue,
        totalDiscountNetValue
    } = calculateNetGrossTotals();

    return (
        <SummaryContainer>
            <Section>
                <SectionTitle>Informacje o pojeździe</SectionTitle>
                <TwoColumnGrid>
                    <InfoItem>
                        <InfoIcon><FaCarSide /></InfoIcon>
                        <InfoContent>
                            <InfoLabel>Marka i model</InfoLabel>
                            <InfoValue>{protocol.make} {protocol.model}</InfoValue>
                        </InfoContent>
                    </InfoItem>

                    <InfoItem>
                        <InfoIcon><FaTags /></InfoIcon>
                        <InfoContent>
                            <InfoLabel>Numer rejestracyjny</InfoLabel>
                            <InfoValue>{protocol.licensePlate}</InfoValue>
                        </InfoContent>
                    </InfoItem>

                    <InfoItem>
                        <InfoIcon><FaFileInvoiceDollar /></InfoIcon>
                        <InfoContent>
                            <InfoLabel>Rok produkcji</InfoLabel>
                            <InfoValue>{protocol.productionYear}</InfoValue>
                        </InfoContent>
                    </InfoItem>

                    <InfoItem>
                        <InfoIcon><FaFileInvoiceDollar /></InfoIcon>
                        <InfoContent>
                            <InfoLabel>Przebieg</InfoLabel>
                            <InfoValue>{protocol.mileage} km</InfoValue>
                        </InfoContent>
                    </InfoItem>
                </TwoColumnGrid>

                <AdditionalInfo>
                    <CheckItem>
                        <Checkbox checked={protocol.keysProvided} readOnly />
                        <CheckboxLabel>Przekazano kluczyk</CheckboxLabel>
                    </CheckItem>

                    <CheckItem>
                        <Checkbox checked={protocol.documentsProvided} readOnly />
                        <CheckboxLabel>Przekazano dokumenty</CheckboxLabel>
                    </CheckItem>
                </AdditionalInfo>
            </Section>

            <Section>
                <SectionTitle>Dane klienta</SectionTitle>
                <TwoColumnGrid>
                    <InfoItem>
                        <InfoIcon><FaUser /></InfoIcon>
                        <InfoContent>
                            <InfoLabel>Imię i nazwisko</InfoLabel>
                            <InfoValue>{protocol.ownerName}</InfoValue>
                        </InfoContent>
                    </InfoItem>

                    <InfoItem>
                        <InfoIcon><FaPhone /></InfoIcon>
                        <InfoContent>
                            <InfoLabel>Telefon</InfoLabel>
                            <InfoValue>{protocol.phone}</InfoValue>
                        </InfoContent>
                    </InfoItem>

                    <InfoItem>
                        <InfoIcon><FaEnvelope /></InfoIcon>
                        <InfoContent>
                            <InfoLabel>Email</InfoLabel>
                            <InfoValue>{protocol.email}</InfoValue>
                        </InfoContent>
                    </InfoItem>

                    {protocol.companyName && (
                        <InfoItem>
                            <InfoIcon><FaBuilding /></InfoIcon>
                            <InfoContent>
                                <InfoLabel>Firma</InfoLabel>
                                <InfoValue>{protocol.companyName}</InfoValue>
                            </InfoContent>
                        </InfoItem>
                    )}

                    {protocol.taxId && (
                        <InfoItem>
                            <InfoIcon><FaIdCard /></InfoIcon>
                            <InfoContent>
                                <InfoLabel>NIP</InfoLabel>
                                <InfoValue>{protocol.taxId}</InfoValue>
                            </InfoContent>
                        </InfoItem>
                    )}
                </TwoColumnGrid>
            </Section>

            <Section>
                <SectionTitleWithAction>
                    <SectionTitle>Usługi</SectionTitle>
                    {protocol.status == ProtocolStatus.IN_PROGRESS && (
                        <AddButton onClick={handleOpenAddServiceModal} disabled={isLoading}>
                            <FaPlus /> {isLoading ? 'Ładowanie...' : 'Dodaj usługę'}
                        </AddButton>
                    )}
                </SectionTitleWithAction>

                <ServicesTable>
                    <TableHeader>
                        <HeaderCell wide>Nazwa usługi</HeaderCell>
                        <HeaderCell>Cena bazowa</HeaderCell>
                        <HeaderCell>Rabat</HeaderCell>
                        <HeaderCell>Cena końcowa</HeaderCell>
                        <HeaderCell action>Akcje</HeaderCell>
                    </TableHeader>

                    {allServices.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                                Brak usług. Kliknij "Dodaj usługę", aby dodać pierwszą.
                            </TableCell>
                        </TableRow>
                    ) : (
                        allServices.map((service) => {
                            const prices = calculateServicePrices(service);

                            return (
                                <TableRow
                                    key={service.id}
                                    pending={service.approvalStatus === ServiceApprovalStatus.PENDING}
                                >
                                    <TableCell wide>
                                        <ServiceNameContainer>
                                            <ServiceName>{service.name}</ServiceName>
                                            {service.approvalStatus === ServiceApprovalStatus.PENDING && (
                                                <PendingBadge>
                                                    <FaClock /> Oczekuje na potwierdzenie
                                                </PendingBadge>
                                            )}
                                            {/* Wyświetl komentarz jeśli istnieje */}
                                            {service.note && (
                                                <ServiceNote>
                                                    {service.note}
                                                </ServiceNote>
                                            )}
                                        </ServiceNameContainer>
                                    </TableCell>
                                    <PriceCell>
                                        <PriceWrapper>
                                            <PriceValue>
                                                {prices.baseGrossPrice.toFixed(2)} zł
                                                <PriceType>brutto</PriceType>
                                            </PriceValue>
                                            <PriceValue>
                                                {prices.baseNetPrice.toFixed(2)} zł
                                                <PriceType>netto</PriceType>
                                            </PriceValue>
                                        </PriceWrapper>
                                    </PriceCell>
                                    <TableCell>
                                        {service.discountValue > 0
                                            ? `${service.discountValue.toFixed(2)}${service.discountType === 'PERCENTAGE' ? '%' : ' zł'}`
                                            : '-'
                                        }
                                    </TableCell>
                                    <PriceCell>
                                        <PriceWrapper>
                                            <PriceValue>
                                                {prices.finalGrossPrice.toFixed(2)} zł
                                                <PriceType>brutto</PriceType>
                                            </PriceValue>
                                            <PriceValue>
                                                {prices.finalNetPrice.toFixed(2)} zł
                                                <PriceType>netto</PriceType>
                                            </PriceValue>
                                        </PriceWrapper>
                                    </PriceCell>
                                    <TableCell action>
                                        {protocol.status !== ProtocolStatus.COMPLETED && protocol.status !== ProtocolStatus.CANCELLED && (<ActionButtons>
                                            {service.approvalStatus === ServiceApprovalStatus.PENDING && (
                                                <>
                                                    <ActionButton
                                                        title="Wyślij ponownie SMS"
                                                        onClick={() => handleResendNotification(service.id)}
                                                    >
                                                        <FaBell />
                                                    </ActionButton>
                                                    <ActionButton
                                                        title="Anuluj usługę"
                                                        danger
                                                        onClick={() => handleCancelService(service.id)}
                                                    >
                                                        <FaTimesCircle />
                                                    </ActionButton>
                                                </>
                                            )}
                                            <ActionButton
                                                title="Usuń usługę"
                                                danger
                                                onClick={() => handleDeleteService(service.id)}
                                            >
                                                <FaTrash />
                                            </ActionButton>
                                        </ActionButtons>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}

                    <TableFooter>
                        <FooterCell wide>Razem</FooterCell>
                        <FooterCell>
                            <PriceWrapper>
                                <TotalValue>{totalBaseGrossValue.toFixed(2)} zł</TotalValue>
                                <PriceType>brutto</PriceType>
                                <TotalValue>{totalBaseNetValue.toFixed(2)} zł</TotalValue>
                                <PriceType>netto</PriceType>
                            </PriceWrapper>
                        </FooterCell>
                        <FooterCell>
                            <PriceWrapper>
                                <TotalValue>{totalDiscountGrossValue.toFixed(2)} zł</TotalValue>
                                <PriceType>brutto</PriceType>
                                <TotalValue>{totalDiscountNetValue.toFixed(2)} zł</TotalValue>
                                <PriceType>netto</PriceType>
                            </PriceWrapper>
                        </FooterCell>
                        <FooterCell>
                            <PriceWrapper>
                                <TotalValue highlight>{totalGrossValue.toFixed(2)} zł</TotalValue>
                                <PriceType>brutto</PriceType>
                                <TotalValue>{totalNetValue.toFixed(2)} zł</TotalValue>
                                <PriceType>netto</PriceType>
                            </PriceWrapper>
                        </FooterCell>
                        <FooterCell action></FooterCell>
                    </TableFooter>
                </ServicesTable>
            </Section>

            {protocol.notes && (
                <Section>
                    <SectionTitle>Uwagi</SectionTitle>
                    <NotesContent>{protocol.notes}</NotesContent>
                </Section>
            )}

            {/* Modal dodawania usługi */}
            <AddServiceModal
                isOpen={showAddServiceModal}
                onClose={() => setShowAddServiceModal(false)}
                onAddServices={handleAddServices}
                availableServices={availableServices}
                customerPhone={protocol.phone}
            />
        </SummaryContainer>
    );
};

// Styled components
const SummaryContainer = styled.div``;

const Section = styled.div`
    margin-bottom: 30px;

    &:last-child {
        margin-bottom: 0;
    }
`;

const SectionTitleWithAction = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    margin: 0 0 15px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
    color: #2c3e50;
`;

const AddButton = styled.button<{ disabled?: boolean }>`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background-color: ${props => props.disabled ? '#e0e0e0' : '#f0f7ff'};
    color: ${props => props.disabled ? '#95a5a6' : '#3498db'};
    border: 1px solid ${props => props.disabled ? '#d5d5d5' : '#d5e9f9'};
    border-radius: 4px;
    font-size: 13px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};

    &:hover:not(:disabled) {
        background-color: #d5e9f9;
    }
`;

const TwoColumnGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const InfoItem = styled.div`
    display: flex;
    align-items: flex-start;
`;

const InfoIcon = styled.div`
    width: 20px;
    margin-right: 10px;
    color: #7f8c8d;
    padding-top: 2px;
`;

const InfoContent = styled.div`
    flex: 1;
`;

const InfoLabel = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-bottom: 2px;
`;

const InfoValue = styled.div`
    font-size: 14px;
    color: #34495e;
`;

const AdditionalInfo = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 15px;
`;

const CheckItem = styled.div`
    display: flex;
    align-items: center;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
    margin-right: 8px;
`;

const CheckboxLabel = styled.div`
    font-size: 14px;
    color: #34495e;
`;

const ServicesTable = styled.div`
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
`;

const TableHeader = styled.div`
    display: flex;
    background-color: #f9f9f9;
    border-bottom: 1px solid #eee;
    font-weight: 500;
`;

const HeaderCell = styled.div<{ wide?: boolean; action?: boolean }>`
    padding: 12px 16px;
    font-size: 13px;
    color: #7f8c8d;
    flex: ${props => props.wide ? 2 : props.action ? 0.7 : 1};
`;

const TableRow = styled.div<{ pending?: boolean }>`
    display: flex;
    border-bottom: 1px solid #eee;
    background-color: ${props => props.pending ? '#f8f9fa' : 'white'};
    opacity: ${props => props.pending ? 0.7 : 1};

    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.div<{ wide?: boolean; colSpan?: number; action?: boolean }>`
    padding: 12px 16px;
    font-size: 14px;
    color: #34495e;
    flex: ${props => props.wide ? 2 : props.action ? 0.7 : props.colSpan ? props.colSpan : 1};
`;

const ServiceNameContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const ServiceName = styled.div`
    font-weight: normal;
    color: #34495e;
`;

// Komponent dla notatki do usługi
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

const PendingBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #95a5a6;
    background-color: #f0f0f0;
    padding: 3px 6px;
    border-radius: 4px;
    width: fit-content;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 6px;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: ${props => props.danger ? '#fef5f5' : '#f0f7ff'};
    color: ${props => props.danger ? '#e74c3c' : '#3498db'};
    border: 1px solid ${props => props.danger ? '#fde8e8' : '#d5e9f9'};
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: ${props => props.danger ? '#fde8e8' : '#d5e9f9'};
    }
`;

const TableFooter = styled.div`
    display: flex;
    background-color: #f9f9fa;
    border-top: 1px solid #eee;
    font-weight: 500;
`;

const FooterCell = styled.div<{ wide?: boolean; highlight?: boolean; action?: boolean }>`
    padding: 12px 16px;
    font-size: 14px;
    color: ${props => props.highlight ? '#27ae60' : '#34495e'};
    font-weight: ${props => props.highlight ? '600' : '500'};
    flex: ${props => props.wide ? 2 : props.action ? 0.7 : 1};
`;

const TotalValue = styled.div<{ highlight?: boolean }>`
    color: ${props => props.highlight ? '#27ae60' : '#34495e'};
    font-weight: 600;
`;

const PendingValue = styled.div`
    font-size: 12px;
    color: #95a5a6;
    font-weight: normal;
    margin-top: 2px;
`;

const NotesContent = styled.div`
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 15px;
    font-size: 14px;
    color: #34495e;
    white-space: pre-line;
`;

// Komponent FaClock został zadeklarowany inline
const FaClock = styled.span`
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-right: 4px;
    position: relative;
    
    &:before {
        content: "⏱";
        position: absolute;
        top: -2px;
        left: 0;
    }
`;

// Nowe komponenty dla wyświetlania cen brutto/netto
const PriceCell = styled(TableCell)`
    min-width: 120px;
`;

const PriceWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const PriceValue = styled.div`
    font-size: 14px;
    color: #34495e;
`;

const PriceType = styled.div`
    font-size: 10px;
    color: #7f8c8d;
    margin-top: 2px;
`;

export default ProtocolSummary;