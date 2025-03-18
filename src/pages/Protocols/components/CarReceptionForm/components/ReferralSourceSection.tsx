import React, { useState } from 'react';
import {
    FormSection,
    SectionTitle,
    FormRow,
    FormGroup,
    Label,
    Input,
    Textarea
} from '../styles/styles';
import styled from 'styled-components';

// Typy źródeł polecenia
export type ReferralSource =
    | 'regular_customer'
    | 'recommendation'
    | 'search_engine'
    | 'social_media'
    | 'local_ad'
    | 'other';

// Interfejs dla props komponentu
interface ReferralSourceSectionProps {
    referralSource: ReferralSource | null;
    otherSourceDetails: string;
    onSourceChange: (source: ReferralSource | null) => void;
    onOtherDetailsChange: (details: string) => void;
}

const ReferralSourceSection: React.FC<ReferralSourceSectionProps> = ({
                                                                         referralSource,
                                                                         otherSourceDetails,
                                                                         onSourceChange,
                                                                         onOtherDetailsChange
                                                                     }) => {
    return (
        <FormSection>
            <SectionTitle>Źródło pozyskania klienta</SectionTitle>
            <SourceOptionsContainer>
                <SourceOption
                    selected={referralSource === 'regular_customer'}
                    onClick={() => onSourceChange('regular_customer')}
                >
                    <RadioButton selected={referralSource === 'regular_customer'} />
                    <OptionLabel>Stały klient</OptionLabel>
                </SourceOption>

                <SourceOption
                    selected={referralSource === 'recommendation'}
                    onClick={() => onSourceChange('recommendation')}
                >
                    <RadioButton selected={referralSource === 'recommendation'} />
                    <OptionLabel>Polecenie</OptionLabel>
                </SourceOption>

                <SourceOption
                    selected={referralSource === 'search_engine'}
                    onClick={() => onSourceChange('search_engine')}
                >
                    <RadioButton selected={referralSource === 'search_engine'} />
                    <OptionLabel>Wyszukiwarka</OptionLabel>
                </SourceOption>

                <SourceOption
                    selected={referralSource === 'social_media'}
                    onClick={() => onSourceChange('social_media')}
                >
                    <RadioButton selected={referralSource === 'social_media'} />
                    <OptionLabel>Facebook / Instagram</OptionLabel>
                </SourceOption>

                <SourceOption
                    selected={referralSource === 'local_ad'}
                    onClick={() => onSourceChange('local_ad')}
                >
                    <RadioButton selected={referralSource === 'local_ad'} />
                    <OptionLabel>Lokalnie</OptionLabel>
                </SourceOption>

                <SourceOption
                    selected={referralSource === 'other'}
                    onClick={() => onSourceChange('other')}
                >
                    <RadioButton selected={referralSource === 'other'} />
                    <OptionLabel>Inne</OptionLabel>
                </SourceOption>
            </SourceOptionsContainer>

            {referralSource === 'other' && (
                <FormGroup>
                    <Label htmlFor="otherSourceDetails">Jakie źródło?</Label>
                    <Input
                        id="otherSourceDetails"
                        name="otherSourceDetails"
                        value={otherSourceDetails}
                        onChange={(e) => onOtherDetailsChange(e.target.value)}
                        placeholder="Wpisz skąd klient się o nas dowiedział..."
                    />
                </FormGroup>
            )}
        </FormSection>
    );
};

// Styled components
const SourceOptionsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 15px;
`;

const SourceOption = styled.div<{ selected: boolean }>`
    display: flex;
    align-items: center;
    padding: 8px 15px;
    background-color: ${props => props.selected ? '#eaf6fd' : '#f9f9f9'};
    border: 1px solid ${props => props.selected ? '#3498db' : '#eee'};
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background-color: ${props => props.selected ? '#eaf6fd' : '#f0f0f0'};
    }
`;

const RadioButton = styled.div<{ selected: boolean }>`
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid ${props => props.selected ? '#3498db' : '#bbb'};
    margin-right: 8px;
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #3498db;
        opacity: ${props => props.selected ? 1 : 0};
        transition: opacity 0.2s;
    }
`;

const OptionLabel = styled.div`
    font-size: 14px;
    color: #34495e;
`;

export default ReferralSourceSection;