import styled from 'styled-components';
import {settingsTheme} from '../../pages/Settings/styles/theme';

export const InstructionsContent = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
`;

export const InstructionsTabs = styled.div`
    display: flex;
    border-bottom: 1px solid ${settingsTheme.border};
    background: ${settingsTheme.surfaceAlt};
    flex-shrink: 0;
`;

export const InstructionsTab = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};
    padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
    border: none;
    background: ${props => props.$active ? settingsTheme.surface : 'transparent'};
    color: ${props => props.$active ? settingsTheme.primary : settingsTheme.text.secondary};
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 3px solid ${props => props.$active ? settingsTheme.primary : 'transparent'};
    white-space: nowrap;

    &:hover {
        background: ${props => props.$active ? settingsTheme.surface : settingsTheme.surfaceHover};
        color: ${props => props.$active ? settingsTheme.primary : settingsTheme.text.primary};
    }
`;

export const InstructionsTabContent = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: ${settingsTheme.spacing.xl};

    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: ${settingsTheme.surfaceAlt};
    }
    
    &::-webkit-scrollbar-thumb {
        background: ${settingsTheme.border};
        border-radius: 4px;
    }
`;

export const TabPanel = styled.div`
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

export const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 700;
    color: ${settingsTheme.text.primary};
    margin: 0 0 ${settingsTheme.spacing.md} 0;
    padding-bottom: ${settingsTheme.spacing.sm};
    border-bottom: 2px solid ${settingsTheme.surfaceAlt};
`;

export const InstructionsList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0 0 ${settingsTheme.spacing.lg} 0;
`;

export const InstructionItem = styled.li`
    padding: ${settingsTheme.spacing.sm} 0;
    border-bottom: 1px solid ${settingsTheme.borderLight};
    font-size: 14px;
    line-height: 1.5;
    color: ${settingsTheme.text.secondary};

    &:last-child {
        border-bottom: none;
    }

    strong {
        color: ${settingsTheme.text.primary};
        font-weight: 600;
    }
`;

export const CodeBlock = styled.pre`
    background: ${settingsTheme.surfaceAlt};
    border: 1px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    padding: ${settingsTheme.spacing.md};
    font-size: 12px;
    font-family: 'Courier New', monospace;
    color: ${settingsTheme.text.primary};
    overflow-x: auto;
    margin: ${settingsTheme.spacing.md} 0;
    white-space: pre-wrap;
    word-wrap: break-word;

    &::-webkit-scrollbar {
        height: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: ${settingsTheme.surfaceAlt};
    }
    
    &::-webkit-scrollbar-thumb {
        background: ${settingsTheme.border};
        border-radius: 3px;
    }
`;

export const WarningBox = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.sm};
    background: ${settingsTheme.status.warningLight};
    border: 1px solid ${settingsTheme.status.warning}30;
    border-radius: ${settingsTheme.radius.md};
    padding: ${settingsTheme.spacing.md};
    margin: ${settingsTheme.spacing.md} 0;
    font-size: 13px;
    color: ${settingsTheme.status.warning};

    svg {
        flex-shrink: 0;
        margin-top: 2px;
    }

    strong {
        font-weight: 700;
    }
`;

export const InfoBox = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.sm};
    background: ${settingsTheme.primaryGhost};
    border: 1px solid ${settingsTheme.primary}30;
    border-radius: ${settingsTheme.radius.md};
    padding: ${settingsTheme.spacing.md};
    margin: ${settingsTheme.spacing.md} 0;
    font-size: 13px;
    color: ${settingsTheme.primary};

    svg {
        flex-shrink: 0;
        margin-top: 2px;
    }

    strong {
        font-weight: 700;
    }
`;

export const VariableGroup = styled.div`
    margin-bottom: ${settingsTheme.spacing.lg};
`;

export const VariableGroupTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    margin: 0 0 ${settingsTheme.spacing.sm} 0;
    padding: ${settingsTheme.spacing.sm} 0;
    border-bottom: 1px solid ${settingsTheme.border};
`;

export const VariablesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.xs};
`;

export const VariableItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: ${settingsTheme.spacing.sm};
    background: ${settingsTheme.surface};
    border: 1px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.sm};
    gap: ${settingsTheme.spacing.md};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${settingsTheme.spacing.xs};
    }
`;

export const VariableCode = styled.code`
    background: ${settingsTheme.surfaceAlt};
    color: ${settingsTheme.primary};
    padding: 2px 6px;
    border-radius: ${settingsTheme.radius.sm};
    font-family: 'Courier New', monospace;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    border: 1px solid ${settingsTheme.primary}20;
`;

export const VariableDescription = styled.div`
    color: ${settingsTheme.text.secondary};
    font-size: 13px;
    flex: 1;
    text-align: right;

    @media (max-width: 768px) {
        text-align: left;
    }
`;

export const RequirementGroup = styled.div`
    margin-bottom: ${settingsTheme.spacing.lg};
`;

export const RequirementTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    margin: 0 0 ${settingsTheme.spacing.sm} 0;
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};
`;

export const RequirementsList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

export const RequirementItem = styled.li`
    padding: ${settingsTheme.spacing.xs} 0;
    font-size: 14px;
    line-height: 1.5;
    color: ${settingsTheme.text.secondary};
    position: relative;
    padding-left: ${settingsTheme.spacing.md};

    &:before {
        content: '•';
        color: ${settingsTheme.primary};
        font-weight: bold;
        position: absolute;
        left: 0;
    }
`;