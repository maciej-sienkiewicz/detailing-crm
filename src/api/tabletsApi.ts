// src/api/tabletsApi.ts
import {apiClient} from './apiClient';

// Updated Types to match backend
export interface TabletDevice {
    id: string;
    companyId: number;           // Changed from tenantId to companyId
    locationId: string;
    friendlyName: string;
    workstationId?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'ERROR';
    lastSeen: string;
    createdAt: string;
    isOnline: boolean;
    connectionInfo?: TabletConnectionInfo;
}

export interface TabletConnectionInfo {
    connectedAt?: string;
    lastHeartbeat?: string;
    isAuthenticated: boolean;
    sessionOpen: boolean;
    uptimeMinutes?: number;
}

export interface SignatureSession {
    id: string;
    sessionId: string;
    companyId: number;           // Changed from tenantId to companyId
    workstationId: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    vehicleInfo: {
        make?: string;
        model?: string;
        licensePlate?: string;
        vin?: string;
        year?: number;
        color?: string;
    };
    serviceType?: string;
    documentType?: string;
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

// Updated request interfaces to match backend DTOs
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
    deviceToken: string;        // This will be JWT token from backend
    websocketUrl: string;
}

export interface SignatureRequestResponse {
    success: boolean;
    sessionId?: string;
    message: string;
    tabletId?: string;
    workstationId?: string;
    estimatedCompletionTime?: string;
}

export interface CreateSignatureSessionRequest {
    workstationId: string;      // UUID as string
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

export interface TabletListResponse {
    success: boolean;
    tablets: TabletDevice[];
    totalCount: number;
    onlineCount: number;
    timestamp: string;
}

export interface TabletStatsResponse {
    total: number;
    online: number;
    offline: number;
    active: number;
    inactive: number;
    maintenance: number;
    error: number;
    connectedTablets: number;
    lastUpdated: string;
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

// Updated API Functions
export const tabletsApi = {
    // Get all tablets for current company
    async getTablets(): Promise<TabletDevice[]> {
        try {
            console.log('🔧 Fetching tablets for company...');
            debugAuthToken();

            const response = await apiClient.get<TabletListResponse>('/tablets');
            console.log('✅ Tablets response:', response);

            return response.tablets || [];
        } catch (error) {
            console.error('❌ Error fetching tablets:', error);
            return [];
        }
    },

    // Get tablet statistics
    async getTabletStats(): Promise<TabletStatsResponse> {
        try {
            return await apiClient.get<TabletStatsResponse>('/tablets/stats');
        } catch (error) {
            console.error('Error fetching tablet stats:', error);
            throw error;
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

    // Generate pairing code (no longer needs request body)
    async generatePairingCode(): Promise<PairingCodeResponse> {
        console.log('🔧 Generating pairing code...');
        debugAuthToken();

        try {
            const response = await apiClient.post<PairingCodeResponse>('/tablets/generate-pairing-code', {});
            console.log('✅ Pairing code generated:', response);
            return response;
        } catch (error) {
            console.error('❌ Failed to generate pairing code:', error);
            throw error;
        }
    },

    // Check pairing code status - NEW FUNCTION
    async checkCodeStatus(code: string): Promise<boolean> {
        try {
            const response = await apiClient.postNotCamel<boolean>('/tablets/code/status',
                { code }, // <- Jako obiekt
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response;
        } catch (error) {
            console.error('Failed to check code status:', error);
            throw error;
        }
    },

    // Complete tablet pairing
    async completeTabletPairing(request: TabletPairingRequest): Promise<TabletCredentials> {
        console.log('🔧 Completing tablet pairing...', request);

        try {
            const response = await apiClient.post<TabletCredentials>('/tablets/pair', request);
            console.log('✅ Tablet pairing completed:', response);
            return response;
        } catch (error) {
            console.error('❌ Tablet pairing failed:', error);
            throw error;
        }
    },

    // Create signature session using /api/signatures/request
    async createSignatureSessionDirect(request: CreateSignatureSessionRequest): Promise<SignatureRequestResponse> {
        console.log('🔧 Creating signature session directly...', request);

        try {
            const response = await apiClient.postNot<SignatureRequestResponse>('/signatures/request', request);
            console.log('✅ Signature session created:', response);
            return response;
        } catch (error) {
            console.error('❌ Failed to create signature session:', error);
            throw error;
        }
    },

    // Create signature session
    async createSignatureSession(request: CreateSignatureSessionRequest): Promise<SignatureSessionResponse> {
        console.log('🔧 Creating signature session...', request);

        try {
            const response = await apiClient.post<SignatureSessionResponse>('/signatures/request', request);
            console.log('✅ Signature session created:', response);
            return response;
        } catch (error) {
            console.error('❌ Failed to create signature session:', error);
            throw error;
        }
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
            return await apiClient.post<{ success: boolean; message: string }>(`/tablets/${tabletId}/test`, {});
        } catch (error) {
            console.error('Error testing tablet:', error);
            return { success: false, message: 'Failed to test tablet' };
        }
    },

    // Get tablet status
    async getTabletStatus(tabletId: string): Promise<{ tabletId: string; isOnline: boolean; timestamp: string; connectionStats: any }> {
        try {
            return await apiClient.get<{ tabletId: string; isOnline: boolean; timestamp: string; connectionStats: any }>(`/tablets/${tabletId}/status`);
        } catch (error) {
            console.error('Error getting tablet status:', error);
            return {
                tabletId,
                isOnline: false,
                timestamp: new Date().toISOString(),
                connectionStats: {}
            };
        }
    },

    // Get tablet details
    async getTabletDetails(tabletId: string): Promise<TabletDevice | null> {
        try {
            const response = await apiClient.get<{ success: boolean; data: TabletDevice }>(`/tablets/${tabletId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting tablet details:', error);
            return null;
        }
    },

    // Disconnect tablet
    async disconnectTablet(tabletId: string): Promise<{ success: boolean; message: string }> {
        try {
            return await apiClient.post<{ success: boolean; message: string }>(`/tablets/${tabletId}/disconnect`, {});
        } catch (error) {
            console.error('Error disconnecting tablet:', error);
            return { success: false, message: 'Failed to disconnect tablet' };
        }
    },

    // Unpair tablet
    async unpairTablet(tabletId: string): Promise<{ success: boolean; message: string }> {
        try {
            return await apiClient.delete<{ success: boolean; message: string }>(`/tablets/${tabletId}`);
        } catch (error) {
            console.error('Error unpairing tablet:', error);
            return { success: false, message: 'Failed to unpair tablet' };
        }
    }
};