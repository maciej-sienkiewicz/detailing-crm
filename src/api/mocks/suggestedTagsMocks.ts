// src/api/mocks/suggestedTagsMock.ts

// Funkcja zwracająca sugerowane tagi dla zdjęć w protokole przyjęcia
export const fetchSuggestedTags = (): Promise<string[]> => {
    // Symulacja opóźnienia odpowiedzi serwera
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                "FOLIA PPF",
                "WGNIOTKA ZDERZAK",
                "WGNIOTKA DRZWI",
                "WGNIOTKA MASKA",
                "LAKIER",
                "RYSA",
                "KOROZJA",
                "CERAMIKA",
                "BRAK CZĘŚCI",
                "WNĘTRZE",
                "PRZEDNI ZDERZAK",
                "TYLNY ZDERZAK",
                "SILNIK",
                "PODWOZIE",
                "OPONY",
                "FELGI",
                "ŚWIATŁA",
                "SZYBA PRZEDNIA",
                "SZYBA TYLNA",
                "DRZWI LEWE",
                "DRZWI PRAWE",
                "BŁOTNIK LEWY",
                "BŁOTNIK PRAWY",
                "DACH",
                "BAGAŻNIK"
            ]);
        }, 300); // 300ms opóźnienia dla realizmu
    });
};