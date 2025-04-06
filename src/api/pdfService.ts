// src/api/pdfService.ts
import { apiClient } from './apiClient';

export const pdfService = {
    /**
     * Generates and opens a PDF for the specified protocol
     *
     * @param protocolId - The ID of the protocol to generate a PDF for
     * @param openInNewTab - Whether to open the PDF in a new tab (default: true)
     * @returns Promise that resolves when the PDF is opened
     */
    printProtocolPdf: async (protocolId: string, openInNewTab: boolean = true): Promise<void> => {
        try {
            console.log(`Generating PDF for protocol ${protocolId}`);

            // Construct the URL for the PDF endpoint
            const pdfUrl = `${apiClient.getBaseUrl()}/printer/protocol/${protocolId}/pdf`;

            if (openInNewTab) {
                // Open the PDF in a new tab
                window.open(pdfUrl, '_blank');
            } else {
                // Open in the same tab
                window.location.href = pdfUrl;
            }
        } catch (error) {
            console.error(`Error generating PDF for protocol ${protocolId}:`, error);
            throw new Error('Failed to generate protocol PDF');
        }
    }
};