import React from 'react';
import {FormGroup, FormSection, Label, SectionTitle, Textarea} from '../styles';

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