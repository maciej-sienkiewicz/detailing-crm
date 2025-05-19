// src/routes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CalendarPage from './pages/Calendar/CalendarPage';
import TaxesPage from './pages/Settings/TaxesPage';
import ServicesPage from './pages/Settings/ServicesPage';
import EmployeesPage from './pages/Settings/EmployeesPage';
import CarReceptionPage from './pages/Protocols/CarReceptionPage';
import OwnersPage from './pages/Clients/OwnersPage';
import VehiclesPage from './pages/Clients/VehiclesPage';
import ReportsPage from "./pages/Reports/ReportsPage";
import ActivityFeedPage from "./pages/ActivityFeed/ActivityFeedPage";
import ProtocolDetailsPage from "./pages/Protocols/details/ProtocolDetailsPage";
import StartVisitPage from "./pages/Protocols/start-visit/StartVisitPage";
import CalendarColorsPage from "./pages/Settings/CalendarColorsPage";
import InvoicesPage from "./pages/Finances/InvoicesPage";
import FinancialSummaryPage from "./pages/Finances/FinancialSummaryPage";
import MailPage from "./pages/Mail/MailPage";
import CashPage from "./pages/Finances/CashPage";
import ModernLoginPage from './pages/Auth/LoginPage';
import OnboardingPage from './pages/Auth/OnboardingPage';
import ProtectedRoute from './components/ProtectedRoute';
import SmsMainPage from "./pages/SMS/SmsMainPage";
import FleetVehiclesPage from "./pages/Fleet/FleetVehiclesPage";
import FleetVehicleDetailsPage from './pages/Fleet/FleetVehicleDetailsPage';
import FleetVehicleFormPage from './pages/Fleet/FleetVehicleFormPage';
import FleetMobileUpdatePage from "./pages/Fleet/FleetMobileUpdatePage";
import FleetMobileRentalReturnPage from "./pages/Fleet/FleetMobileRentalReturnPage";
import FleetMaintenanceFormPage from "./pages/Fleet/FleetMaintenanceFormPage";
import FleetRentalsPage from "./pages/Fleet/FleetRentalsPage";
import FleetRentalDetailsPage from "./pages/Fleet/FleetRentalDetailsPage";
import FleetRentalFormPage from "./pages/Fleet/FleetRentalFormPage";
import FleetCalendarPage from "./pages/Fleet/FleetCalendarPage";

// Tymczasowe komponenty dla innych stron - do zastąpienia rzeczywistymi implementacjami
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
    <div style={{ padding: "20px" }}>
        <h1>{title}</h1>
        <p>Ta strona jest w trakcie implementacji</p>
    </div>
);

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Publiczne ścieżki - bez layoutu */}
            <Route path="/login" element={<ModernLoginPage />} />
            <Route path="/welcome" element={<OnboardingPage />} />

            {/* Wszystkie chronione ścieżki z layoutem */}
            <Route element={<ProtectedRoute />}>
                {/* Przekierowanie z głównej strony do kalendarza */}
                <Route path="/" element={<Navigate to="/calendar" replace />} />

                {/* Strona kalendarza */}
                <Route path="/calendar" element={<CalendarPage />} />

                {/* Strona aktualności */}
                <Route path="/activity" element={<ActivityFeedPage />} />

                {/* Ścieżki finansowe */}
                <Route path="/finances" element={<Navigate to="/finances/invoices" replace />} />
                <Route path="/finances/invoices" element={<InvoicesPage />} />
                <Route path="/finances/cash" element={<CashPage />} />
                <Route path="/finances/reports" element={<FinancialSummaryPage />} />

                {/* Strona poczty - nowy moduł */}
                <Route path="/mail" element={<MailPage />} />

                {/* Strony klientów */}
                <Route path="/clients/owners" element={<OwnersPage />} />
                <Route path="/clients/vehicles" element={<VehiclesPage />} />

                {/* Inne strony */}
                <Route path="/warehouse" element={<PlaceholderPage title="Magazyn" />} />

                {/* Raporty */}
                <Route path="/reports" element={<ReportsPage />} />

                {/* Strony ustawień */}
                <Route path="/settings/calendar" element={<CalendarColorsPage />} />
                <Route path="/settings/taxes" element={<TaxesPage />} />
                <Route path="/settings/services" element={<ServicesPage />} />
                <Route path="/settings" element={<Navigate to="/settings/calendar" replace />} />

                <Route path="/team" element={<EmployeesPage />} />

                {/* Wizyty i protokoły */}
                <Route path="/orders" element={<CarReceptionPage />} />
                <Route path="/orders/car-reception/:id" element={<ProtocolDetailsPage />} />
                <Route path="/orders/start-visit/:id" element={<StartVisitPage />} />

                <Route path="/sms" element={<SmsMainPage />} />
                <Route path="/sms/dashboard" element={<Navigate to="/sms" replace />} />
                <Route path="/sms/messages" element={<SmsMainPage />} />
                <Route path="/sms/templates" element={<SmsMainPage />} />
                <Route path="/sms/campaigns" element={<SmsMainPage />} />
                <Route path="/sms/automations" element={<SmsMainPage />} />
                <Route path="/sms/stats" element={<SmsMainPage />} />
                <Route path="/sms/settings" element={<SmsMainPage />} />

                <Route path="/fleet/vehicles" element={<FleetVehiclesPage />} />
                <Route path="/fleet/vehicles/:id" element={<FleetVehicleDetailsPage />} />
                <Route path="/fleet/vehicles/new" element={<FleetVehicleFormPage />} />
                <Route path="/fleet/vehicles/edit/:id" element={<FleetVehicleFormPage />} />
                <Route path="/fleet/vehicles/:id/maintenance/new" element={<FleetMaintenanceFormPage />} />
                <Route path="/fleet/vehicles/:id/fuel/new" element={<FleetMaintenanceFormPage fuel />} />

                {/* Zarządzanie wypożyczeniami */}
                <Route path="/fleet/rentals" element={<FleetCalendarPage />} />
                <Route path="/fleet/rentals/:id" element={<FleetRentalDetailsPage />} />
                <Route path="/fleet/rentals/new" element={<FleetRentalFormPage />} />

                {/* Interfejs mobilny */}
                <Route path="/fleet/mobile/vehicle/:id" element={<FleetMobileUpdatePage />} />
                <Route path="/fleet/mobile/rental/:id/return" element={<FleetMobileRentalReturnPage />} />
            </Route>

            {/* Strona 404 - nieistniejąca ścieżka */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;