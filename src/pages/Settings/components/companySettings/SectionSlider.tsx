// src/pages/Settings/components/companySettings/SectionSlider.tsx - Zaktualizowana wersja
import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaEdit, FaSave, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { NavigationGuardModal } from '../../../../components/common/NavigationGuardModal';
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
    onShowInstruction?: () => void;
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
                                                                showEditControls = false,
                                                                onShowInstruction
                                                            }) => {
    const [showNavigationGuard, setShowNavigationGuard] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

    const currentSection = sections[currentIndex];
    const progress = ((currentIndex + 1) / sections.length) * 100;

    // Function to handle navigation with guard check
    const handleNavigationAttempt = (navigationAction: () => void) => {
        if (isEditing) {
            setPendingNavigation(() => navigationAction);
            setShowNavigationGuard(true);
        } else {
            // Allow navigation
            navigationAction();
        }
    };

    // Handle navigation confirmation
    const handleConfirmNavigation = () => {
        setShowNavigationGuard(false);

        // Cancel current editing first
        if (onCancel) {
            onCancel();
        }

        // Then execute pending navigation
        if (pendingNavigation) {
            pendingNavigation();
            setPendingNavigation(null);
        }
    };

    // Handle navigation cancellation
    const handleCancelNavigation = () => {
        setShowNavigationGuard(false);
        setPendingNavigation(null);
    };

    // Wrapped navigation functions
    const handlePreviousClick = () => {
        handleNavigationAttempt(onPrevious);
    };

    const handleNextClick = () => {
        handleNavigationAttempt(onNext);
    };

    const handleSectionClick = (index: number) => {
        handleNavigationAttempt(() => onSectionChange(index));
    };

    const renderInstructionButton = () => {
        if (currentSection.id === 'google-drive' && onShowInstruction) {
            return (
                <ActionButton
                    $secondary
                    onClick={onShowInstruction}
                    disabled={saving}
                >
                    <FaInfoCircle />
                    Instrukcja
                </ActionButton>
            );
        }
        return null;
    };

    const renderActionButtons = () => {
        if (!showEditControls) return null;

        if (isEditing) {
            return (
                <>
                    <ActionButton
                        $secondary
                        onClick={onCancel}
                        disabled={saving}
                    >
                        <FaTimes />
                        Anuluj
                    </ActionButton>
                    <ActionButton
                        $primary
                        onClick={onSave}
                        disabled={saving}
                    >
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
        <>
            <SliderContainer>
                <SliderHeader>
                    <HeaderLeft>
                        <SliderTitle>{currentSection.title}</SliderTitle>
                        <SliderSubtitle>{currentSection.subtitle}</SliderSubtitle>
                    </HeaderLeft>

                    <HeaderRight>
                        <ActionButtonsContainer>
                            {renderInstructionButton()}
                            {renderActionButtons()}
                        </ActionButtonsContainer>
                        <NavigationContainer>
                            <NavButton
                                onClick={handlePreviousClick}
                                disabled={!canNavigatePrev || saving}
                                $disabled={!canNavigatePrev || saving}
                                title={isEditing ? "Anuluj zmiany aby przejść do poprzedniej sekcji" : "Poprzednia sekcja"}
                            >
                                <FaChevronLeft />
                            </NavButton>

                            <SectionIndicators>
                                {sections.map((_, index) => (
                                    <SectionDot
                                        key={index}
                                        $active={index === currentIndex}
                                        onClick={() => handleSectionClick(index)}
                                        disabled={saving}
                                        title={
                                            isEditing
                                                ? "Anuluj zmiany aby przejść do innej sekcji"
                                                : `Przejdź do sekcji: ${sections[index].title}`
                                        }
                                        style={{
                                            cursor: saving ? 'not-allowed' : 'pointer',
                                            opacity: saving ? 0.5 : 1
                                        }}
                                    />
                                ))}
                            </SectionIndicators>

                            <NavButton
                                onClick={handleNextClick}
                                disabled={!canNavigateNext || saving}
                                $disabled={!canNavigateNext || saving}
                                title={isEditing ? "Anuluj zmiany aby przejść do następnej sekcji" : "Następna sekcja"}
                            >
                                <FaChevronRight />
                            </NavButton>
                        </NavigationContainer>
                    </HeaderRight>
                </SliderHeader>

                <ProgressContainer>
                    <ProgressBar>
                        <ProgressFill $progress={progress} />
                    </ProgressBar>
                </ProgressContainer>
            </SliderContainer>

            {/* Modal potwierdzający nawigację */}
            <NavigationGuardModal
                isOpen={showNavigationGuard}
                onConfirm={handleConfirmNavigation}
                onCancel={handleCancelNavigation}
                title="Niezapisane zmiany"
                message="Masz niezapisane zmiany w tej sekcji. Przejście do innej sekcji spowoduje utratę zmian. Czy na pewno chcesz kontynuować?"
            />
        </>
    );
};