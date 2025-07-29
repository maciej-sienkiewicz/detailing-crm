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
    isClientFromSearch: boolean;
    setIsClientFromSearch: (value: boolean) => void;
}

const initializeDates = () => {
    const today = new Date().toISOString().split('T')[0];
    const startTime = '08:00:00';
    const endTime = '23:59:59';

    return {
        startDate: `${today}T${startTime}`,
        endDate: `${today}T${endTime}`
    };
};

export const useFormData = (
    protocol: CarReceptionProtocol | null,
    initialData?: Partial<CarReceptionProtocol>
): UseFormDataResult => {
    const [formData, setFormData] = useState<Partial<CarReceptionProtocol>>(
        protocol || initialData || {
            ...initializeDates(),
            title: '',
            calendarColorId: '',
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

    const [isClientFromSearch, setIsClientFromSearch] = useState(false);

    const { errors, validateForm, clearFieldError } = useFormValidation(formData);

    useEffect(() => {
        if (initialData?.startDate) {
            let startDateWithTime: string = initialData.startDate;

            if (startDateWithTime.includes('T')) {
                // Data już ma format ISO z czasem
            } else {
                startDateWithTime = `${startDateWithTime}T08:00:00`;
            }

            let endDateWithTime: string;

            if (initialData.endDate) {
                endDateWithTime = initialData.endDate;

                if (!endDateWithTime.includes('T')) {
                    endDateWithTime = `${endDateWithTime}T23:59:59`;
                } else if (!endDateWithTime.endsWith('23:59:59')) {
                    endDateWithTime = `${endDateWithTime.split('T')[0]}T23:59:59`;
                }
            } else {
                endDateWithTime = `${startDateWithTime.split('T')[0]}T23:59:59`;
            }

            setFormData(prev => ({
                ...prev,
                startDate: startDateWithTime,
                endDate: endDateWithTime
            }));
        }
    }, [initialData?.startDate, initialData?.endDate]);

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
            setFormData({
                ...formData,
                [name]: value
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }

        clearFieldError(name);
    };

    const handleReferralSourceChange = (source: ReferralSource | null) => {
        const referralValue = source as CarReceptionProtocol['referralSource'];

        setFormData({
            ...formData,
            referralSource: referralValue
        });
    };

    const handleOtherSourceDetailsChange = (details: string) => {
        setFormData({
            ...formData,
            otherSourceDetails: details
        });
    };

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
        handleImagesChange,
        isClientFromSearch,
        setIsClientFromSearch
    };
};