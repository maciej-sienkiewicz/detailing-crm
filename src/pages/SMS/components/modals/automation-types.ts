// src/pages/SMS/components/modals/automation-types.ts
import {SmsAutomation, SmsAutomationTrigger, SmsTemplate} from '../../../../types/sms';

/**
 * Interfejs dla wartości formularza automatyzacji
 */
export interface AutomationFormValues extends Partial<SmsAutomation> {
    // Dodatkowe pola formularza, które nie są częścią SmsAutomation
}

/**
 * Interfejs dla komponentu kroku 1 - informacje podstawowe
 */
export interface Step1Props {
    automation: Partial<AutomationFormValues>;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNext: () => void;
    onCancel: () => void;
}

/**
 * Interfejs dla komponentu kroku 2 - ustawienia wyzwalacza
 */
export interface Step2Props {
    automation: Partial<AutomationFormValues>;
    onTriggerChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onTriggerParameterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    getDefaultTriggerParameters: (trigger: SmsAutomationTrigger) => Record<string, any>;
    onPrevious: () => void;
    onNext: () => void;
}

/**
 * Interfejs dla komponentu kroku 3 - szablon i podsumowanie
 */
export interface Step3Props {
    automation: Partial<AutomationFormValues>;
    templates: SmsTemplate[];
    selectedTemplate: SmsTemplate | null;
    isLoadingTemplates: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onPrevious: () => void;
    onSave: () => void;
    isLoading: boolean;
}

/**
 * Interfejs dla stylizowanego przycisku
 */
export interface ButtonProps {
    primary?: boolean;
    disabled?: boolean;
}

/**
 * Interfejs dla opcji wyzwalacza
 */
export interface TriggerOptionProps {
    selected?: boolean;
}

/**
 * Interfejs dla etykiety statusu
 */
export interface StatusValueProps {
    active?: boolean;
}

/**
 * Interfejs dla elementu podsumowania
 */
export interface SummaryItemProps {
    fullWidth?: boolean;
}