// src/components/PDFViewer.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPrint, FaDownload, FaTimes } from 'react-icons/fa';

interface PDFViewerProps {
    pdfUrl: string;
    onClose: () => void;
    title?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, onClose, title }) => {
    const [isLoading, setIsLoading] = useState(true);

    const handlePrint = () => {
        const printWindow = window.open(pdfUrl, '_blank');
        if (printWindow) {
            printWindow.addEventListener('load', () => {
                printWindow.print();
            });
        }
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = title ? `${title}.pdf` : 'protokol.pdf';
        link.click();
    };

    return (
        <PDFViewerContainer>
            <PDFHeader>
                <HeaderTitle>{title || 'Podgląd dokumentu'}</HeaderTitle>
                <HeaderActions>
                    <ActionButton title="Drukuj" onClick={handlePrint}>
                        <FaPrint />
                    </ActionButton>
                    <ActionButton title="Pobierz" onClick={handleDownload}>
                        <FaDownload />
                    </ActionButton>
                    <ActionButton title="Zamknij" onClick={onClose}>
                        <FaTimes />
                    </ActionButton>
                </HeaderActions>
            </PDFHeader>
            <PDFFrame
                src={pdfUrl}
                title={title || 'PDF Preview'}
                frameBorder="0"
                onLoad={() => setIsLoading(false)}
            />
            {isLoading && (
                <LoadingOverlay>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie dokumentu...</LoadingText>
                </LoadingOverlay>
            )}
        </PDFViewerContainer>
    );
};

// Styled Components
const PDFViewerContainer = styled.div`
  position: fixed;
  top: 50px;
  left: 50px;
  right: 50px;
  bottom: 50px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  z-index: 1100;
  overflow: hidden;
`;

const PDFHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #34495e;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #3498db;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f0f7ff;
  }
`;

const PDFFrame = styled.iframe`
  flex: 1;
  width: 100%;
  border: none;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: #34495e;
`;

export default PDFViewer;