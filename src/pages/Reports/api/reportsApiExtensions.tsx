import { AppointmentStatus } from '../../../types';
import { mockAppointments } from '../../../api/mocks/appointmentMocks';
import { mockCarReceptionProtocols } from '../../../api/mocks/carReceptionMocks';
import { mockEmployees } from '../../../api/mocks/employeesMocks';
import { mockVehicles } from '../../../api/mocks/clientMocks';
import { FaSmile, FaMeh, FaFrown } from 'react-icons/fa';

// Funkcja do pobierania danych o wydajności pracowników
export const fetchEmployeeProductivity = async (timeRange: 'month' | 'quarter' | 'year'): Promise<any> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Symulujemy dane o wydajności pracowników
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Określamy przedział czasu
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

            // Pobieramy dane pracowników
            const employees = [...mockEmployees];

            // Generujemy losowe dane o wydajności
            const employeeProductivity = employees.map(employee => {
                // Losowa liczba ukończonych zadań od 5 do 20
                const completedTasks = Math.floor(Math.random() * 15) + 5;

                // Losowy przychód od 5000 do 15000
                const revenue = Math.floor(Math.random() * 10000) + 5000;

                return {
                    id: employee.id,
                    name: employee.fullName,
                    completedTasks,
                    revenue,
                    color: employee.color
                };
            });

            // Sortujemy według liczby ukończonych zadań (malejąco)
            employeeProductivity.sort((a, b) => b.completedTasks - a.completedTasks);

            resolve(employeeProductivity);
        }, 800);
    });
};

// Funkcja do pobierania danych o sezonowości
export const fetchSeasonalityData = async (year: number = new Date().getFullYear()): Promise<any> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Generujemy dane sezonowe dla wszystkich miesięcy
            const monthNames = [
                'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
                'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
            ];

            // Wzór sezonowy dla biznesu detailingowego
            const seasonalPattern = [
                { multiplier: 0.6, name: 'styczeń' },    // Niski sezon zimowy
                { multiplier: 0.7, name: 'luty' },       // Niski sezon zimowy
                { multiplier: 0.9, name: 'marzec' },     // Początek sezonu
                { multiplier: 1.2, name: 'kwiecień' },   // Wysoki sezon
                { multiplier: 1.4, name: 'maj' },        // Wysoki sezon
                { multiplier: 1.5, name: 'czerwiec' },   // Szczyt sezonu
                { multiplier: 1.3, name: 'lipiec' },     // Wysoki sezon
                { multiplier: 1.2, name: 'sierpień' },   // Wysoki sezon
                { multiplier: 1.1, name: 'wrzesień' },   // Koniec wysokiego sezonu
                { multiplier: 0.9, name: 'październik' }, // Średni sezon
                { multiplier: 0.7, name: 'listopad' },   // Niski sezon
                { multiplier: 0.5, name: 'grudzień' }    // Niski sezon świąteczny
            ];

            // Generujemy dane sezonowe na podstawie wzorca
            const baseTasksCount = 20; // Średnia liczba zadań w miesiącu
            const baseRevenue = 10000; // Średni przychód w miesiącu

            const seasonalData = seasonalPattern.map(month => {
                const tasks = Math.round(baseTasksCount * month.multiplier);
                const revenue = Math.round(baseRevenue * month.multiplier);

                // Dodajemy losowy szum (±10%)
                const noise = 0.9 + (Math.random() * 0.2);

                return {
                    month: month.name,
                    tasks: Math.round(tasks * noise),
                    revenue: Math.round(revenue * noise)
                };
            });

            resolve(seasonalData);
        }, 800);
    });
};

// Funkcja do pobierania danych o czasie trwania usług
export const fetchTaskDurationData = async (): Promise<any> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Dane o czasie trwania różnych rodzajów usług
            const taskDurationData = [
                { name: 'Detailing kompletny', duration: 8, count: 12 },
                { name: 'Korekta lakieru', duration: 4, count: 18 },
                { name: 'Czyszczenie wnętrza', duration: 3, count: 24 },
                { name: 'Nakładanie powłoki ceramicznej', duration: 6, count: 15 },
                { name: 'Pranie tapicerki', duration: 2.5, count: 20 },
                { name: 'Polerowanie reflektorów', duration: 1, count: 10 },
                { name: 'Polerowanie lakieru', duration: 3.5, count: 16 }
            ];

            resolve(taskDurationData);
        }, 600);
    });
};

// Funkcja do pobierania danych o satysfakcji klientów
export const fetchCustomerSatisfactionData = async (): Promise<any> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Dane o satysfakcji klientów
            const satisfactionData = [
                { name: 'Bardzo zadowoleni', value: 65, color: '#2ecc71', icon: <FaSmile /> },
                { name: 'Zadowoleni', value: 25, color: '#3498db', icon: <FaMeh /> },
                { name: 'Niezadowoleni', value: 10, color: '#e74c3c', icon: <FaFrown /> }
            ];

            // Obliczenie średniej oceny (zakładamy, że bardzo zadowoleni dają 5, zadowoleni 4, niezadowoleni 2)
            const averageRating = (
                (satisfactionData[0].value * 5) +
                (satisfactionData[1].value * 4) +
                (satisfactionData[2].value * 2)
            ) / 100;

            // Losowa liczba ocen
            const totalReviews = Math.floor(Math.random() * 100) + 150;

            resolve({
                satisfactionData,
                averageRating,
                totalReviews
            });
        }, 700);
    });
};

// Funkcja do pobierania danych o klientach i ich wartości (Lifetime Value)
export const fetchCustomerLTVData = async (): Promise<any> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Symulujemy dane o wartości klientów w czasie
            const customerValueData = [
                { visits: 1, averageValue: 500 },
                { visits: 2, averageValue: 800 },
                { visits: 3, averageValue: 1200 },
                { visits: 4, averageValue: 1500 },
                { visits: 5, averageValue: 1800 },
                { visits: '6+', averageValue: 2200 }
            ];

            // Lojalność klientów
            const loyaltyData = {
                newClients: 35,     // Klienci z jedną wizytą
                returningClients: 45, // Klienci z 2-5 wizytami
                loyalClients: 20    // Klienci z 6+ wizytami
            };

            // Statystyki powtarzalności wizyt
            const repeatRate = 68; // Procent klientów, którzy wracają
            const averageVisitsPerClient = 3.2; // Średnia liczba wizyt na klienta

            resolve({
                customerValueData,
                loyaltyData,
                repeatRate,
                averageVisitsPerClient
            });
        }, 700);
    });
};

// Funkcja do pobierania danych o pojazdach i najpopularniejszych markach
export const fetchVehicleStatsData = async (): Promise<any> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Pobieramy dane o pojazdach z mocków
            const vehicles = [...mockVehicles];

            // Grupujemy pojazdy według marek
            const makeGroups = vehicles.reduce((acc, vehicle) => {
                if (!acc[vehicle.make]) {
                    acc[vehicle.make] = {
                        make: vehicle.make,
                        count: 0,
                        totalSpent: 0,
                        averageSpent: 0,
                        models: {}
                    };
                }

                acc[vehicle.make].count += 1;
                acc[vehicle.make].totalSpent += vehicle.totalSpent;

                // Grupujemy również według modeli
                if (!acc[vehicle.make].models[vehicle.model]) {
                    acc[vehicle.make].models[vehicle.model] = {
                        model: vehicle.model,
                        count: 0,
                        totalSpent: 0
                    };
                }

                acc[vehicle.make].models[vehicle.model].count += 1;
                acc[vehicle.make].models[vehicle.model].totalSpent += vehicle.totalSpent;

                return acc;
            }, {} as any);

            // Przekształcamy na tablicę i obliczamy średnie
            let makesArray = Object.values(makeGroups).map((make: any) => {
                make.averageSpent = make.totalSpent / make.count;

                // Przekształcamy modele również na tablicę
                make.models = Object.values(make.models).map((model: any) => {
                    model.averageSpent = model.totalSpent / model.count;
                    return model;
                }).sort((a: any, b: any) => b.count - a.count);

                return make;
            });

            // Sortujemy według liczby pojazdów (malejąco)
            makesArray = makesArray.sort((a: any, b: any) => b.count - a.count);

            // Statystyki dla wszystkich pojazdów
            const totalVehicles = vehicles.length;
            const totalRevenue = vehicles.reduce((sum, vehicle) => sum + vehicle.totalSpent, 0);
            const averageRevenuePerVehicle = totalRevenue / totalVehicles;

            // Statystyki o rocznikach
            const yearGroups = vehicles.reduce((acc, vehicle) => {
                const yearRange = Math.floor(vehicle.year / 5) * 5;
                const yearRangeKey = `${yearRange}-${yearRange + 4}`;

                if (!acc[yearRangeKey]) {
                    acc[yearRangeKey] = {
                        range: yearRangeKey,
                        count: 0,
                        totalSpent: 0
                    };
                }

                acc[yearRangeKey].count += 1;
                acc[yearRangeKey].totalSpent += vehicle.totalSpent;

                return acc;
            }, {} as any);

            // Przekształcamy roczniki na tablicę i obliczamy średnie
            const yearRanges = Object.values(yearGroups).map((range: any) => {
                range.averageSpent = range.totalSpent / range.count;
                return range;
            }).sort((a: any, b: any) => {
                // Sortujemy od najnowszych do najstarszych
                const aStart = parseInt(a.range.split('-')[0]);
                const bStart = parseInt(b.range.split('-')[0]);
                return bStart - aStart;
            });

            resolve({
                topMakes: makesArray.slice(0, 5),
                allMakes: makesArray,
                yearRanges,
                totalVehicles,
                totalRevenue,
                averageRevenuePerVehicle
            });
        }, 800);
    });
};