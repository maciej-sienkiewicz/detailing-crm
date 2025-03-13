import React from 'react';
import {
    FormSection,
    SectionTitle,
    FormGroup,
    Label,
    Textarea
} from '../styles/styles';

interface NotesSectionProps {
    notes: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({
                                                       notes,
                                                       onChange
                                                   }) => {
    return (
        <FormSection>
            <SectionTitle>Uwagi</SectionTitle>
            <FormGroup>
                <Label htmlFor="notes">Uwagi dodatkowe</Label>
                <Textarea
                    id="notes"
                    name="notes"
                    value={notes}
                    onChange={onChange}
                    placeholder="Dodatkowe informacje, uwagi, zalecenia..."
                    rows={4}
                />
            </FormGroup>
        </FormSection>
    );
};

export default NotesSection;