// src/pages/Settings/styles/companySettings/CompanySettingsRedesigned.styles.ts
import styled from 'styled-components';

export const PageContainer = styled.div`
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    overflow: hidden;
`;

export const SlideContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideIn 0.3s ease-out;

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;