import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaSearch } from 'react-icons/fa';
import { calendarColorsApi } from '../../api/calendarColorsApi';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import Modal from '../../components/common/Modal';
import {CalendarColor} from "../../types/calendar";

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
    const [formColor, setFormColor] = useState('#1E293B');
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
            setError('Nie udało się pobrać kolorów kalendarza. Spróbuj ponownie później.');
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
        setFormColor('#1E293B');
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
                // Aktualizacja istniejącego koloru
                savedColor = await calendarColorsApi.updateCalendarColor(editingColor.id, colorData);
                if (savedColor) {
                    setColors(colors.map(c => c.id === savedColor!.id ? savedColor! : c));
                    setSuccessMessage('Kolor został zaktualizowany');
                }
            } else {
                // Dodanie nowego koloru
                savedColor = await calendarColorsApi.createCalendarColor(colorData);
                if (savedColor) {
                    setColors([...colors, savedColor]);
                    setSuccessMessage('Nowy kolor został dodany');
                }
            }

            setShowModal(false);
            resetForm();

            // Ukryj komunikat sukcesu po 3 sekundach
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

                // Ukryj komunikat sukcesu po 3 sekundach
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

    return (
        <PageContainer>
            <PageHeader>
                <PageTitle>Kolory kalendarza</PageTitle>
                <HeaderControls>
                    <SearchContainer>
                        <SearchIconWrapper>
                            <FaSearch />
                        </SearchIconWrapper>
                        <SearchInput
                            type="text"
                            placeholder="Szukaj..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </SearchContainer>
                    <AddButton onClick={handleAdd}>
                        <FaPlus /> Dodaj kolor
                    </AddButton>
                </HeaderControls>
            </PageHeader>

            {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
            {error && <ErrorMessage>{error}</ErrorMessage>}

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader width="60px">Kolor</TableHeader>
                            <TableHeader>Nazwa</TableHeader>
                            <TableHeader width="120px">Kod HEX</TableHeader>
                            <TableHeader width="120px">Akcje</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <LoadingContainer>
                                        <LoadingText>Ładowanie danych...</LoadingText>
                                    </LoadingContainer>
                                </TableCell>
                            </TableRow>
                        ) : filteredColors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <EmptyContainer>
                                        {searchQuery ?
                                            'Nie znaleziono kolorów spełniających kryteria wyszukiwania.' :
                                            'Brak zdefiniowanych kolorów. Kliknij "Dodaj kolor", aby utworzyć pierwszy.'
                                        }
                                    </EmptyContainer>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredColors.map(color => (
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
                                            >
                                                <FaEdit />
                                            </ActionButton>
                                            <ActionButton
                                                danger
                                                onClick={() => handleDeleteConfirm(color.id)}
                                                title="Usuń kolor"
                                            >
                                                <FaTrash />
                                            </ActionButton>
                                        </ActionButtons>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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
                        <Button secondary onClick={handleCloseModal}>
                            Anuluj
                        </Button>
                        <Button primary onClick={handleSave}>
                            <FaSave /> {editingColor ? 'Zapisz zmiany' : 'Dodaj kolor'}
                        </Button>
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

// Style komponentu
const PageContainer = styled.div`
    padding: 24px;
    background-color: #FAFAFA;
    min-height: 100%;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
`;

const PageTitle = styled.h1`
    font-size: 24px;
    font-weight: 600;
    color: #1E293B;
    margin: 0;
`;

const HeaderControls = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const SearchContainer = styled.div`
    position: relative;
    width: 300px;
`;

const SearchIconWrapper = styled.div`
    position: absolute;
    top: 50%;
    left: 12px;
    transform: translateY(-50%);
    color: #64748B;
    font-size: 14px;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 10px 12px 10px 36px;
    border: 1px solid #E2E8F0;
    border-radius: 4px;
    font-size: 14px;
    color: #1E293B;
    background-color: white;
    transition: border-color 0.2s;

    &:focus {
        outline: none;
        border-color: #3B82F6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    &::placeholder {
        color: #94A3B8;
    }
`;

const AddButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #0F172A;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 16px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #1E293B;
    }
`;

const SuccessMessage = styled.div`
    background-color: #F0FDF4;
    color: #166534;
    border-left: 4px solid #22C55E;
    border-radius: 4px;
    padding: 14px 16px;
    margin-bottom: 24px;
    font-size: 14px;
`;

const ErrorMessage = styled.div`
    background-color: #FEF2F2;
    color: #991B1B;
    border-left: 4px solid #EF4444;
    border-radius: 4px;
    padding: 14px 16px;
    margin-bottom: 24px;
    font-size: 14px;
`;

const TableContainer = styled.div`
    background-color: white;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHead = styled.thead`
    background-color: #F8FAFC;
    border-bottom: 1px solid #E2E8F0;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
    &:not(:last-child) {
        border-bottom: 1px solid #E2E8F0;
    }

    &:hover {
        background-color: #F8FAFC;
    }
`;

const TableHeader = styled.th<{ width?: string }>`
    text-align: left;
    padding: 14px 16px;
    font-weight: 600;
    font-size: 14px;
    color: #64748B;
    width: ${props => props.width || 'auto'};
`;

const TableCell = styled.td`
    padding: 14px 16px;
    font-size: 14px;
    color: #1E293B;
    vertical-align: middle;
`;

const ColorSwatch = styled.div<{ color: string }>`
    width: 28px;
    height: 28px;
    border-radius: 4px;
    background-color: ${props => props.color};
    border: 1px solid #E2E8F0;
`;

const ColorName = styled.div`
    font-weight: 500;
`;

const ColorCode = styled.div`
    font-family: monospace;
    color: #64748B;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 12px;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
    background: none;
    border: none;
    color: ${props => props.danger ? '#DC2626' : '#3B82F6'};
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    transition: background-color 0.2s;
    border-radius: 4px;

    &:hover {
        background-color: ${props => props.danger ? '#FEF2F2' : '#F0F7FF'};
    }
`;

const LoadingContainer = styled.div`
    padding: 32px 0;
    text-align: center;
`;

const LoadingText = styled.div`
    color: #64748B;
    font-size: 14px;
`;

const EmptyContainer = styled.div`
    padding: 48px 0;
    text-align: center;
    color: #64748B;
    font-size: 14px;
`;

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Label = styled.label`
    font-weight: 500;
    font-size: 14px;
    color: #1E293B;
`;

const Input = styled.input`
    padding: 10px 12px;
    border: 1px solid #E2E8F0;
    border-radius: 4px;
    font-size: 14px;
    color: #1E293B;
    transition: border-color 0.2s;

    &:focus {
        outline: none;
        border-color: #3B82F6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }
`;

const ColorPickerContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const ColorPreview = styled.div<{ color: string }>`
    width: 30px;
    height: 30px;
    border-radius: 4px;
    background-color: ${props => props.color};
    border: 1px solid #E2E8F0;
`;

const ColorInput = styled.input`
    width: 40px;
    height: 40px;
    border: none;
    padding: 0;
    background: none;
    cursor: pointer;

    &::-webkit-color-swatch-wrapper {
        padding: 0;
    }

    &::-webkit-color-swatch {
        border: 1px solid #E2E8F0;
        border-radius: 4px;
    }
`;

const HelpText = styled.div`
    font-size: 12px;
    color: #64748B;
`;

const ErrorText = styled.div`
    color: #DC2626;
    font-size: 12px;
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
`;

const Button = styled.button<{ primary?: boolean; secondary?: boolean }>`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border-radius: 4px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;

    ${props => props.primary && `
        background-color: #0F172A;
        color: white;
        border: 1px solid #0F172A;

        &:hover {
            background-color: #1E293B;
            border-color: #1E293B;
        }
    `}

    ${props => props.secondary && `
        background-color: white;
        color: #1E293B;
        border: 1px solid #E2E8F0;

        &:hover {
            background-color: #F1F5F9;
        }
    `}
`;

export default CalendarColorsPage;