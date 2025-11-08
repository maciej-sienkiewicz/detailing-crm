import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Reservation, reservationsApi, ConvertToVisitRequest, Discount } from '../api/reservationsApi';
import { parseDateFromBackend, formatDateForAPI } from '../libs/utils';

interface UseConvertReservationToVisitProps {
    reservation: Reservation;
    onSuccess?: (visitId: string) => void;
    onError?: (error: string) => void;
}

type ReferralSource = 'regular_customer' | 'recommendation' | 'search_engine' | 'social_media' | 'local_ad' | 'other';

export interface ConvertFormData {
    title: string;
    calendarColorId: string;
    startDate: string;
    endDate?: string;
    vehicleMake: string;
    vehicleModel: string;
    contactPhone: string;
    contactName?: string;
    notes?: string;

    ownerName: string;
    ownerId?: number;
    email?: string;
    phone: string;
    companyName?: string;
    taxId?: string;
    address?: string;

    make: string;
    model: string;

    licensePlate: string;
    productionYear?: number;
    vin?: string;
    color?: string;
    mileage?: number;

    keysProvided: boolean;
    documentsProvided: boolean;
    additionalNotes?: string;

    referralSource?: ReferralSource;
    otherSourceDetails?: string;

    services?: Array<{
        id: string;
        name: string;
        quantity: number;
        basePrice: {
            priceNetto: number;
            priceBrutto: number;
            taxAmount: number;
        };
        discountType: any;
        discountValue: number;
        finalPrice: {
            priceNetto: number;
            priceBrutto: number;
            taxAmount: number;
        };
        note?: string;
    }>;
}

export const useConvertReservationToVisit = ({
                                                 reservation,
                                                 onSuccess,
                                                 onError
                                             }: UseConvertReservationToVisitProps) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getInitialFormData = useCallback((): ConvertFormData => {
        return {
            title: reservation.title,
            calendarColorId: reservation.calendarColorId,
            startDate: parseDateFromBackend(reservation.startDate),
            endDate: parseDateFromBackend(reservation.endDate),
            vehicleMake: reservation.vehicleMake,
            vehicleModel: reservation.vehicleModel,
            contactPhone: reservation.contactPhone,
            contactName: reservation.contactName,
            notes: reservation.notes,

            ownerName: reservation.contactName || '',
            phone: reservation.contactPhone,
            email: '',
            companyName: '',
            taxId: '',
            address: '',

            licensePlate: '',
            make: reservation.vehicleMake,
            model: reservation.vehicleModel,
            productionYear: undefined,
            vin: '',
            color: '',
            mileage: undefined,

            keysProvided: false,
            documentsProvided: false,
            additionalNotes: '',

            referralSource: undefined,
            otherSourceDetails: ''
        };
    }, [reservation]);

    const convertToVisit = async (formData: ConvertFormData): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const servicesToConvert = formData.services || reservation.services;

            const request: ConvertToVisitRequest = {
                title: formData.title,
                calendarColorId: formData.calendarColorId,
                startDate: formatDateForAPI(formData.startDate),
                endDate: formData.endDate ? formatDateForAPI(formData.endDate) : undefined,
                referralSource: formData.referralSource,
                otherSourceDetails: formData.otherSourceDetails,

                ownerName: formData.ownerName,
                ownerId: formData.ownerId,
                email: formData.email,
                phone: formData.phone,
                companyName: formData.companyName,
                taxId: formData.taxId,
                address: formData.address,

                licensePlate: formData.licensePlate,
                make: formData.vehicleMake,
                model: formData.vehicleModel,
                productionYear: formData.productionYear,
                vin: formData.vin,
                color: formData.color,
                mileage: formData.mileage,

                selectedServices: servicesToConvert.map(service => {
                    const hasDiscount = 'discountValue' in service && service.discountValue > 0;

                    const discount: Discount | null = hasDiscount ? {
                        discountType: service.discountType,
                        discountValue: service.discountValue
                    } : null;

                    return {
                        id: service.id,
                        name: service.name,
                        basePrice: {
                            priceNetto: service.basePrice.priceNetto,
                            priceBrutto: service.basePrice.priceBrutto,
                            taxAmount: service.basePrice.taxAmount
                        },
                        quantity: service.quantity,
                        vatRate: 23,
                        discount,
                        note: service.note || null
                    };
                }),

                keysProvided: formData.keysProvided,
                documentsProvided: formData.documentsProvided,
                additionalNotes: formData.additionalNotes,
                notes: formData.notes
            };

            const visitResponse = await reservationsApi.convertToVisit(
                reservation.id,
                request
            );

            if (onSuccess) {
                onSuccess(visitResponse.id);
            } else {
                navigate(`/visits/${visitResponse.id}`);
            }

            return true;

        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Nie udało się przekonwertować rezerwacji na wizytę. Spróbuj ponownie.';

            setError(errorMessage);

            if (onError) {
                onError(errorMessage);
            }

            return false;

        } finally {
            setLoading(false);
        }
    };

    return {
        getInitialFormData,
        convertToVisit,
        loading,
        error
    };
};