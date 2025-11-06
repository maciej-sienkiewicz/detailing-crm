import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaDollarSign, FaEuroSign, FaTimes, FaTools} from 'react-icons/fa';
import {PriceType} from '../../../../types';

// Professional Brand Theme
const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',
    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7',
        error: '#dc2626',
        errorLight: '#fee2e2',
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
    },
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    },
    transitions: {
        fast: '0.15s ease',
        normal: '0.2s ease',
        slow: '0.3s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }
};

interface PriceEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (price: number, inputType: PriceType) => void;
    serviceName: string;
    isNewService: boolean;
    initialPrice?: number;
    initialPriceType?: PriceType;
}

const PriceEditModal: React.FC<PriceEditModalProps> = ({
                                                           isOpen,
                                                           onClose,
                                                           onSave,
                                                           serviceName,
                                                           isNewService,
                                                           initialPrice = 0,
                                                           initialPriceType = PriceType.GROSS
                                                       }) => {
    const [price, setPrice] = useState<string>(initialPrice > 0 ? initialPrice.toString() : '');
    const [error, setError] = useState<string | null>(null);
    const [isPriceGross, setIsPriceGross] = useState<boolean>(initialPriceType === PriceType.GROSS);

    // Domyślna stawka VAT
    const DEFAULT_VAT_RATE = 23;

    // Reset stanu przy otwarciu modalu
    useEffect(() => {
        if (isOpen) {
            setPrice(initialPrice >= 0 ? initialPrice.toString() : '');
            setError(null);
            setIsPriceGross(initialPriceType === PriceType.GROSS);
        }
    }, [isOpen, initialPrice, initialPriceType]);

    // Funkcje do przeliczania cen netto/brutto
    const calculateNetPrice = (grossPrice: number): number => {
        return grossPrice / (1 + DEFAULT_VAT_RATE / 100);
    };

    const calculateGrossPrice = (netPrice: number): number => {
        return netPrice * (1 + DEFAULT_VAT_RATE / 100);
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Pozwól na wprowadzanie tylko cyfr i kropki/przecinka
        if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
            // Sprawdź ilość miejsc po przecinku
            const decimalPart = value.split(/[.,]/)[1];
            if (decimalPart && decimalPart.length > 2) {
                // Jeśli więcej niż 2 miejsca po przecinku, ignoruj input
                return;
            }

            setPrice(value);
            setError(null);
        }
    };

    // Zmiana typu ceny (brutto/netto)
    const handlePriceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newIsPriceGross = e.target.value === "gross";

        // Przelicz wartość w polu, jeśli jest liczbą
        const parsedPrice = parseFloat(price.replace(',', '.'));
        if (!isNaN(parsedPrice) && parsedPrice > 0) {
            if (isPriceGross && !newIsPriceGross) {
                // Zmiana z brutto na netto
                setPrice(calculateNetPrice(parsedPrice).toFixed(2));
            } else if (!isPriceGross && newIsPriceGross) {
                // Zmiana z netto na brutto
                setPrice(calculateGrossPrice(parsedPrice).toFixed(2));
            }
        }

        setIsPriceGross(newIsPriceGross);
    };

    const handleSave = () => {
        // Konwersja na liczbę i sprawdzenie czy jest prawidłowa
        const numericPrice = parseFloat(price.replace(',', '.'));

        if (isNaN(numericPrice)) {
            setError('Wprowadź poprawną cenę');
            return;
        }

        if (numericPrice < 0) {
            setError('Cena nie może być ujemna');
            return;
        }

        // Przekaż wprowadzoną cenę oraz typ ceny do API
        // API oczekuje inputPrice i inputType (GROSS lub NET)
        const inputType = isPriceGross ? PriceType.GROSS : PriceType.NET;

        onSave(numericPrice, inputType);
        setPrice('');
        setError(null);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        }
    };

    // Wyświetlanie przeliczonej ceny dla informacji użytkownika
    const displayConvertedPrice = () => {
        const parsedPrice = parseFloat(price.replace(',', '.'));
        if (!isNaN(parsedPrice) && parsedPrice > 0) {
            if (isPriceGross) {
                // Jeśli wprowadzamy brutto, pokazujemy netto
                const netPrice = calculateNetPrice(parsedPrice);
                return `${netPrice.toFixed(2)} zł netto`;
            } else {
                // Jeśli wprowadzamy netto, pokazujemy brutto
                const grossPrice = calculateGrossPrice(parsedPrice);
                return `${grossPrice.toFixed(2)} zł brutto`;
            }
        }
        return '';
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <HeaderContent>
                        <HeaderIcon>
                            <FaTools />
                        </HeaderIcon>
                        <HeaderText>
                            <ModalTitle>
                                {isNewService ? "Dodaj nową usługę" : "Edytuj cenę usługi"}
                            </ModalTitle>
                            <ModalSubtitle>
                                Ustaw prawidłową cenę dla tej usługi
                            </ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <ServiceInfoSection>
                        <ServiceInfoLabel>Nazwa usługi:</ServiceInfoLabel>
                        <ServiceInfoValue>{serviceName}</ServiceInfoValue>
                    </ServiceInfoSection>

                    {isNewService && (
                        <InfoMessage>
                            Ta usługa zostanie dodana do bazy danych i będzie dostępna dla przyszłych rezerwacji
                        </InfoMessage>
                    )}

                    <FormSection>
                        <FormGroup>
                            <Label htmlFor="priceType">Typ ceny</Label>
                            <PriceTypeSelect
                                id="priceType"
                                value={isPriceGross ? "gross" : "net"}
                                onChange={handlePriceTypeChange}
                            >
                                <option value="gross">Cena brutto (z VAT 23%)</option>
                                <option value="net">Cena netto (bez VAT)</option>
                            </PriceTypeSelect>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="price">
                                Cena ({isPriceGross ? 'brutto' : 'netto'}) PLN
                            </Label>
                            <PriceInputContainer>
                                <PriceInput
                                    id="price"
                                    type="text"
                                    value={price}
                                    onChange={handlePriceChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="0.00"
                                    autoFocus
                                    $hasError={!!error}
                                />
                                <CurrencyLabel>PLN</CurrencyLabel>
                            </PriceInputContainer>
                            {displayConvertedPrice() && (
                                <ConversionInfo>
                                    <span>Odpowiada: {displayConvertedPrice()}</span>
                                </ConversionInfo>
                            )}
                            {error && <ErrorText>{error}</ErrorText>}
                        </FormGroup>
                    </FormSection>
                </ModalBody>

                <ModalFooter>
                    <SecondaryButton onClick={onClose}>
                        <FaTimes />
                        Anuluj
                    </SecondaryButton>
                    <PrimaryButton onClick={handleSave}>
                        Zapisz cenę
                    </PrimaryButton>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components - Professional Automotive CRM Design
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    box-shadow: ${brandTheme.shadow.xl};
    width: 500px;
    max-width: 95%;
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
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 2px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
`;

const HeaderIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${brandTheme.status.successLight};
    color: ${brandTheme.status.success};
    border-radius: ${brandTheme.radius.lg};
    font-size: 18px;
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.025em;
`;

const ModalSubtitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${brandTheme.surfaceHover};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    color: ${brandTheme.text.muted};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};

    &:hover {
        background: ${brandTheme.status.errorLight};
        border-color: ${brandTheme.status.error};
        color: ${brandTheme.status.error};
        transform: translateY(-1px);
    }
`;

const ModalBody = styled.div`
    padding: ${brandTheme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
`;

const ServiceInfoSection = styled.div`
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.border};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const ServiceInfoLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
`;

const ServiceInfoValue = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    word-break: break-word;
    line-height: 1.4;
`;

const InfoMessage = styled.div`
    background: linear-gradient(135deg, ${brandTheme.status.infoLight} 0%, rgba(59, 130, 246, 0.05) 100%);
    color: ${brandTheme.status.info};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid rgba(59, 130, 246, 0.2);
    font-size: 14px;
    font-weight: 500;
    box-shadow: ${brandTheme.shadow.xs};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};

    &::before {
        content: '💡';
        font-size: 16px;
    }
`;

const FormSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const PriceTypeSelect = styled.select`
    height: 44px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all ${brandTheme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }
`;

const PriceInputContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const PriceInput = styled.input<{ $hasError?: boolean }>`
    width: 100%;
    height: 56px;
    padding: 0 60px 0 ${brandTheme.spacing.lg};
    border: 2px solid ${props => props.$hasError ? brandTheme.status.error : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 18px;
    font-weight: 600;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all ${brandTheme.transitions.normal};
    text-align: right;
    font-variant-numeric: tabular-nums;

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? brandTheme.status.error : brandTheme.primary};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? brandTheme.status.errorLight : brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

const CurrencyLabel = styled.div`
    position: absolute;
    right: ${brandTheme.spacing.lg};
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.muted};
    pointer-events: none;
`;

const ConversionInfo = styled.div`
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.sm};
    border: 1px solid ${brandTheme.border};

    span {
        font-size: 13px;
        color: ${brandTheme.text.secondary};
        font-weight: 500;
    }
`;

const ErrorText = styled.div`
    color: ${brandTheme.status.error};
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};

    &::before {
        content: '⚠️';
        font-size: 14px;
    }
`;

const TaxInfo = styled.div`
    background: ${brandTheme.status.warningLight};
    border: 1px solid ${brandTheme.status.warning};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const TaxInfoIcon = styled.div`
    font-size: 16px;
    flex-shrink: 0;
`;

const TaxInfoText = styled.div`
    font-size: 13px;
    color: ${brandTheme.status.warning};
    font-weight: 500;
    line-height: 1.4;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-top: 2px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;

const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${brandTheme.transitions.spring};
    min-height: 44px;
    min-width: 120px;

    &:hover {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.text.primary};
        border-color: ${brandTheme.borderHover};
        box-shadow: ${brandTheme.shadow.sm};
    }
`;

const PrimaryButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: linear-gradient(135deg, ${brandTheme.status.success} 0%, #059669 100%);
    color: white;
    border: 2px solid transparent;
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${brandTheme.transitions.spring};
    box-shadow: ${brandTheme.shadow.sm};
    min-height: 44px;
    min-width: 120px;

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, #047857 0%, ${brandTheme.status.success} 100%);
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        background: ${brandTheme.text.disabled};
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
`;

export default PriceEditModal;