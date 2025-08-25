// src/api/pdfInvoiceService.ts
import {apiClient} from './apiClient';
import {Invoice} from '../types';
import {invoicesApi} from './invoicesApi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const pdfInvoiceService = {
    /**
     * Pobiera PDF załącznika faktury jako Blob i tworzy tymczasowy URL
     *
     * @param invoiceId - ID faktury
     * @param attachmentId - ID załącznika
     * @returns Promise z URL do podglądu PDF-a
     */
    fetchAttachmentAsBlob: async (invoiceId: string): Promise<string> => {
        try {
            const attachmentUrl = invoicesApi.getInvoiceAttachmentUrl(invoiceId);

            // Dodajemy timestamp jako query param, aby uniknąć cachowania
            const urlWithTimestamp = `${attachmentUrl}?t=${new Date().getTime()}`;

            const response = await fetch(urlWithTimestamp, {
                method: 'GET',
                headers: {},
                // Ustawiamy credentials, aby ciasteczka sesyjne były przesyłane
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Błąd pobierania PDF: ${response.status} ${response.statusText}`);
            }

            // Pobieramy odpowiedź jako Blob
            const blob = await response.blob();

            // Tworzymy tymczasowy URL dla Bloba
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Błąd podczas pobierania PDF załącznika:', error);
            throw error;
        }
    },

    /**
     * Generuje PDF z widoku faktury i zwraca URL do podglądu
     *
     * @param elementId - ID elementu DOM do przekształcenia na PDF
     * @param invoice - Obiekt faktury (do nazwy pliku)
     * @returns Promise z URL do podglądu PDF-a
     */
    generateInvoicePdf: async (elementId: string, invoice: Invoice): Promise<string> => {
        try {
            const element = document.getElementById(elementId);
            if (!element) {
                throw new Error('Nie znaleziono elementu do konwersji na PDF');
            }

            // Przekształć element HTML na płótno
            const canvas = await html2canvas(element, {
                scale: 2, // Wyższa rozdzielczość
                useCORS: true,
                logging: false,
                backgroundColor: '#FFFFFF'
            });

            // Tworzenie dokumentu PDF o odpowiednim rozmiarze
            const imgWidth = 210; // Szerokość strony A4 w mm
            const pageHeight = 297; // Wysokość strony A4 w mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            const pdf = new jsPDF('p', 'mm', 'a4');

            // Dodanie daty wygenerowania w stopce dokumentu
            const currentDate = new Date().toLocaleDateString('pl-PL');
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`Wygenerowano: ${currentDate}`, 10, pageHeight - 10);

            // Dodanie obrazu do PDF
            pdf.addImage(
                canvas.toDataURL('image/jpeg', 0.8),
                'JPEG',
                0,
                0,
                imgWidth,
                imgHeight
            );

            // Jeśli wysokość obrazu przekracza wysokość strony, dodajemy kolejne strony
            let heightLeft = imgHeight - pageHeight;
            let position = -pageHeight;

            while (heightLeft > 0) {
                position = position - pageHeight;
                pdf.addPage();
                pdf.addImage(
                    canvas.toDataURL('image/jpeg', 0.8),
                    'JPEG',
                    0,
                    position,
                    imgWidth,
                    imgHeight
                );

                // Dodanie numeru strony w stopce
                const pageNumber = pdf.getNumberOfPages();
                pdf.setFontSize(8);
                pdf.setTextColor(150, 150, 150);
                pdf.text(`Strona ${pageNumber}`, imgWidth - 25, pageHeight - 10);

                heightLeft -= pageHeight;
            }

            // Generowanie Blob z PDF
            const pdfBlob = pdf.output('blob');

            // Tworzymy tymczasowy URL dla Bloba
            return URL.createObjectURL(pdfBlob);
        } catch (error) {
            console.error('Błąd podczas generowania PDF faktury:', error);
            throw error;
        }
    },

    /**
     * Otwiera fakturę PDF w nowej karcie
     *
     * @param invoice - Obiekt faktury
     * @param elementId - ID elementu DOM do przekształcenia na PDF (opcjonalne)
     */
    openInvoiceInNewTab: async (invoice: Invoice, elementId?: string): Promise<void> => {
        try {
            let pdfUrl: string;

            // Sprawdzamy, czy faktura ma załączniki
            if (invoice.attachments && invoice.attachments.length > 0) {
                // Jeśli ma, pobieramy pierwszy załącznik
                pdfUrl = await pdfInvoiceService.fetchAttachmentAsBlob(invoice.id);
            } else if (elementId) {
                // Jeśli nie ma załączników, generujemy PDF z widoku
                pdfUrl = await pdfInvoiceService.generateInvoicePdf(elementId, invoice);
            } else {
                throw new Error('Brak załącznika i nie podano elementId do wygenerowania PDF');
            }

            // Otwieramy PDF w nowej karcie
            window.open(pdfUrl, '_blank');
        } catch (error) {
            console.error('Błąd podczas otwierania faktury:', error);
            throw error;
        }
    },

    /**
     * Drukuje fakturę PDF
     *
     * @param invoice - Obiekt faktury
     * @param elementId - ID elementu DOM do przekształcenia na PDF (opcjonalne)
     */
    printInvoice: async (invoice: Invoice, elementId?: string): Promise<void> => {
        try {
            let pdfUrl: string;

            // Sprawdzamy, czy faktura ma załączniki
            if (invoice.attachments && invoice.attachments.length > 0) {
                // Jeśli ma, pobieramy pierwszy załącznik
                pdfUrl = await pdfInvoiceService.fetchAttachmentAsBlob(invoice.id);
            } else if (elementId) {
                // Jeśli nie ma załączników, generujemy PDF z widoku
                pdfUrl = await pdfInvoiceService.generateInvoicePdf(elementId, invoice);
            } else {
                throw new Error('Brak załącznika i nie podano elementId do wygenerowania PDF');
            }

            // Otwieramy okno z PDF i wydrukujemy
            const printWindow = window.open(pdfUrl, '_blank');

            if (printWindow) {
                printWindow.addEventListener('load', () => {
                    printWindow.print();
                    // Zwolnij URL Bloba po wydrukowaniu
                    setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
                });
            } else {
                // Jeśli nie udało się otworzyć okna, zwolnij URL
                URL.revokeObjectURL(pdfUrl);
                throw new Error('Nie udało się otworzyć okna wydruku');
            }
        } catch (error) {
            console.error('Błąd podczas drukowania faktury:', error);
            throw error;
        }
    }
};