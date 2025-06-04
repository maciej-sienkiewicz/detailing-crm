// src/utils/uuidHelper.ts

/**
 * Generate a version 4 UUID
 */
export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Validate if string is a valid UUID
 */
export const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};

/**
 * Create a deterministic UUID from a string (for testing)
 */
export const createDeterministicUUID = (input: string): string => {
    // Simple hash to create consistent UUID from string
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    // Convert hash to UUID format
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-8${hex.slice(0, 3)}-${hex.slice(0, 8)}${hex.slice(0, 4)}`;
};

/**
 * Get or create tenant UUID for current company
 */
export const getTenantUUID = (): string => {
    // Try to get from localStorage first
    let tenantId = localStorage.getItem('tenantId');

    if (!tenantId || !isValidUUID(tenantId)) {
        // Create deterministic UUID based on company or generate new one
        const companyId = localStorage.getItem('companyId') || 'default-company';
        tenantId = createDeterministicUUID(`tenant-${companyId}`);
        localStorage.setItem('tenantId', tenantId);
        console.log('🆔 Generated new tenant UUID:', tenantId);
    }

    return tenantId;
};

/**
 * Get or create location UUID for current location
 */
export const getLocationUUID = (): string => {
    // Try to get from localStorage first
    let locationId = localStorage.getItem('locationId');

    if (!locationId || !isValidUUID(locationId)) {
        // Create deterministic UUID for default location
        locationId = createDeterministicUUID('default-location');
        localStorage.setItem('locationId', locationId);
        console.log('📍 Generated new location UUID:', locationId);
    }

    return locationId;
};

/**
 * Generate workstation UUID
 */
export const generateWorkstationUUID = (): string => {
    return generateUUID();
};

// Log current UUIDs for debugging
export const debugUUIDs = () => {
    console.group('🆔 UUID Debug Info');
    console.log('Tenant UUID:', getTenantUUID());
    console.log('Location UUID:', getLocationUUID());
    console.log('Sample Workstation UUID:', generateWorkstationUUID());
    console.groupEnd();
};