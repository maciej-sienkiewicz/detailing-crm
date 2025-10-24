// src/pages/Settings/styles/companySettings/CompanySettingsRedesigned.styles.ts
import styled from 'styled-components';

export const PageContainer = styled.div`
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg,
    #f8fafc 0%,
    #f1f5f9 25%,
    #e2e8f0 75%,
    #cbd5e1 100%
    );
    overflow: hidden;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background:
                radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.02) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(26, 54, 93, 0.02) 0%, transparent 50%);
        pointer-events: none;
    }
`;

export const ContentWrapper = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    max-width: 1600px;
    width: 100%;
    margin: 20px auto 0;
    padding: 0 24px;
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
        margin: 16px auto 0;
        padding: 0 16px;
    }
`;

export const SlideContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
    border-radius: 0 0 16px 16px;
    box-shadow: 
        0 8px 32px rgba(15, 23, 42, 0.08),
        0 4px 16px rgba(15, 23, 42, 0.04);
    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;