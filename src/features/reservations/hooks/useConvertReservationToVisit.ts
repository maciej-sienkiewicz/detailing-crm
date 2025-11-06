// src/features/reservations/hooks/useConvertReservationToVisit.ts
/**
 * Hook for converting reservation to full visit
 * FULLY CORRECTED VERSION - matching backend expectations
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Reservation, reservationsApi, ConvertToVisitRequest } from '../api/reservationsApi';

interface UseConvertReservationToVisitProps {
    reservation: Reservation;
    onSuccess?: (visitId: string) => void;
    onError?: (error: string) => void;
}

// ReferralSource type matching the backend
type ReferralSource = 'regular_customer' | 'recommendation' | 'search_engine' | 'social_media' | 'local_ad' | 'other';

export interface ConvertFormData {
    // Fields from reservation (pre-filled, editable)
    title: string;
    calendarColorId: string;
    startDate: string;
    endDate?: string;
    vehicleMake: string;
    vehicleModel: string;
    contactPhone: string;
    contactName?: string;
    notes?: string;

    // New required fields for visit
    ownerName: string;
    ownerId?: number;
    email?: string;
    phone: string;
    companyName?: string;
    taxId?: string;
    address?: string;

    // Vehicle details
    licensePlate: string;
    productionYear?: number;
    vin?: string;
    color?: string;
    mileage?: number;

    // Reception details
    keysProvided: boolean;
    documentsProvided: boolean;
    additionalNotes?: string;

    // Referral - using proper type
    referralSource?: ReferralSource;
    otherSourceDetails?: string;

    // Services - using SelectedService structure
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

    /**
     * Initialize form data from reservation
     */
    const getInitialFormData = useCallback((): ConvertFormData => {
        return {
            // From reservation
            title: reservation.title,
            calendarColorId: reservation.calendarColorId,
            startDate: reservation.startDate,
            endDate: reservation.endDate,
            vehicleMake: reservation.vehicleMake,
            vehicleModel: reservation.vehicleModel,
            contactPhone: reservation.contactPhone,
            contactName: reservation.contactName,
            notes: reservation.notes,

            // New required fields (empty, to be filled)
            ownerName: reservation.contactName || '',
            phone: reservation.contactPhone,
            email: '',
            companyName: '',
            taxId: '',
            address: '',

            // Vehicle details (empty, to be filled)
            licensePlate: '',
            productionYear: undefined,
            vin: '',
            color: '',
            mileage: undefined,

            // Reception details (defaults)
            keysProvided: false,
            documentsProvided: false,
            additionalNotes: '',

            // Referral (undefined - will not be sent if not selected)
            referralSource: undefined,
            otherSourceDetails: ''
        };
    }, [reservation]);

    /**
     * Convert reservation to visit
     */
    const convertToVisit = async (formData: ConvertFormData): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            console.log('🔄 Converting reservation to visit:', reservation.id);

            // Use services from formData if provided, otherwise from reservation
            const servicesToConvert = formData.services || reservation.services;

            // Prepare request - CORRECTED: backend expects CalculatedPriceDto structure
            const request: ConvertToVisitRequest = {
                title: formData.title,
                calendarColorId: formData.calendarColorId,
                startDate: formData.startDate,
                endDate: formData.endDate,
                referralSource: formData.referralSource,
                otherSourceDetails: formData.otherSourceDetails,

                // Owner data
                ownerName: formData.ownerName,
                ownerId: formData.ownerId,
                email: formData.email,
                phone: formData.phone,
                companyName: formData.companyName,
                taxId: formData.taxId,
                address: formData.address,

                // Vehicle data
                licensePlate: formData.licensePlate,
                make: formData.vehicleMake,
                model: formData.vehicleModel,
                productionYear: formData.productionYear,
                vin: formData.vin,
                color: formData.color,
                mileage: formData.mileage,

                // Services - CRITICAL FIX: Use CalculatedPriceDto structure
                selectedServices: servicesToConvert.map(service => ({
                    id: service.id,
                    name: service.name,
                    basePrice: {
                        // Backend expects CalculatedPriceDto with these exact fields
                        priceNetto: service.basePrice.priceNetto,
                        priceBrutto: service.basePrice.priceBrutto,
                        taxAmount: service.basePrice.taxAmount
                    },
                    quantity: service.quantity,
                    vatRate: 23, // Default VAT rate
                    discountType: 'PERCENTAGE',
                    discountValue: 0,
                    note: service.note || null
                })),

                // Reception details
                keysProvided: formData.keysProvided,
                documentsProvided: formData.documentsProvided,
                additionalNotes: formData.additionalNotes,
                notes: formData.notes
            };

            console.log('📤 Convert request:', request);
            console.log('📤 Services to send:', request.selectedServices);

            // Call API
            const visitResponse = await reservationsApi.convertToVisit(
                reservation.id,
                request
            );

            console.log('✅ Reservation converted to visit:', visitResponse);

            // Success callback
            if (onSuccess) {
                onSuccess(visitResponse.id);
            } else {
                // Default: navigate to visit details
                navigate(`/visits/${visitResponse.id}`);
            }

            return true;

        } catch (err) {
            console.error('❌ Error converting reservation:', err);

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