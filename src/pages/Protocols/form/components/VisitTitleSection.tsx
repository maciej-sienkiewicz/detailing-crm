import React from 'react';
import {
    FormSection,
    SectionTitle,
    FormRow,
    FormGroup,
    Label,
    Input,
    ErrorText
} from '../styles';

interface VisitTitleSectionProps {
    title: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}

const VisitTitleSection: React.FC<VisitTitleSectionProps> = ({
                                                                 title,
                                                                 onChange,
                                                                 error
                                                             }) => {
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
            </FormRow>
        </FormSection>
    );
};

export default VisitTitleSection;