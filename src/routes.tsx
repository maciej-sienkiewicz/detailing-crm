import CalendarPage from './pages/Calendar/CalendarPage';
import TaxesPage from './pages/Settings/TaxesPage';
import ServicesPage from './pages/Settings/ServicesPage';
import EmployeesPage from './pages/Settings/EmployeesPage';
import CarReceptionPage from './pages/Protocols/CarReceptionPage';
import ProtocolDetailsPage from './pages/Protocols/ProtocolDetailsPage';
import OwnersPage from './pages/Clients/OwnersPage';
import VehiclesPage from './pages/Clients/VehiclesPage';
import ReportsPage from './pages/Reports/ReportsPage';


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

                    {/* Strony klientów */}
                    <Route path="/clients/owners" element={<OwnersPage />} />
                    <Route path="/clients/vehicles" element={<VehiclesPage />} />

                    {/* Inne strony */}
                    <Route path="/finances" element={<PlaceholderPage title="Finanse" />} />
                    <Route path="/warehouse" element={<PlaceholderPage title="Magazyn" />} />
                    {/* Strony ustawień */}
                    <Route path="/settings/general" element={<PlaceholderPage title="Ustawienia ogólne" />} />
                    <Route path="/settings/employees" element={<EmployeesPage />} />
                    <Route path="/settings/taxes" element={<TaxesPage />} />
                    <Route path="/settings/services" element={<ServicesPage />} />
                    <Route path="/settings" element={<Navigate to="/settings/general" replace />} />

                    {/* Protokoły */}
                    <Route path="/protocols/car-reception" element={<CarReceptionPage />} />
                    <Route path="/protocols/car-reception/:id" element={<ProtocolDetailsPage />} />
                    <Route path="/protocols/car-inspection" element={<PlaceholderPage title="Protokół oględzin pojazdu" />} />
                    <Route path="/protocols/wheel-renovation" element={<PlaceholderPage title="Protokół renowacji felg" />} />
                    <Route path="/protocols/window-tinting" element={<PlaceholderPage title="Protokół przyciemniania szyb" />} />
                    <Route path="/protocols" element={<Navigate to="/protocols/car-reception" replace />} />

                    {/* Strona 404 - nieistniejąca ścieżka */}
                    <Route path="*" element={<div>Strona nie istnieje</div>} />
            </Routes>
        );
};

export default AppRoutes;