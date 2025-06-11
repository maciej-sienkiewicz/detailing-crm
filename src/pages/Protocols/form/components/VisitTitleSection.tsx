import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { calendarColorsApi } from '../../../../api/calendarColorsApi';
import { CalendarColor } from '../../../../types/calendar';
import {
    FormSection,
    SectionTitle,
    FormRow,
    FormGroup,
    Label,
    Input,
    ErrorText,
    brandTheme
} from '../styles';
import { LabelWithBadge } from './LabelWithBadge';

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
        onChange(e);

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
                    <Label htmlFor="title">
                        Tytuł wizyty
                    </Label>
                    <Input
                        id="title"
                        name="title"
                        value={title || ''}
                        onChange={onChange}
                        placeholder="np. Kompleksowe mycie i woskowanie - BMW X5"
                        $hasError={!!error}
                    />
                    {error && <ErrorText>{error}</ErrorText>}
                    <HelpText>
                        Jeśli pozostawisz puste, tytuł zostanie wygenerowany automatycznie na podstawie
                        wybranych usług i danych klienta.
                    </HelpText>
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="calendarColorId">
                        <LabelWithBadge
                            htmlFor="phone"
                            required={!selectedColorId}
                            badgeVariant="modern"
                        >
                        Kolor w kalendarzu
                        </LabelWithBadge>
                    </Label>
                    <ColorSelectContainer>
                        <ColorSquare $color={selectedColor} $hasColor={!!selectedColor} />
                        <StyledSelect
                            id="calendarColorId"
                            name="calendarColorId"
                            value={selectedColorId || ''}
                            onChange={handleColorChange}
                            disabled={colorsLoading}
                            required={true}
                            $hasError={!!colorsError}
                            $hasValue={!!selectedColorId}
                        >
                            <option value="">
                                {colorsLoading ? 'Ładowanie kolorów...' : 'Wybierz kolor wizyty...'}
                            </option>
                            {calendarColors.map(color => (
                                <ColorOption
                                    key={color.id}
                                    value={color.id}
                                    data-color={color.color}
                                >
                                    {color.name}
                                </ColorOption>
                            ))}
                        </StyledSelect>
                        {colorsLoading && (
                            <LoadingSpinner>
                                <SpinnerDot />
                                <SpinnerDot />
                                <SpinnerDot />
                            </LoadingSpinner>
                        )}
                    </ColorSelectContainer>
                    {colorsError && <ErrorText>{colorsError}</ErrorText>}
                    <HelpText>
                        Kolor pomoże w łatwym rozpoznawaniu wizyty w kalendarzu zespołu.
                    </HelpText>
                </FormGroup>
            </FormRow>
        </FormSection>
    );
};

// Styled Components - dopasowane do brandTheme ze styles.ts
const OptionalTag = styled.span`
    background: ${brandTheme.text.muted};
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: ${brandTheme.radius.sm};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-left: auto;
`;

const RequiredTag = styled.span`
    background: ${brandTheme.status.error};
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: ${brandTheme.radius.sm};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-left: auto;
`;

const ColorSelectContainer = styled.div`
    position: relative;
    width: 100%;
`;

const ColorSquare = styled.div<{ $color?: string; $hasColor: boolean }>`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: ${brandTheme.spacing.md};
    width: 20px;
    height: 20px;
    background: ${props => props.$color || brandTheme.surfaceAlt};
    border: 2px solid ${props => props.$hasColor ? brandTheme.border : brandTheme.text.disabled};
    border-radius: ${brandTheme.radius.sm};
    z-index: 2;
    transition: all ${brandTheme.transitions.normal};
    box-shadow: ${props => props.$hasColor ? brandTheme.shadow.xs : 'none'};
    
    ${props => !props.$hasColor && `
        background: repeating-linear-gradient(
            45deg,
            ${brandTheme.surfaceAlt},
            ${brandTheme.surfaceAlt} 3px,
            ${brandTheme.borderLight} 3px,
            ${brandTheme.borderLight} 6px
        );
    `}
`;

const StyledSelect = styled.select<{ $hasError?: boolean; $hasValue?: boolean }>`
    width: 100%;
    height: 44px;
    padding: 0 ${brandTheme.spacing.xl} 0 ${brandTheme.spacing.xxl};
    border: 2px solid ${props => props.$hasError ? brandTheme.status.error : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${props => props.$hasValue ? brandTheme.text.primary : brandTheme.text.muted};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right ${brandTheme.spacing.md} center;
    background-size: 16px;
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? brandTheme.status.error : brandTheme.primary};
        box-shadow: 0 0 0 3px ${props =>
    props.$hasError ?
        `${brandTheme.status.error}20` :
        brandTheme.primaryGhost
};
        
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23${props => props.$hasError ? 'dc2626' : '1a365d'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
    }

    &:disabled {
        background: ${brandTheme.surfaceAlt};
        color: ${brandTheme.text.disabled};
        cursor: not-allowed;
        opacity: 0.6;
    }

    /* Lepsze stylowanie opcji w dropdown */
    option {
        padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
        font-weight: 500;
        background: ${brandTheme.surface};
        color: ${brandTheme.text.primary};
    }

    /* Style dla różnych przeglądarek */
    &::-ms-expand {
        display: none;
    }
`;

const ColorOption = styled.option`
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    line-height: 1.5;
    
    /* Dodatkowe style dla lepszego wyglądu w dropdown */
    &:hover {
        background: ${brandTheme.surfaceHover};
    }
    
    &:checked {
        background: ${brandTheme.primary};
        color: white;
    }
`;

const LoadingSpinner = styled.div`
    position: absolute;
    top: 50%;
    right: ${brandTheme.spacing.xl};
    transform: translateY(-50%);
    z-index: 3;
    display: flex;
    gap: 2px;
    align-items: center;
`;

const SpinnerDot = styled.div`
    width: 4px;
    height: 4px;
    background: ${brandTheme.primary};
    border-radius: 50%;
    animation: pulse 1.4s ease-in-out infinite both;

    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: 0s; }

    @keyframes pulse {
        0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
        }
        40% {
            opacity: 1;
            transform: scale(1);
        }
    }
`;

const HelpText = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    line-height: 1.4;
    margin-top: ${brandTheme.spacing.xs};
    font-weight: 400;
`;

export default VisitTitleSection;