// // src/pages/SMS/components/SmsTemplatesList.tsx
// import React, { useState, useEffect } from 'react';
// import styled from 'styled-components';
// import {
//     FaListAlt,
//     FaPlus,
//     FaEdit,
//     FaTrash,
//     FaCopy,
//     FaSearch,
//     FaSort,
//     FaTags,
//     FaCheck,
//     FaEye
// } from 'react-icons/fa';
// import { smsApi } from '../../../api/smsApi';
// import {
//     SmsTemplate,
//     SmsTemplateCategory,
//     SmsTemplateCategoryLabels
// } from '../../../types/sms';
// import Modal from '../../../components/common/Modal';
// import { useToast } from '../../../components/common/Toast/Toast';
//
// // Definicja zmiennej dynamicznej
// interface TemplateVariable {
//     key: string;
//     description: string;
//     example: string;
// }
//
// // Zdefiniowane zmienne dla szablonów
// const TEMPLATE_VARIABLES: Record<string, TemplateVariable> = {
//     'klient.imie': {
//         key: '{{klient.imie}}',
//         description: 'Imię klienta',
//         example: 'Jan'
//     },
//     'klient.nazwisko': {
//         key: '{{klient.nazwisko}}',
//         description: 'Nazwisko klienta',
//         example: 'Kowalski'
//     },
//     'klient.firma': {
//         key: '{{klient.firma}}',
//         description: 'Nazwa firmy klienta',
//         example: 'ABC Sp. z o.o.'
//     },
//     'pojazd.marka': {
//         key: '{{pojazd.marka}}',
//         description: 'Marka pojazdu',
//         example: 'Toyota'
//     },
//     'pojazd.model': {
//         key: '{{pojazd.model}}',
//         description: 'Model pojazdu',
//         example: 'Corolla'
//     },
//     'pojazd.rejestracja': {
//         key: '{{pojazd.rejestracja}}',
//         description: 'Numer rejestracyjny',
//         example: 'WA12345'
//     },
//     'wizyta.data': {
//         key: '{{wizyta.data}}',
//         description: 'Data najbliższej wizyty',
//         example: '12.05.2025'
//     },
//     'wizyta.godzina': {
//         key: '{{wizyta.godzina}}',
//         description: 'Godzina wizyty',
//         example: '14:30'
//     },
//     'wizyta.status': {
//         key: '{{wizyta.status}}',
//         description: 'Status wizyty',
//         example: 'W realizacji'
//     },
//     'rabat.kod': {
//         key: '{{rabat.kod}}',
//         description: 'Kod rabatowy',
//         example: 'LATO2025'
//     },
//     'rabat.wartosc': {
//         key: '{{rabat.wartosc}}',
//         description: 'Wartość rabatu',
//         example: '15%'
//     },
//     'rabat.data_waznosci': {
//         key: '{{rabat.data_waznosci}}',
//         description: 'Data ważności rabatu',
//         example: '30.06.2025'
//     },
//     'firma.nazwa': {
//         key: '{{firma.nazwa}}',
//         description: 'Nazwa Twojej firmy',
//         example: 'Auto Detailing'
//     },
//     'firma.telefon': {
//         key: '{{firma.telefon}}',
//         description: 'Telefon do Twojej firmy',
//         example: '+48 123 456 789'
//     },
//     'link.rezerwacja': {
//         key: '{{link.rezerwacja}}',
//         description: 'Link do strony rezerwacji',
//         example: 'https://rezerwacja.twojafirma.pl'
//     },
//     'link.recenzja': {
//         key: '{{link.recenzja}}',
//         description: 'Link do wystawienia opinii',
//         example: 'https://opinie.twojafirma.pl'
//     }
// };
//
// export const SmsTemplatesList: React.FC = () => {
//     const { showToast } = useToast();
//
//     // Stan komponentu
//     const [templates, setTemplates] = useState<SmsTemplate[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//
//     // Stan filtrowania i sortowania
//     const [searchQuery, setSearchQuery] = useState('');
//     const [categoryFilter, setCategoryFilter] = useState<string>('');
//     const [sortOrder, setSortOrder] = useState<'name' | 'category' | 'usage'>('name');
//
//     // Stan dla zarządzania szablonami
//     const [selectedTemplate, setSelectedTemplate] = useState<SmsTemplate | null>(null);
//     const [showTemplateDetails, setShowTemplateDetails] = useState(false);
//     const [showTemplateEditor, setShowTemplateEditor] = useState(false);
//     const [showVariablesHelp, setShowVariablesHelp] = useState(false);
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//
//     // Stan edytora szablonu
//     const [editedTemplate, setEditedTemplate] = useState<{
//         id?: string;
//         name: string;
//         content: string;
//         category: SmsTemplateCategory;
//         isActive: boolean;
//     }>({
//         name: '',
//         content: '',
//         category: SmsTemplateCategory.OTHER,
//         isActive: true
//     });
//
//     // Pobieranie szablonów
//     const fetchTemplates = async () => {
//         try {
//             setLoading(true);
//             const data = await smsApi.fetchTemplates();
//             setTemplates(data);
//             setError(null);
//         } catch (err) {
//             console.error('Error fetching templates:', err);
//             setError('Nie udało się pobrać szablonów SMS');
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     // Pobierz szablony przy pierwszym renderowaniu
//     useEffect(() => {
//         fetchTemplates();
//     }, []);
//
//     // Filtrowanie i sortowanie szablonów
//     const filteredAndSortedTemplates = React.useMemo(() => {
//         let result = [...templates];
//
//         // Filtruj po frazie
//         if (searchQuery) {
//             const query = searchQuery.toLowerCase();
//             result = result.filter(
//                 template =>
//                     template.name.toLowerCase().includes(query) ||
//                     template.content.toLowerCase().includes(query)
//             );
//         }
//
//         // Filtruj po kategorii
//         if (categoryFilter) {
//             result = result.filter(template => template.category === categoryFilter);
//         }
//
//         // Sortuj
//         return result.sort((a, b) => {
//             switch (sortOrder) {
//                 case 'name':
//                     return a.name.localeCompare(b.name);
//                 case 'category':
//                     return a.category.localeCompare(b.category);
//                 case 'usage':
//                     return b.usageCount - a.usageCount;
//                 default:
//                     return 0;
//             }
//         });
//     }, [templates, searchQuery, categoryFilter, sortOrder]);
//
//     // Obsługa wyszukiwania
//     const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setSearchQuery(e.target.value);
//     };
//
//     // Obsługa filtrowania kategorii
//     const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//         setCategoryFilter(e.target.value);
//     };
//
//     // Obsługa sortowania
//     const handleSortOrderChange = (newSortOrder: 'name' | 'category' | 'usage') => {
//         setSortOrder(newSortOrder);
//     };
//
//     // Otwieranie edytora szablonu
//     const handleAddTemplate = () => {
//         setEditedTemplate({
//             name: '',
//             content: '',
//             category: SmsTemplateCategory.OTHER,
//             isActive: true
//         });
//         setSelectedTemplate(null);
//         setShowTemplateEditor(true);
//     };
//
//     // Edycja istniejącego szablonu
//     const handleEditTemplate = (template: SmsTemplate) => {
//         setSelectedTemplate(template);
//         setEditedTemplate({
//             id: template.id,
//             name: template.name,
//             content: template.content,
//             category: template.category,
//             isActive: template.isActive
//         });
//         setShowTemplateEditor(true);
//     };
//
//     // Duplikowanie szablonu
//     const handleDuplicateTemplate = (template: SmsTemplate) => {
//         setSelectedTemplate(null);
//         setEditedTemplate({
//             name: `Kopia - ${template.name}`,
//             content: template.content,
//             category: template.category,
//             isActive: true
//         });
//         setShowTemplateEditor(true);
//     };
//
//     // Obsługa zmiany w formularzu edycji
//     const handleEditorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//         const { name, value } = e.target;
//         setEditedTemplate(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };
//
//     // Przełączanie aktywności szablonu
//     const handleToggleActive = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setEditedTemplate(prev => ({
//             ...prev,
//             isActive: e.target.checked
//         }));
//     };
//
//     // Wstawianie zmiennej do edytora
//     const handleInsertVariable = (variableKey: string) => {
//         const variable = TEMPLATE_VARIABLES[variableKey];
//         if (!variable) return;
//
//         const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
//         if (!textarea) return;
//
//         const start = textarea.selectionStart;
//         const end = textarea.selectionEnd;
//         const text = textarea.value;
//         const before = text.substring(0, start);
//         const after = text.substring(end);
//
//         const newText = before + variable.key + after;
//         setEditedTemplate(prev => ({
//             ...prev,
//             content: newText
//         }));
//
//         // Ustawienie kursora za wstawioną zmienną
//         setTimeout(() => {
//             textarea.focus();
//             textarea.setSelectionRange(
//                 start + variable.key.length,
//                 start + variable.key.length
//             );
//         }, 0);
//     };
//
//     // Zapisywanie szablonu
//     const handleSaveTemplate = async () => {
//         try {
//             if (!editedTemplate.name.trim()) {
//                 showToast('error', 'Nazwa szablonu jest wymagana', 3000);
//                 return;
//             }
//
//             if (!editedTemplate.content.trim()) {
//                 showToast('error', 'Treść szablonu jest wymagana', 3000);
//                 return;
//             }
//
//             if (editedTemplate.id) {
//                 // Aktualizacja istniejącego szablonu
//                 await smsApi.updateTemplate(editedTemplate.id, {
//                     name: editedTemplate.name,
//                     content: editedTemplate.content,
//                     category: editedTemplate.category,
//                     isActive: editedTemplate.isActive
//                 });
//                 showToast('success', 'Szablon został zaktualizowany', 3000);
//             } else {
//                 // Tworzenie nowego szablonu
//                 await smsApi.createTemplate({
//                     name: editedTemplate.name,
//                     content: editedTemplate.content,
//                     category: editedTemplate.category,
//                     isActive: editedTemplate.isActive
//                 });
//                 showToast('success', 'Nowy szablon został utworzony', 3000);
//             }
//
//             // Zamknij edytor i odśwież listę
//             setShowTemplateEditor(false);
//             fetchTemplates();
//         } catch (err) {
//             console.error('Error saving template:', err);
//             showToast('error', 'Nie udało się zapisać szablonu', 3000);
//         }
//     };
//
//     // Usuwanie szablonu
//     const handleDeleteTemplate = (template: SmsTemplate) => {
//         setSelectedTemplate(template);
//         setShowDeleteConfirm(true);
//     };
//
//     // Potwierdzenie usunięcia
//     const confirmDeleteTemplate = async () => {
//         if (!selectedTemplate) return;
//
//         try {
//             await smsApi.deleteTemplate(selectedTemplate.id);
//             showToast('success', 'Szablon został usunięty', 3000);
//             setShowDeleteConfirm(false);
//             fetchTemplates();
//         } catch (err) {
//             console.error('Error deleting template:', err);
//             showToast('error', 'Nie udało się usunąć szablonu', 3000);
//         }
//     };
//
//     // Podgląd szablonu
//     const handleViewTemplate = (template: SmsTemplate) => {
//         setSelectedTemplate(template);
//         setShowTemplateDetails(true);
//     };
//
//     // Licznik znaków w treści
//     const countCharacters = (text: string) => {
//         // Prostej implementacja
//         return text.length;
//     };
//
//     // Liczba SMS-ów
//     const getSmsCount = (text: string) => {
//         const length = countCharacters(text);
//         if (length <= 160) return 1;
//         return Math.ceil(length / 153); // 153 znaki dla kolejnych części wiadomości wieloczęściowej
//     };
//
//     // Wyświetlanie kategorii szablonu
//     const renderTemplateCategory = (category: SmsTemplateCategory) => {
//         return (
//             <CategoryBadge>
//                 <FaTags style={{ marginRight: '4px' }} />
//                 {SmsTemplateCategoryLabels[category]}
//             </CategoryBadge>
//         );
//     };
//
//     return (
//         <Container>
//             <PageHeader>
//                 <PageTitle>
//                     <FaListAlt style={{ marginRight: '10px' }} />
//                     Szablony SMS
//                 </PageTitle>
//                 <HeaderActions>
//                     <HelpButton onClick={() => setShowVariablesHelp(true)}>
//                         Zmienne dynamiczne
//                     </HelpButton>
//                     <PrimaryButton onClick={handleAddTemplate}>
//                         <FaPlus /> Nowy szablon
//                     </PrimaryButton>
//                 </HeaderActions>
//             </PageHeader>
//
//             {/* Panel wyszukiwania i filtrowania */}
//             <SearchFilterPanel>
//                 <SearchInput
//                     type="text"
//                     placeholder="Szukaj szablonów..."
//                     value={searchQuery}
//                     onChange={handleSearchChange}
//                 />
//
//                 <CategorySelect
//                     value={categoryFilter}
//                     onChange={handleCategoryFilterChange}
//                 >
//                     <option value="">Wszystkie kategorie</option>
//                     {Object.entries(SmsTemplateCategoryLabels).map(([key, label]) => (
//                         <option key={key} value={key}>
//                             {label}
//                         </option>
//                     ))}
//                 </CategorySelect>
//
//                 <SortButtons>
//                     <SortButton
//                         active={sortOrder === 'name'}
//                         onClick={() => handleSortOrderChange('name')}
//                         title="Sortuj według nazwy"
//                     >
//                         Nazwa <FaSort />
//                     </SortButton>
//                     <SortButton
//                         active={sortOrder === 'category'}
//                         onClick={() => handleSortOrderChange('category')}
//                         title="Sortuj według kategorii"
//                     >
//                         Kategoria <FaSort />
//                     </SortButton>
//                     <SortButton
//                         active={sortOrder === 'usage'}
//                         onClick={() => handleSortOrderChange('usage')}
//                         title="Sortuj według użycia"
//                     >
//                         Użycie <FaSort />
//                     </SortButton>
//                 </SortButtons>
//             </SearchFilterPanel>
//
//             {/* Wyświetlanie błędu */}
//             {error && <ErrorMessage>{error}</ErrorMessage>}
//
//             {/* Lista szablonów */}
//             {loading ? (
//                 <LoadingContainer>
//                     <LoadingSpinner />
//                     <LoadingText>Ładowanie szablonów...</LoadingText>
//                 </LoadingContainer>
//             ) : filteredAndSortedTemplates.length === 0 ? (
//                 <EmptyState>
//                     {searchQuery || categoryFilter
//                         ? 'Nie znaleziono szablonów spełniających kryteria.'
//                         : 'Brak szablonów. Kliknij "Nowy szablon", aby utworzyć pierwszy szablon.'}
//                 </EmptyState>
//             ) : (
//                 <TemplatesGrid>
//                     {filteredAndSortedTemplates.map(template => (
//                         <TemplateCard key={template.id}>
//                             <TemplateHeader>
//                                 <TemplateName onClick={() => handleViewTemplate(template)}>
//                                     {template.name}
//                                 </TemplateName>
//                                 <TemplateActions>
//                                     <ActionButton
//                                         onClick={() => handleViewTemplate(template)}
//                                         title="Podgląd"
//                                     >
//                                         <FaEye />
//                                     </ActionButton>
//                                     <ActionButton
//                                         onClick={() => handleEditTemplate(template)}
//                                         title="Edytuj"
//                                     >
//                                         <FaEdit />
//                                     </ActionButton>
//                                     <ActionButton
//                                         onClick={() => handleDuplicateTemplate(template)}
//                                         title="Duplikuj"
//                                     >
//                                         <FaCopy />
//                                     </ActionButton>
//                                     <ActionButton
//                                         onClick={() => handleDeleteTemplate(template)}
//                                         title="Usuń"
//                                         danger
//                                     >
//                                         <FaTrash />
//                                     </ActionButton>
//                                 </TemplateActions>
//                             </TemplateHeader>
//
//                             <TemplateContent onClick={() => handleViewTemplate(template)}>
//                                 {template.content.length > 120
//                                     ? `${template.content.substring(0, 120)}...`
//                                     : template.content}
//                             </TemplateContent>
//
//                             <TemplateFooter>
//                                 <TemplateMetaInfo>
//                                     {renderTemplateCategory(template.category)}
//                                     <TemplateUsage>
//                                         Użyto: {template.usageCount} razy
//                                     </TemplateUsage>
//                                 </TemplateMetaInfo>
//                                 <TemplateStatus active={template.isActive}>
//                                     {template.isActive ? (
//                                         <>
//                                             <FaCheck style={{ marginRight: '4px' }} />
//                                             Aktywny
//                                         </>
//                                     ) : 'Nieaktywny'}
//                                 </TemplateStatus>
//                             </TemplateFooter>
//                         </TemplateCard>
//                     ))}
//                 </TemplatesGrid>
//             )}
//
//             {/* Modal ze szczegółami szablonu */}
//             {showTemplateDetails && selectedTemplate && (
//                 <Modal
//                     isOpen={showTemplateDetails}
//                     onClose={() => setShowTemplateDetails(false)}
//                     title="Szczegóły szablonu SMS"
//                 >
//                     <TemplateDetailsContent>
//                         <TemplateDetailHeader>
//                             <TemplateDetailName>{selectedTemplate.name}</TemplateDetailName>
//                             {renderTemplateCategory(selectedTemplate.category)}
//                         </TemplateDetailHeader>
//
//                         <TemplateDetailSection>
//                             <TemplateDetailLabel>Treść:</TemplateDetailLabel>
//                             <TemplateDetailText>{selectedTemplate.content}</TemplateDetailText>
//                         </TemplateDetailSection>
//
//                         <TemplatePreviewSection>
//                             <TemplateDetailLabel>Podgląd z przykładowymi danymi:</TemplateDetailLabel>
//                             <TemplatePreviewBox>
//                                 {selectedTemplate.content.replace(/{{([^}]+)}}/g, (match, variable) => {
//                                     // Zamiana zmiennych na przykładowe wartości
//                                     const key = variable.trim();
//                                     const variableObj = Object.values(TEMPLATE_VARIABLES).find(
//                                         v => v.key === `{{${key}}}`
//                                     );
//                                     return variableObj ? variableObj.example : match;
//                                 })}
//                             </TemplatePreviewBox>
//                         </TemplatePreviewSection>
//
//                         <TemplateStats>
//                             <StatItem>
//                                 <StatLabel>Liczba znaków:</StatLabel>
//                                 <StatValue>{countCharacters(selectedTemplate.content)}</StatValue>
//                             </StatItem>
//                             <StatItem>
//                                 <StatLabel>Liczba SMS-ów:</StatLabel>
//                                 <StatValue>{getSmsCount(selectedTemplate.content)}</StatValue>
//                             </StatItem>
//                             <StatItem>
//                                 <StatLabel>Użyto:</StatLabel>
//                                 <StatValue>{selectedTemplate.usageCount} razy</StatValue>
//                             </StatItem>
//                             <StatItem>
//                                 <StatLabel>Utworzono:</StatLabel>
//                                 <StatValue>
//                                     {new Date(selectedTemplate.createdAt).toLocaleDateString('pl-PL')}
//                                 </StatValue>
//                             </StatItem>
//                             <StatItem>
//                                 <StatLabel>Ostatnia aktualizacja:</StatLabel>
//                                 <StatValue>
//                                     {new Date(selectedTemplate.updatedAt).toLocaleDateString('pl-PL')}
//                                 </StatValue>
//                             </StatItem>
//                         </TemplateStats>
//
//                         <DetailActions>
//                             <Button onClick={() => handleEditTemplate(selectedTemplate)}>
//                                 <FaEdit /> Edytuj
//                             </Button>
//                             <Button onClick={() => handleDuplicateTemplate(selectedTemplate)}>
//                                 <FaCopy /> Duplikuj
//                             </Button>
//                             <DangerButton onClick={() => {
//                                 setShowTemplateDetails(false);
//                                 handleDeleteTemplate(selectedTemplate);
//                             }}>
//                                 <FaTrash /> Usuń
//                             </DangerButton>
//                         </DetailActions>
//                     </TemplateDetailsContent>
//                 </Modal>
//             )}
//
//             {/* Modal z pomocą dla zmiennych dynamicznych */}
//             {showVariablesHelp && (
//                 <Modal
//                     isOpen={showVariablesHelp}
//                     onClose={() => setShowVariablesHelp(false)}
//                     title="Zmienne dynamiczne w szablonach SMS"
//                 >
//                     <VariablesHelpContent>
//                         <HelpText>
//                             Zmienne dynamiczne pozwalają na personalizację wiadomości SMS.
//                             Poniżej znajduje się lista dostępnych zmiennych, które możesz wstawić do szablonu.
//                         </HelpText>
//
//                         <VariablesTable>
//                             <thead>
//                             <tr>
//                                 <VariableTableHeader>Zmienna</VariableTableHeader>
//                                 <VariableTableHeader>Opis</VariableTableHeader>
//                                 <VariableTableHeader>Przykład</VariableTableHeader>
//                             </tr>
//                             </thead>
//                             <tbody>
//                             {Object.values(TEMPLATE_VARIABLES).map(variable => (
//                                 <tr key={variable.key}>
//                                     <VariableTableCell>
//                                         <VariableKey>{variable.key}</VariableKey>
//                                     </VariableTableCell>
//                                     <VariableTableCell>{variable.description}</VariableTableCell>
//                                     <VariableTableCell>{variable.example}</VariableTableCell>
//                                 </tr>
//                             ))}
//                             </tbody>
//                         </VariablesTable>
//
//                         <HelpText>
//                             <strong>Jak używać zmiennych:</strong> Wstaw zmienną do szablonu,
//                             a system automatycznie zastąpi ją danymi z bazy podczas wysyłki SMS.
//                             Jeśli system nie znajdzie danych dla zmiennej, zostanie ona zastąpiona pustym ciągiem.
//                         </HelpText>
//
//                         <HelpExamples>
//                             <h4>Przykładowe szablony:</h4>
//                             <ExampleTemplate>
//                                 <strong>Przypomnienie o wizycie:</strong><br />
//                                 {{klient.imie}}, przypominamy o jutrzejszej wizycie ({{wizyta.data}}, {{wizyta.godzina}}) dla {{pojazd.marka}} {{pojazd.model}}. Prosimy o potwierdzenie lub zmianę terminu. Zespół {{firma.nazwa}}
//                             </ExampleTemplate>
//
//                             <ExampleTemplate>
//                                 <strong>Gotowość pojazdu do odbioru:</strong><br />
//                                 {{klient.imie}}, Twój {{pojazd.marka}} {{pojazd.model}} jest gotowy do odbioru. Możesz odebrać pojazd do godz. 18:00. W razie pytań prosimy o kontakt. Zespół {{firma.nazwa}}
//                             </ExampleTemplate>
//                         </HelpExamples>
//                     </VariablesHelpContent>
//                 </Modal>
//             )}
//
//             {/* Modal z potwierdzeniem usunięcia */}
//             {showDeleteConfirm && selectedTemplate && (
//                 <Modal
//                     isOpen={showDeleteConfirm}
//                     onClose={() => setShowDeleteConfirm(false)}
//                     title="Potwierdź usunięcie"
//                 >
//                     <ConfirmContent>
//                         <p>Czy na pewno chcesz usunąć szablon <strong>{selectedTemplate.name}</strong>?</p>
//                         <p>Ta operacja jest nieodwracalna.</p>
//
//                         {selectedTemplate.usageCount > 0 && (
//                             <WarningMessage>
//                                 <strong>Uwaga:</strong> Ten szablon był używany {selectedTemplate.usageCount} razy.
//                                 Usunięcie go może wpłynąć na automatyzacje lub kampanie, które go wykorzystują.
//                             </WarningMessage>
//                         )}
//
//                         <ConfirmActions>
//                             <SecondaryButton onClick={() => setShowDeleteConfirm(false)}>
//                                 Anuluj
//                             </SecondaryButton>
//                             <DangerButton onClick={confirmDeleteTemplate}>
//                                 Usuń szablon
//                             </DangerButton>
//                         </ConfirmActions>
//                     </ConfirmContent>
//                 </Modal>
//             )}
//         </Container>
//     );
// };
//
// // Styled components
// const Container = styled.div`
//     display: flex;
//     flex-direction: column;
//     gap: 16px;
// `;
//
// const PageHeader = styled.div`
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
// `;
//
// const PageTitle = styled.h1`
//     font-size: 24px;
//     display: flex;
//     align-items: center;
//     color: #2c3e50;
//     margin: 0;
// `;
//
// const HeaderActions = styled.div`
//     display: flex;
//     gap: 10px;
// `;
//
// const Button = styled.button`
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     padding: 8px 16px;
//     border-radius: 4px;
//     background-color: #f8f9fa;
//     border: 1px solid #dee2e6;
//     color: #495057;
//     font-size: 14px;
//     cursor: pointer;
//     transition: all 0.2s;
//
//     &:hover {
//         background-color: #e9ecef;
//     }
// `;
//
// const HelpButton = styled(Button)`
//     color: #6c757d;
//
//     &:hover {
//         color: #3498db;
//     }
// `;
//
// const PrimaryButton = styled(Button)`
//     background-color: #3498db;
//     border-color: #3498db;
//     color: white;
//
//     &:hover {
//         background-color: #2980b9;
//         border-color: #2980b9;
//     }
// `;
//
// const SecondaryButton = styled(Button)`
//     background-color: white;
//     border-color: #ced4da;
//     color: #6c757d;
//
//     &:hover {
//         background-color: #f8f9fa;
//     }
// `;
//
// const DangerButton = styled(Button)`
//     background-color: #e74c3c;
//     border-color: #e74c3c;
//     color: white;
//
//     &:hover {
//         background-color: #c0392b;
//         border-color: #c0392b;
//     }
// `;
//
// const SearchFilterPanel = styled.div`
//     display: flex;
//     flex-wrap: wrap;
//     gap: 12px;
//     align-items: center;
//     margin-bottom: 8px;
// `;
//
// const SearchInput = styled.input`
//     flex: 1;
//     min-width: 200px;
//     padding: 8px 12px;
//     border: 1px solid #ced4da;
//     border-radius: 4px;
//     font-size: 14px;
//
//     &:focus {
//         outline: none;
//         border-color: #3498db;
//         box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
//     }
// `;
//
// const CategorySelect = styled.select`
//     padding: 8px 12px;
//     border: 1px solid #ced4da;
//     border-radius: 4px;
//     font-size: 14px;
//     background-color: white;
//
//     &:focus {
//         outline: none;
//         border-color: #3498db;
//         box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
//     }
// `;
//
// const SortButtons = styled.div`
//     display: flex;
//     gap: 6px;
// `;
//
// const SortButton = styled.button<{ active: boolean }>`
//     display: flex;
//     align-items: center;
//     gap: 4px;
//     padding: 6px 10px;
//     border-radius: 4px;
//     background-color: ${props => props.active ? '#e9ecef' : 'white'};
//     border: 1px solid ${props => props.active ? '#ced4da' : '#e9ecef'};
//     color: ${props => props.active ? '#495057' : '#6c757d'};
//     font-size: 13px;
//     cursor: pointer;
//     transition: all 0.2s;
//
//     &:hover {
//         background-color: #e9ecef;
//         color: #495057;
//     }
// `;
//
// const ErrorMessage = styled.div`
//     padding: 12px 16px;
//     background-color: #fff5f5;
//     border: 1px solid #fee2e2;
//     border-radius: 4px;
//     color: #e53e3e;
//     margin-bottom: 8px;
// `;
//
// const LoadingContainer = styled.div`
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     padding: 40px 0;
// `;
//
// const LoadingSpinner = styled.div`
//     width: 30px;
//     height: 30px;
//     border: 3px solid #f3f3f3;
//     border-top: 3px solid #3498db;
//     border-radius: 50%;
//     margin-bottom: 16px;
//     animation: spin 1s linear infinite;
//
//     @keyframes spin {
//         0% { transform: rotate(0deg); }
//         100% { transform: rotate(360deg); }
//     }
// `;
//
// const LoadingText = styled.div`
//     color: #6c757d;
//     font-size: 14px;
// `;
//
// const EmptyState = styled.div`
//     padding: 40px;
//     text-align: center;
//     background-color: #f8f9fa;
//     border-radius: 4px;
//     border: 1px dashed #dee2e6;
//     color: #6c757d;
// `;
//
// const TemplatesGrid = styled.div`
//     display: grid;
//     grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
//     gap: 16px;
// `;
//
// const TemplateCard = styled.div`
//     display: flex;
//     flex-direction: column;
//     background-color: white;
//     border-radius: 6px;
//     border: 1px solid #e9ecef;
//     box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
//     overflow: hidden;
//     transition: all 0.2s;
//
//     &:hover {
//         box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
//         transform: translateY(-2px);
//     }
// `;
//
// const TemplateHeader = styled.div`
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     padding: 12px 16px;
//     border-bottom: 1px solid #f1f3f5;
//     background-color: #f8f9fa;
// `;
//
// const TemplateName = styled.h3`
//     margin: 0;
//     font-size: 16px;
//     font-weight: 600;
//     color: #2c3e50;
//     cursor: pointer;
// `;
//
// const TemplateActions = styled.div`
//     display: flex;
//     gap: 6px;
// `;
//
// const ActionButton = styled.button<{ danger?: boolean }>`
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     width: 28px;
//     height: 28px;
//     border-radius: 4px;
//     background-color: transparent;
//     border: none;
//     color: ${({ danger }) => danger ? '#e74c3c' : '#6c757d'};
//     cursor: pointer;
//     transition: all 0.2s;
//
//     &:hover {
//         background-color: ${({ danger }) => danger ? '#fff5f5' : '#f0f9ff'};
//         color: ${({ danger }) => danger ? '#c0392b' : '#3498db'};
//     }
// `;
//
// const TemplateContent = styled.div`
//     flex: 1;
//     padding: 16px;
//     font-size: 14px;
//     color: #2c3e50;
//     line-height: 1.5;
//     cursor: pointer;
//     min-height: 80px;
// `;
//
// const TemplateFooter = styled.div`
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     padding: 10px 16px;
//     background-color: #f8f9fa;
//     border-top: 1px solid #f1f3f5;
// `;
//
// const TemplateMetaInfo = styled.div`
//     display: flex;
//     flex-direction: column;
//     gap: 4px;
// `;
//
// const CategoryBadge = styled.div`
//     display: inline-flex;
//     align-items: center;
//     padding: 2px 8px;
//     border-radius: 12px;
//     background-color: #e3f2fd;
//     color: #2980b9;
//     font-size: 12px;
//     font-weight: 500;
//     gap: 4px;
// `;
//
// const TemplateUsage = styled.div`
//     font-size: 12px;
//     color: #6c757d;
// `;
//
// const TemplateStatus = styled.div<{ active: boolean }>`
//     display: flex;
//     align-items: center;
//     font-size: 12px;
//     font-weight: 500;
//     color: ${props => props.active ? '#2ecc71' : '#6c757d'};
// `;
//
// // Styled components dla szczegółów szablonu
// const TemplateDetailsContent = styled.div`
//     display: flex;
//     flex-direction: column;
//     gap: 16px;
// `;
//
// const TemplateDetailHeader = styled.div`
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     margin-bottom: 8px;
// `;
//
// const TemplateDetailName = styled.h2`
//     margin: 0;
//     font-size: 18px;
//     color: #2c3e50;
// `;
//
// const TemplateDetailSection = styled.div`
//     display: flex;
//     flex-direction: column;
//     gap: 8px;
// `;
//
// const TemplateDetailLabel = styled.div`
//     font-weight: 500;
//     color: #495057;
// `;
//
// const TemplateDetailText = styled.div`
//     padding: 12px 16px;
//     background-color: #f8f9fa;
//     border: 1px solid #e9ecef;
//     border-radius: 4px;
//     font-size: 14px;
//     line-height: 1.5;
//     color: #2c3e50;
//     white-space: pre-wrap;
// `;
//
// const TemplatePreviewSection = styled.div`
//     display: flex;
//     flex-direction: column;
//     gap: 8px;
// `;
//
// const TemplatePreviewBox = styled.div`
//     padding: 12px 16px;
//     background-color: #f0f9ff;
//     border: 1px dashed #90cdf4;
//     border-radius: 4px;
//     font-size: 14px;
//     line-height: 1.5;
//     color: #2c3e50;
//     white-space: pre-wrap;
// `;
//
// const TemplateStats = styled.div`
//     display: grid;
//     grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
//     gap: 12px;
//     background-color: #f8f9fa;
//     padding: 12px 16px;
//     border-radius: 4px;
// `;
//
// const StatItem = styled.div`
//     display: flex;
//     flex-direction: column;
//     gap: 2px;
// `;
//
// const StatLabel = styled.div`
//     font-size: 12px;
//     color: #6c757d;
// `;
//
// const StatValue = styled.div`
//     font-size: 14px;
//     font-weight: 500;
//     color: #2c3e50;
// `;
//
// const DetailActions = styled.div`
//     display: flex;
//     justify-content: flex-end;
//     gap: 10px;
//     margin-top: 16px;
// `;
//
// // Styled components dla edytora szablonu
// const TemplateEditorContent = styled.div`
//     display: flex;
//     flex-direction: column;
//     gap: 16px;
// `;
//
// const FormGroup = styled.div`
//     display: flex;
//     flex-direction: column;
//     gap: 6px;
// `;
//
// const FormLabel = styled.label`
//     font-size: 14px;
//     font-weight: 500;
//     color: #495057;
// `;
//
// const FormInput = styled.input`
//     padding: 10px 12px;
//     border: 1px solid #ced4da;
//     border-radius: 4px;
//     font-size: 14px;
//
//     &:focus {
//         outline: none;
//         border-color: #3498db;
//         box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
//     }
// `;
//
// const FormSelect = styled.select`
//     padding: 10px 12px;
//     border: 1px solid #ced4da;
//     border-radius: 4px;
//     font-size: 14px;
//     background-color: white;
//
//     &:focus {
//         outline: none;
//         border-color: #3498db;
//         box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
//     }
// `;
//
// const TextareaWithTools = styled.div`
//     display: flex;
//     flex-direction: column;
//     border: 1px solid #ced4da;
//     border-radius: 4px;
//     overflow: hidden;
//
//     &:focus-within {
//         border-color: #3498db;
//         box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
//     }
// `;
//
// const FormTextarea = styled.textarea`
//     padding: 10px 12px;
//     border: none;
//     font-size: 14px;
//     min-height: 120px;
//     resize: vertical;
//
//     &:focus {
//         outline: none;
//     }
// `;
//
// const VariablesToolbar = styled.div`
//     display: flex;
//     flex-wrap: wrap;
//     gap: 12px;
//     padding: 8px 12px;
//     background-color: #f8f9fa;
//     border-top: 1px solid #ced4da;
// `;
//
// const ToolbarSection = styled.div`
//     display: flex;
//     flex-direction: column;
//     gap: 4px;
// `;
//
// const ToolbarLabel = styled.div`
//     font-size: 12px;
//     font-weight: 500;
//     color: #6c757d;
// `;
//
// const ToolbarButtons = styled.div`
//     display: flex;
//     flex-wrap: wrap;
//     gap: 6px;
// `;
//
// const VariableButton = styled.button`
//     padding: 3px 8px;
//     border: 1px solid #ced4da;
//     border-radius: 3px;
//     background-color: white;
//     color: #3498db;
//     font-size: 12px;
//     cursor: pointer;
//     transition: all 0.2s;
//
//     &:hover {
//         background-color: #e3f2fd;
//         border-color: #3498db;
//     }
// `;
//
// const CharacterCounter = styled.div`
//     display: flex;
//     justify-content: space-between;
//     font-size: 12px;
//     color: #6c757d;
//     padding: 4px 0;
// `;
//
// const FormCheckboxWrapper = styled.div`
//     display: flex;
//     align-items: center;
//     gap: 8px;
// `;
//
// const FormCheckbox = styled.input`
//     width: 16px;
//     height: 16px;
// `;
//
// const FormCheckboxLabel = styled.label`
//     font-size: 14px;
//     color: #495057;
// `;
//
// const EditorPreview = styled.div`
//     display: flex;
//     flex-direction: column;
//     gap: 6px;
//     margin-top: 8px;
// `;
//
// const PreviewLabel = styled.div`
//     font-size: 14px;
//     font-weight: 500;
//     color: #495057;
// `;
//
// const PreviewContent = styled.div`
//     padding: 12px 16px;
//     background-color: #f0f9ff;
//     border: 1px dashed #90cdf4;
//     border-radius: 4px;
//     font-size: 14px;
//     color: #2c3e50;
//     white-space: pre-wrap;
//     line-height: 1.5;
//     min-height: 60px;
// `;
//
// const FormActions = styled.div`
//     display: flex;
//     justify-content: flex-end;
//     gap: 10px;
//     margin-top: 16px;
// `;
//
// // Styled components dla modalu zmiennych
// const VariablesHelpContent = styled.div`
//     display: flex;
//     flex-direction: column;
//     gap: 16px;
// `;
//
// const HelpText = styled.p`
//     font-size: 14px;
//     line-height: 1.5;
//     color: #2c3e50;
//     margin: 0;
// `;
//
// const VariablesTable = styled.table`
//     width: 100%;
//     border-collapse: collapse;
// `;
//
// const VariableTableHeader = styled.th`
//     padding: 10px 16px;
//     text-align: left;
//     font-weight: 600;
//     color: #495057;
//     background-color: #f8f9fa;
//     border-bottom: 2px solid #e9ecef;
// `;
//
// const VariableTableCell = styled.td`
//     padding: 8px 16px;
//     border-bottom: 1px solid #e9ecef;
//     font-size: 14px;
//     color: #2c3e50;
// `;
//
// const VariableKey = styled.code`
//     padding: 2px 6px;
//     background-color: #f8f9fa;
//     border: 1px solid #e9ecef;
//     border-radius: 3px;
//     font-family: monospace;
//     font-size: 13px;
//     color: #e74c3c;
// `;
//
// const HelpExamples = styled.div`
//     display: flex;
//     flex-direction: column;
//     gap: 8px;
//     margin-top: 8px;
//
//     h4 {
//         margin: 0 0 8px 0;
//         color: #2c3e50;
//     }
// `;
//
// const ExampleTemplate = styled.div`
//     padding: 12px 16px;
//     background-color: #f8f9fa;
//     border: 1px solid #e9ecef;
//     border-radius: 4px;
//     font-size: 14px;
//     line-height: 1.5;
//     color: #2c3e50;
//     margin-bottom: 8px;
// `;
//
// // Styled components dla modalu potwierdzenia
// const ConfirmContent = styled.div`
//     display: flex;
//     flex-direction: column;
//     gap: 16px;
//
//     p {
//         margin: 0;
//         line-height: 1.5;
//         color: #2c3e50;
//     }
// `;
//
// const WarningMessage = styled.div`
//     padding: 12px 16px;
//     background-color: #fff8e6;
//     border: 1px solid #ffeeba;
//     border-radius: 4px;
//     color: #856404;
//     font-size: 14px;
//     line-height: 1.5;
// `;
//
// const ConfirmActions = styled.div`
//     display: flex;
//     justify-content: flex-end;
//     gap: 10px;
//     margin-top: 8px;
// `;>
// )}
//
// {/* Modal edytora szablonu */}
// {showTemplateEditor && (
//     <Modal
//         isOpen={showTemplateEditor}
//         onClose={() => setShowTemplateEditor(false)}
//         title={selectedTemplate ? 'Edytuj szablon SMS' : 'Nowy szablon SMS'}
//     >
//         <TemplateEditorContent>
//             <FormGroup>
//                 <FormLabel>Nazwa szablonu</FormLabel>
//                 <FormInput
//                     type="text"
//                     name="name"
//                     value={editedTemplate.name}
//                     onChange={handleEditorChange}
//                     placeholder="Nazwa szablonu, np. Przypomnienie o wizycie"
//                     required
//                 />
//             </FormGroup>
//
//             <FormGroup>
//                 <FormLabel>Kategoria</FormLabel>
//                 <FormSelect
//                     name="category"
//                     value={editedTemplate.category}
//                     onChange={handleEditorChange}
//                     required
//                 >
//                     {Object.entries(SmsTemplateCategoryLabels).map(([key, label]) => (
//                         <option key={key} value={key}>
//                             {label}
//                         </option>
//                     ))}
//                 </FormSelect>
//             </FormGroup>
//
//             <FormGroup>
//                 <FormLabel>Treść szablonu</FormLabel>
//                 <TextareaWithTools>
//                     <FormTextarea
//                         id="template-content"
//                         name="content"
//                         value={editedTemplate.content}
//                         onChange={handleEditorChange}
//                         placeholder="Wprowadź treść szablonu SMS..."
//                         rows={6}
//                         required
//                     />
//                     <VariablesToolbar>
//                         <ToolbarSection>
//                             <ToolbarLabel>Klient:</ToolbarLabel>
//                             <ToolbarButtons>
//                                 <VariableButton
//                                     onClick={() => handleInsertVariable('klient.imie')}
//                                     title="Imię klienta"
//                                 >
//                                     Imię
//                                 </VariableButton>
//                                 <VariableButton
//                                     onClick={() => handleInsertVariable('klient.nazwisko')}
//                                     title="Nazwisko klienta"
//                                 >
//                                     Nazwisko
//                                 </VariableButton>
//                                 <VariableButton
//                                     onClick={() => handleInsertVariable('klient.firma')}
//                                     title="Nazwa firmy klienta"
//                                 >
//                                     Firma
//                                 </VariableButton>
//                             </ToolbarButtons>
//                         </ToolbarSection>
//
//                         <ToolbarSection>
//                             <ToolbarLabel>Pojazd:</ToolbarLabel>
//                             <ToolbarButtons>
//                                 <VariableButton
//                                     onClick={() => handleInsertVariable('pojazd.marka')}
//                                     title="Marka pojazdu"
//                                 >
//                                     Marka
//                                 </VariableButton>
//                                 <VariableButton
//                                     onClick={() => handleInsertVariable('pojazd.model')}
//                                     title="Model pojazdu"
//                                 >
//                                     Model
//                                 </VariableButton>
//                                 <VariableButton
//                                     onClick={() => handleInsertVariable('pojazd.rejestracja')}
//                                     title="Numer rejestracyjny"
//                                 >
//                                     Rejestracja
//                                 </VariableButton>
//                             </ToolbarButtons>
//                         </ToolbarSection>
//
//                         <ToolbarSection>
//                             <ToolbarLabel>Wizyta:</ToolbarLabel>
//                             <ToolbarButtons>
//                                 <VariableButton
//                                     onClick={() => handleInsertVariable('wizyta.data')}
//                                     title="Data wizyty"
//                                 >
//                                     Data
//                                 </VariableButton>
//                                 <VariableButton
//                                     onClick={() => handleInsertVariable('wizyta.godzina')}
//                                     title="Godzina wizyty"
//                                 >
//                                     Godzina
//                                 </VariableButton>
//                                 <VariableButton
//                                     onClick={() => handleInsertVariable('wizyta.status')}
//                                     title="Status wizyty"
//                                 >
//                                     Status
//                                 </VariableButton>
//                             </ToolbarButtons>
//                         </ToolbarSection>
//
//                         <ToolbarSection>
//                             <ToolbarLabel>Inne:</ToolbarLabel>
//                             <ToolbarButtons>
//                                 <VariableButton
//                                     onClick={() => handleInsertVariable('firma.nazwa')}
//                                     title="Nazwa firmy"
//                                 >
//                                     Nazwa firmy
//                                 </VariableButton>
//                                 <VariableButton
//                                     onClick={() => handleInsertVariable('firma.telefon')}
//                                     title="Telefon do firmy"
//                                 >
//                                     Telefon firmy
//                                 </VariableButton>
//                             </ToolbarButtons>
//                         </ToolbarSection>
//                     </VariablesToolbar>
//                 </TextareaWithTools>
//
//                 <CharacterCounter>
//                     <div>
//                         {countCharacters(editedTemplate.content)} znaków
//                     </div>
//                     <div>
//                         {getSmsCount(editedTemplate.content)} {
//                         getSmsCount(editedTemplate.content) === 1
//                             ? 'wiadomość SMS'
//                             : getSmsCount(editedTemplate.content) < 5
//                                 ? 'wiadomości SMS'
//                                 : 'wiadomości SMS'
//                     }
//                     </div>
//                 </CharacterCounter>
//             </FormGroup>
//
//             <FormGroup>
//                 <FormCheckboxWrapper>
//                     <FormCheckbox
//                         type="checkbox"
//                         id="is-active"
//                         checked={editedTemplate.isActive}
//                         onChange={handleToggleActive}
//                     />
//                     <FormCheckboxLabel htmlFor="is-active">
//                         Szablon aktywny
//                     </FormCheckboxLabel>
//                 </FormCheckboxWrapper>
//             </FormGroup>
//
//             <EditorPreview>
//                 <PreviewLabel>Podgląd z przykładowymi danymi:</PreviewLabel>
//                 <PreviewContent>
//                     {editedTemplate.content.replace(/{{([^}]+)}}/g, (match, variable) => {
//                         // Zamiana zmiennych na przykładowe wartości
//                         const key = variable.trim();
//                         const variableObj = Object.values(TEMPLATE_VARIABLES).find(
//                             v => v.key === `{{${key}}}`
//                         );
//                         return variableObj ? variableObj.example : match;
//                     })}
//                 </PreviewContent>
//             </EditorPreview>
//
//             <FormActions>
//                 <SecondaryButton onClick={() => setShowTemplateEditor(false)}>
//                     Anuluj
//                 </SecondaryButton>
//                 <PrimaryButton onClick={handleSaveTemplate}>
//                     {selectedTemplate ? 'Zapisz zmiany' : 'Utwórz szablon'}
//                 </PrimaryButton>
//             </FormActions>
//         </TemplateEditorContent>
//     </Modal