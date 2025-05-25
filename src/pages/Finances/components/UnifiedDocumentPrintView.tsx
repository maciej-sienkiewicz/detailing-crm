// src/pages/Finances/components/UnifiedDocumentPrintView.tsx
import {
    UnifiedFinancialDocument,
    DocumentType,
    DocumentTypeLabels,
    PaymentMethodLabels
} from '../../../types/finance';

export class UnifiedDocumentPrintView {
    static render(document: UnifiedFinancialDocument, printWindow: Window) {
        const formatDate = (dateString: string): string => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString('pl-PL');
        };

        const formatAmount = (amount: number): string => {
            return new Intl.NumberFormat('pl-PL', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        };

        const generateItemsTable = () => {
            if (document.type !== DocumentType.INVOICE || !document.items || document.items.length === 0) {
                return '';
            }

            const itemsRows = document.items.map((item, index) => `
                <tr>
                    <td style="text-align: center; font-weight: 600;">${index + 1}</td>
                    <td>
                        <div class="print-item-name">${item.name}</div>
                        ${item.description ? `<div class="print-item-description">${item.description}</div>` : ''}
                    </td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${formatAmount(item.unitPrice)} ${document.currency}</td>
                    <td style="text-align: center;">${item.taxRate}%</td>
                    <td style="text-align: right; font-weight: 600;">${formatAmount(item.totalNet)} ${document.currency}</td>
                    <td style="text-align: right; font-weight: 600;">${formatAmount(item.totalGross)} ${document.currency}</td>
                </tr>
            `).join('');

            return `
                <div class="print-section-title">Pozycje dokumentu</div>
                <table class="print-items-table">
                    <thead>
                        <tr>
                            <th style="width: 5%;">Lp.</th>
                            <th style="width: 35%;">Nazwa towaru/usługi</th>
                            <th style="width: 10%;">Ilość</th>
                            <th style="width: 15%;">Cena jedn. netto</th>
                            <th style="width: 10%;">VAT %</th>
                            <th style="width: 12.5%;">Wartość netto</th>
                            <th style="width: 12.5%;">Wartość brutto</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRows}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="5" style="text-align: right; font-size: 14px;">RAZEM:</td>
                            <td style="text-align: right; font-size: 14px;">${formatAmount(document.totalNet)} ${document.currency}</td>
                            <td style="text-align: right; font-size: 14px;">${formatAmount(document.totalGross)} ${document.currency}</td>
                        </tr>
                    </tfoot>
                </table>
            `;
        };

        const generateSummarySection = () => {
            if (document.type === DocumentType.INVOICE && document.items && document.items.length > 0) {
                return '';
            }

            return `
                <div class="print-section-title">Podsumowanie finansowe</div>
                <div class="print-summary-section">
                    <div class="print-summary-grid">
                        ${document.totalNet > 0 ? `
                            <div class="print-summary-item">
                                <div class="print-summary-label">Kwota netto:</div>
                                <div class="print-summary-value">${formatAmount(document.totalNet)} ${document.currency}</div>
                            </div>
                            <div class="print-summary-item">
                                <div class="print-summary-label">Kwota VAT:</div>
                                <div class="print-summary-value">${formatAmount(document.totalTax)} ${document.currency}</div>
                            </div>
                        ` : ''}
                        <div class="print-summary-item">
                            <div class="print-summary-label">Kwota brutto:</div>
                            <div class="print-summary-value emphasis">${formatAmount(document.totalGross)} ${document.currency}</div>
                        </div>
                    </div>
                </div>
            `;
        };

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${DocumentTypeLabels[document.type]} ${document.number}</title>
                <style>
                    /* Reset i podstawowe style */
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        font-size: 12px;
                        line-height: 1.4;
                        color: #2c3e50;
                        background: white;
                        max-width: 210mm;
                        margin: 0 auto;
                        padding: 20mm;
                    }
                    
                    /* Nagłówek dokumentu */
                    .print-document-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #34495e;
                    }
                    
                    .print-header-left {
                        flex: 1;
                    }
                    
                    .print-document-type {
                        font-size: 28px;
                        font-weight: 700;
                        color: #2c3e50;
                        margin-bottom: 8px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    
                    .print-document-number {
                        font-size: 18px;
                        font-weight: 600;
                        color: #3498db;
                        margin-bottom: 12px;
                    }
                    
                    /* Szczegóły dokumentu */
                    .print-document-details {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 20px;
                        margin-bottom: 30px;
                        background-color: #f8f9fa;
                        padding: 20px;
                        border-radius: 6px;
                        border: 1px solid #dee2e6;
                    }
                    
                    .print-detail-item {
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                    }
                    
                    .print-detail-label {
                        font-size: 11px;
                        color: #6c757d;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    
                    .print-detail-value {
                        font-size: 13px;
                        font-weight: 600;
                        color: #2c3e50;
                    }
                    
                    /* Sekcja adresowa */
                    .print-address-section {
                        display: flex;
                        gap: 30px;
                        margin-bottom: 40px;
                    }
                    
                    .print-address-block {
                        flex: 1;
                        padding: 25px;
                        border: 2px solid #dee2e6;
                        border-radius: 8px;
                        background-color: #fdfdfd;
                    }
                    
                    .print-address-title {
                        font-size: 14px;
                        color: #6c757d;
                        margin-bottom: 15px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        padding-bottom: 8px;
                        border-bottom: 1px solid #dee2e6;
                    }
                    
                    .print-address-name {
                        font-size: 16px;
                        font-weight: 700;
                        color: #2c3e50;
                        margin-bottom: 8px;
                        line-height: 1.2;
                    }
                    
                    .print-address-detail {
                        font-size: 13px;
                        color: #495057;
                        line-height: 1.4;
                        margin-bottom: 4px;
                    }
                    
                    /* Tytuły sekcji */
                    .print-section-title {
                        font-size: 18px;
                        color: #2c3e50;
                        margin: 40px 0 20px 0;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        border-bottom: 2px solid #3498db;
                        padding-bottom: 8px;
                    }
                    
                    .print-section-title::before {
                        content: '';
                        width: 4px;
                        height: 20px;
                        background-color: #3498db;
                        border-radius: 2px;
                    }
                    
                    /* Tabela pozycji */
                    .print-items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                        border: 2px solid #dee2e6;
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    
                    .print-items-table th {
                        padding: 15px 10px;
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        text-align: left;
                        font-weight: 700;
                        color: #2c3e50;
                        border-bottom: 2px solid #dee2e6;
                        font-size: 11px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    
                    .print-items-table td {
                        padding: 12px 10px;
                        border-bottom: 1px solid #dee2e6;
                        vertical-align: top;
                        font-size: 12px;
                    }
                    
                    .print-items-table tbody tr:nth-child(even) {
                        background-color: #f8f9fa;
                    }
                    
                    .print-items-table tfoot {
                        background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
                        font-weight: 700;
                    }
                    
                    .print-items-table tfoot td {
                        padding: 15px 10px;
                        border-top: 2px solid #dee2e6;
                        border-bottom: none;
                        font-size: 13px;
                        color: #2c3e50;
                    }
                    
                    .print-item-name {
                        font-weight: 600;
                        color: #2c3e50;
                        margin-bottom: 4px;
                    }
                    
                    .print-item-description {
                        font-size: 11px;
                        color: #6c757d;
                        font-style: italic;
                        line-height: 1.3;
                    }
                    
                    /* Sekcja podsumowania */
                    .print-summary-section {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        padding: 25px;
                        border-radius: 8px;
                        margin-bottom: 30px;
                        border: 2px solid #dee2e6;
                    }
                    
                    .print-summary-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 20px;
                    }
                    
                    .print-summary-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 0;
                        border-bottom: 1px solid #dee2e6;
                    }
                    
                    .print-summary-item:last-child {
                        border-bottom: none;
                        font-size: 16px;
                        font-weight: 700;
                        padding: 15px 0;
                        border-top: 2px solid #3498db;
                        margin-top: 10px;
                    }
                    
                    .print-summary-label {
                        font-size: 13px;
                        color: #495057;
                        font-weight: 600;
                    }
                    
                    .print-summary-value {
                        font-size: 14px;
                        font-weight: 700;
                        color: #2c3e50;
                    }
                    
                    .print-summary-value.emphasis {
                        font-size: 16px;
                        color: #e74c3c;
                    }
                    
                    /* Sekcja uwag */
                    .print-notes-section {
                        padding: 25px;
                        background-color: #f8f9fa;
                        border-radius: 8px;
                        margin-bottom: 30px;
                        font-size: 13px;
                        color: #495057;
                        border: 1px solid #dee2e6;
                        white-space: pre-line;
                        line-height: 1.6;
                        border-left: 4px solid #3498db;
                    }
                    
                    /* Stopka */
                    .print-footer {
                        margin-top: 50px;
                        padding-top: 20px;
                        border-top: 1px solid #dee2e6;
                        text-align: center;
                        font-size: 11px;
                        color: #6c757d;
                    }
                    
                    /* Style responsywne dla druku */
                    @media print {
                        body {
                            padding: 0;
                            margin: 0;
                        }
                        
                        .print-address-section {
                            page-break-inside: avoid;
                        }
                        
                        .print-items-table {
                            page-break-inside: auto;
                        }
                        
                        .print-items-table thead {
                            display: table-header-group;
                        }
                        
                        .print-items-table tfoot {
                            display: table-footer-group;
                        }
                        
                        .print-summary-section {
                            page-break-inside: avoid;
                        }
                    }
                    
                    /* Dostosowania dla różnych rozmiarów papieru */
                    @page {
                        size: A4;
                        margin: 2cm;
                    }
                </style>
            </head>
            <body>
                <!-- Nagłówek dokumentu - bez tytułu i kierunku -->
                <div class="print-document-header">
                    <div class="print-header-left">
                        <div class="print-document-type">${DocumentTypeLabels[document.type]}</div>
                        <div class="print-document-number">${document.number}</div>
                    </div>
                </div>

                <!-- Szczegóły dokumentu -->
                <div class="print-document-details">
                    <div class="print-detail-item">
                        <div class="print-detail-label">Data wystawienia</div>
                        <div class="print-detail-value">${formatDate(document.issuedDate)}</div>
                    </div>
                    ${document.dueDate ? `
                        <div class="print-detail-item">
                            <div class="print-detail-label">Termin płatności</div>
                            <div class="print-detail-value">${formatDate(document.dueDate)}</div>
                        </div>
                    ` : ''}
                    <div class="print-detail-item">
                        <div class="print-detail-label">Metoda płatności</div>
                        <div class="print-detail-value">${PaymentMethodLabels[document.paymentMethod]}</div>
                    </div>
                    <div class="print-detail-item">
                        <div class="print-detail-label">Waluta</div>
                        <div class="print-detail-value">${document.currency}</div>
                    </div>
                </div>

                <!-- Sekcja adresowa -->
                <div class="print-address-section">
                    <div class="print-address-block">
                        <div class="print-address-title">Sprzedawca</div>
                        <div class="print-address-name">${document.sellerName}</div>
                        ${document.sellerTaxId ? `<div class="print-address-detail">NIP: ${document.sellerTaxId}</div>` : ''}
                        ${document.sellerAddress ? `<div class="print-address-detail">${document.sellerAddress}</div>` : ''}
                    </div>
                    <div class="print-address-block">
                        <div class="print-address-title">Nabywca</div>
                        <div class="print-address-name">${document.buyerName}</div>
                        ${document.buyerTaxId ? `<div class="print-address-detail">NIP: ${document.buyerTaxId}</div>` : ''}
                        ${document.buyerAddress ? `<div class="print-address-detail">${document.buyerAddress}</div>` : ''}
                    </div>
                </div>

                <!-- Pozycje lub podsumowanie -->
                ${generateItemsTable()}
                ${generateSummarySection()}

                <!-- Uwagi -->
                ${document.notes ? `
                    <div class="print-section-title">Uwagi</div>
                    <div class="print-notes-section">${document.notes}</div>
                ` : ''}

                <!-- Stopka -->
                <div class="print-footer">
                    Dokument wygenerowany automatycznie • ${new Date().toLocaleDateString('pl-PL')} ${new Date().toLocaleTimeString('pl-PL')}
                </div>
            </body>
            </html>
        `;

        // Zastąp zawartość okna i uruchom druk
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Czekamy na załadowanie i uruchamiamy druk
        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
    }
}

export default UnifiedDocumentPrintView;