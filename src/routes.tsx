// src/routes.tsx - FIXED VERSION with Toast Provider
import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
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
import FinancialPageWithFixedCosts from "./pages/Finances/FinancialPageWithFixedCosts";
import SettingsPageWithTabs from './pages/Settings/SettingsPageWithTabs';
import ClientsVehiclesPage from './pages/Clients/ClientsVehiclesPage';
import VehicleDetailPage from "./pages/Clients/components/VehicleDetailPage/VehicleDetailPage";

// Toast Provider import
import { ToastProvider } from './components/common/Toast/Toast';

// Lazy load recurring events pages for better performance
const RecurringEventsPage = React.lazy(() => import('./pages/RecurringEvents/RecurringEventsPage'));
const RecurringEventDetailsPage = React.lazy(() => import('./pages/RecurringEvents/RecurringEventDetailsPage'));
const RecurringEventOccurrencesPage = React.lazy(() => import('./pages/RecurringEvents/RecurringEventOccurrencesPage'));

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
    <div style={{ padding: "20px" }}>
        <h1>{title}</h1>
        <p>Ta strona jest w trakcie implementacji</p>
    </div>
);

// Loading component for lazy-loaded routes
const PageLoadingFallback: React.FC = () => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        flexDirection: 'column',
        gap: '1rem'
    }}>
        <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e2e8f0',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#64748b' }}>Ładowanie...</p>
        <style>{`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

const AppRoutes: React.FC = () => {
    return (
        <ToastProvider>
            <Routes>
                <Route path="/login" element={<ModernLoginPage />} />
                <Route path="/welcome" element={<OnboardingPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Navigate to="/calendar" replace />} />

                    {/* Calendar Routes */}
                    <Route path="/calendar" element={<CalendarPage />} />

                    {/* Activity Feed */}
                    <Route path="/activity" element={<ActivityFeedPage />} />

                    {/* Finances */}
                    <Route path="/finances" element={<FinancialPageWithFixedCosts />} />

                    {/* Clients & Vehicles */}
                    <Route path="/clients-vehicles" element={<ClientsVehiclesPage />} />
                    <Route path="/vehicle/:id" element={<VehicleDetailPage />} />
                    <Route path="/clients/owners" element={<Navigate to="/clients-vehicles?tab=owners" replace />} />
                    <Route path="/clients/vehicles" element={<Navigate to="/clients-vehicles?tab=vehicles" replace />} />

                    {/* Warehouse */}
                    <Route path="/warehouse" element={<PlaceholderPage title="Magazyn" />} />

                    {/* Settings & Team */}
                    <Route path="/settings" element={<SettingsPageWithTabs />} />
                    <Route path="/team" element={<EmployeesPage />} />

                    {/* Visits/Protocols Routes */}
                    <Route path="/visits" element={<CarReceptionPage />} />
                    <Route path="/visits/:id" element={<ProtocolDetailsPage />} />
                    <Route path="/visits/:id/open" element={<StartVisitPage />} />

                    {/* ======================================================================================== */}
                    {/* RECURRING EVENTS ROUTES - New Module */}
                    {/* ======================================================================================== */}
                    <Route path="/recurring-events" element={
                        <Suspense fallback={<PageLoadingFallback />}>
                            <RecurringEventsPage />
                        </Suspense>
                    } />

                    <Route path="/recurring-events/:eventId" element={
                        <Suspense fallback={<PageLoadingFallback />}>
                            <RecurringEventDetailsPage />
                        </Suspense>
                    } />

                    <Route path="/recurring-events/:eventId/occurrences" element={
                        <Suspense fallback={<PageLoadingFallback />}>
                            <RecurringEventOccurrencesPage />
                        </Suspense>
                    } />

                    {/* SMS Routes */}
                    <Route path="/sms" element={<SmsMainPage />} />
                    <Route path="/sms/dashboard" element={<Navigate to="/sms" replace />} />
                    <Route path="/sms/messages" element={<SmsMainPage />} />
                    <Route path="/sms/templates" element={<SmsMainPage />} />
                    <Route path="/sms/campaigns" element={<SmsMainPage />} />
                    <Route path="/sms/automations" element={<SmsMainPage />} />
                    <Route path="/sms/stats" element={<SmsMainPage />} />
                    <Route path="/sms/settings" element={<SmsMainPage />} />

                    {/* Fleet Routes */}
                    <Route path="/fleet/vehicles" element={<FleetVehiclesPage />} />
                    <Route path="/fleet/vehicles/:id" element={<FleetVehicleDetailsPage />} />
                    <Route path="/fleet/vehicles/new" element={<FleetVehicleFormPage />} />
                    <Route path="/fleet/vehicles/edit/:id" element={<FleetVehicleFormPage />} />
                    <Route path="/fleet/vehicles/:id/maintenance/new" element={<FleetMaintenanceFormPage />} />
                    <Route path="/fleet/vehicles/:id/fuel/new" element={<FleetMaintenanceFormPage fuel />} />
                    <Route path="/fleet/calendar" element={<FleetCalendarPage />} />
                    <Route path="/fleet/rentals" element={<FleetRentalsPage />} />
                    <Route path="/fleet/rentals/:id" element={<FleetRentalDetailsPage />} />
                    <Route path="/fleet/rentals/new" element={<FleetRentalFormPage />} />
                    <Route path="/fleet/mobile/vehicle/:id" element={<FleetMobileUpdatePage />} />
                    <Route path="/fleet/mobile/rental/:id/return" element={<FleetMobileRentalReturnPage />} />

                    {/* Gallery */}
                    <Route path="/gallery" element={<GalleryPage />} />

                    {/* Tablets */}
                    <Route path="/tablets" element={<TabletIntegrationPage />} />

                </Route>

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </ToastProvider>
    );
};

export default AppRoutes;