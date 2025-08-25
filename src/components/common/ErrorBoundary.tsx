// src/components/common/ErrorBoundary.tsx
import React, {Component, ErrorInfo, ReactNode} from 'react';
import styled from 'styled-components';
import {theme} from '../../styles/theme';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo
        });

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // In production, you might want to log this to an error reporting service
        if (process.env.NODE_ENV === 'production') {
            // Example: Sentry, LogRocket, etc.
            // errorReportingService.logError(error, errorInfo);
        }
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <ErrorContainer>
                    <ErrorCard>
                        <ErrorIcon>🚫</ErrorIcon>
                        <ErrorTitle>Wystąpił nieoczekiwany błąd</ErrorTitle>
                        <ErrorMessage>
                            Przepraszamy za niedogodności. Coś poszło nie tak w aplikacji.
                        </ErrorMessage>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <ErrorDetails>
                                <DetailsTitle>Szczegóły błędu (tryb deweloperski):</DetailsTitle>
                                <ErrorStack>
                                    <strong>Błąd:</strong> {this.state.error.message}
                                    <br />
                                    <strong>Stack trace:</strong>
                                    <pre>{this.state.error.stack}</pre>
                                    {this.state.errorInfo && (
                                        <>
                                            <strong>Component stack:</strong>
                                            <pre>{this.state.errorInfo.componentStack}</pre>
                                        </>
                                    )}
                                </ErrorStack>
                            </ErrorDetails>
                        )}

                        <ButtonGroup>
                            <SecondaryButton onClick={this.handleReset}>
                                Spróbuj ponownie
                            </SecondaryButton>
                            <PrimaryButton onClick={this.handleReload}>
                                Odśwież stronę
                            </PrimaryButton>
                        </ButtonGroup>
                    </ErrorCard>
                </ErrorContainer>
            );
        }

        return this.props.children;
    }
}

// Styled Components
const ErrorContainer = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${theme.surfaceAlt};
    padding: ${theme.spacing.xl};
`;

const ErrorCard = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.xl};
    padding: ${theme.spacing.xxxl};
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    box-shadow: ${theme.shadow.xl};
    text-align: center;
    max-width: 600px;
    width: 100%;
    border: 1px solid ${theme.error}20;
`;

const ErrorIcon = styled.div`
    font-size: 64px;
    opacity: 0.8;
`;

const ErrorTitle = styled.h1`
    font-size: 24px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0;
    line-height: 1.3;
`;

const ErrorMessage = styled.p`
    font-size: 16px;
    color: ${theme.text.secondary};
    margin: 0;
    line-height: 1.5;
    max-width: 400px;
`;

const ErrorDetails = styled.div`
    width: 100%;
    text-align: left;
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.md};
    padding: ${theme.spacing.lg};
    border: 1px solid ${theme.border};
`;

const DetailsTitle = styled.h3`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.md} 0;
`;

const ErrorStack = styled.div`
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    color: ${theme.text.secondary};
    line-height: 1.4;
    max-height: 200px;
    overflow-y: auto;

    pre {
        margin: ${theme.spacing.sm} 0;
        white-space: pre-wrap;
        word-break: break-word;
    }

    strong {
        color: ${theme.text.primary};
        display: block;
        margin-top: ${theme.spacing.md};
        margin-bottom: ${theme.spacing.xs};
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: ${theme.spacing.lg};
    margin-top: ${theme.spacing.lg};

    @media (max-width: 480px) {
        flex-direction: column;
        width: 100%;
    }
`;

const BaseButton = styled.button`
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    border-radius: ${theme.radius.lg};
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid;
    min-width: 140px;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:active {
        transform: translateY(0);
    }

    @media (max-width: 480px) {
        width: 100%;
    }
`;

const PrimaryButton = styled(BaseButton)`
    background: ${theme.primary};
    color: white;
    border-color: ${theme.primary};

    &:hover {
        background: ${theme.primaryDark};
        border-color: ${theme.primaryDark};
    }
`;

const SecondaryButton = styled(BaseButton)`
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border-color: ${theme.border};

    &:hover {
        background: ${theme.surfaceHover};
        border-color: ${theme.borderActive};
        color: ${theme.text.primary};
    }
`;

// Hook for functional components to trigger error boundary
export const useErrorHandler = () => {
    return (error: Error, errorInfo?: any) => {
        // This will be caught by the nearest Error Boundary
        throw error;
    };
};

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode,
    onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary fallback={fallback} onError={onError}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
};