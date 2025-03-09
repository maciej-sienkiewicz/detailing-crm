import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

type PriceType = 'netto' | 'brutto';

const TaxesPage: React.FC = () => {
    const [vatRate, setVatRate] = useState<number>(23); // Domyślna wartość 23%
    const [savedVatRate, setSavedVatRate] = useState<number>(23);
    const [priceType, setPriceType] = useState<PriceType>('netto'); // Domyślnie ceny netto
    const [savedPriceType, setSavedPriceType] = useState<PriceType>('netto');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Symulacja pobrania danych z API
    useEffect(() => {
        // W rzeczywistej aplikacji tutaj byłoby pobieranie danych z backendu
        const fetchTaxSettings = async () => {
            try {
                // Symulacja odpowiedzi z API
                const response = { vatRate: 23, priceType: 'netto' as PriceType };
                setVatRate(response.vatRate);
                setSavedVatRate(response.vatRate);
                setPriceType(response.priceType);
                setSavedPriceType(response.priceType);
            } catch (err) {
                setError('Nie udało się pobrać ustawień podatkowych.');
            }
        };

        fetchTaxSettings();
    }, []);

    const handleVatRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (isNaN(value)) {
            setVatRate(0);
        } else {
            setVatRate(value);
        }
        // Czyścimy komunikaty przy zmianie wartości
        setError(null);
        setSuccessMessage(null);
    };

    const handlePriceTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPriceType(e.target.value as PriceType);
        // Czyścimy komunikaty przy zmianie wartości
        setError(null);
        setSuccessMessage(null);
    };

    const handleSave = async () => {
        // Walidacja
        if (vatRate < 0 || vatRate > 100) {
            setError('Stawka VAT musi być wartością między 0 a 100.');
            return;
        }

        try {
            // W rzeczywistej aplikacji tutaj byłby zapis do backendu
            // Symulacja zapisu
            await new Promise(resolve => setTimeout(resolve, 500));
            setSavedVatRate(vatRate);
            setSavedPriceType(priceType);
            setSuccessMessage('Ustawienia podatkowe zostały zaktualizowane.');

            // Usuń komunikat sukcesu po 3 sekundach
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            setError('Nie udało się zapisać ustawień podatkowych.');
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <h1>Podatki</h1>
            </PageHeader>

            <ContentSection>
                <SectionTitle>Ustawienia podatku VAT</SectionTitle>

                <FormGroup>
                    <Label htmlFor="vat-rate">Standardowa stawka VAT (%)</Label>
                    <InputWithControls>
                        <Input
                            id="vat-rate"
                            type="number"
                            min="0"
                            max="100"
                            value={vatRate}
                            onChange={handleVatRateChange}
                        />
                        <PercentSymbol>%</PercentSymbol>
                    </InputWithControls>
                    <HelpText>Wprowadź wartość od 0 do 100.</HelpText>
                </FormGroup>

                <FormGroup>
                    <Label>Wprowadzane ceny w systemie to ceny:</Label>
                    <RadioGroup>
                        <RadioOption>
                            <RadioInput
                                type="radio"
                                id="price-type-netto"
                                name="price-type"
                                value="netto"
                                checked={priceType === 'netto'}
                                onChange={handlePriceTypeChange}
                            />
                            <RadioLabel htmlFor="price-type-netto">Netto</RadioLabel>
                        </RadioOption>
                        <RadioOption>
                            <RadioInput
                                type="radio"
                                id="price-type-brutto"
                                name="price-type"
                                value="brutto"
                                checked={priceType === 'brutto'}
                                onChange={handlePriceTypeChange}
                            />
                            <RadioLabel htmlFor="price-type-brutto">Brutto</RadioLabel>
                        </RadioOption>
                    </RadioGroup>
                    <HelpText>
                        Wybór określa, czy ceny wprowadzane do systemu są cenami netto (bez VAT), czy brutto (z VAT).
                    </HelpText>
                </FormGroup>

                {error && <ErrorMessage>{error}</ErrorMessage>}
                {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

                <ButtonGroup>
                    <SaveButton
                        onClick={handleSave}
                        disabled={vatRate === savedVatRate && priceType === savedPriceType}
                    >
                        Zapisz
                    </SaveButton>
                </ButtonGroup>

                <InfoBox>
                    <InfoTitle>Informacje o podatkach</InfoTitle>
                    <p>Standardowa stawka VAT będzie używana jako domyślna przy tworzeniu nowych usług i produktów w systemie.</p>
                    <p>Opcja typu cen określa, jak będą interpretowane ceny wprowadzane w całym systemie.</p>
                </InfoBox>
            </ContentSection>
        </PageContainer>
    );
};

const PageContainer = styled.div`
    padding: 20px;
`;

const PageHeader = styled.div`
    margin-bottom: 30px;

    h1 {
        font-size: 24px;
        color: #2c3e50;
        margin: 0;
    }
`;

const ContentSection = styled.section`
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 20px;
    max-width: 800px;
`;

const SectionTitle = styled.h2`
    font-size: 18px;
    color: #2c3e50;
    margin: 0 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
`;

const FormGroup = styled.div`
    margin-bottom: 20px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
`;

const InputWithControls = styled.div`
    display: flex;
    align-items: center;
    position: relative;
    max-width: 200px;
`;

const Input = styled.input`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    width: 100%;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    /* Usuń strzałki z inputu typu number */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    &[type=number] {
        -moz-appearance: textfield;
    }
`;

const PercentSymbol = styled.span`
    position: absolute;
    right: 12px;
    color: #7f8c8d;
`;

const HelpText = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-top: 4px;
`;

const ButtonGroup = styled.div`
    margin-top: 30px;
`;

const SaveButton = styled.button`
    padding: 8px 16px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;

    &:hover:not(:disabled) {
        background-color: #2980b9;
    }

    &:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
        opacity: 0.7;
    }
`;

const ErrorMessage = styled.div`
    color: #e74c3c;
    background-color: #fdecea;
    border-radius: 4px;
    padding: 10px;
    margin-top: 10px;
    font-size: 14px;
`;

const SuccessMessage = styled.div`
    color: #27ae60;
    background-color: #e8f8f5;
    border-radius: 4px;
    padding: 10px;
    margin-top: 10px;
    font-size: 14px;
`;

const InfoBox = styled.div`
    background-color: #f9f9f9;
    border-left: 4px solid #3498db;
    padding: 15px;
    margin-top: 30px;
    border-radius: 0 4px 4px 0;
`;

const InfoTitle = styled.h3`
    font-size: 16px;
    margin: 0 0 10px 0;
    color: #3498db;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 8px;
`;

const RadioOption = styled.div`
  display: flex;
  align-items: center;
`;

const RadioInput = styled.input`
  margin: 0;
  cursor: pointer;
`;

const RadioLabel = styled.label`
  margin-left: 8px;
  cursor: pointer;
  font-weight: normal;
`;

export default TaxesPage;