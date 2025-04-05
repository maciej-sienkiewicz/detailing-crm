import { useState, useEffect } from 'react';
import { CarReceptionProtocol, ProtocolStatus, VehicleImage } from '../../../../types';
import { FormErrors, useFormValidation } from './useFormValidation';
import { ReferralSource } from '../components/ReferralSourceSection';

interface UseFormDataResult {
    formData: Partial<CarReceptionProtocol>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<CarReceptionProtocol>>>;
    errors: FormErrors;
    validateForm: () => boolean;
    clearFieldError: (fieldName: string) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleReferralSourceChange: (source: ReferralSource | null) => void;
    handleOtherSourceDetailsChange: (details: string) => void;
    handleImagesChange: (images: VehicleImage[]) => void;
}

// Funkcja pomocnicza do inicjalizacji dat z odpowiednim formatem
const initializeDates = () => {
    const today = new Date().toISOString().split('T')[0];
    const startTime = '08:00:00'; // Domyślna godzina rozpoczęcia - 8:00 rano
    const endTime = '23:59:59';   // Koniec dnia dla daty zakończenia

    return {
        startDate: `${today}T${startTime}`,
        endDate: `${today}T${endTime}`
    };
};

export const useFormData = (
    protocol: CarReceptionProtocol | null,
    initialData?: Partial<CarReceptionProtocol>
): UseFormDataResult => {
    // Inicjalizacja formularza z danymi protokołu, danymi z wizyty lub pustym obiektem
    const [formData, setFormData] = useState<Partial<CarReceptionProtocol>>(
        protocol || initialData || {
            ...initializeDates(),
            title: '',
            licensePlate: '',
            make: '',
            model: '',
            productionYear: new Date().getFullYear(),
            mileage: 0,
            keysProvided: true,
            documentsProvided: true,
            ownerName: '',
            companyName: '',
            taxId: '',
            email: '',
            phone: '',
            notes: '',
            selectedServices: [],
            status: ProtocolStatus.SCHEDULED,
            vehicleImages: [],
            referralSource: undefined,
            otherSourceDetails: ''
        }
    );

    // Użycie custom hooka walidacji
    const { errors, validateForm, clearFieldError } = useFormValidation(formData);

    // Efekt do obsługi startDate z kalendarza
// W pliku src/pages/Protocols/form/hooks/useFormData.ts (linia około 49)
// W useEffect obsługującym inicjalizację daty

// W pliku src/pages/Protocols/form/hooks/useFormData.ts (linia około 49)
// W useEffect obsługującym inicjalizację daty

    useEffect(() => {
        if (initialData?.startDate) {
            // Logujemy wartość daty początkowej dla celów diagnostycznych
            console.log('Inicjalizacja formularza z datą początkową:', initialData.startDate);

            // Sprawdzamy format daty
            let startDateWithTime: string = initialData.startDate;

            // Jeśli mamy pełną datę ISO, używamy jej bezpośrednio
            if (startDateWithTime.includes('T')) {
                // Data już ma format ISO z czasem, nie modyfikujemy
                console.log('Użycie pełnej daty ISO z czasem');
            } else {
                // Jeśli mamy tylko datę YYYY-MM-DD, dodajemy domyślny czas (8:00)
                startDateWithTime = `${startDateWithTime}T08:00:00`;
                console.log('Dodanie domyślnego czasu 08:00 do daty');
            }

            // Dla endDate zawsze ustawiamy koniec dnia
            let endDateWithTime: string;

            if (initialData.endDate) {
                endDateWithTime = initialData.endDate;

                if (!endDateWithTime.includes('T')) {
                    // Jeśli endDate jest tylko datą (YYYY-MM-DD), dodajemy koniec dnia
                    endDateWithTime = `${endDateWithTime}T23:59:59`;
                } else if (!endDateWithTime.endsWith('23:59:59')) {
                    // Jeśli już ma czas, ale nie jest to koniec dnia, zmieniamy na koniec dnia
                    endDateWithTime = `${endDateWithTime.split('T')[0]}T23:59:59`;
                }
            } else {
                // Jeśli nie ma endDate, ustawiamy na ten sam dzień co startDate, ale na koniec dnia
                endDateWithTime = `${startDateWithTime.split('T')[0]}T23:59:59`;
            }

            console.log('Ustawiona data końcowa:', endDateWithTime);

            setFormData(prev => ({
                ...prev,
                startDate: startDateWithTime,
                endDate: endDateWithTime
            }));
        }
    }, [initialData?.startDate, initialData?.endDate]);

    // Obsługuje zmianę danych formularza
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            setFormData({
                ...formData,
                [name]: checkbox.checked
            });
        } else if (name === 'productionYear' || name === 'mileage') {
            setFormData({
                ...formData,
                [name]: value ? parseInt(value, 10) : 0
            });
        } else if (name === 'startDate' || name === 'endDate') {
            // Specjalna obsługa dla pól daty, które teraz zawierają również czas
            setFormData({
                ...formData,
                [name]: value // Wartość już powinna być w formacie ISO
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }

        // Usuwanie błędów przy edycji pola
        clearFieldError(name);
    };

    // Obsługa zmiany źródła polecenia
    const handleReferralSourceChange = (source: ReferralSource | null) => {
        // Use type assertion to tell TypeScript this is a valid value
        const referralValue = source as CarReceptionProtocol['referralSource'];

        setFormData({
            ...formData,
            referralSource: referralValue
        });
    };

    // Obsługa zmiany szczegółów innego źródła
    const handleOtherSourceDetailsChange = (details: string) => {
        setFormData({
            ...formData,
            otherSourceDetails: details
        });
    };

    // Obsługa aktualizacji zdjęć
    const handleImagesChange = (images: VehicleImage[]) => {
        setFormData(prev => ({
            ...prev,
            vehicleImages: images
        }));
    };

    return {
        formData,
        setFormData,
        errors,
        validateForm,
        clearFieldError,
        handleChange,
        handleReferralSourceChange,
        handleOtherSourceDetailsChange,
        handleImagesChange
    };
};