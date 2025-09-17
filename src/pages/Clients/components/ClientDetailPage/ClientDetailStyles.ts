import styled from 'styled-components';
import { theme } from "../../../../styles/theme";

export const PageContainer = styled.div`
    min-height: 100vh;
    background: ${theme.surfaceAlt};
    padding: ${theme.spacing.lg};

    @media (max-width: 768px) {
        padding: ${theme.spacing.md};
    }
`;

export const ContentContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: ${theme.spacing.xl};

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.lg};
    }
`;

export const MainContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
`;

export const Sidebar = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};

    @media (max-width: 1024px) {
        order: -1;
    }
`;

export const Section = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    padding: ${theme.spacing.xl};
    box-shadow: ${theme.shadow.sm};
    border: 1px solid ${theme.border};
`;

export const SectionTitle = styled.h2`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.lg} 0;
    padding-bottom: ${theme.spacing.md};
    border-bottom: 2px solid ${theme.primaryGhost};

    svg {
        color: ${theme.primary};
        font-size: 16px;
    }
`;

export const SidebarSection = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    box-shadow: ${theme.shadow.xs};
    border: 1px solid ${theme.border};
`;

export const SidebarSectionTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.md} 0;
    padding-bottom: ${theme.spacing.sm};
    border-bottom: 1px solid ${theme.borderLight};

    svg {
        color: ${theme.primary};
        font-size: 14px;
    }
`;

export const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: ${theme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${theme.spacing.md};
    }
`;

export const InfoItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

export const InfoLabel = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    font-size: 12px;
    font-weight: 500;
    color: ${theme.text.tertiary};
    text-transform: uppercase;
    letter-spacing: 0.5px;

    svg {
        font-size: 11px;
        color: ${theme.text.muted};
    }
`;

export const InfoValue = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: ${theme.text.primary};
    line-height: 1.3;
`;

export const EmptyMessage = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xl};
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.lg};
    border: 2px dashed ${theme.border};
    text-align: center;
    gap: ${theme.spacing.md};
`;

export const EmptyIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${theme.surface};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: ${theme.text.tertiary};
    box-shadow: ${theme.shadow.xs};
`;

export const EmptyText = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.secondary};
`;

export const EmptySubtext = styled.div`
    font-size: 14px;
    color: ${theme.text.muted};
    font-style: italic;
`;

export const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: ${theme.spacing.lg};
`;

export const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid ${theme.borderLight};
    border-top: 3px solid ${theme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export const LoadingText = styled.div`
    font-size: 16px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

export const ErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: ${theme.spacing.lg};
    text-align: center;
`;

export const ErrorMessage = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.status.error};
`;

export const BackButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.primary};
    color: white;
    border: none;
    border-radius: ${theme.radius.md};
    font-weight: 600;
    cursor: pointer;
    transition: all ${theme.transitions.normal};

    &:hover {
        background: ${theme.primaryDark};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }
`;