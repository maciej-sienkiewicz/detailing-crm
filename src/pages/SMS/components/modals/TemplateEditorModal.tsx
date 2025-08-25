// src/pages/SMS/components/modals/TemplateEditorModal.tsx
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {
    FaBuilding,
    FaCalendarAlt,
    FaCar,
    FaCaretRight,
    FaCheck,
    FaCode,
    FaEye,
    FaInfoCircle,
    FaPercentage,
    FaSave,
    FaTimes,
    FaUser
} from 'react-icons/fa';
import Modal from '../../../../components/common/Modal';
import {smsApi} from '../../../../api/smsApi';
import {SmsTemplate, SmsTemplateCategory, SmsTemplateCategoryLabels} from '../../../../types/sms';
import {useToast} from '../../../../components/common/Toast/Toast';

// Interfejs dla zmiennych dynamicznych
interface TemplateVariable {
    key: string;
    description: string;
    example: string;
    category: string;
}

// Interfejs dla grup zmiennych
interface VariableGroup {
    name: string;
    icon: React.ReactNode;
    variables: TemplateVariable[];
}

// Interfejs dla props komponentu
interface TemplateEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (template: SmsTemplate) => void;
    initialTemplate?: SmsTemplate;
    isEditing?: boolean;
}

// Definicja dostępnych zmiennych
const TEMPLATE_VARIABLES: Record<string, TemplateVariable> = {
    'klient.imie': {
        key: 'klient.imie',
        description: 'Imię klienta',
        example: 'Jan',
        category: 'klient'
    },
    'klient.nazwisko': {
        key: 'klient.nazwisko',
        description: 'Nazwisko klienta',
        example: 'Kowalski',
        category: 'klient'
    },
    'klient.firma': {
        key: 'klient.firma',
        description: 'Nazwa firmy klienta',
        example: 'ABC Sp. z o.o.',
        category: 'klient'
    },
    'pojazd.marka': {
        key: 'pojazd.marka',
        description: 'Marka pojazdu',
        example: 'Toyota',
        category: 'pojazd'
    },
    'pojazd.model': {
        key: 'pojazd.model',
        description: 'Model pojazdu',
        example: 'Corolla',
        category: 'pojazd'
    },
    'pojazd.rejestracja': {
        key: 'pojazd.rejestracja',
        description: 'Numer rejestracyjny',
        example: 'WA12345',
        category: 'pojazd'
    },
    'wizyta.data': {
        key: 'wizyta.data',
        description: 'Data najbliższej wizyty',
        example: '12.05.2025',
        category: 'wizyta'
    },
    'wizyta.godzina': {
        key: 'wizyta.godzina',
        description: 'Godzina wizyty',
        example: '14:30',
        category: 'wizyta'
    },
    'wizyta.status': {
        key: 'wizyta.status',
        description: 'Status wizyty',
        example: 'W realizacji',
        category: 'wizyta'
    },
    'rabat.kod': {
        key: 'rabat.kod',
        description: 'Kod rabatowy',
        example: 'LATO2025',
        category: 'rabat'
    },
    'rabat.wartosc': {
        key: 'rabat.wartosc',
        description: 'Wartość rabatu',
        example: '15%',
        category: 'rabat'
    },
    'rabat.data_waznosci': {
        key: 'rabat.data_waznosci',
        description: 'Data ważności rabatu',
        example: '30.06.2025',
        category: 'rabat'
    },
    'firma.nazwa': {
        key: 'firma.nazwa',
        description: 'Nazwa Twojej firmy',
        example: 'Auto Detailing',
        category: 'firma'
    },
    'firma.telefon': {
        key: 'firma.telefon',
        description: 'Telefon do Twojej firmy',
        example: '+48 123 456 789',
        category: 'firma'
    },
    'link.rezerwacja': {
        key: 'link.rezerwacja',
        description: 'Link do strony rezerwacji',
        example: 'https://rezerwacja.twojafirma.pl',
        category: 'link'
    },
    'link.recenzja': {
        key: 'link.recenzja',
        description: 'Link do wystawienia opinii',
        example: 'https://opinie.twojafirma.pl',
        category: 'link'
    }
};

// Grupowanie zmiennych według kategorii
const groupVariablesByCategory = (): VariableGroup[] => {
    const groups: Record<string, TemplateVariable[]> = {};

    // Grupowanie zmiennych
    Object.values(TEMPLATE_VARIABLES).forEach(variable => {
        if (!groups[variable.category]) {
            groups[variable.category] = [];
        }
        groups[variable.category].push(variable);
    });

    // Tworzenie grup z ikonami
    return [
        {
            name: 'Klient',
            icon: <FaUser />,
            variables: groups['klient'] || []
        },
        {
            name: 'Pojazd',
            icon: <FaCar />,
            variables: groups['pojazd'] || []
        },
        {
            name: 'Wizyta',
            icon: <FaCalendarAlt />,
            variables: groups['wizyta'] || []
        },
        {
            name: 'Rabat',
            icon: <FaPercentage />,
            variables: groups['rabat'] || []
        },
        {
            name: 'Firma',
            icon: <FaBuilding />,
            variables: groups['firma'] || []
        },
        {
            name: 'Linki',
            icon: <FaLink />,
            variables: groups['link'] || []
        }
    ];
};// src/pages/SMS/components/modals/TemplateEditorModal.tsx - Część 2: Komponent główny i stan

const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSave,
                                                                     initialTemplate,
                                                                     isEditing = false
                                                                 }) => {
    const { showToast } = useToast();
    const variableGroups = groupVariablesByCategory();

    // Stan dla danych szablonu
    const [template, setTemplate] = useState<Partial<SmsTemplate>>({
        name: '',
        content: '',
        category: SmsTemplateCategory.OTHER,
        isActive: true,
        variables: []
    });

    // Stan interfejsu
    const [loading, setLoading] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        'Klient': true,  // Domyślnie rozwinięta tylko pierwsza grupa
        'Pojazd': false,
        'Wizyta': false,
        'Rabat': false,
        'Firma': false,
        'Linki': false
    });

    // Wypełnianie formularza danymi przy edycji
    useEffect(() => {
        if (initialTemplate && isEditing) {
            setTemplate({
                ...initialTemplate
            });
        }
    }, [initialTemplate, isEditing]);

    // Reset stanu przy zamknięciu modalu
    useEffect(() => {
        if (!isOpen) {
            if (!isEditing) {
                resetForm();
            }
            setPreviewMode(false);
        }
    }, [isOpen]);

    // Resetowanie formularza
    const resetForm = () => {
        setTemplate({
            name: '',
            content: '',
            category: SmsTemplateCategory.OTHER,
            isActive: true,
            variables: []
        });
    };

    // Obsługa zmiany pól formularza
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTemplate(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Obsługa zmiany statusu aktywności
    const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTemplate(prev => ({
            ...prev,
            isActive: e.target.checked
        }));
    };

    // Przełączanie widoczności grup zmiennych
    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    // Wstawianie zmiennej do treści
    const insertVariable = (variable: TemplateVariable) => {
        const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
        if (!textarea) return;

        const variableText = `{{${variable.key}}}`;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end);

        // Wstawiamy zmienną
        const newText = before + variableText + after;
        setTemplate(prev => ({
            ...prev,
            content: newText
        }));

        // Ustawiamy kursor za wstawioną zmienną
        setTimeout(() => {
            textarea.focus();
            const newPosition = start + variableText.length;
            textarea.setSelectionRange(newPosition, newPosition);
        }, 0);

        // Dodajemy zmienną do listy użytych zmiennych
        if (!template.variables?.includes(variable.key)) {
            setTemplate(prev => ({
                ...prev,
                variables: [...(prev.variables || []), variable.key]
            }));
        }
    };

    // Analiza treści i ekstrakcja zmiennych
    const extractVariables = (content: string) => {
        const variablePattern = /\{\{([^}]+)\}\}/g;
        const foundVariables = new Set<string>();
        let match;

        while ((match = variablePattern.exec(content)) !== null) {
            const variableName = match[1].trim();
            if (TEMPLATE_VARIABLES[variableName]) {
                foundVariables.add(variableName);
            }
        }

        return Array.from(foundVariables);
    };

    // Aktualizacja listy zmiennych po zmianie treści
    useEffect(() => {
        if (template.content) {
            const extractedVars = extractVariables(template.content);
            setTemplate(prev => ({
                ...prev,
                variables: extractedVars
            }));
        }
    }, [template.content]);

    // Zapisywanie szablonu
    const handleSave = async () => {
        // Walidacja
        if (!template.name) {
            showToast('error', 'Nazwa szablonu jest wymagana', 3000);
            return;
        }

        if (!template.content) {
            showToast('error', 'Treść szablonu jest wymagana', 3000);
            return;
        }

        try {
            setLoading(true);

            // Przygotowanie kompletnego obiektu szablonu
            const completeTemplate = {
                ...template,
                variables: extractVariables(template.content),
                category: template.category || SmsTemplateCategory.OTHER,
                isActive: template.isActive !== undefined ? template.isActive : true
            } as SmsTemplate;

            onSave(completeTemplate);
            showToast('success', isEditing ? 'Szablon został zaktualizowany' : 'Szablon został utworzony', 3000);
            onClose();
        } catch (error) {
            console.error('Error saving template:', error);
            showToast('error', 'Nie udało się zapisać szablonu', 3000);
        } finally {
            setLoading(false);
        }
    };

    // Liczenie znaków w treści
    const countCharacters = (text: string) => {
        return text ? text.length : 0;
    };

    // Liczba SMS-ów potrzebnych do wysłania
    const getSmsCount = (text: string) => {
        const length = countCharacters(text);
        if (length <= 160) return 1;
        return Math.ceil(length / 153); // 153 znaki dla kolejnych części wiadomości wieloczęściowej
    };

    // Renderowanie podglądu z podstawionymi zmiennymi
    const renderPreview = () => {
        if (!template.content) return 'Brak treści';

        return template.content.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
            const varKey = variable.trim();
            return TEMPLATE_VARIABLES[varKey]?.example || match;
        });
    };// src/pages/SMS/components/modals/TemplateEditorModal.tsx - Część 3: Renderowanie głównego układu

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edytuj szablon SMS' : 'Nowy szablon SMS'}
        >
            <ModalContent>
                <EditorLayout>
                    <EditorMainSection>
                        <FormGroup>
                            <FormLabel>Nazwa szablonu*</FormLabel>
                            <FormInput
                                type="text"
                                name="name"
                                value={template.name || ''}
                                onChange={handleInputChange}
                                placeholder="np. Przypomnienie o wizycie"
                                required
                            />
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>Kategoria</FormLabel>
                            <FormSelect
                                name="category"
                                value={template.category || SmsTemplateCategory.OTHER}
                                onChange={handleInputChange}
                            >
                                {Object.entries(SmsTemplateCategoryLabels).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </FormSelect>
                        </FormGroup>

                        <FormGroup>
                            <EditorToolbar>
                                <ToolbarTitle>Treść szablonu SMS*</ToolbarTitle>
                                <EditorActions>
                                    <ActionToggle
                                        active={previewMode}
                                        onClick={() => setPreviewMode(!previewMode)}
                                        title={previewMode ? 'Przejdź do edycji' : 'Pokaż podgląd'}
                                    >
                                        {previewMode ? (
                                            <>
                                                <FaCode /> Edytor
                                            </>
                                        ) : (
                                            <>
                                                <FaEye /> Podgląd
                                            </>
                                        )}
                                    </ActionToggle>
                                </EditorActions>
                            </EditorToolbar>

                            {previewMode ? (
                                <PreviewBox>
                                    <PreviewContent>
                                        {renderPreview()}
                                    </PreviewContent>
                                </PreviewBox>
                            ) : (
                                <FormTextarea
                                    id="template-content"
                                    name="content"
                                    value={template.content || ''}
                                    onChange={handleInputChange}
                                    placeholder="Wprowadź treść szablonu SMS..."
                                    rows={10}
                                    required
                                />
                            )}

                            <CharacterCounter>
                                <div>
                                    {countCharacters(template.content || '')} znaków
                                </div>
                                <div>
                                    {getSmsCount(template.content || '')} {
                                    getSmsCount(template.content || '') === 1
                                        ? 'wiadomość SMS'
                                        : getSmsCount(template.content || '') < 5
                                            ? 'wiadomości SMS'
                                            : 'wiadomości SMS'
                                }
                                </div>
                            </CharacterCounter>
                        </FormGroup>

                        <FormCheckboxWrapper>
                            <FormCheckbox
                                type="checkbox"
                                id="isActive"
                                checked={template.isActive === true}
                                onChange={handleActiveChange}
                            />
                            <FormCheckboxLabel htmlFor="isActive">
                                Szablon aktywny
                            </FormCheckboxLabel>
                            <FormHelp>
                                Nieaktywne szablony nie będą dostępne do użycia w wiadomościach i kampaniach.
                            </FormHelp>
                        </FormCheckboxWrapper>
                    </EditorMainSection>

                    <EditorSidebar>
                        <SidebarTitle>
                            <FaInfoCircle style={{ marginRight: '8px' }} />
                            Zmienne dynamiczne
                        </SidebarTitle>

                        <VariablesHelp>
                            Kliknij na zmienną, aby wstawić ją do treści. Zmienne są zastępowane danymi odbiorcy podczas wysyłki.
                        </VariablesHelp>

                        <VariableGroupsContainer>
                            {variableGroups.map(group => (
                                <VariableGroup key={group.name}>
                                    <GroupHeader onClick={() => toggleGroup(group.name)}>
                                        <GroupIcon>{group.icon}</GroupIcon>
                                        <GroupName>{group.name}</GroupName>
                                        <GroupToggle expanded={expandedGroups[group.name]}>
                                            <FaCaretRight />
                                        </GroupToggle>
                                    </GroupHeader>

                                    {expandedGroups[group.name] && (
                                        <GroupVariables>
                                            {group.variables.map(variable => (
                                                <VariableButton
                                                    key={variable.key}
                                                    onClick={() => insertVariable(variable)}
                                                    title={variable.description}
                                                >
                                                    <VariableName>
                                                        {`{{${variable.key}}}`}
                                                    </VariableName>
                                                    <VariableDesc>
                                                        {variable.description}
                                                    </VariableDesc>
                                                </VariableButton>
                                            ))}
                                        </GroupVariables>
                                    )}
                                </VariableGroup>
                            ))}
                        </VariableGroupsContainer>

                        <VariableUsageInfo>
                            <UsageTitle>Użyte zmienne:</UsageTitle>
                            {template.variables && template.variables.length > 0 ? (
                                <UsedVariablesList>
                                    {template.variables.map(varKey => (
                                        <UsedVariable key={varKey}>
                                            <FaCheck style={{ marginRight: '5px', color: '#2ecc71' }} />
                                            {`{{${varKey}}}`}
                                        </UsedVariable>
                                    ))}
                                </UsedVariablesList>
                            ) : (
                                <NoVariablesMessage>
                                    Brak użytych zmiennych
                                </NoVariablesMessage>
                            )}
                        </VariableUsageInfo>
                    </EditorSidebar>
                </EditorLayout>

                <ModalActions>
                    <SecondaryButton onClick={onClose} disabled={loading}>
                        <FaTimes /> Anuluj
                    </SecondaryButton>
                    <PrimaryButton onClick={handleSave} disabled={loading}>
                        {loading ? (
                            <>
                                <LoadingSpinner />
                                Zapisywanie...
                            </>
                        ) : (
                            <>
                                <FaSave /> {isEditing ? 'Zapisz zmiany' : 'Utwórz szablon'}
                            </>
                        )}
                    </PrimaryButton>
                </ModalActions>
            </ModalContent>
        </Modal>
    );
};

// src/pages/SMS/components/modals/TemplateEditorModal.tsx - Brakujące styled-components

// Brakujące styled-components
const ModalContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const EditorLayout = styled.div`
    display: flex;
    gap: 24px;

    @media (max-width: 992px) {
        flex-direction: column;
    }
`;

const EditorMainSection = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const EditorSidebar = styled.div`
    width: 280px;
    background-color: #f8f9fa;
    border-radius: 5px;
    border: 1px solid #e9ecef;
    padding: 16px;
    max-height: 600px;
    overflow-y: auto;

    @media (max-width: 992px) {
        width: 100%;
        max-height: 400px;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const FormLabel = styled.label`
    font-size: 14px;
    font-weight: 500;
    color: #495057;
`;

const FormInput = styled.input`
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 14px;
    transition: border-color 0.2s;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const FormSelect = styled.select`
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 14px;
    background-color: white;
    transition: border-color 0.2s;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const FormTextarea = styled.textarea`
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 14px;
    transition: border-color 0.2s;
    resize: vertical;
    min-height: 120px;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const FormHelp = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

const FormCheckboxWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const FormCheckbox = styled.input`
    width: 16px;
    height: 16px;
    cursor: pointer;
`;

const FormCheckboxLabel = styled.label`
    font-size: 14px;
    color: #495057;
    cursor: pointer;
`;

const EditorToolbar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ToolbarTitle = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #495057;
`;

const EditorActions = styled.div`
    display: flex;
    gap: 8px;
`;

const ActionToggle = styled.button<{ active?: boolean }>`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background-color: ${props => props.active ? '#e3f2fd' : '#f8f9fa'};
    border: 1px solid ${props => props.active ? '#90cdf4' : '#dee2e6'};
    border-radius: 4px;
    color: ${props => props.active ? '#3498db' : '#6c757d'};
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background-color: ${props => props.active ? '#e3f2fd' : '#f1f3f5'};
        color: ${props => props.active ? '#3498db' : '#495057'};
    }
`;

const PreviewBox = styled.div`
    padding: 10px 12px;
    border: 1px solid #bee3f8;
    border-radius: 5px;
    background-color: #f0f9ff;
    min-height: 120px;
`;

const PreviewContent = styled.div`
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
    color: #2c3e50;
`;

const CharacterCounter = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #6c757d;
    margin-top: 8px;
`;

const SidebarTitle = styled.h4`
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
`;

const VariablesHelp = styled.div`
    font-size: 12px;
    color: #6c757d;
    margin-bottom: 16px;
    line-height: 1.5;
`;

const VariableGroupsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const VariableGroup = styled.div`
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 10px;
    
    &:last-child {
        border-bottom: none;
    }
`;

const GroupHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    cursor: pointer;
    
    &:hover {
        color: #3498db;
    }
`;

const GroupIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background-color: #e3f2fd;
    border-radius: 4px;
    color: #3498db;
`;

const GroupName = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
    flex: 1;
`;

const GroupToggle = styled.div<{ expanded: boolean }>`
    transform: ${props => props.expanded ? 'rotate(90deg)' : 'rotate(0)'};
    transition: transform 0.2s;
    color: #6c757d;
`;

const GroupVariables = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 34px;
    margin-bottom: 8px;
`;

const VariableButton = styled.button`
    text-align: left;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    padding: 8px 10px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background-color: #f0f9ff;
        border-color: #bee3f8;
    }
`;

const VariableName = styled.div`
    font-family: monospace;
    font-size: 12px;
    color: #e74c3c;
    margin-bottom: 2px;
`;

const VariableDesc = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

const VariableUsageInfo = styled.div`
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #e9ecef;
`;

const UsageTitle = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: #495057;
    margin-bottom: 10px;
`;

const UsedVariablesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const UsedVariable = styled.div`
    display: flex;
    align-items: center;
    font-family: monospace;
    font-size: 12px;
    color: #2c3e50;
`;

const NoVariablesMessage = styled.div`
    font-size: 12px;
    color: #6c757d;
    font-style: italic;
`;

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 5px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const PrimaryButton = styled(Button)`
    background-color: #3498db;
    border-color: #3498db;
    color: white;

    &:hover:not(:disabled) {
        background-color: #2980b9;
        border-color: #2980b9;
    }
`;

const SecondaryButton = styled(Button)`
    background-color: #f8f9fa;
    border-color: #dee2e6;
    color: #6c757d;

    &:hover:not(:disabled) {
        background-color: #e9ecef;
    }
`;

const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Brakujące uzupełnienie importu
const FaLink = styled(FaCaretRight)`
    transform: rotate(-45deg);
`;

export default TemplateEditorModal;