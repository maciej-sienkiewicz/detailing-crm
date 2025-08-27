// src/pages/Settings/components/companySettings/SectionSlider.tsx
import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import {
    SliderContainer,
    SliderHeader,
    SliderTitle,
    SliderSubtitle,
    NavigationContainer,
    NavButton,
    ProgressContainer,
    ProgressBar,
    ProgressFill,
    SectionIndicators,
    SectionDot
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
}

export const SectionSlider: React.FC<SectionSliderProps> = ({
                                                                sections,
                                                                currentIndex,
                                                                onPrevious,
                                                                onNext,
                                                                onSectionChange,
                                                                canNavigatePrev,
                                                                canNavigateNext
                                                            }) => {
    const currentSection = sections[currentIndex];
    const progress = ((currentIndex + 1) / sections.length) * 100;

    return (
        <SliderContainer>
            <SliderHeader>
                <div>
                    <SliderTitle>{currentSection.title}</SliderTitle>
                    <SliderSubtitle>{currentSection.subtitle}</SliderSubtitle>
                </div>

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
            </SliderHeader>

            <ProgressContainer>
                <ProgressBar>
                    <ProgressFill $progress={progress} />
                </ProgressBar>
            </ProgressContainer>
        </SliderContainer>
    );
};