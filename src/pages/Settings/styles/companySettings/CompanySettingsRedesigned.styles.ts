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
                radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(26, 54, 93, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(99, 102, 241, 0.02) 0%, transparent 50%);
        pointer-events: none;
    }
`;

export const SlideContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    z-index: 1;
    animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(24px) scale(0.98);
        }
        to {
            opacity: 1;
            transform: translateX(0) scale(1);
        }
    }
`;