import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    FaCarSide,
    FaUser,
    FaPhone,
    FaEnvelope,
    FaFileInvoiceDollar,
    FaTags,
    FaBuilding,
    FaIdCard
} from 'react-icons/fa';
import { CarReceptionProtocol } from '../../../../types';

interface ProtocolSummaryProps {
    protocol: CarReceptionProtocol;
}

const ProtocolSummary: React.FC<ProtocolSummaryProps> = ({ protocol }) => {
    // Format date for display
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd MMMM yyyy', { locale: pl });
    };

    // Calculate the total value
    const totalValue = protocol.selectedServices.reduce(
        (sum, service) => sum + service.finalPrice, 0
    );

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
                <SectionTitle>Usługi</SectionTitle>
                <ServicesTable>
                    <TableHeader>
                        <HeaderCell wide>Nazwa usługi</HeaderCell>
                        <HeaderCell>Cena bazowa</HeaderCell>
                        <HeaderCell>Rabat</HeaderCell>
                        <HeaderCell>Cena końcowa</HeaderCell>
                    </TableHeader>

                    {protocol.selectedServices.map((service) => (
                        <TableRow key={service.id}>
                            <TableCell wide>{service.name}</TableCell>
                            <TableCell>{service.price.toFixed(2)} zł</TableCell>
                            <TableCell>
                                {service.discountValue > 0
                                    ? `${service.discountValue}${service.discountType === 'PERCENTAGE' ? '%' : ' zł'}`
                                    : '-'
                                }
                            </TableCell>
                            <TableCell>{service.finalPrice.toFixed(2)} zł</TableCell>
                        </TableRow>
                    ))}

                    <TableFooter>
                        <FooterCell wide>Razem</FooterCell>
                        <FooterCell>{protocol.selectedServices.reduce((sum, s) => sum + s.price, 0).toFixed(2)} zł</FooterCell>
                        <FooterCell>
                            {(protocol.selectedServices.reduce((sum, s) => sum + s.price, 0) - totalValue).toFixed(2)} zł
                        </FooterCell>
                        <FooterCell highlight>{totalValue.toFixed(2)} zł</FooterCell>
                    </TableFooter>
                </ServicesTable>
            </Section>

            {protocol.notes && (
                <Section>
                    <SectionTitle>Uwagi</SectionTitle>
                    <NotesContent>{protocol.notes}</NotesContent>
                </Section>
            )}

            <Section>
                <SectionTitle>Daty i terminy</SectionTitle>
                <InfoGrid>
                    <DateInfoItem>
                        <DateInfoLabel>Data utworzenia protokołu</DateInfoLabel>
                        <DateInfoValue>{formatDate(protocol.createdAt)}</DateInfoValue>
                    </DateInfoItem>

                    <DateInfoItem>
                        <DateInfoLabel>Data ostatniej aktualizacji</DateInfoLabel>
                        <DateInfoValue>{formatDate(protocol.updatedAt)}</DateInfoValue>
                    </DateInfoItem>

                    <DateInfoItem>
                        <DateInfoLabel>Data przyjęcia pojazdu</DateInfoLabel>
                        <DateInfoValue>{formatDate(protocol.startDate)}</DateInfoValue>
                    </DateInfoItem>

                    <DateInfoItem>
                        <DateInfoLabel>Planowana data wydania</DateInfoLabel>
                        <DateInfoValue>{formatDate(protocol.endDate)}</DateInfoValue>
                    </DateInfoItem>
                </InfoGrid>
            </Section>
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

const SectionTitle = styled.h3`
    font-size: 16px;
    margin: 0 0 15px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
    color: #2c3e50;
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

const HeaderCell = styled.div<{ wide?: boolean }>`
    padding: 12px 16px;
    font-size: 13px;
    color: #7f8c8d;
    flex: ${props => props.wide ? 2 : 1};
`;

const TableRow = styled.div`
    display: flex;
    border-bottom: 1px solid #eee;

    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.div<{ wide?: boolean }>`
    padding: 12px 16px;
    font-size: 14px;
    color: #34495e;
    flex: ${props => props.wide ? 2 : 1};
`;

const TableFooter = styled.div`
    display: flex;
    background-color: #f9f9f9;
    border-top: 1px solid #eee;
    font-weight: 500;
`;

const FooterCell = styled.div<{ wide?: boolean; highlight?: boolean }>`
    padding: 12px 16px;
    font-size: 14px;
    color: ${props => props.highlight ? '#27ae60' : '#34495e'};
    font-weight: ${props => props.highlight ? '600' : '500'};
    flex: ${props => props.wide ? 2 : 1};
`;

const NotesContent = styled.div`
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 15px;
    font-size: 14px;
    color: #34495e;
    white-space: pre-line;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const DateInfoItem = styled.div`
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 12px 15px;
`;

const DateInfoLabel = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-bottom: 4px;
`;

const DateInfoValue = styled.div`
    font-size: 15px;
    color: #34495e;
    font-weight: 500;
`;

export default ProtocolSummary;