// src/components/Templates/TemplateInstructionsModal.tsx
import React from 'react';
import styled from 'styled-components';
import { FaFileAlt, FaFilePdf, FaCode } from 'react-icons/fa';
import Modal from '../common/Modal';
import { settingsTheme } from '../../pages/Settings/styles/theme';

interface TemplateInstructionsModalProps {
    onClose: () => void;
}

export const TemplateInstructionsModal: React.FC<TemplateInstructionsModalProps> = ({ onClose }) => {
    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Instrukcje - Szablony dokumentów"
            size="xl"
        >
            <Content>
                <Section>
                    <SectionHeader>
                        <SectionIcon>
                            <FaFileAlt />
                        </SectionIcon>
                        <SectionTitle>Typy szablonów</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <TypeList>
                            <TypeItem>
                                <TypeIcon><FaFilePdf /></TypeIcon>
                                <TypeInfo>
                                    <TypeName>Szablony PDF</TypeName>
                                    <TypeDescription>
                                        Używane do generowania dokumentów do podpisu i wydruku:
                                        protokoły przyjęcia, zgody marketingowe, dokumenty wydania.
                                    </TypeDescription>
                                </TypeInfo>
                            </TypeItem>
                            <TypeItem>
                                <TypeIcon><FaCode /></TypeIcon>
                                <TypeInfo>
                                    <TypeName>Szablony HTML</TypeName>
                                    <TypeDescription>
                                        Używane do generowania wiadomości email: powiadomienia
                                        o rozpoczęciu wizyty, podsumowania zakończonych usług.
                                    </TypeDescription>
                                </TypeInfo>
                            </TypeItem>
                        </TypeList>
                    </SectionContent>
                </Section>

                <Section>
                    <SectionHeader>
                        <SectionTitle>Wymagania techniczne</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <RequirementList>
                            <RequirementItem>
                                <strong>Szablony PDF:</strong> Plik musi być w formacie PDF.
                                Może zawierać pola formularza do automatycznego wypełniania danych.
                            </RequirementItem>
                            <RequirementItem>
                                <strong>Szablony HTML:</strong> Plik musi być w formacie HTML.
                                Może używać CSS do stylizacji oraz zmiennych do podstawiania danych.
                            </RequirementItem>
                            <RequirementItem>
                                <strong>Rozmiar pliku:</strong> Maksymalny rozmiar pliku to 5MB.
                            </RequirementItem>
                            <RequirementItem>
                                <strong>Kodowanie:</strong> Pliki HTML powinny używać kodowania UTF-8.
                            </RequirementItem>
                        </RequirementList>
                    </SectionContent>
                </Section>

                <Section>
                    <SectionHeader>
                        <SectionTitle>Zmienne w szablonach</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <VariableDescription>
                            W szablonach możesz używać zmiennych, które zostaną automatycznie zastąpione rzeczywistymi danymi:
                        </VariableDescription>
                        <VariableGrid>
                            <VariableCard>
                                <VariableTitle>Dane klienta</VariableTitle>
                                <VariableList>
                                    <li><code>{"{{client.name}}"}</code> - Nazwa klienta</li>
                                    <li><code>{"{{client.phone}}"}</code> - Telefon</li>
                                    <li><code>{"{{client.email}}"}</code> - Email</li>
                                </VariableList>
                            </VariableCard>
                            <VariableCard>
                                <VariableTitle>Dane pojazdu</VariableTitle>
                                <VariableList>
                                    <li><code>{"{{vehicle.make}}"}</code> - Marka</li>
                                    <li><code>{"{{vehicle.model}}"}</code> - Model</li>
                                    <li><code>{"{{vehicle.licensePlate}}"}</code> - Numer rejestracyjny</li>
                                </VariableList>
                            </VariableCard>
                            <VariableCard>
                                <VariableTitle>Dane wizyty</VariableTitle>
                                <VariableList>
                                    <li><code>{"{{visit.startDate}}"}</code> - Data rozpoczęcia</li>
                                    <li><code>{"{{visit.services}}"}</code> - Lista usług</li>
                                    <li><code>{"{{visit.totalAmount}}"}</code> - Łączna kwota</li>
                                </VariableList>
                            </VariableCard>
                            <VariableCard>
                                <VariableTitle>Dane firmy</VariableTitle>
                                <VariableList>
                                    <li><code>{"{{company.name}}"}</code> - Nazwa firmy</li>
                                    <li><code>{"{{company.address}}"}</code> - Adres</li>
                                    <li><code>{"{{company.phone}}"}</code> - Telefon</li>
                                </VariableList>
                            </VariableCard>
                        </VariableGrid>
                    </SectionContent>
                </Section>

                <Section>
                    <SectionHeader>
                        <SectionTitle>Przykłady użycia</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <ExampleGrid>
                            <ExampleCard>
                                <ExampleTitle>Szablon HTML - Email powitalny</ExampleTitle>
                                <ExampleCode>
                                    {`<h1>Witaj {{client.name}}!</h1>
<p>Twoja wizyta na {{visit.startDate}} została potwierdzona.</p>
<p>Pojazd: {{vehicle.make}} {{vehicle.model}} ({{vehicle.licensePlate}})</p>
<p>Zaplanowane usługi:</p>
<ul>{{#each visit.services}}
  <li>{{this.name}} - {{this.price}} zł</li>
{{/each}}</ul>`}
                                </ExampleCode>
                            </ExampleCard>
                        </ExampleGrid>
                    </SectionContent>
                </Section>

                <CloseButtonContainer>
                    <CloseButton onClick={onClose}>
                        Zamknij instrukcje
                    </CloseButton>
                </CloseButtonContainer>
            </Content>
        </Modal>
    );
};

const Content = styled.div`
    padding: ${settingsTheme.spacing.lg};
    max-height: 80vh;
    overflow-y: auto;
`;

const Section = styled.div`
    margin-bottom: ${settingsTheme.spacing.xl};
    
    &:last-child {
        margin-bottom: 0;
    }
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
    margin-bottom: ${settingsTheme.spacing.lg};
    padding-bottom: ${settingsTheme.spacing.sm};
    border-bottom: 2px solid ${settingsTheme.primary};
`;

const SectionIcon = styled.div`
    width: 32px;
    height: 32px;
    background: ${settingsTheme.primaryGhost};
    border-radius: ${settingsTheme.radius.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${settingsTheme.primary};
    font-size: 16px;
`;

const SectionTitle = styled.h3`
    font-size: 20px;
    font-weight: 700;
    color: ${settingsTheme.text.primary};
    margin: 0;
`;

const SectionContent = styled.div`
    color: ${settingsTheme.text.secondary};
    line-height: 1.6;
`;

const TypeList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.lg};
`;

const TypeItem = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.md};
    padding: ${settingsTheme.spacing.lg};
    background: ${settingsTheme.surfaceAlt};
    border-radius: ${settingsTheme.radius.md};
    border: 1px solid ${settingsTheme.border};
`;

const TypeIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${settingsTheme.primaryGhost};
    border-radius: ${settingsTheme.radius.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${settingsTheme.primary};
    font-size: 20px;
    flex-shrink: 0;
`;

const TypeInfo = styled.div`
    flex: 1;
`;

const TypeName = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    margin: 0 0 ${settingsTheme.spacing.xs} 0;
`;

const TypeDescription = styled.p`
    font-size: 14px;
    color: ${settingsTheme.text.secondary};
    margin: 0;
    line-height: 1.5;
`;

const RequirementList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

const RequirementItem = styled.li`
    padding: ${settingsTheme.spacing.md};
    background: ${settingsTheme.surfaceAlt};
    border-radius: ${settingsTheme.radius.sm};
    margin-bottom: ${settingsTheme.spacing.sm};
    border-left: 4px solid ${settingsTheme.primary};
    font-size: 14px;
    
    strong {
        color: ${settingsTheme.text.primary};
    }
    
    &:last-child {
        margin-bottom: 0;
    }
`;

const VariableDescription = styled.p`
    margin-bottom: ${settingsTheme.spacing.lg};
    font-size: 16px;
    color: ${settingsTheme.text.primary};
`;

const VariableGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${settingsTheme.spacing.lg};
`;

const VariableCard = styled.div`
    background: ${settingsTheme.surfaceAlt};
    border: 1px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    padding: ${settingsTheme.spacing.lg};
`;

const VariableTitle = styled.h4`
    font-size: 14px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    margin: 0 0 ${settingsTheme.spacing.md} 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const VariableList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
        margin-bottom: ${settingsTheme.spacing.sm};
        font-size: 13px;
        color: ${settingsTheme.text.secondary};
        
        code {
            background: ${settingsTheme.surface};
            padding: 2px 6px;
            border-radius: ${settingsTheme.radius.sm};
            font-family: monospace;
            font-size: 12px;
            color: ${settingsTheme.primary};
            font-weight: 600;
        }
        
        &:last-child {
            margin-bottom: 0;
        }
    }
`;

const ExampleGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.lg};
`;

const ExampleCard = styled.div`
    background: ${settingsTheme.surfaceAlt};
    border: 1px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    padding: ${settingsTheme.spacing.lg};
`;

const ExampleTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    margin: 0 0 ${settingsTheme.spacing.md} 0;
`;

const ExampleCode = styled.pre`
    background: ${settingsTheme.surface};
    border: 1px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.sm};
    padding: ${settingsTheme.spacing.md};
    font-family: monospace;
    font-size: 12px;
    color: ${settingsTheme.text.primary};
    overflow-x: auto;
    margin: 0;
    white-space: pre-wrap;
`;

const CloseButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: ${settingsTheme.spacing.xl};
    padding-top: ${settingsTheme.spacing.lg};
    border-top: 1px solid ${settingsTheme.border};
`;

const CloseButton = styled.button`
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.xl};
    background: ${settingsTheme.primary};
    color: white;
    border: none;
    border-radius: ${settingsTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${settingsTheme.primaryDark};
        transform: translateY(-1px);
    }
`;