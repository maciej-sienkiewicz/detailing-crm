// src/pages/SMS/components/modals/automation-common/AutomationUtils.ts
import { SmsAutomationTrigger } from '../../../../../types/sms';
import { AutomationFormValues } from '../automation-types';

/**
 * Generuje domyślne parametry dla różnych typów wyzwalaczy automatyzacji SMS
 */
export const getDefaultTriggerParameters = (trigger: SmsAutomationTrigger): Record<string, any> => {
    switch (trigger) {
        case SmsAutomationTrigger.BEFORE_APPOINTMENT:
            return { days: 1 };
        case SmsAutomationTrigger.AFTER_APPOINTMENT:
            return { days: 1 };
        case SmsAutomationTrigger.STATUS_CHANGE:
            return { status: 'completed' };
        case SmsAutomationTrigger.CLIENT_BIRTHDAY:
            return {
                time: '09:00',
                withDiscount: false,
                discountCode: '',
                discountValue: 0
            };
        case SmsAutomationTrigger.NO_VISIT_PERIOD:
            return { months: 3 };
        case SmsAutomationTrigger.INVOICE_STATUS_CHANGE:
            return { status: 'overdue' };
        case SmsAutomationTrigger.VEHICLE_ANNIVERSARY:
            return { years: 1 };
        case SmsAutomationTrigger.VEHICLE_MILEAGE:
            return { mileage: 10000 };
        default:
            return {};
    }
};

/**
 * Waliduje parametry wyzwalacza automatyzacji SMS
 */
export const validateTriggerParameters = (
    automation: Partial<AutomationFormValues>,
    showErrorToast: (message: string) => void
): boolean => {
    const { trigger, triggerParameters } = automation;

    if (!trigger || !triggerParameters) return false;

    switch (trigger) {
        case SmsAutomationTrigger.BEFORE_APPOINTMENT:
        case SmsAutomationTrigger.AFTER_APPOINTMENT:
            if (!triggerParameters.days || triggerParameters.days < 1) {
                showErrorToast('Liczba dni musi być większa od 0');
                return false;
            }
            break;
        case SmsAutomationTrigger.CLIENT_BIRTHDAY:
            if (triggerParameters.withDiscount && !triggerParameters.discountCode) {
                showErrorToast('Podaj kod rabatowy');
                return false;
            }
            break;
        case SmsAutomationTrigger.NO_VISIT_PERIOD:
            if (!triggerParameters.months || triggerParameters.months < 1) {
                showErrorToast('Liczba miesięcy musi być większa od 0');
                return false;
            }
            break;
        case SmsAutomationTrigger.VEHICLE_MILEAGE:
            if (!triggerParameters.mileage || triggerParameters.mileage < 1000) {
                showErrorToast('Przebieg musi być większy od 1000 km');
                return false;
            }
            break;
    }

    return true;
};

/**
 * Generuje opis dla danego wyzwalacza automatyzacji
 */
export const getTriggerDescription = (trigger: SmsAutomationTrigger): string => {
    switch (trigger) {
        case SmsAutomationTrigger.BEFORE_APPOINTMENT:
            return 'Automatyzacja wysyła wiadomość określoną liczbę dni przed zaplanowaną wizytą.';
        case SmsAutomationTrigger.AFTER_APPOINTMENT:
            return 'Automatyzacja wysyła wiadomość określoną liczbę dni po zakończonej wizycie.';
        case SmsAutomationTrigger.STATUS_CHANGE:
            return 'Automatyzacja wysyła wiadomość gdy status zlecenia zmienia się na określoną wartość.';
        case SmsAutomationTrigger.CLIENT_BIRTHDAY:
            return 'Automatyzacja wysyła wiadomość w dniu urodzin klienta, opcjonalnie z kodem rabatowym.';
        case SmsAutomationTrigger.NO_VISIT_PERIOD:
            return 'Automatyzacja wysyła wiadomość gdy klient nie odwiedził warsztatu przez określony czas.';
        case SmsAutomationTrigger.INVOICE_STATUS_CHANGE:
            return 'Automatyzacja wysyła wiadomość gdy status faktury zmienia się na określoną wartość.';
        case SmsAutomationTrigger.VEHICLE_ANNIVERSARY:
            return 'Automatyzacja wysyła wiadomość w rocznicę pierwszej wizyty pojazdu w warsztacie.';
        case SmsAutomationTrigger.VEHICLE_MILEAGE:
            return 'Automatyzacja wysyła wiadomość gdy przebieg pojazdu przekroczy określoną wartość.';
        default:
            return 'Niestandardowa automatyzacja wiadomości SMS.';
    }
};