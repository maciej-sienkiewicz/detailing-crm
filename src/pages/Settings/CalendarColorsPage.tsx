// src/pages/Settings/CalendarColorsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaTimes,
    FaSave,
    FaSearch,
    FaPalette,
    FaEye,
    FaChevronDown,
    FaChevronUp,
    FaFilter
} from 'react-icons/fa';
import { calendarColorsApi } from '../../api/calendarColorsApi';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import Modal from '../../components/common/Modal';
import { CalendarColor } from "../../types/calendar";
import { settingsTheme } from './styles/theme';

const CalendarColorsPage: React.FC = () => {
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

    // Obsługa rozpoczęcia edycji
    const handleEdit = (color: CalendarColor) => {
        setEditingColor(color);
        setFormName(color.name);
        setFormColor(color.color);
        setFormErrors({});
        setShowModal(true);
    };

    // Obsługa rozpoczęcia dodawania
    const handleAdd = () => {
        resetForm();
        setShowModal(true);
    };

    // Obsługa zamknięcia modala
    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
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
            {/* Header */}
            <HeaderContainer>
                <HeaderContent>
                    <HeaderLeft>
                        <HeaderIcon>
                            <FaPalette />
                        </HeaderIcon>
                        <HeaderText>
                            <HeaderTitle>Kolory kalendarza</HeaderTitle>
                            <HeaderSubtitle>
                                Zarządzanie kolorami dla pracowników i usług
                            </HeaderSubtitle>
                        </HeaderText>
                    </HeaderLeft>

                    <HeaderActions>
                        <PrimaryButton onClick={handleAdd}>
                            <FaPlus />
                            <span>Dodaj kolor</span>
                        </PrimaryButton>
                    </HeaderActions>
                </HeaderContent>
            </HeaderContainer>

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

            {/* Modal edycji/dodawania */}
            <Modal
                isOpen={showModal}
                onClose={handleCloseModal}
                title={editingColor ? 'Edytuj kolor' : 'Dodaj nowy kolor'}
            >
                <FormContainer>
                    <FormGroup>
                        <Label htmlFor="color-name">Nazwa*</Label>
                        <Input
                            id="color-name"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="Nazwa (np. nazwisko pracownika lub nazwa usługi)"
                        />
                        {formErrors.name && <ErrorText>{formErrors.name}</ErrorText>}
                        <HelpText>
                            Nazwa musi być unikalna. Będzie używana do identyfikacji koloru w systemie.
                        </HelpText>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="color-value">Kolor*</Label>
                        <ColorPickerContainer>
                            <ColorPreview color={formColor} />
                            <ColorInput
                                id="color-value"
                                type="color"
                                value={formColor}
                                onChange={(e) => setFormColor(e.target.value)}
                            />
                            <Input
                                value={formColor}
                                onChange={(e) => setFormColor(e.target.value)}
                                placeholder="#RRGGBB"
                                style={{ flex: 1 }}
                            />
                        </ColorPickerContainer>
                        {formErrors.color && <ErrorText>{formErrors.color}</ErrorText>}
                    </FormGroup>

                    <FormActions>
                        <SecondaryButton onClick={handleCloseModal}>
                            Anuluj
                        </SecondaryButton>
                        <PrimaryButton onClick={handleSave}>
                            <FaSave /> {editingColor ? 'Zapisz zmiany' : 'Dodaj kolor'}
                        </PrimaryButton>
                    </FormActions>
                </FormContainer>
            </Modal>

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
};

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${settingsTheme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

const HeaderContainer = styled.header`
    background: ${settingsTheme.surface};
    border-bottom: 1px solid ${settingsTheme.border};
    box-shadow: ${settingsTheme.shadow.sm};
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);
`;

const HeaderContent = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${settingsTheme.spacing.lg} ${settingsTheme.spacing.xl};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${settingsTheme.spacing.lg};

    @media (max-width: 1024px) {
        padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
        flex-direction: column;
        align-items: stretch;
        gap: ${settingsTheme.spacing.md};
    }

    @media (max-width: 768px) {
        padding: ${settingsTheme.spacing.md};
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
    min-width: 0;
    flex: 1;
`;

const HeaderIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${settingsTheme.primary} 0%, ${settingsTheme.primaryLight} 100%);
    border-radius: ${settingsTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${settingsTheme.shadow.md};
    flex-shrink: 0;
`;

const HeaderText = styled.div`
    min-width: 0;
    flex: 1;
`;

const HeaderTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${settingsTheme.text.primary};
    margin: 0 0 ${settingsTheme.spacing.xs} 0;
    letter-spacing: -0.025em;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const HeaderSubtitle = styled.p`
    color: ${settingsTheme.text.secondary};
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.4;

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.sm};
    align-items: center;
    flex-wrap: wrap;

    @media (max-width: 1024px) {
        justify-content: flex-end;
        width: 100%;
    }

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${settingsTheme.spacing.xs};

        > * {
            width: 100%;
        }
    }
`;

const PrimaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, ${settingsTheme.primary} 0%, ${settingsTheme.primaryLight} 100%);
    color: white;
    box-shadow: ${settingsTheme.shadow.sm};

    &:hover {
        background: linear-gradient(135deg, ${settingsTheme.primaryDark} 0%, ${settingsTheme.primary} 100%);
        box-shadow: ${settingsTheme.shadow.md};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;
    position: relative;
    overflow: hidden;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.secondary};
    border-color: ${settingsTheme.border};
    box-shadow: ${settingsTheme.shadow.xs};

    &:hover {
        background: ${settingsTheme.surfaceHover};
        color: ${settingsTheme.text.primary};
        border-color: ${settingsTheme.borderHover};
        box-shadow: ${settingsTheme.shadow.sm};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    @media (max-width: 768px) {
        justify-content: center;
    }
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
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 ${settingsTheme.spacing.xl};
    width: 100%;

    @media (max-width: 1024px) {
        padding: 0 ${settingsTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: 0 ${settingsTheme.spacing.md};
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
    box-shadow: ${settingsTheme.shadow.xs};
    margin-bottom: ${settingsTheme.spacing.lg};
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

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.lg};
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.xs};
`;

const Label = styled.label`
    font-weight: 600;
    font-size: 14px;
    color: ${settingsTheme.text.primary};
`;

const Input = styled.input`
    height: 44px;
    padding: 0 ${settingsTheme.spacing.md};
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    font-size: 14px;
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

const ColorPickerContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
`;

const ColorPreview = styled.div<{ color: string }>`
    width: 44px;
    height: 44px;
    border-radius: ${settingsTheme.radius.sm};
    background-color: ${props => props.color};
    border: 2px solid ${settingsTheme.border};
    flex-shrink: 0;
`;

const ColorInput = styled.input`
    width: 44px;
    height: 44px;
    border: none;
    padding: 0;
    background: none;
    cursor: pointer;
    border-radius: ${settingsTheme.radius.sm};

    &::-webkit-color-swatch-wrapper {
        padding: 0;
    }

    &::-webkit-color-swatch {
        border: 2px solid ${settingsTheme.border};
        border-radius: ${settingsTheme.radius.sm};
    }
`;

const HelpText = styled.div`
    font-size: 12px;
    color: ${settingsTheme.text.muted};
    line-height: 1.4;
`;

const ErrorText = styled.div`
    color: ${settingsTheme.status.error};
    font-size: 12px;
    font-weight: 500;
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${settingsTheme.spacing.sm};
    margin-top: ${settingsTheme.spacing.md};
    padding-top: ${settingsTheme.spacing.lg};
    border-top: 1px solid ${settingsTheme.border};

    @media (max-width: 576px) {
        flex-direction: column;
    }
`;

export default CalendarColorsPage;