import React from 'react';
import {brandTheme, FormGroup, FormSection, Input, Label, SectionTitle} from '../styles';
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
                    <OptionLabel>
                        Stały klient
                    </OptionLabel>
                </SourceOption>

                <SourceOption
                    selected={referralSource === 'recommendation'}
                    onClick={() => onSourceChange('recommendation')}
                >
                    <RadioButton selected={referralSource === 'recommendation'} />
                    <OptionLabel>
                        Polecenie
                    </OptionLabel>
                </SourceOption>

                <SourceOption
                    selected={referralSource === 'search_engine'}
                    onClick={() => onSourceChange('search_engine')}
                >
                    <RadioButton selected={referralSource === 'search_engine'} />
                    <OptionLabel>
                        Wyszukiwarka
                    </OptionLabel>
                </SourceOption>

                <SourceOption
                    selected={referralSource === 'social_media'}
                    onClick={() => onSourceChange('social_media')}
                >
                    <RadioButton selected={referralSource === 'social_media'} />
                    <OptionLabel>
                        Facebook / Instagram
                    </OptionLabel>
                </SourceOption>

                <SourceOption
                    selected={referralSource === 'local_ad'}
                    onClick={() => onSourceChange('local_ad')}
                >
                    <RadioButton selected={referralSource === 'local_ad'} />
                    <OptionLabel>
                        Lokalnie
                    </OptionLabel>
                </SourceOption>

                <SourceOption
                    selected={referralSource === 'other'}
                    onClick={() => onSourceChange('other')}
                >
                    <RadioButton selected={referralSource === 'other'} />
                    <OptionLabel>
                        Inne
                    </OptionLabel>
                </SourceOption>
            </SourceOptionsContainer>

            {referralSource === 'other' && (
                <OtherSourceContainer>
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
                </OtherSourceContainer>
            )}
        </FormSection>
    );
};

// Styled components zgodne z brandTheme
const SourceOptionsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: ${brandTheme.spacing.sm};
    }

    @media (max-width: 576px) {
        grid-template-columns: 1fr;
        gap: ${brandTheme.spacing.sm};
    }
`;

const SourceOption = styled.div<{ selected: boolean }>`
    display: flex;
    align-items: center;
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: ${props => props.selected ? brandTheme.primaryGhost : brandTheme.surface};
    border: 2px solid ${props => props.selected ? brandTheme.primary : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};
    position: relative;
    min-height: 56px;
    box-shadow: ${props => props.selected ? brandTheme.shadow.sm : brandTheme.shadow.xs};

    &:hover {
        background: ${props => props.selected ? brandTheme.primaryGhost : brandTheme.surfaceHover};
        border-color: ${props => props.selected ? brandTheme.primary : brandTheme.borderHover};
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }

    &:active {
        transform: translateY(0);
    }

    /* Subtle gradient when selected */
    ${props => props.selected && `
        background: linear-gradient(135deg, ${brandTheme.primaryGhost} 0%, ${brandTheme.surface} 100%);
        
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, ${brandTheme.primary}08 0%, transparent 50%);
            border-radius: ${brandTheme.radius.md};
            pointer-events: none;
        }
    `}

    @media (max-width: 576px) {
        padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
        min-height: 48px;
    }
`;

const RadioButton = styled.div<{ selected: boolean }>`
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid ${props => props.selected ? brandTheme.primary : brandTheme.border};
    margin-right: ${brandTheme.spacing.md};
    position: relative;
    flex-shrink: 0;
    transition: all ${brandTheme.transitions.normal};
    background: ${brandTheme.surface};
    box-shadow: ${props => props.selected ? `0 0 0 3px ${brandTheme.primaryGhost}` : 'none'};

    &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(${props => props.selected ? 1 : 0});
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${brandTheme.primary};
        transition: all ${brandTheme.transitions.spring};
    }

    /* Pulse animation when selected */
    ${props => props.selected && `
        animation: pulseGlow 2s ease-in-out infinite;
        
        @keyframes pulseGlow {
            0%, 100% {
                box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
            }
            50% {
                box-shadow: 0 0 0 6px ${brandTheme.primaryGhost}40;
            }
        }
    `}
`;

const OptionLabel = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    line-height: 1.4;
    flex: 1;
`;

const OptionIcon = styled.span`
    font-size: 16px;
    line-height: 1;
    opacity: 0.8;
    
    @media (max-width: 576px) {
        font-size: 14px;
    }
`;

const OtherSourceContainer = styled.div`
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    margin-top: ${brandTheme.spacing.md};
    animation: slideDown 0.3s ease;
    position: relative;

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
            padding-top: 0;
            padding-bottom: 0;
        }
        to {
            opacity: 1;
            transform: translateY(0);
            max-height: 200px;
            padding-top: ${brandTheme.spacing.lg};
            padding-bottom: ${brandTheme.spacing.lg};
        }
    }

    &::before {
        content: '';
        position: absolute;
        top: -1px;
        left: ${brandTheme.spacing.lg};
        right: ${brandTheme.spacing.lg};
        height: 2px;
        background: linear-gradient(90deg, transparent 0%, ${brandTheme.primary} 50%, transparent 100%);
        border-radius: 1px;
    }

    @media (max-width: 576px) {
        margin-left: -${brandTheme.spacing.lg};
        margin-right: -${brandTheme.spacing.lg};
        border-radius: 0;
        border-left: none;
        border-right: none;
        
        &::before {
            left: ${brandTheme.spacing.md};
            right: ${brandTheme.spacing.md};
        }
    }
`;

export default ReferralSourceSection;