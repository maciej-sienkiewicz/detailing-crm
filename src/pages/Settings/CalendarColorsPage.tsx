// src/pages/Settings/CalendarColorsPage.tsx
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from 'react';
import styled from 'styled-components';
import {FaEdit, FaPalette, FaSave, FaSearch, FaTimes, FaTrash} from 'react-icons/fa';
import {calendarColorsApi} from '../../api/calendarColorsApi';
import {CalendarColor} from "../../types/calendar";
import {settingsTheme} from './styles/theme';
import {ConfirmationDialog} from "../../components/common/NewConfirmationDialog";

// Poprawna składnia forwardRef z TypeScript
const CalendarColorsPage = forwardRef<{ handleAddColor: () => void }, {}>((props, ref) => {
    const [colors, setColors] = useState<CalendarColor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Stan dla modalu edycji/dodawania
    const [showModal, setShowModal] = useState(false);
    const [editingColor, setEditingColor] = useState<CalendarColor | null>(null);

    // Stan dla filtrowania
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredColors, setFilteredColors] = useState<CalendarColor[]>([]);

    // Stan dla formularza
    const [formName, setFormName] = useState('');
    const [formColor, setFormColor] = useState('#1a365d');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Stan dla potwierdzenia usunięcia
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [colorToDelete, setColorToDelete] = useState<string | null>(null);

    // Expose handleAddColor method to parent component
    useImperativeHandle(ref, () => ({
        handleAddColor: handleAdd
    }));

    // Pobieranie kolorów z API
    const fetchColors = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await calendarColorsApi.fetchCalendarColors();
            setColors(data);
            setFilteredColors(data);
        } catch (err) {
            setError('Nie udało się pobrać kolorów kalendarza. Sprawdź połączenie z serwerem.');
            console.error('Error fetching calendar colors:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchColors();
    }, [fetchColors]);

    // Filtrowanie kolorów na podstawie wyszukiwania
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredColors(colors);
            return;
        }

        const query = searchQuery.toLowerCase().trim();
        const filtered = colors.filter(color =>
            color.name.toLowerCase().includes(query)
        );
        setFilteredColors(filtered);
    }, [searchQuery, colors]);

    // Resetowanie formularza
    const resetForm = () => {
        setFormName('');
        setFormColor('#1a365d');
        setFormErrors({});
        setEditingColor(null);
    };

    // Obsługa dodawania nowego koloru
    const handleAdd = () => {
        resetForm();
        setShowModal(true);
    };

    // Obsługa rozpoczęcia edycji
    const handleEdit = (color: CalendarColor) => {
        setEditingColor(color);
        setFormName(color.name);
        setFormColor(color.color);
        setFormErrors({});
        setShowModal(true);
    };

    // Obsługa zamknięcia modala
    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    // Obsługa zmiany koloru
    const handleCustomColorChange = (color: string) => {
        setFormColor(color);
        // Wyczyść błąd koloru jeśli istnieje
        if (formErrors.color) {
            setFormErrors(prev => ({ ...prev, color: '' }));
        }
    };

    // Walidacja formularza
    const validateForm = async (): Promise<boolean> => {
        const errors: Record<string, string> = {};

        if (!formName.trim()) {
            errors.name = 'Nazwa jest wymagana';
        }

        // Sprawdzenie, czy nazwa jest już zajęta
        if (formName.trim() && (!editingColor || formName !== editingColor.name)) {
            const isTaken = await calendarColorsApi.isColorNameTaken(
                formName,
                editingColor ? editingColor.id : undefined
            );

            if (isTaken) {
                errors.name = 'Ta nazwa jest już używana';
            }
        }

        // Walidacja koloru HEX
        if (!formColor.trim()) {
            errors.color = 'Kolor jest wymagany';
        } else if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(formColor)) {
            errors.color = 'Nieprawidłowy format koloru HEX';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Obsługa zapisu
    const handleSave = async () => {
        const isValid = await validateForm();

        if (!isValid) return;

        try {
            const colorData = {
                name: formName,
                color: formColor
            };

            let savedColor: CalendarColor | null;

            if (editingColor) {
                savedColor = await calendarColorsApi.updateCalendarColor(editingColor.id, colorData);
                if (savedColor) {
                    setColors(colors.map(c => c.id === savedColor!.id ? savedColor! : c));
                    setSuccessMessage('Kolor został zaktualizowany');
                }
            } else {
                savedColor = await calendarColorsApi.createCalendarColor(colorData);
                if (savedColor) {
                    setColors([...colors, savedColor]);
                    setSuccessMessage('Nowy kolor został dodany');
                }
            }

            setShowModal(false);
            resetForm();

            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            setError('Nie udało się zapisać koloru. Spróbuj ponownie później.');
            console.error('Error saving calendar color:', err);
        }
    };

    // Obsługa potwierdzenia usunięcia
    const handleDeleteConfirm = (id: string) => {
        setColorToDelete(id);
        setShowDeleteConfirmation(true);
    };

    // Obsługa faktycznego usunięcia
    const handleDelete = async () => {
        if (!colorToDelete) return;

        try {
            const result = await calendarColorsApi.deleteCalendarColor(colorToDelete);

            if (result) {
                setColors(colors.filter(color => color.id !== colorToDelete));
                setSuccessMessage('Kolor został usunięty');

                setTimeout(() => {
                    setSuccessMessage(null);
                }, 3000);
            }
        } catch (err) {
            setError('Nie udało się usunąć koloru. Spróbuj ponownie później.');
            console.error('Error deleting calendar color:', err);
        } finally {
            setColorToDelete(null);
            setShowDeleteConfirmation(false);
        }
    };

    const refreshData = async () => {
        await fetchColors();
    };

    return (
        <PageContainer>
            {/* Filters */}
            <FiltersContainer>
                <QuickSearchSection>
                    <SearchWrapper>
                        <SearchIcon>
                            <FaSearch />
                        </SearchIcon>
                        <SearchInput
                            type="text"
                            placeholder="Szybkie wyszukiwanie - nazwa koloru..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <ClearSearchButton onClick={() => setSearchQuery('')}>
                                <FaTimes />
                            </ClearSearchButton>
                        )}
                    </SearchWrapper>
                </QuickSearchSection>

                <ResultsCounter>
                    Znaleziono: <strong>{filteredColors.length}</strong> {filteredColors.length === 1 ? 'kolor' : 'kolorów'}
                </ResultsCounter>
            </FiltersContainer>

            {/* Messages */}
            {successMessage && (
                <MessageContainer>
                    <SuccessMessage>
                        <MessageIcon>✓</MessageIcon>
                        {successMessage}
                    </SuccessMessage>
                </MessageContainer>
            )}

            {error && (
                <MessageContainer>
                    <ErrorMessage>
                        <MessageIcon>⚠️</MessageIcon>
                        {error}
                    </ErrorMessage>
                </MessageContainer>
            )}

            {/* Content */}
            <ContentContainer>
                {loading ? (
                    <LoadingContainer>
                        <LoadingSpinner />
                        <LoadingText>Ładowanie kolorów...</LoadingText>
                    </LoadingContainer>
                ) : (
                    <>
                        {filteredColors.length === 0 ? (
                            <EmptyStateContainer>
                                <EmptyStateIcon>
                                    <FaPalette />
                                </EmptyStateIcon>
                                <EmptyStateTitle>
                                    {searchQuery ? 'Brak wyników' : 'Brak kolorów'}
                                </EmptyStateTitle>
                                <EmptyStateDescription>
                                    {searchQuery ?
                                        'Nie znaleziono kolorów spełniających kryteria wyszukiwania.' :
                                        'Nie masz jeszcze żadnych kolorów w systemie'
                                    }
                                </EmptyStateDescription>
                                {!searchQuery && (
                                    <EmptyStateAction>
                                        Kliknij przycisk "Dodaj kolor", aby utworzyć pierwszy kolor
                                    </EmptyStateAction>
                                )}
                            </EmptyStateContainer>
                        ) : (
                            <TableContainer>
                                <TableHeader>
                                    <TableTitle>
                                        Kolory kalendarza ({filteredColors.length})
                                    </TableTitle>
                                </TableHeader>

                                <TableWrapper>
                                    <Table>
                                        <TableHead>
                                            <TableRowHeader>
                                                <TableHeaderCell width="80px">Podgląd</TableHeaderCell>
                                                <TableHeaderCell>Nazwa</TableHeaderCell>
                                                <TableHeaderCell width="120px">Kod HEX</TableHeaderCell>
                                                <TableHeaderCell width="120px">Akcje</TableHeaderCell>
                                            </TableRowHeader>
                                        </TableHead>
                                        <TableBody>
                                            {filteredColors.map(color => (
                                                <TableRow key={color.id}>
                                                    <TableCell>
                                                        <ColorSwatch color={color.color} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <ColorName>{color.name}</ColorName>
                                                    </TableCell>
                                                    <TableCell>
                                                        <ColorCode>{color.color.toUpperCase()}</ColorCode>
                                                    </TableCell>
                                                    <TableCell>
                                                        <ActionButtons>
                                                            <ActionButton
                                                                onClick={() => handleEdit(color)}
                                                                title="Edytuj kolor"
                                                                $variant="edit"
                                                            >
                                                                <FaEdit />
                                                            </ActionButton>
                                                            <ActionButton
                                                                onClick={() => handleDeleteConfirm(color.id)}
                                                                title="Usuń kolor"
                                                                $variant="delete"
                                                            >
                                                                <FaTrash />
                                                            </ActionButton>
                                                        </ActionButtons>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableWrapper>
                            </TableContainer>
                        )}
                    </>
                )}
            </ContentContainer>

            {/* Modern Modal edycji/dodawania */}
            {showModal && (
                <ModernModalOverlay>
                    <ModernModalContainer>
                        <ModernModalHeader>
                            <ModernModalTitle>
                                <ModalIcon>
                                    <FaPalette />
                                </ModalIcon>
                                <ModalTitleText>
                                    <MainTitle>{editingColor ? 'Edytuj kolor' : 'Dodaj nowy kolor'}</MainTitle>
                                    <SubTitle>Kolor będzie dostępny w kalendarzu dla pracowników i usług</SubTitle>
                                </ModalTitleText>
                            </ModernModalTitle>
                            <ModernCloseButton onClick={handleCloseModal}>
                                <FaTimes />
                            </ModernCloseButton>
                        </ModernModalHeader>

                        <ModernModalBody>
                            <ModernForm>
                                <ModernFormGroup>
                                    <ModernLabel htmlFor="color-name">
                                        Nazwa koloru
                                        <RequiredMark>*</RequiredMark>
                                    </ModernLabel>
                                    <ModernInput
                                        id="color-name"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        placeholder="np. Mechanik Jan, Diagnostyka, Lakiernia..."
                                        $hasError={!!formErrors.name}
                                    />
                                    {formErrors.name && (
                                        <ModernErrorText>
                                            <ErrorIcon>⚠</ErrorIcon>
                                            {formErrors.name}
                                        </ModernErrorText>
                                    )}
                                    <ModernHelpText>
                                        Nazwa musi być unikalna. Będzie używana do identyfikacji koloru w systemie.
                                    </ModernHelpText>
                                </ModernFormGroup>

                                <ModernFormGroup>
                                    <ModernLabel htmlFor="color-value">
                                        Wybierz kolor
                                        <RequiredMark>*</RequiredMark>
                                    </ModernLabel>

                                    <ColorPickerSection>
                                        <ColorPreviewLarge color={formColor} />
                                        <ColorInputsContainer>
                                            <ColorPickerInput
                                                id="color-value"
                                                type="color"
                                                value={formColor}
                                                onChange={(e) => handleCustomColorChange(e.target.value)}
                                            />
                                            <HexInput
                                                value={formColor}
                                                onChange={(e) => handleCustomColorChange(e.target.value)}
                                                placeholder="#RRGGBB"
                                                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                                $hasError={!!formErrors.color}
                                            />
                                        </ColorInputsContainer>
                                    </ColorPickerSection>

                                    {formErrors.color && (
                                        <ModernErrorText>
                                            <ErrorIcon>⚠</ErrorIcon>
                                            {formErrors.color}
                                        </ModernErrorText>
                                    )}

                                    <ModernHelpText>
                                        Kliknij kolorową próbkę aby otworzyć paletę kolorów, lub wpisz kod HEX
                                    </ModernHelpText>
                                </ModernFormGroup>

                                <PreviewSection>
                                    <PreviewTitle>Podgląd</PreviewTitle>
                                    <PreviewContainer>
                                        <PreviewItem>
                                            <PreviewLabel>W kalendarzu</PreviewLabel>
                                            <CalendarPreview>
                                                <CalendarEvent color={formColor}>
                                                    <EventTime>10:00</EventTime>
                                                    <EventTitle>{formName || 'Nazwa koloru'}</EventTitle>
                                                </CalendarEvent>
                                            </CalendarPreview>
                                        </PreviewItem>

                                        <PreviewItem>
                                            <PreviewLabel>Na liście</PreviewLabel>
                                            <ListPreview>
                                                <ListColorDot color={formColor} />
                                                <ListText>{formName || 'Nazwa koloru'}</ListText>
                                            </ListPreview>
                                        </PreviewItem>
                                    </PreviewContainer>
                                </PreviewSection>
                            </ModernForm>
                        </ModernModalBody>

                        <ModernModalFooter>
                            <ModernButtonGroup>
                                <ModernSecondaryButton onClick={handleCloseModal}>
                                    <FaTimes />
                                    Anuluj
                                </ModernSecondaryButton>
                                <ModernPrimaryButton onClick={handleSave} disabled={!formName.trim()}>
                                    <FaSave />
                                    {editingColor ? 'Zapisz zmiany' : 'Dodaj kolor'}
                                </ModernPrimaryButton>
                            </ModernButtonGroup>
                        </ModernModalFooter>
                    </ModernModalContainer>
                </ModernModalOverlay>
            )}

            {/* Dialog potwierdzenia usunięcia */}
            <ConfirmationDialog
                isOpen={showDeleteConfirmation}
                title="Usuń kolor"
                message="Czy na pewno chcesz usunąć ten kolor? Ta operacja jest nieodwracalna i może wpłynąć na wyświetlanie istniejących wizyt w kalendarzu."
                confirmText="Usuń"
                cancelText="Anuluj"
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirmation(false)}
            />
        </PageContainer>
    );
});

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${settingsTheme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

const FiltersContainer = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${settingsTheme.spacing.lg} ${settingsTheme.spacing.xl} 0;
    width: 100%;

    @media (max-width: 1024px) {
        padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg} 0;
    }

    @media (max-width: 768px) {
        padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.md} 0;
    }
`;

const QuickSearchSection = styled.div`
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
    padding: ${settingsTheme.spacing.lg};
    margin-bottom: ${settingsTheme.spacing.md};
    box-shadow: ${settingsTheme.shadow.sm};
`;

const SearchWrapper = styled.div`
    position: relative;
    max-width: 500px;
    margin: 0 auto;
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${settingsTheme.text.muted};
    font-size: 16px;
    z-index: 2;
`;

const SearchInput = styled.input`
    width: 100%;
    height: 48px;
    padding: 0 48px 0 48px;
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.lg};
    font-size: 16px;
    font-weight: 500;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${settingsTheme.primary};
        box-shadow: 0 0 0 3px ${settingsTheme.primaryGhost};
    }

    &::placeholder {
        color: ${settingsTheme.text.muted};
        font-weight: 400;
    }
`;

const ClearSearchButton = styled.button`
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    border: none;
    background: ${settingsTheme.surfaceAlt};
    color: ${settingsTheme.text.muted};
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: all 0.2s ease;

    &:hover {
        background: ${settingsTheme.status.error};
        color: white;
    }
`;

const ResultsCounter = styled.div`
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
    padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
    color: ${settingsTheme.primary};
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    box-shadow: ${settingsTheme.shadow.sm};

    strong {
        font-weight: 700;
    }
`;

const MessageContainer = styled.div`
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 400px;
    width: auto;
    padding: 0;

    @media (max-width: 768px) {
        bottom: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
    }
`;

const SuccessMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    background: ${settingsTheme.status.successLight};
    color: ${settingsTheme.status.success};
    padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
    border-radius: ${settingsTheme.radius.lg};
    border: 1px solid ${settingsTheme.status.success}30;
    font-weight: 500;
    box-shadow: ${settingsTheme.shadow.lg};
    animation: slideInFromRight 0.3s ease-out;
    min-width: 300px;

    @keyframes slideInFromRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @media (max-width: 768px) {
        min-width: auto;
        width: 100%;
    }
`;

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    background: ${settingsTheme.status.errorLight};
    color: ${settingsTheme.status.error};
    padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
    border-radius: ${settingsTheme.radius.lg};
    border: 1px solid ${settingsTheme.status.error}30;
    font-weight: 500;
    box-shadow: ${settingsTheme.shadow.xs};
    margin-bottom: ${settingsTheme.spacing.lg};
`;

const MessageIcon = styled.div`
    font-size: 18px;
    flex-shrink: 0;
`;

const ContentContainer = styled.div`
    flex: 1;
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 ${settingsTheme.spacing.xl} ${settingsTheme.spacing.xl};
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.lg};
    min-height: 0;

    @media (max-width: 1024px) {
        padding: 0 ${settingsTheme.spacing.lg} ${settingsTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: 0 ${settingsTheme.spacing.md} ${settingsTheme.spacing.md};
        gap: ${settingsTheme.spacing.md};
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${settingsTheme.spacing.xxl};
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
    gap: ${settingsTheme.spacing.md};
    min-height: 400px;
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid ${settingsTheme.borderLight};
    border-top: 3px solid ${settingsTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${settingsTheme.text.secondary};
    font-weight: 500;
`;

const EmptyStateContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${settingsTheme.spacing.xxl};
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    border: 2px dashed ${settingsTheme.border};
    text-align: center;
    min-height: 400px;
`;

const EmptyStateIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${settingsTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: ${settingsTheme.text.tertiary};
    margin-bottom: ${settingsTheme.spacing.lg};
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
`;

const EmptyStateTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    margin: 0 0 ${settingsTheme.spacing.sm} 0;
    letter-spacing: -0.025em;
`;

const EmptyStateDescription = styled.p`
    font-size: 16px;
    color: ${settingsTheme.text.secondary};
    margin: 0 0 ${settingsTheme.spacing.sm} 0;
    line-height: 1.5;
`;

const EmptyStateAction = styled.p`
    font-size: 14px;
    color: ${settingsTheme.primary};
    margin: 0;
    font-weight: 500;
`;

const TableContainer = styled.div`
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
    overflow: hidden;
    box-shadow: ${settingsTheme.shadow.sm};
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

const TableHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${settingsTheme.spacing.lg};
    border-bottom: 1px solid ${settingsTheme.border};
    background: ${settingsTheme.surfaceAlt};
    flex-shrink: 0;
`;

const TableTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;
`;

const TableWrapper = styled.div`
    flex: 1;
    overflow: auto;
    min-height: 0;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHead = styled.thead`
    background: ${settingsTheme.surfaceAlt};
    border-bottom: 2px solid ${settingsTheme.border};
    position: sticky;
    top: 0;
    z-index: 10;
`;

const TableRowHeader = styled.tr``;

const TableHeaderCell = styled.th<{ width?: string }>`
    padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.md};
    text-align: left;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    font-size: 14px;
    border-right: 1px solid ${settingsTheme.border};
    width: ${props => props.width || 'auto'};

    &:last-child {
        border-right: none;
    }
`;

const TableBody = styled.tbody`
    background: ${settingsTheme.surface};
`;

const TableRow = styled.tr`
    border-bottom: 1px solid ${settingsTheme.borderLight};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
        background: ${settingsTheme.surfaceHover};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.td`
    padding: ${settingsTheme.spacing.md};
    border-right: 1px solid ${settingsTheme.borderLight};
    vertical-align: middle;

    &:last-child {
        border-right: none;
    }
`;

const ColorSwatch = styled.div<{ color: string }>`
    width: 32px;
    height: 32px;
    border-radius: ${settingsTheme.radius.sm};
    background-color: ${props => props.color};
    border: 2px solid ${settingsTheme.border};
    box-shadow: ${settingsTheme.shadow.xs};
    margin: 0 auto;
`;

const ColorName = styled.div`
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    font-size: 14px;
`;

const ColorCode = styled.div`
    font-family: monospace;
    color: ${settingsTheme.text.secondary};
    font-size: 13px;
    font-weight: 500;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.xs};
    align-items: center;
`;

const ActionButton = styled.button<{
    $variant: 'edit' | 'delete';
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: ${settingsTheme.radius.sm};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 13px;
    position: relative;
    overflow: hidden;

    ${({ $variant }) => {
    switch ($variant) {
        case 'edit':
            return `
                    background: ${settingsTheme.status.warningLight};
                    color: ${settingsTheme.status.warning};
                    &:hover {
                        background: ${settingsTheme.status.warning};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${settingsTheme.shadow.md};
                    }
                `;
        case 'delete':
            return `
                    background: ${settingsTheme.status.errorLight};
                    color: ${settingsTheme.status.error};
                    &:hover {
                        background: ${settingsTheme.status.error};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${settingsTheme.shadow.md};
                    }
                `;
    }
}}
`;

// Modern Modal Styles
const ModernModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${settingsTheme.zIndex.modal};
    padding: ${settingsTheme.spacing.lg};
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModernModalContainer = styled.div`
    background-color: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    box-shadow: ${settingsTheme.shadow.xl};
    width: 95vw;
    max-width: 650px;
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease;

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @media (max-width: 768px) {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
    }
`;

const ModernModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: ${settingsTheme.spacing.xl};
    border-bottom: 1px solid ${settingsTheme.border};
    background: ${settingsTheme.surfaceAlt};
    flex-shrink: 0;
`;

const ModernModalTitle = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${settingsTheme.spacing.md};
    flex: 1;
`;

const ModalIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${settingsTheme.primaryGhost};
    border-radius: ${settingsTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${settingsTheme.primary};
    font-size: 20px;
    flex-shrink: 0;
    border: 1px solid ${settingsTheme.primary}20;
`;

const ModalTitleText = styled.div`
    flex: 1;
`;

const MainTitle = styled.h2`
    margin: 0 0 ${settingsTheme.spacing.xs} 0;
    font-size: 20px;
    font-weight: 700;
    color: ${settingsTheme.text.primary};
    letter-spacing: -0.025em;
`;

const SubTitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${settingsTheme.text.secondary};
    font-weight: 500;
    line-height: 1.4;
`;

const ModernCloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: ${settingsTheme.surfaceHover};
    color: ${settingsTheme.text.secondary};
    border-radius: ${settingsTheme.radius.md};
    cursor: pointer;
    transition: all ${settingsTheme.transitions.spring};
    font-size: 16px;
    margin-left: ${settingsTheme.spacing.md};

    &:hover {
        background: ${settingsTheme.status.errorLight};
        color: ${settingsTheme.status.error};
        transform: scale(1.05);
    }

    &:active {
        transform: scale(0.95);
    }
`;

const ModernModalBody = styled.div`
    overflow-y: auto;
    flex: 1;
    padding: ${settingsTheme.spacing.xl};
    
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: ${settingsTheme.surfaceAlt};
    }
    
    &::-webkit-scrollbar-thumb {
        background: ${settingsTheme.border};
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: ${settingsTheme.borderHover};
    }
`;

const ModernForm = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.xl};
`;

const ModernFormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.sm};
`;

const ModernLabel = styled.label`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};
    font-weight: 600;
    font-size: 15px;
    color: ${settingsTheme.text.primary};
`;

const RequiredMark = styled.span`
    color: ${settingsTheme.status.error};
    font-weight: 700;
`;

const ModernInput = styled.input<{ $hasError?: boolean }>`
    height: 52px;
    padding: 0 ${settingsTheme.spacing.md};
    border: 2px solid ${props => props.$hasError ? settingsTheme.status.error : settingsTheme.border};
    border-radius: ${settingsTheme.radius.lg};
    font-size: 15px;
    font-weight: 500;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.primary};
    transition: all ${settingsTheme.transitions.spring};

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? settingsTheme.status.error : settingsTheme.primary};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? settingsTheme.status.error + '20' : settingsTheme.primaryGhost};
    }

    &::placeholder {
        color: ${settingsTheme.text.muted};
        font-weight: 400;
    }
`;

const ColorPickerSection = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.lg};
    padding: ${settingsTheme.spacing.lg};
    background: ${settingsTheme.surfaceAlt};
    border-radius: ${settingsTheme.radius.lg};
    border: 1px solid ${settingsTheme.border};
`;

const ColorPreviewLarge = styled.div<{ color: string }>`
    width: 64px;
    height: 64px;
    border-radius: ${settingsTheme.radius.lg};
    background-color: ${props => props.color};
    border: 3px solid ${settingsTheme.border};
    box-shadow: ${settingsTheme.shadow.md};
    flex-shrink: 0;
    position: relative;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    }
`;

const ColorInputsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.sm};
    flex: 1;
`;

const ColorPickerInput = styled.input`
    width: 100%;
    height: 52px;
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    cursor: pointer;
    background: none;
    padding: 4px;

    &::-webkit-color-swatch-wrapper {
        padding: 0;
        border-radius: ${settingsTheme.radius.sm};
        overflow: hidden;
    }

    &::-webkit-color-swatch {
        border: none;
        border-radius: ${settingsTheme.radius.sm};
    }

    &:focus {
        outline: none;
        border-color: ${settingsTheme.primary};
        box-shadow: 0 0 0 3px ${settingsTheme.primaryGhost};
    }
`;

const HexInput = styled.input<{ $hasError?: boolean }>`
    height: 44px;
    padding: 0 ${settingsTheme.spacing.md};
    border: 2px solid ${props => props.$hasError ? settingsTheme.status.error : settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    font-size: 14px;
    font-weight: 600;
    font-family: 'Courier New', monospace;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.primary};
    transition: all ${settingsTheme.transitions.spring};
    text-transform: uppercase;

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? settingsTheme.status.error : settingsTheme.primary};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? settingsTheme.status.error + '20' : settingsTheme.primaryGhost};
    }

    &::placeholder {
        color: ${settingsTheme.text.muted};
        font-weight: 400;
        text-transform: none;
    }
`;

const PreviewSection = styled.div`
    background: ${settingsTheme.surfaceElevated};
    border-radius: ${settingsTheme.radius.lg};
    padding: ${settingsTheme.spacing.lg};
    border: 1px solid ${settingsTheme.border};
`;

const PreviewTitle = styled.h3`
    margin: 0 0 ${settingsTheme.spacing.md} 0;
    font-size: 16px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
`;

const PreviewContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${settingsTheme.spacing.lg};

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const PreviewItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.sm};
`;

const PreviewLabel = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${settingsTheme.text.tertiary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const CalendarPreview = styled.div`
    background: ${settingsTheme.surface};
    border: 1px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    padding: ${settingsTheme.spacing.sm};
    min-height: 60px;
`;

const CalendarEvent = styled.div<{ color?: string }>`
    background: ${props => props.color || 'currentColor'};
    color: white;
    padding: ${settingsTheme.spacing.sm};
    border-radius: ${settingsTheme.radius.sm};
    font-size: 12px;
    box-shadow: ${settingsTheme.shadow.sm};
`;

const EventTime = styled.div`
    font-weight: 600;
    margin-bottom: 2px;
    opacity: 0.9;
`;

const EventTitle = styled.div`
    font-weight: 500;
    line-height: 1.2;
`;

const ListPreview = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    background: ${settingsTheme.surface};
    border: 1px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    padding: ${settingsTheme.spacing.md};
`;

const ListColorDot = styled.div<{ color: string }>`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${props => props.color};
    flex-shrink: 0;
    border: 1px solid ${settingsTheme.border};
`;

const ListText = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: ${settingsTheme.text.primary};
`;

const ModernErrorText = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};
    color: ${settingsTheme.status.error};
    font-size: 13px;
    font-weight: 500;
`;

const ErrorIcon = styled.span`
    font-size: 14px;
`;

const ModernHelpText = styled.div`
    font-size: 13px;
    color: ${settingsTheme.text.muted};
    line-height: 1.4;
`;

const ModernModalFooter = styled.div`
    padding: ${settingsTheme.spacing.xl};
    border-top: 1px solid ${settingsTheme.border};
    background: ${settingsTheme.surfaceAlt};
    flex-shrink: 0;
`;

const ModernButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${settingsTheme.spacing.sm};

    @media (max-width: 480px) {
        flex-direction: column;
    }
`;

const BaseModernButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
    border-radius: ${settingsTheme.radius.lg};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${settingsTheme.transitions.spring};
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 48px;
    position: relative;
    overflow: hidden;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    @media (max-width: 480px) {
        justify-content: center;
    }
`;

const ModernPrimaryButton = styled(BaseModernButton)`
    background: linear-gradient(135deg, ${settingsTheme.primary} 0%, ${settingsTheme.primaryLight} 100%);
    color: white;
    box-shadow: ${settingsTheme.shadow.sm};

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${settingsTheme.primaryDark} 0%, ${settingsTheme.primary} 100%);
        box-shadow: ${settingsTheme.shadow.lg};
    }

    @media (max-width: 480px) {
        order: 1;
    }
`;

const ModernSecondaryButton = styled(BaseModernButton)`
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.secondary};
    border-color: ${settingsTheme.border};
    box-shadow: ${settingsTheme.shadow.xs};

    &:hover:not(:disabled) {
        background: ${settingsTheme.surfaceHover};
        color: ${settingsTheme.text.primary};
        border-color: ${settingsTheme.borderHover};
        box-shadow: ${settingsTheme.shadow.sm};
    }

    @media (max-width: 480px) {
        order: 2;
    }
`;

export default CalendarColorsPage;