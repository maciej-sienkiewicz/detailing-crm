import React, { useState } from 'react';
import {
    FaInfoCircle,
    FaCode,
    FaCheckCircle,
    FaFileAlt,
    FaExclamationTriangle
} from 'react-icons/fa';
import {
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    CloseButton,
    ModalBody
} from '../../pages/Settings/styles/ModalStyles';
import {
    InstructionsContent,
    InstructionsTabs,
    InstructionsTab,
    InstructionsTabContent,
    TabPanel,
    SectionTitle,
    InstructionsList,
    InstructionItem,
    CodeBlock,
    WarningBox,
    InfoBox,
    VariableGroup,
    VariableGroupTitle,
    VariablesList,
    VariableItem,
    VariableCode,
    VariableDescription,
    RequirementGroup,
    RequirementTitle,
    RequirementsList,
    RequirementItem
} from './InstructionsModal.styles';

interface InstructionsModalProps {
    onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'variables' | 'requirements' | 'examples'>('overview');

    return (
        <ModalOverlay>
            <ModalContainer style={{ maxWidth: '900px', maxHeight: '90vh' }}>
                <ModalHeader>
                    <h2>Instrukcja tworzenia szablonów faktur</h2>
                    <CloseButton onClick={onClose}>×</CloseButton>
                </ModalHeader>
                <ModalBody style={{ padding: 0 }}>
                    <InstructionsContent>
                        <InstructionsTabs>
                            <InstructionsTab
                                $active={activeTab === 'overview'}
                                onClick={() => setActiveTab('overview')}
                            >
                                <FaInfoCircle />
                                Przegląd
                            </InstructionsTab>
                            <InstructionsTab
                                $active={activeTab === 'variables'}
                                onClick={() => setActiveTab('variables')}
                            >
                                <FaCode />
                                Zmienne
                            </InstructionsTab>
                            <InstructionsTab
                                $active={activeTab === 'requirements'}
                                onClick={() => setActiveTab('requirements')}
                            >
                                <FaCheckCircle />
                                Wymagania
                            </InstructionsTab>
                            <InstructionsTab
                                $active={activeTab === 'examples'}
                                onClick={() => setActiveTab('examples')}
                            >
                                <FaFileAlt />
                                Przykłady
                            </InstructionsTab>
                        </InstructionsTabs>

                        <InstructionsTabContent>
                            {activeTab === 'overview' && (
                                <TabPanel>
                                    <SectionTitle>Jak tworzyć szablony faktur?</SectionTitle>
                                    <InstructionsList>
                                        <InstructionItem>
                                            <strong>Format pliku:</strong> Szablon musi być plikiem HTML (.html) z wbudowanym CSS
                                        </InstructionItem>
                                        <InstructionItem>
                                            <strong>Maksymalny rozmiar:</strong> 1MB
                                        </InstructionItem>
                                        <InstructionItem>
                                            <strong>Kodowanie:</strong> UTF-8
                                        </InstructionItem>
                                        <InstructionItem>
                                            <strong>Zmienne:</strong> System automatycznie podstawi dane faktury
                                        </InstructionItem>
                                        <InstructionItem>
                                            <strong>Zgodność prawna:</strong> Szablon jest automatycznie sprawdzany pod kątem zgodności z polskim prawem
                                        </InstructionItem>
                                    </InstructionsList>

                                    <WarningBox>
                                        <FaExclamationTriangle />
                                        <div>
                                            <strong>Ważne:</strong> Wszystkie style CSS muszą być wewnątrz tagu &lt;style&gt; w sekcji &lt;head&gt;.
                                            Nie używaj zewnętrznych plików CSS ani inline styles.
                                        </div>
                                    </WarningBox>
                                </TabPanel>
                            )}

                            {activeTab === 'variables' && (
                                <TabPanel>
                                    <SectionTitle>Dostępne zmienne w szablonie</SectionTitle>

                                    <VariableGroup>
                                        <VariableGroupTitle>Dane faktury</VariableGroupTitle>
                                        <VariablesList>
                                            <VariableItem>
                                                <VariableCode>{'{{invoice.number}}'}</VariableCode>
                                                <VariableDescription>Numer faktury</VariableDescription>
                                            </VariableItem>
                                            <VariableItem>
                                                <VariableCode>{'{{issuedDate}}'}</VariableCode>
                                                <VariableDescription>Data wystawienia</VariableDescription>
                                            </VariableItem>
                                            <VariableItem>
                                                <VariableCode>{'{{dueDate}}'}</VariableCode>
                                                <VariableDescription>Termin płatności</VariableDescription>
                                            </VariableItem>
                                            <VariableItem>
                                                <VariableCode>{'{{totalNetFormatted}}'}</VariableCode>
                                                <VariableDescription>Suma netto (z "zł")</VariableDescription>
                                            </VariableItem>
                                        </VariablesList>
                                    </VariableGroup>

                                    <VariableGroup>
                                        <VariableGroupTitle>Dane firmy</VariableGroupTitle>
                                        <VariablesList>
                                            <VariableItem>
                                                <VariableCode>{'{{sellerName}}'}</VariableCode>
                                                <VariableDescription>Nazwa firmy</VariableDescription>
                                            </VariableItem>
                                            <VariableItem>
                                                <VariableCode>{'{{sellerAddress}}'}</VariableCode>
                                                <VariableDescription>Adres firmy</VariableDescription>
                                            </VariableItem>
                                            <VariableItem>
                                                <VariableCode>{'{{sellerTaxId}}'}</VariableCode>
                                                <VariableDescription>NIP firmy</VariableDescription>
                                            </VariableItem>
                                        </VariablesList>
                                    </VariableGroup>
                                </TabPanel>
                            )}

                            {activeTab === 'requirements' && (
                                <TabPanel>
                                    <SectionTitle>Wymagania techniczne</SectionTitle>

                                    <RequirementGroup>
                                        <RequirementTitle>✅ Zalecane praktyki</RequirementTitle>
                                        <RequirementsList>
                                            <RequirementItem>Używaj czcionek bezpiecznych dla PDF: Arial, Times New Roman</RequirementItem>
                                            <RequirementItem>Wszystkie style CSS w tagu &lt;style&gt; w sekcji &lt;head&gt;</RequirementItem>
                                            <RequirementItem>Używaj tylko zmiennych z dostępnej listy</RequirementItem>
                                            <RequirementItem>Testuj szablon z funkcją podglądu</RequirementItem>
                                        </RequirementsList>
                                    </RequirementGroup>

                                    <RequirementGroup>
                                        <RequirementTitle>❌ Czego unikać</RequirementTitle>
                                        <RequirementsList>
                                            <RequirementItem>Nie używaj zewnętrznych plików CSS</RequirementItem>
                                            <RequirementItem>Nie używaj JavaScript</RequirementItem>
                                            <RequirementItem>Nie używaj zewnętrznych obrazków</RequirementItem>
                                            <RequirementItem>Unikaj position: fixed</RequirementItem>
                                        </RequirementsList>
                                    </RequirementGroup>
                                </TabPanel>
                            )}

                            {activeTab === 'examples' && (
                                <TabPanel>
                                    <SectionTitle>Przykładowy szablon faktury</SectionTitle>

                                    <CodeBlock>
                                        {`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Faktura</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
        }
        .header { 
            margin-bottom: 30px; 
        }
        .invoice-title { 
            font-size: 24px; 
            font-weight: bold; 
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="invoice-title">FAKTURA {{invoice.number}}</h1>
    </div>
    
    <p>Data wystawienia: {{issuedDate}}</p>
    <p>Sprzedawca: {{sellerName}}</p>
    <p>Nabywca: {{buyerName}}</p>
    
    <p>Suma brutto: {{totalGrossFormatted}}</p>
</body>
</html>`}
                                    </CodeBlock>

                                    <InfoBox>
                                        <FaInfoCircle />
                                        <div>
                                            <strong>Wskazówka:</strong> Ten przykład zawiera podstawowe elementy faktury.
                                            Możesz go użyć jako punkt wyjścia.
                                        </div>
                                    </InfoBox>
                                </TabPanel>
                            )}
                        </InstructionsTabContent>
                    </InstructionsContent>
                </ModalBody>
            </ModalContainer>
        </ModalOverlay>
    );
};