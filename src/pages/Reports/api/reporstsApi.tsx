import { AppointmentStatus } from '../../../types';
import { mockAppointments } from '../../../api/mocks/appointmentMocks';
import { mockCarReceptionProtocols } from '../../../api/mocks/carReceptionMocks';

// Pomocnicza funkcja do formatowania daty
const formatToLocalDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

// W rzeczywistej aplikacji dane pochodziłyby z API
// Tutaj symulujemy je na podstawie danych mockowych
export const fetchTasksStats = async (timeRange: 'month' | 'quarter' | 'year'): Promise<any> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Pobieramy dane z mockowanych danych
            const appointments = [...mockAppointments];
            const protocols = [...mockCarReceptionProtocols];

            // Obliczamy aktualną datę i daty do porównania
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Pobieramy początek i koniec miesiąca/kwartału/roku
            let startDate: Date, endDate: Date, prevStartDate: Date, prevEndDate: Date;

            if (timeRange === 'month') {
                // Aktualny miesiąc
                startDate = new Date(currentYear, currentMonth, 1);
                endDate = new Date(currentYear, currentMonth + 1, 0);

                // Poprzedni miesiąc
                prevStartDate = new Date(currentYear, currentMonth - 1, 1);
                prevEndDate = new Date(currentYear, currentMonth, 0);
            } else if (timeRange === 'quarter') {
                const currentQuarter = Math.floor(currentMonth / 3);

                // Aktualny kwartał
                startDate = new Date(currentYear, currentQuarter * 3, 1);
                endDate = new Date(currentYear, (currentQuarter + 1) * 3, 0);

                // Poprzedni kwartał
                prevStartDate = new Date(currentYear, (currentQuarter - 1) * 3, 1);
                prevEndDate = new Date(currentYear, currentQuarter * 3, 0);
            } else { // year
                // Aktualny rok
                startDate = new Date(currentYear, 0, 1);
                endDate = new Date(currentYear, 12, 0);

                // Poprzedni rok
                prevStartDate = new Date(currentYear - 1, 0, 1);
                prevEndDate = new Date(currentYear - 1, 12, 0);
            }

            // Filtrujemy zadania według statusów i dat
            const currentTasks = appointments.filter(app =>
                app.status === AppointmentStatus.IN_PROGRESS
            ).length;

            // Przeterminowane zadania - zadania w trakcie realizacji z datą end przed dzisiejszą
            const overdueTasks = appointments.filter(app =>
                app.status === AppointmentStatus.IN_PROGRESS &&
                app.end < now
            ).length;

            // Zadania z bieżącego okresu
            const currentPeriodTasks = appointments.filter(app =>
                app.start >= startDate && app.start <= endDate
            ).length;

            // Zadania z poprzedniego okresu
            const prevPeriodTasks = appointments.filter(app =>
                app.start >= prevStartDate && app.start <= prevEndDate
            ).length;

            // Dla listy bieżących zadań
            const currentTasksList = appointments
                .filter(app => app.status === AppointmentStatus.IN_PROGRESS)
                .map(app => ({
                    id: app.id,
                    title: app.title,
                    customer: app.customerId,
                    startDate: formatToLocalDate(app.start.toISOString()),
                    endDate: formatToLocalDate(app.end.toISOString()),
                    isOverdue: app.end < now
                }))
                .slice(0, 5); // Bierzemy tylko top 5 dla widgetu

            // Dla listy przeterminowanych zadań
            const overdueTasksList = appointments
                .filter(app => app.status === AppointmentStatus.IN_PROGRESS && app.end < now)
                .map(app => ({
                    id: app.id,
                    title: app.title,
                    customer: app.customerId,
                    startDate: formatToLocalDate(app.start.toISOString()),
                    endDate: formatToLocalDate(app.end.toISOString()),
                    daysOverdue: Math.floor((now.getTime() - app.end.getTime()) / (1000 * 60 * 60 * 24))
                }))
                .slice(0, 5); // Bierzemy tylko top 5 dla widgetu

            // Dystrybucja statusów
            const statusDistribution = [
                {
                    name: 'Do zatwierdzenia',
                    value: appointments.filter(app => app.status === AppointmentStatus.PENDING_APPROVAL).length,
                    color: '#f39c12' // Pomarańczowy
                },
                {
                    name: 'Potwierdzone',
                    value: appointments.filter(app => app.status === AppointmentStatus.CONFIRMED).length,
                    color: '#3498db' // Niebieski
                },
                {
                    name: 'W realizacji',
                    value: appointments.filter(app => app.status === AppointmentStatus.IN_PROGRESS).length,
                    color: '#9b59b6' // Fioletowy
                },
                {
                    name: 'Gotowe do odbioru',
                    value: appointments.filter(app => app.status === AppointmentStatus.READY_FOR_PICKUP).length,
                    color: '#2ecc71' // Zielony
                },
                {
                    name: 'Zakończone',
                    value: appointments.filter(app => app.status === AppointmentStatus.COMPLETED).length,
                    color: '#7f8c8d' // Szary
                }
            ];

            // Zwracamy dane statystyczne
            resolve({
                currentTasks,
                overdueTasks,
                monthlyTasks: currentPeriodTasks,
                prevMonthTasks: prevPeriodTasks,
                currentTasksList,
                overdueTasksList,
                statusDistribution
            });
        }, 800); // Symulacja opóźnienia sieciowego
    });
};

export const fetchRevenueStats = async (timeRange: 'month' | 'quarter' | 'year'): Promise<any> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // W prawdziwej aplikacji te dane pochodziłyby z API
            // Tutaj generujemy je na podstawie mockowanych protokołów
            const protocols = [...mockCarReceptionProtocols];

            // Obliczamy aktualną datę i daty do porównania
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Pobieramy początek i koniec miesiąca/kwartału/roku
            let startDate: Date, endDate: Date, prevStartDate: Date, prevEndDate: Date;

            if (timeRange === 'month') {
                // Aktualny miesiąc
                startDate = new Date(currentYear, currentMonth, 1);
                endDate = new Date(currentYear, currentMonth + 1, 0);

                // Poprzedni miesiąc
                prevStartDate = new Date(currentYear, currentMonth - 1, 1);
                prevEndDate = new Date(currentYear, currentMonth, 0);
            } else if (timeRange === 'quarter') {
                const currentQuarter = Math.floor(currentMonth / 3);

                // Aktualny kwartał
                startDate = new Date(currentYear, currentQuarter * 3, 1);
                endDate = new Date(currentYear, (currentQuarter + 1) * 3, 0);

                // Poprzedni kwartał
                prevStartDate = new Date(currentYear, (currentQuarter - 1) * 3, 1);
                prevEndDate = new Date(currentYear, currentQuarter * 3, 0);
            } else { // year
                // Aktualny rok
                startDate = new Date(currentYear, 0, 1);
                endDate = new Date(currentYear, 12, 0);

                // Poprzedni rok
                prevStartDate = new Date(currentYear - 1, 0, 1);
                prevEndDate = new Date(currentYear - 1, 12, 0);
            }

            // Przekształcamy daty w protokołach na obiekty Date
            const protocolsWithDates = protocols.map(protocol => ({
                ...protocol,
                startDateObj: new Date(protocol.startDate),
                // Obliczamy kwotę z usług
                totalValue: protocol.selectedServices.reduce((sum, service) => sum + service.finalPrice, 0)
            }));

            // Przychody z bieżącego okresu
            const currentPeriodProtocols = protocolsWithDates.filter(p =>
                p.startDateObj >= startDate && p.startDateObj <= endDate
            );

            const currentPeriodRevenue = currentPeriodProtocols.reduce(
                (sum, protocol) => sum + protocol.totalValue,
                0
            );

            // Przychody z poprzedniego okresu
            const prevPeriodProtocols = protocolsWithDates.filter(p =>
                p.startDateObj >= prevStartDate && p.startDateObj <= prevEndDate
            );

            const prevPeriodRevenue = prevPeriodProtocols.reduce(
                (sum, protocol) => sum + protocol.totalValue,
                0
            );

            // Dane dla wykresu miesięcznego
            // Generujemy dane za ostatnie 6 miesięcy
            const monthlyData = [];
            for (let i = 5; i >= 0; i--) {
                const monthStart = new Date(currentYear, currentMonth - i, 1);
                const monthEnd = new Date(currentYear, currentMonth - i + 1, 0);
                const monthName = monthStart.toLocaleDateString('pl-PL', { month: 'short' });

                const monthProtocols = protocolsWithDates.filter(p =>
                    p.startDateObj >= monthStart && p.startDateObj <= monthEnd
                );

                const monthRevenue = monthProtocols.reduce(
                    (sum, protocol) => sum + protocol.totalValue,
                    0
                );

                monthlyData.push({
                    month: monthName,
                    revenue: monthRevenue
                });
            }

            resolve({
                monthlyRevenue: currentPeriodRevenue,
                prevMonthlyRevenue: prevPeriodRevenue,
                monthlyData
            });
        }, 1000); // Symulacja opóźnienia sieciowego
    });
};

export const fetchTopServices = async (timeRange: 'month' | 'quarter' | 'year'): Promise<any[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Pobieramy dane z mockowanych protokołów
            const protocols = [...mockCarReceptionProtocols];

            // Obliczamy aktualną datę i daty do porównania
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Pobieramy początek i koniec okresu
            let startDate: Date, endDate: Date;

            if (timeRange === 'month') {
                startDate = new Date(currentYear, currentMonth, 1);
                endDate = new Date(currentYear, currentMonth + 1, 0);
            } else if (timeRange === 'quarter') {
                const currentQuarter = Math.floor(currentMonth / 3);
                startDate = new Date(currentYear, currentQuarter * 3, 1);
                endDate = new Date(currentYear, (currentQuarter + 1) * 3, 0);
            } else { // year
                startDate = new Date(currentYear, 0, 1);
                endDate = new Date(currentYear, 12, 0);
            }

            // Przekształcamy daty w protokołach na obiekty Date
            const protocolsWithDates = protocols.map(protocol => ({
                ...protocol,
                startDateObj: new Date(protocol.startDate)
            }));

            // Protokoły z bieżącego okresu
            const currentPeriodProtocols = protocolsWithDates.filter(p =>
                p.startDateObj >= startDate && p.startDateObj <= endDate
            );

            // Zbieramy wszystkie usługi z protokołów
            const allServices: any[] = [];
            currentPeriodProtocols.forEach(protocol => {
                protocol.selectedServices.forEach(service => {
                    allServices.push({
                        id: service.id,
                        name: service.name,
                        price: service.finalPrice
                    });
                });
            });

            // Grupujemy usługi po id i nazwie, sumując ich wartości
            const servicesMap = new Map();
            allServices.forEach(service => {
                if (servicesMap.has(service.id)) {
                    const existingService = servicesMap.get(service.id);
                    existingService.count += 1;
                    existingService.totalValue += service.price;
                } else {
                    servicesMap.set(service.id, {
                        id: service.id,
                        name: service.name,
                        count: 1,
                        totalValue: service.price
                    });
                }
            });

            // Konwertujemy mapę na tablicę, sortujemy po ilości i bierzemy top 5
            const topServices = Array.from(servicesMap.values())
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            // Przypisujemy kolory dla wykresu
            const colors = ['#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#e74c3c'];
            topServices.forEach((service, index) => {
                service.color = colors[index % colors.length];
            });

            resolve(topServices);
        }, 800);
    });
};