// src/components/common/ApiErrorDialog.tsx
import React from 'react';
import styled, { keyframes } from 'styled-components';
import {
    FaTimes,
    FaExclamationTriangle,
    FaFileAlt,
    FaWifi,
    FaLock,
    FaBug
} from 'react-icons/fa';

interface ApiErrorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    error: ApiError | null;
    onRetry?: () => void;
}

export interface ApiError {
    status: number;
    error?: string;
    message: string;
    timestamp?: string;
    path?: string;
}

export const ApiErrorDialog: React.FC<ApiErrorDialogProps> = ({
                                                                  isOpen,
                                                                  onClose,
                                                                  error,
                                                                  onRetry
                                                              }) => {
    if (!isOpen || !error) return null;

    const getErrorConfig = (error: ApiError) => {
        switch (error.status) {
            case 406:
                if (error.error === 'TEMPLATE_NOT_FOUND') {
                    return {
                        icon: <FaFileAlt />,
                        iconColor: '#f59e0b',
                        iconBg: '#fef3c7',
                        title: 'Szablon nie został znaleziony',
                        description: 'Nie można wygenerować dokumentu ponieważ wymagany szablon nie istnieje lub został usunięty.',
                        showRetry: false
                    };
                }
                return {
                    icon: <FaExclamationTriangle />,
                    iconColor: '#f59e0b',
                    iconBg: '#fef3c7',
                    title: 'Nieprawidłowe żądanie',
                    description: 'Serwer nie może przetworzyć żądania w obecnej formie.',
                    showRetry: true
                };
            case 404:
                return {
                    icon: <FaFileAlt />,
                    iconColor: '#6b7280',
                    iconBg: '#f3f4f6',
                    title: 'Zasób nie został znaleziony',
                    description: 'Żądany zasób nie istnieje lub został przeniesiony.',
                    showRetry: false
                };
            case 401:
                return {
                    icon: <FaLock />,
                    iconColor: '#ef4444',
                    iconBg: '#fef2f2',
                    title: 'Brak autoryzacji',
                    description: 'Sesja wygasła lub nie masz uprawnień do wykonania tej operacji.',
                    showRetry: false
                };
            case 403:
                return {
                    icon: <FaLock />,
                    iconColor: '#ef4444',
                    iconBg: '#fef2f2',
                    title: 'Brak uprawnień',
                    description: 'Nie masz wystarczających uprawnień do wykonania tej operacji.',
                    showRetry: false
                };
            case 500:
                return {
                    icon: <FaBug />,
                    iconColor: '#ef4444',
                    iconBg: '#fef2f2',
                    title: 'Błąd serwera',
                    description: 'Wystąpił nieoczekiwany błąd po stronie serwera. Spróbuj ponownie za chwilę.',
                    showRetry: true
                };
            case 0:
                return {
                    icon: <FaWifi />,
                    iconColor: '#6b7280',
                    iconBg: '#f3f4f6',
                    title: 'Brak połączenia',
                    description: 'Nie można połączyć się z serwerem. Sprawdź połączenie internetowe.',
                    showRetry: true
                };
            default:
                return {
                    icon: <FaExclamationTriangle />,
                    iconColor: '#f59e0b',
                    iconBg: '#fef3c7',
                    title: 'Wystąpił błąd',
                    description: 'Wystąpił nieoczekiwany błąd podczas przetwarzania żądania.',
                    showRetry: true
                };
        }
    };

    const config = getErrorConfig(error);

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ErrorIcon $color={config.iconColor} $bgColor={config.iconBg}>
                        {config.icon}
                    </ErrorIcon>
                    <HeaderContent>
                        <ErrorTitle>{config.title}</ErrorTitle>
                        <ErrorCode>Kod błędu: {error.status}</ErrorCode>
                    </HeaderContent>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <ErrorDescription>{config.description}</ErrorDescription>

                    {error.message && (
                        <ErrorDetails>
                            <DetailsTitle>Szczegóły błędu:</DetailsTitle>
                            <DetailsMessage>{error.message}</DetailsMessage>
                        </ErrorDetails>
                    )}

                    {error.timestamp && (
                        <ErrorMeta>
                            Wystąpił: {new Date(error.timestamp).toLocaleString('pl-PL')}
                        </ErrorMeta>
                    )}
                </ModalBody>

                <ModalFooter>
                    <ButtonGroup>
                        <SecondaryButton onClick={onClose}>
                            <FaTimes />
                            Zamknij
                        </SecondaryButton>

                        {config.showRetry && onRetry && (
                            <RetryButton onClick={() => { onClose(); onRetry(); }}>
                                Spróbuj ponownie
                            </RetryButton>
                        )}
                    </ButtonGroup>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Hook do obsługi błędów API
export const useApiErrorHandler = () => {
    const [apiError, setApiError] = React.useState<ApiError | null>(null);

    const handleApiError = React.useCallback((error: any) => {
        console.error('🔍 Analyzing API Error:', {
            error,
            hasResponse: !!error?.response,
            hasRequest: !!error?.request,
            message: error?.message,
            status: error?.status || error?.response?.status,
            data: error?.response?.data || error?.data
        });

        let parsedError: ApiError;

        // Przypadek 1: Błąd z axios/fetch z response
        if (error?.response) {
            const { status, data } = error.response;

            parsedError = {
                status,
                error: data?.error,
                message: data?.message || `Błąd HTTP ${status}`,
                timestamp: data?.timestamp,
                path: data?.path
            };
        }
        // Przypadek 2: Błąd z apiClient - sprawdź czy w message jest JSON
        else if (error?.message && typeof error.message === 'string') {
            // Próbuj wyciągnąć JSON z błędu rzuconego przez apiClient
            try {
                // Sprawdź czy error.message zawiera JSON
                const jsonMatch = error.message.match(/\{.*\}/);
                if (jsonMatch) {
                    const errorData = JSON.parse(jsonMatch[0]);
                    parsedError = {
                        status: errorData.status || 406, // Domyślnie 406 jeśli nie ma statusu
                        error: errorData.error,
                        message: errorData.message || error.message,
                        timestamp: errorData.timestamp,
                        path: errorData.path
                    };
                } else {
                    // Spróbuj wyciągnąć status z message (np. "HTTP error 406")
                    const statusMatch = error.message.match(/HTTP error (\d+)/);
                    const status = statusMatch ? parseInt(statusMatch[1]) : 500;

                    parsedError = {
                        status,
                        message: error.message,
                        timestamp: new Date().toISOString()
                    };
                }
            } catch (parseError) {
                // Jeśli nie udało się sparsować, użyj oryginalnego message
                const statusMatch = error.message.match(/HTTP error (\d+)/);
                const status = statusMatch ? parseInt(statusMatch[1]) : 500;

                parsedError = {
                    status,
                    message: error.message,
                    timestamp: new Date().toISOString()
                };
            }
        }
        // Przypadek 3: Obiekt z gotowymi danymi JSON
        else if (error?.status && (error?.error || error?.message)) {
            parsedError = {
                status: error.status,
                error: error.error,
                message: error.message || `Błąd HTTP ${error.status}`,
                timestamp: error.timestamp,
                path: error.path
            };
        }
        // Przypadek 4: Błąd sieci (brak response)
        else if (error?.request) {
            parsedError = {
                status: 0,
                message: 'Brak odpowiedzi od serwera. Sprawdź połączenie internetowe.',
                timestamp: new Date().toISOString()
            };
        }
        // Przypadek 5: Fallback
        else {
            parsedError = {
                status: 500,
                message: error?.message || 'Wystąpił nieoczekiwany błąd',
                timestamp: new Date().toISOString()
            };
        }
        setApiError(parsedError);
    }, []);

    const clearError = React.useCallback(() => {
        setApiError(null);
    }, []);

    return {
        apiError,
        handleApiError,
        clearError
    };
};

// Styled Components
const corporateTheme = {
    primary: '#1a365d',
    primaryLight: '#2c5aa0',
    surface: '#ffffff',
    surfaceElevated: '#fafbfc',
    surfaceHover: '#f8fafc',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    status: {
        success: '#059669',
        successLight: '#f0fdf4',
        error: '#dc2626',
        errorLight: '#fef2f2',
        warning: '#d97706',
        warningLight: '#fffbeb'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px'
    },
    shadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    }
};

const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const slideIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    backdrop-filter: blur(4px);
    animation: ${fadeIn} 0.2s ease-out;
    padding: ${corporateTheme.spacing.lg};
`;

const ModalContainer = styled.div`
    background: ${corporateTheme.surface};
    border-radius: ${corporateTheme.radius.lg};
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid ${corporateTheme.border};
    box-shadow: ${corporateTheme.shadow.xl};
    animation: ${slideIn} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${corporateTheme.spacing.md};
    padding: ${corporateTheme.spacing.lg} ${corporateTheme.spacing.xl};
    border-bottom: 1px solid ${corporateTheme.border};
    background: ${corporateTheme.surfaceElevated};
`;

const ErrorIcon = styled.div<{ $color: string; $bgColor: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${props => props.$bgColor};
    color: ${props => props.$color};
    border-radius: ${corporateTheme.radius.md};
    font-size: 20px;
    flex-shrink: 0;
`;

const HeaderContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.xs};
`;

const ErrorTitle = styled.h2`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: ${corporateTheme.text.primary};
    line-height: 1.3;
`;

const ErrorCode = styled.div`
    font-size: 12px;
    color: ${corporateTheme.text.tertiary};
    font-weight: 500;
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: none;
    border: none;
    color: ${corporateTheme.text.tertiary};
    cursor: pointer;
    border-radius: ${corporateTheme.radius.sm};
    transition: all 0.15s ease;

    &:hover {
        background: ${corporateTheme.surfaceHover};
        color: ${corporateTheme.text.primary};
    }
`;

const ModalBody = styled.div`
    padding: ${corporateTheme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.md};
    overflow-y: auto;
`;

const ErrorDescription = styled.div`
    font-size: 15px;
    line-height: 1.6;
    color: ${corporateTheme.text.secondary};
`;

const ErrorDetails = styled.div`
    background: ${corporateTheme.surfaceElevated};
    border: 1px solid ${corporateTheme.borderLight};
    border-radius: ${corporateTheme.radius.md};
    padding: ${corporateTheme.spacing.md};
`;

const DetailsTitle = styled.div`
    font-size: 13px;
    font-weight: 600;
    color: ${corporateTheme.text.primary};
    margin-bottom: ${corporateTheme.spacing.sm};
`;

const DetailsMessage = styled.div`
    font-size: 13px;
    line-height: 1.5;
    color: ${corporateTheme.text.secondary};
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
    background: ${corporateTheme.surface};
    border: 1px solid ${corporateTheme.borderLight};
    border-radius: ${corporateTheme.radius.sm};
    padding: ${corporateTheme.spacing.sm};
`;

const ErrorMeta = styled.div`
    font-size: 12px;
    color: ${corporateTheme.text.muted};
    text-align: center;
    border-top: 1px solid ${corporateTheme.borderLight};
    padding-top: ${corporateTheme.spacing.md};
`;

const ModalFooter = styled.div`
    padding: ${corporateTheme.spacing.lg} ${corporateTheme.spacing.xl};
    border-top: 1px solid ${corporateTheme.border};
    background: ${corporateTheme.surfaceElevated};
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${corporateTheme.spacing.sm};
`;

const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${corporateTheme.spacing.sm};
    padding: ${corporateTheme.spacing.sm} ${corporateTheme.spacing.md};
    background: ${corporateTheme.surface};
    color: ${corporateTheme.text.secondary};
    border: 1px solid ${corporateTheme.border};
    border-radius: ${corporateTheme.radius.sm};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: ${corporateTheme.surfaceHover};
        border-color: ${corporateTheme.text.muted};
    }
`;

const RetryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${corporateTheme.spacing.sm};
    padding: ${corporateTheme.spacing.sm} ${corporateTheme.spacing.md};
    background: ${corporateTheme.primary};
    color: white;
    border: 1px solid ${corporateTheme.primary};
    border-radius: ${corporateTheme.radius.sm};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: ${corporateTheme.primaryLight};
        transform: translateY(-1px);
    }
`;