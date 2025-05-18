import React from 'react';
import { FaTimes, FaArrowRight } from 'react-icons/fa';
import {
    StepContainer,
    StepTitle,
    StepNumber,
    FormSection,
    StepActions,
    SecondaryButton,
    PrimaryButton
} from '../campaign-common/styled/LayoutComponents';
import {
    FormGroup,
    FormLabel,
    FormInput,
    FormTextarea,
    RequiredLabel
} from '../campaign-common/styled/FormComponents';
import {SmsCampaign} from "../../../../../types/sms";

interface Step1BasicInfoProps {
    campaign: Partial<SmsCampaign> & { tags?: string, campaignCategory?: string };
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onNext: () => void;
    onCancel: () => void;
}

/**
 * Pierwszy krok kreatora kampanii SMS - podstawowe informacje
 * Zbiera podstawowe dane o kampanii (nazwa, opis)
 */
const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
                                                           campaign,
                                                           onInputChange,
                                                           onNext,
                                                           onCancel
                                                       }) => {
    // Rozszerzamy handlera, aby obsługiwał select
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onInputChange(e as any);
    };

    return (
        <StepContainer>
            <StepTitle>
                <StepNumber active>1</StepNumber>
                Podstawowe informacje
            </StepTitle>

            <FormSection>
                <FormGroup>
                    <FormLabel>
                        Nazwa kampanii<RequiredLabel>*</RequiredLabel>
                    </FormLabel>
                    <FormInput
                        type="text"
                        name="name"
                        value={campaign.name || ''}
                        onChange={onInputChange}
                        placeholder="np. Promocja letnia 2025"
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel>Opis kampanii</FormLabel>
                    <FormTextarea
                        name="description"
                        value={campaign.description || ''}
                        onChange={onInputChange}
                        placeholder="Dodaj opis kampanii, który pomoże Ci później zidentyfikować jej cel i zawartość..."
                        rows={4}
                    />
                </FormGroup>
            </FormSection>

            <FormSection>
                <FormGroup>
                    <FormLabel>Tagi kampanii</FormLabel>
                    <FormInput
                        type="text"
                        name="tags"
                        value={campaign.tags || ''}
                        onChange={onInputChange}
                        placeholder="np. promocja, lato, detailing"
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel>Kategoria kampanii</FormLabel>
                    <select
                        name="campaignCategory"
                        value={campaign.campaignCategory || ''}
                        onChange={handleSelectChange}
                        style={{
                            padding: '10px 12px',
                            border: '1px solid #ced4da',
                            borderRadius: '5px',
                            fontSize: '14px',
                            width: '100%'
                        }}
                    >
                        <option value="">Wybierz kategorię</option>
                        <option value="promotional">Promocyjna</option>
                        <option value="reminder">Przypomnienie</option>
                        <option value="informational">Informacyjna</option>
                        <option value="birthday">Urodzinowa</option>
                        <option value="service">Serwisowa</option>
                        <option value="loyalty">Lojalnościowa</option>
                        <option value="other">Inna</option>
                    </select>
                </FormGroup>
            </FormSection>

            <StepActions>
                <SecondaryButton onClick={onCancel}>
                    <FaTimes /> Anuluj
                </SecondaryButton>
                <PrimaryButton onClick={onNext}>
                    Dalej <FaArrowRight />
                </PrimaryButton>
            </StepActions>
        </StepContainer>
    );
};

export default Step1BasicInfo;