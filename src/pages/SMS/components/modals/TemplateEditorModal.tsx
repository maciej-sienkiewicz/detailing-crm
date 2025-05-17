// src/pages/SMS/components/modals/TemplateEditorModal.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaListAlt,
    FaSave,
    FaTimes,
    FaCheck,
    FaTags,
    FaInfoCircle,
    FaQuestionCircle,
    FaCaretRight,
    FaUser,
    FaEnvelope,
    FaBuilding,
    FaCar,
    FaCalendarAlt,
    FaClock,
    FaPercentage,
    FaCode,
    FaEye,
    FaPlus
} from 'react-icons/fa';
import Modal from '../../../../components/common/Modal';
import { smsApi } from '../../../../api/smsApi';
import { SmsTemplate, SmsTemplateCategory, SmsTemplateCategoryLabels } from '../../../../types/sms';
import { useToast } from '../../../../components/common/Toast/Toast';

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
            size="lg"
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