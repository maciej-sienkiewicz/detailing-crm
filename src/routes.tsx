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
import CashPage from "./pages/Finances/CashPage"; // Dodajemy import


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
            {/* Przekierowanie z głównej strony do kalendarza */}
            <Route path="/" element={<Navigate to="/calendar" replace />} />

            {/* Strona kalendarza */}
            <Route path="/calendar" element={<CalendarPage />} />

            {/* Strona aktualności */}
            <Route path="/activity" element={<ActivityFeedPage />} />

            <Route path="/finances" element={<Navigate to="/finances/invoices" replace />} />
            <Route path="/finances/invoices" element={<InvoicesPage />} />
            <Route path="/finances/cash" element={<CashPage/>} />
            <Route path="/finances/reports" element={<FinancialSummaryPage />} />

                {/* Strona poczty - nowy moduł */}
                <Route path="/mail" element={<MailPage />} />

            {/* Strony klientów */}
            <Route path="/clients/owners" element={<OwnersPage />} />
            <Route path="/clients/vehicles" element={<VehiclesPage />} />

            {/* Inne strony */}
            <Route path="/finances" element={<PlaceholderPage title="Finanse" />} />

            {/* Raporty */}
            <Route path="/reports" element={<ReportsPage />} />


            <Route path="/warehouse" element={<PlaceholderPage title="Magazyn" />} />
            {/* Strony ustawień */}
            <Route path="/settings/general" element={<CalendarColorsPage />} />
            <Route path="/settings/taxes" element={<TaxesPage />} />
            <Route path="/settings/services" element={<ServicesPage />} />
            <Route path="/settings" element={<Navigate to="/settings/general" replace />} />

            <Route path="/team" element={<EmployeesPage/>} />

                {/* Wizyty i protokoły */}
            <Route path="/orders" element={<CarReceptionPage />} />
            <Route path="/orders/car-reception/:id" element={<ProtocolDetailsPage />} />
            <Route path="/orders/start-visit/:id" element={<StartVisitPage />} /> {/* Dodajemy nową ścieżkę */}

            {/* Strona 404 - nieistniejąca ścieżka */}
            <Route path="*" element={<div>Strona nie istnieje</div>} />
        </Routes>
    );
};

export default AppRoutes;