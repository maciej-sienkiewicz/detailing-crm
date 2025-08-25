// src/components/PDFViewer.tsx
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaSpinner, FaTimes} from 'react-icons/fa';

interface PDFViewerProps {
    protocolId: string;
    onClose: () => void;
    title?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ protocolId, onClose, title }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadPdf = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Importujemy dynamicznie dla lepszego code splitting
                const { pdfService } = await import('../api/pdfService');
                const blobUrl = await pdfService.fetchPdfAsBlob(protocolId);

                if (isMounted) {
                    setPdfBlobUrl(blobUrl);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Błąd ładowania PDF:', err);
                if (isMounted) {
                    setError('Nie udało się załadować dokumentu PDF. Spróbuj ponownie później.');
                    setIsLoading(false);
                }
            }
        };

        loadPdf();

        // Cleanup - zwolnij URL Bloba przy odmontowaniu komponentu
        return () => {
            isMounted = false;
            if (pdfBlobUrl) {
                URL.revokeObjectURL(pdfBlobUrl);
            }
        };
    }, [protocolId]);

    return (
        <PDFViewerContainer>
            <PDFHeader>
                <HeaderTitle>{title || `Protokół przyjęcia pojazdu #${protocolId}`}</HeaderTitle>
                <HeaderActions>
                    <ActionButton title="Zamknij" onClick={onClose}>
                        <FaTimes />
                    </ActionButton>
                </HeaderActions>
            </PDFHeader>

            <PDFContentContainer>
                {isLoading && (
                    <LoadingOverlay>
                        <FaSpinner className="spinner" />
                        <LoadingText>Ładowanie dokumentu...</LoadingText>
                    </LoadingOverlay>
                )}

                {error && (
                    <ErrorOverlay>
                        <ErrorIcon>!</ErrorIcon>
                        <ErrorText>{error}</ErrorText>
                        <RetryButton onClick={() => window.location.reload()}>
                            Odśwież stronę
                        </RetryButton>
                    </ErrorOverlay>
                )}

                {!isLoading && !error && pdfBlobUrl && (
                    <PDFFrame
                        src={pdfBlobUrl}
                        title={title || `Podgląd protokołu ${protocolId}`}
                        frameBorder="0"
                    />
                )}
            </PDFContentContainer>
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

const ActionButton = styled.button<{ disabled?: boolean }>`
    background: none;
    border: none;
    color: ${props => props.disabled ? '#bdc3c7' : '#3498db'};
    font-size: 16px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 4px;

    &:hover:not(:disabled) {
        background-color: #f0f7ff;
    }
`;

const PDFContentContainer = styled.div`
    flex: 1;
    position: relative;
    overflow: hidden;
    background-color: #f5f5f5;
`;

const PDFFrame = styled.iframe`
    width: 100%;
    height: 100%;
    border: none;
    display: block;
`;

const LoadingOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .spinner {
        font-size: 40px;
        color: #3498db;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: #34495e;
    margin-top: 15px;
`;

const ErrorOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ErrorIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #e74c3c;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const ErrorText = styled.div`
  font-size: 16px;
  color: #34495e;
  text-align: center;
  margin-bottom: 20px;
  max-width: 600px;
`;

const RetryButton = styled.button`
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #2980b9;
  }
`;

export default PDFViewer;