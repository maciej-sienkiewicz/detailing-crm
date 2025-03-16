import React, { useState } from 'react';
import styled from 'styled-components';
import {
    FaCarSide,
    FaUser,
    FaPhone,
    FaEnvelope,
    FaFileInvoiceDollar,
    FaTags,
    FaBuilding,
    FaIdCard,
    FaPlus,
    FaBell,
    FaTimesCircle,
    FaClock
} from 'react-icons/fa';
import { CarReceptionProtocol, ServiceApprovalStatus, SelectedService } from '../../../../types';
import AddServiceModal from '../AddServiceModal';
import { updateCarReceptionProtocol } from '../../../../api/mocks/carReceptionMocks';
import { fetchAvailableServices } from '../../../../api/mocks/carReceptionMocks';

interface ProtocolSummaryProps {
    protocol: CarReceptionProtocol;
    onProtocolUpdate?: (updatedProtocol: CarReceptionProtocol) => void;
}

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
            const savedProtocol = await updateCarReceptionProtocol(updatedProtocol);

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
// Zaktualizowana funkcja handleAddServices bez obsługi customMessage
    const handleAddServices = async (servicesData: {
        services: Array<{ id: string; name: string; price: number }>;
    }) => {
        if (servicesData.services.length === 0) return;

        try {
            setIsLoading(true);
            const now = new Date().toISOString();

            // Utworzenie nowych usług
            const newServices: SelectedService[] = servicesData.services.map(serviceData => ({
                id: `service_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                name: serviceData.name,
                price: serviceData.price,
                discountType: 'PERCENTAGE', // Domyślny typ rabatu
                discountValue: 0,           // Domyślna wartość rabatu
                finalPrice: serviceData.price,
                approvalStatus: ServiceApprovalStatus.PENDING,
                addedAt: now,
                confirmationMessage: `Wysłano SMS z prośbą o potwierdzenie usługi`
            }));

            // Dodanie usług do protokołu
            const updatedServices = [...protocol.selectedServices, ...newServices];
            const updatedProtocol = {
                ...protocol,
                selectedServices: updatedServices,
                updatedAt: now
            };

            // W rzeczywistej implementacji użylibyśmy API backendu:
            // const savedProtocol = await addServicesWithNotification(protocol.id, servicesData.services);

            // Symulacja zapisu do backendu
            const savedProtocol = await updateCarReceptionProtocol(updatedProtocol);

            // Aktualizacja UI
            if (onProtocolUpdate) {
                console.log('Wywołanie onProtocolUpdate z nowymi usługami:', savedProtocol);
                onProtocolUpdate(savedProtocol);
            } else {
                console.warn('onProtocolUpdate nie jest dostępna, brak aktualizacji UI');
            }

            setShowAddServiceModal(false);

            // Informacja dla użytkownika
            alert(`Dodano ${newServices.length} ${newServices.length === 1 ? 'usługę' : newServices.length < 5 ? 'usługi' : 'usług'}. SMS zostanie wysłany na numer ${protocol.phone}.`);

            // W rzeczywistym systemie backend wysłałby SMS do klienta
            console.log(`SMS zostanie wysłany przez backend na numer: ${protocol.phone}`);
        } catch (error) {
            console.error('Błąd podczas dodawania nowych usług:', error);
            alert('Wystąpił błąd podczas dodawania usług. Spróbuj ponownie.');
        } finally {
            setIsLoading(false);
        }
    };

    // Obliczanie sum
    const allServices = protocol.selectedServices;
    const approvedValue = allServices
        .filter(service => !service.approvalStatus || service.approvalStatus === ServiceApprovalStatus.APPROVED)
        .reduce((sum, service) => sum + service.finalPrice, 0);

    const pendingValue = allServices
        .filter(service => service.approvalStatus === ServiceApprovalStatus.PENDING)
        .reduce((sum, service) => sum + service.finalPrice, 0);

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
                    <AddButton onClick={handleOpenAddServiceModal} disabled={isLoading}>
                        <FaPlus /> {isLoading ? 'Ładowanie...' : 'Dodaj usługę'}
                    </AddButton>
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
                            <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                                Brak usług. Kliknij "Dodaj usługę", aby dodać pierwszą.
                            </TableCell>
                        </TableRow>
                    ) : (
                        allServices.map((service) => (
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
                                    </ServiceNameContainer>
                                </TableCell>
                                <TableCell>{service.price.toFixed(2)} zł</TableCell>
                                <TableCell>
                                    {service.discountValue > 0
                                        ? `${service.discountValue}${service.discountType === 'PERCENTAGE' ? '%' : ' zł'}`
                                        : '-'
                                    }
                                </TableCell>
                                <TableCell>{service.finalPrice.toFixed(2)} zł</TableCell>
                                <TableCell action>
                                    {service.approvalStatus === ServiceApprovalStatus.PENDING && (
                                        <ActionButtons>
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
                                        </ActionButtons>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}

                    <TableFooter>
                        <FooterCell wide>Razem</FooterCell>
                        <FooterCell>{allServices.reduce((sum, s) => sum + s.price, 0).toFixed(2)} zł</FooterCell>
                        <FooterCell>
                            {(allServices.reduce((sum, s) => sum + s.price, 0) - (approvedValue + pendingValue)).toFixed(2)} zł
                        </FooterCell>
                        <FooterCell>
                            <TotalValue highlight>{approvedValue.toFixed(2)} zł</TotalValue>
                            {pendingValue > 0 && (
                                <PendingValue>+ {pendingValue.toFixed(2)} zł oczekuje</PendingValue>
                            )}
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
    flex: ${props => props.wide ? 2 : props.action ? 0.5 : 1};
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
    flex: ${props => props.wide ? 2 : props.action ? 0.5 : props.colSpan ? props.colSpan : 1};
`;

const ServiceNameContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const ServiceName = styled.div`
    font-weight: 500;
    color: #34495e;
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
    flex: ${props => props.wide ? 2 : props.action ? 0.5 : 1};
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

export default ProtocolSummary;