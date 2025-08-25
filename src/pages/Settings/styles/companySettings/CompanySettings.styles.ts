// src/pages/Settings/styles/CompanySettings.styles.ts
import styled from 'styled-components';
import {theme} from '../../../../styles/theme';

export const PageContainer = styled.div`
    min-height: 100vh;
    background: ${theme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

export const ContentContainer = styled.div`
    flex: 1;
    max-width: 1600px;
    margin: 0 auto;
    padding: ${theme.spacing.xxxl} ${theme.spacing.xxxl} ${theme.spacing.xxxl};
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xxl};
    min-height: 0;

    @media (max-width: 1024px) {
        padding: ${theme.spacing.xxl} ${theme.spacing.xxl} ${theme.spacing.xxl};
    }

    @media (max-width: 768px) {
        padding: ${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing.lg};
        gap: ${theme.spacing.lg};
    }
`;

export const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxxl};
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    margin: ${theme.spacing.xxxl};
    gap: ${theme.spacing.lg};
    min-height: 400px;
`;

export const ErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxxl};
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    margin: ${theme.spacing.xxxl};
    gap: ${theme.spacing.lg};
    min-height: 400px;
`;