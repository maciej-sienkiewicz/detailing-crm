// src/pages/Settings/components/companySettings/SectionSlider.tsx
import React from 'react';
import { FaChevronLeft, FaChevronRight, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import {
    SliderContainer,
    SliderHeader,
    HeaderLeft,
    SliderTitle,
    SliderSubtitle,
    HeaderRight,
    NavigationContainer,
    NavButton,
    SectionIndicators,
    SectionDot,
    ActionButtonsContainer,
    ActionButton,
    ProgressContainer,
    ProgressBar,
    ProgressFill
} from '../../styles/companySettings/SectionSlider.styles';

interface Section {
    id: string;
    title: string;
    subtitle: string;
    component: React.ComponentType<any>;
}

interface SectionSliderProps {
    sections: Section[];
    currentIndex: number;
    onPrevious: () => void;
    onNext: () => void;
    onSectionChange: (index: number) => void;
    canNavigatePrev: boolean;
    canNavigateNext: boolean;
    isEditing?: boolean;
    saving?: boolean;
    onStartEdit?: () => void;
    onSave?: () => void;
    onCancel?: () => void;
    showEditControls?: boolean;
}

export const SectionSlider: React.FC<SectionSliderProps> = ({
                                                                sections,
                                                                currentIndex,
                                                                onPrevious,
                                                                onNext,
                                                                onSectionChange,
                                                                canNavigatePrev,
                                                                canNavigateNext,
                                                                isEditing = false,
                                                                saving = false,
                                                                onStartEdit,
                                                                onSave,
                                                                onCancel,
                                                                showEditControls = false
                                                            }) => {
    const currentSection = sections[currentIndex];
    const progress = ((currentIndex + 1) / sections.length) * 100;

    const renderActionButtons = () => {
        if (!showEditControls) return null;

        if (isEditing) {
            return (
                <>
                    <ActionButton $secondary onClick={onCancel} disabled={saving}>
                        <FaTimes />
                        Anuluj
                    </ActionButton>
                    <ActionButton $primary onClick={onSave} disabled={saving}>
                        <FaSave />
                        {saving ? 'Zapisywanie...' : 'Zapisz'}
                    </ActionButton>
                </>
            );
        }

        return (
            <ActionButton $primary onClick={onStartEdit}>
                <FaEdit />
                Edytuj sekcję
            </ActionButton>
        );
    };

    return (
        <SliderContainer>
            <SliderHeader>
                <HeaderLeft>
                    <SliderTitle>{currentSection.title}</SliderTitle>
                    <SliderSubtitle>{currentSection.subtitle}</SliderSubtitle>
                </HeaderLeft>

                <HeaderRight>
                    <NavigationContainer>
                        <NavButton
                            onClick={onPrevious}
                            disabled={!canNavigatePrev}
                            $disabled={!canNavigatePrev}
                        >
                            <FaChevronLeft />
                        </NavButton>

                        <SectionIndicators>
                            {sections.map((_, index) => (
                                <SectionDot
                                    key={index}
                                    $active={index === currentIndex}
                                    onClick={() => onSectionChange(index)}
                                />
                            ))}
                        </SectionIndicators>

                        <NavButton
                            onClick={onNext}
                            disabled={!canNavigateNext}
                            $disabled={!canNavigateNext}
                        >
                            <FaChevronRight />
                        </NavButton>
                    </NavigationContainer>

                    <ActionButtonsContainer>
                        {renderActionButtons()}
                    </ActionButtonsContainer>
                </HeaderRight>
            </SliderHeader>

            <ProgressContainer>
                <ProgressBar>
                    <ProgressFill $progress={progress} />
                </ProgressBar>
            </ProgressContainer>
        </SliderContainer>
    );
};