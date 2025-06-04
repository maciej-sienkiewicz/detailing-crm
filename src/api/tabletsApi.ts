// src/api/tabletsApi.ts
import { apiClient } from './apiClient';

// Types
export interface TabletDevice {
    id: string;
    tenantId: string;
    locationId: string;
    friendlyName: string;
    workstationId?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'ERROR';
    lastSeen: string;
    createdAt: string;
    isOnline: boolean;
}

export interface SignatureSession {
    id: string;
    sessionId: string;
    tenantId: string;
    workstationId: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    vehicleInfo: {
        make: string;
        model: string;
        licensePlate: string;
        vin?: string;
        year?: number;
        color?: string;
    };
    serviceType: string;
    documentType: string;
    status: 'PENDING' | 'SENT_TO_TABLET' | 'SIGNED' | 'EXPIRED' | 'CANCELLED';
    expiresAt: string;
    createdAt: string;
    signedAt?: string;
    assignedTabletId?: string;
    signatureImageUrl?: string;
    location?: string;
    notes?: string;
    metadata?: {
        ipAddress?: string;
        userAgent?: string;
        signatureDuration?: number;
    };
}

export interface TabletRegistrationRequest {
    tenantId: string;    // UUID as string
    locationId: string;  // UUID as string
    workstationId?: string; // UUID as string (optional)
}

export interface PairingCodeResponse {
    code: string;
    expiresIn: number;
}

export interface TabletPairingRequest {
    code: string;
    deviceName: string;
}

export interface TabletCredentials {
    deviceId: string;
    deviceToken: string;
    websocketUrl: string;
}

export interface CreateSignatureSessionRequest {
    workstationId: string;
    customerName: string;
    vehicleInfo?: {
        make?: string;
        model?: string;
        licensePlate?: string;
        vin?: string;
        year?: number;
    };
    serviceType?: string;
    documentType?: string;
    additionalNotes?: string;
}

export interface SignatureSessionResponse {
    success: boolean;
    sessionId?: string;
    message: string;
    tabletId?: string;
    workstationId?: string;
    estimatedCompletionTime?: string;
}

// Debug helper
const debugAuthToken = () => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
    console.log('🔐 Auth Token Debug:', {
        exists: !!token,
        length: token?.length,
        preview: token?.substring(0, 20) + '...',
        storageKeys: Object.keys(localStorage)
    });
    return token;
};

// API Functions
export const tabletsApi = {
    // Get all tablets for current user/company
    async getTablets(): Promise<TabletDevice[]> {
        try {
            const response = await apiClient.get<{ tablets: TabletDevice[] }>('/tablets');
            return response.tablets || [];
        } catch (error) {
            console.error('Error fetching tablets:', error);
            return [];
        }
    },

    // Get signature sessions
    async getSignatureSessions(): Promise<SignatureSession[]> {
        try {
            const response = await apiClient.get<{ sessions: SignatureSession[] }>('/signatures');
            return response.sessions || [];
        } catch (error) {
            console.error('Error fetching signature sessions:', error);
            return [];
        }
    },

    // Initiate tablet registration (generates pairing code)
    async initiateTabletRegistration(request: TabletRegistrationRequest): Promise<PairingCodeResponse> {
        console.log('🔧 Attempting tablet registration...');
        console.log('📤 Request payload:', JSON.stringify(request, null, 2));
        debugAuthToken();

        try {
            const response = await apiClient.post<PairingCodeResponse>('/tablets/register', request);
            console.log('✅ Registration successful:', response);
            return response;
        } catch (error) {
            console.error('❌ Registration failed:', error);
            throw error;
        }
    },

    // Complete tablet pairing
    async completeTabletPairing(request: TabletPairingRequest): Promise<TabletCredentials> {
        return await apiClient.post<TabletCredentials>('/tablets/pair', request);
    },

    // Create signature session
    async createSignatureSession(request: CreateSignatureSessionRequest): Promise<SignatureSessionResponse> {
        return await apiClient.post<SignatureSessionResponse>('/signatures/request', request);
    },

    // Get signature session details
    async getSignatureSession(sessionId: string): Promise<SignatureSession | null> {
        try {
            return await apiClient.get<SignatureSession>(`/signatures/${sessionId}`);
        } catch (error) {
            console.error('Error fetching signature session:', error);
            return null;
        }
    },

    // Get signature image
    async getSignatureImage(sessionId: string): Promise<{ signatureImage: string; signedAt: string; customerName: string } | null> {
        try {
            return await apiClient.get<{ signatureImage: string; signedAt: string; customerName: string }>(`/signatures/${sessionId}/image`);
        } catch (error) {
            console.error('Error fetching signature image:', error);
            return null;
        }
    },

    // Cancel signature session
    async cancelSignatureSession(sessionId: string): Promise<{ success: boolean; message: string }> {
        try {
            return await apiClient.delete<{ success: boolean; message: string }>(`/signatures/${sessionId}`);
        } catch (error) {
            console.error('Error cancelling signature session:', error);
            return { success: false, message: 'Failed to cancel session' };
        }
    },

    // Retry signature session
    async retrySignatureSession(sessionId: string): Promise<SignatureSessionResponse> {
        // This would need to be implemented on the backend
        // For now, we can get the session and create a new one
        const session = await this.getSignatureSession(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }

        return await this.createSignatureSession({
            workstationId: session.workstationId,
            customerName: session.customerName,
            vehicleInfo: session.vehicleInfo,
            serviceType: session.serviceType,
            documentType: session.documentType
        });
    },

    // Test tablet connection
    async testTablet(tabletId: string): Promise<{ success: boolean; message: string }> {
        try {
            return await apiClient.post<{ success: boolean; message: string }>(`/admin/tablets/${tabletId}/test`, {});
        } catch (error) {
            console.error('Error testing tablet:', error);
            return { success: false, message: 'Failed to test tablet' };
        }
    },

    // Get tablet status
    async getTabletStatus(tabletId: string): Promise<{ tabletId: string; isOnline: boolean; timestamp: string }> {
        try {
            return await apiClient.get<{ tabletId: string; isOnline: boolean; timestamp: string }>(`/admin/tablets/${tabletId}/status`);
        } catch (error) {
            console.error('Error getting tablet status:', error);
            return { tabletId, isOnline: false, timestamp: new Date().toISOString() };
        }
    }
};