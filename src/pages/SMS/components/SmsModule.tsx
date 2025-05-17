// src/pages/SMS/SmsModule.tsx - poprawiona wersja
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SmsMainPage from './SmsMainPage';
import SmsModalsContainer from './components/modals/SmsModalsContainer';
import { SmsProvider } from '../../hooks/useSmsContext'; // Import providera kontekstu

/**
 * Główny komponent modułu SMS
 * Zawiera routing wewnętrzny, providera kontekstu oraz kontener modali
 */
const SmsModule: React.FC = () => {
    return (
        // Opakowanie całego modułu w provider kontekstu SMS
        <SmsProvider>
            <SmsModalsContainer>
                <Routes>
                    <Route path="/" element={<Navigate to="/sms/dashboard" replace />} />
                    <Route path="/*" element={<SmsMainPage />} />
                </Routes>
            </SmsModalsContainer>
        </SmsProvider>
    );
};

export default SmsModule;