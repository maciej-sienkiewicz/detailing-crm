import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FormSection,
    SectionTitle,
    FormRow,
    FormGroup,
    Label,
    Input,
    ErrorText,
    Select
} from '../styles';
import { calendarColorsApi } from '../../../../api/calendarColorsApi';
import { CalendarColor } from '../../../../types/calendar';

// Styled components dla podglądu kolorów
const ColorPreviewSelect = styled(Select)`
    // Dodajemy niestandardowy wygląd dla pola select
    padding-left: 30px; // Miejsce na kolorowy kwadracik
`;

const ColorPreviewContainer = styled.div`
    position: relative;
    width: 100%;
`;

const ColorSquare = styled.div<{ color: string }>`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 10px;
    width: 16px;
    height: 16px;
    background-color: ${props => props.color || '#ccc'};
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 3px;
`;

// Niestandardowa stylizacja dla opcji w select
// Ponieważ nie możemy bezpośrednio stylizować opcji w select poprzez styled-components
// (są one kontrolowane przez przeglądarkę), użyjemy niestandardowego renderowania
const StyledSelect = styled.select`
    padding: 8px 12px 8px 30px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;
    appearance: auto; // Zachowujemy domyślny wygląd rozwijanej listy

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

interface VisitTitleSectionProps {
    title: string;
    selectedColorId?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    error?: string;
}

const VisitTitleSection: React.FC<VisitTitleSectionProps> = ({
                                                                 title,
                                                                 selectedColorId,
                                                                 onChange,
                                                                 error
                                                             }) => {
    const [calendarColors, setCalendarColors] = useState<CalendarColor[]>([]);
    const [colorsLoading, setColorsLoading] = useState(false);
    const [colorsError, setColorsError] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);

    // Pobieranie dostępnych kolorów kalendarza
    useEffect(() => {
        const fetchColors = async () => {
            try {
                setColorsLoading(true);
                setColorsError(null);
                const colors = await calendarColorsApi.fetchCalendarColors();
                setCalendarColors(colors);
            } catch (err) {
                console.error('Błąd podczas pobierania kolorów kalendarza:', err);
                setColorsError('Nie udało się pobrać dostępnych kolorów kalendarza');
            } finally {
                setColorsLoading(false);
            }
        };

        fetchColors();
    }, []);

    // Ustawianie aktualnie wybranego koloru
    useEffect(() => {
        if (selectedColorId && calendarColors.length > 0) {
            const color = calendarColors.find(c => c.id === selectedColorId);
            if (color) {
                setSelectedColor(color.color);
            }
        } else {
            setSelectedColor(undefined);
        }
    }, [selectedColorId, calendarColors]);

    // Obsługa zmiany wybranego koloru
    const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // Wywołujemy oryginalną funkcję onChange
        onChange(e);

        // Aktualizujemy lokalny stan
        const colorId = e.target.value;
        if (colorId) {
            const color = calendarColors.find(c => c.id === colorId);
            if (color) {
                setSelectedColor(color.color);
            }
        } else {
            setSelectedColor(undefined);
        }
    };

    return (
        <FormSection>
            <SectionTitle>Informacje o wizycie</SectionTitle>
            <FormRow>
                <FormGroup>
                    <Label htmlFor="title">Tytuł wizyty</Label>
                    <Input
                        id="title"
                        name="title"
                        value={title || ''}
                        onChange={onChange}
                        placeholder="np. Naprawa zawieszenia - Jan Kowalski (jeśli puste, zostanie wygenerowane automatycznie)"
                    />
                    {error && <ErrorText>{error}</ErrorText>}
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="calendarColorId">Kolor w kalendarzu</Label>
                    <ColorPreviewContainer>
                        {selectedColor && <ColorSquare color={selectedColor} />}
                        <StyledSelect
                            id="calendarColorId"
                            name="calendarColorId"
                            value={selectedColorId || ''}
                            onChange={handleColorChange}
                            disabled={colorsLoading}
                        >
                            <option value="">Wybierz kolor...</option>
                            {calendarColors.map(color => (
                                <option
                                    key={color.id}
                                    value={color.id}
                                    // Tutaj nie możemy bezpośrednio stylizować opcji,
                                    // ale będziemy używać atrybutu data-* do identyfikacji w JavaScript
                                    data-color={color.color}
                                >
                                    {color.name}
                                </option>
                            ))}
                        </StyledSelect>
                    </ColorPreviewContainer>
                    {colorsError && <ErrorText>{colorsError}</ErrorText>}
                </FormGroup>
            </FormRow>
        </FormSection>
    );
};

export default VisitTitleSection;