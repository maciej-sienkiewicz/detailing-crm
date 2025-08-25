// src/routes.tsx - Updated to include unified Clients/Vehicles
import React from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import CalendarPage from './pages/Calendar/CalendarPage';
import EmployeesPage from './pages/Settings/EmployeesPage';
import CarReceptionPage from './pages/Protocols/CarReceptionPage';
import ActivityFeedPage from "./pages/ActivityFeed/ActivityFeedPage";
import ProtocolDetailsPage from "./pages/Protocols/details/ProtocolDetailsPage";
import StartVisitPage from "./pages/Protocols/start-visit/StartVisitPage";
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
import GalleryPage from "./pages/Gallery/GalleryPage";
import TabletIntegrationPage from "./pages/Tablets/TabletIntegrationPage";

// Updated Financial imports
import FinancialPageWithFixedCosts from "./pages/Finances/FinancialPageWithFixedCosts";
import SettingsPageWithTabs from './pages/Settings/SettingsPageWithTabs';

// NEW: Unified Clients/Vehicles component
import ClientsVehiclesPage from './pages/Clients/ClientsVehiclesPage';

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
                <Route path="/finances" element={<FinancialPageWithFixedCosts />} />

                {/* UPDATED: Unified Clients/Vehicles page */}
                <Route path="/clients-vehicles" element={<ClientsVehiclesPage />} />

                {/* DEPRECATED: Redirects for old routes - for backward compatibility */}
                <Route path="/clients/owners" element={<Navigate to="/clients-vehicles?tab=owners" replace />} />
                <Route path="/clients/vehicles" element={<Navigate to="/clients-vehicles?tab=vehicles" replace />} />

                {/* Inne strony */}
                <Route path="/warehouse" element={<PlaceholderPage title="Magazyn" />} />

                {/* Strony ustawień */}
                <Route path="/settings" element={<SettingsPageWithTabs />} />

                <Route path="/team" element={<EmployeesPage />} />

                {/* Wizyty i protokoły */}
                <Route path="/visits" element={<CarReceptionPage />} />
                <Route path="/visits/:id" element={<ProtocolDetailsPage />} />
                <Route path="/visits/:id/open" element={<StartVisitPage />} />

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
                <Route path="/fleet/calendar" element={<FleetCalendarPage />} />
                <Route path="/fleet/rentals" element={<FleetRentalsPage />} />
                <Route path="/fleet/rentals/:id" element={<FleetRentalDetailsPage />} />
                <Route path="/fleet/rentals/new" element={<FleetRentalFormPage />} />

                {/* Interfejs mobilny */}
                <Route path="/fleet/mobile/vehicle/:id" element={<FleetMobileUpdatePage />} />
                <Route path="/fleet/mobile/rental/:id/return" element={<FleetMobileRentalReturnPage />} />

                <Route path="/gallery" element={<GalleryPage />} />

                <Route path="/tablets" element={<TabletIntegrationPage />} />

            </Route>

            {/* Strona 404 - nieistniejąca ścieżka */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;