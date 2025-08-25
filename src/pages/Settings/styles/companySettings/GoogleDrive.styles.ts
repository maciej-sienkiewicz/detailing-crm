// src/pages/Settings/styles/GoogleDrive.styles.ts
import styled from 'styled-components';
import {theme} from '../../../../styles/theme';

export const ConfigStatusBanner = styled.div<{ $configured: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg} ${theme.spacing.xxl};
    background: ${props => props.$configured ? theme.successBg : theme.warningBg};
    color: ${props => props.$configured ? theme.success : theme.warning};
    border-radius: ${theme.radius.md};
    margin-bottom: ${theme.spacing.xxl};
    border: 1px solid ${props => props.$configured ? theme.success + '30' : theme.warning + '30'};
    font-weight: 500;
`;

export const GoogleDriveInfo = styled.div`
    background: ${theme.surfaceElevated};
    border-radius: ${theme.radius.md};
    padding: ${theme.spacing.xxl};
    border: 1px solid ${theme.border};
`;

export const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

export const InfoItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

export const InfoLabel = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${theme.text.tertiary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

export const InfoValue = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: ${theme.text.primary};
`;

export const StatusBadge = styled.span<{ $active: boolean }>`
    display: inline-flex;
    align-items: center;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border-radius: ${theme.radius.sm};
    font-size: 12px;
    font-weight: 600;
    background: ${props => props.$active ? theme.successBg : theme.warningBg};
    color: ${props => props.$active ? theme.success : theme.warning};
    border: 1px solid ${props => props.$active ? theme.success + '30' : theme.warning + '30'};
`;

export const GoogleDriveActions = styled.div`
    display: flex;
    justify-content: center;
    padding: ${theme.spacing.xxl} 0;
    border-top: 1px solid ${theme.border};
    border-bottom: 1px solid ${theme.border};
`;

export const ActionGroup = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};

    @media (max-width: 768px) {
        width: 100%;
        > * {
            flex: 1;
        }
    }
`;

export const GoogleDriveHelp = styled.div`
    background: ${theme.primaryGhost};
    border-radius: ${theme.radius.md};
    padding: ${theme.spacing.xxl};
    border: 1px solid ${theme.primary}20;
`;

export const HelpTitle = styled.h4`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 16px;
    font-weight: 600;
    color: ${theme.primary};
    margin: 0 0 ${theme.spacing.lg} 0;
`;

export const HelpList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
`;

export const HelpItem = styled.li`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.sm};

    &::before {
        content: '✓';
        color: ${theme.success};
        font-weight: bold;
        font-size: 14px;
        margin-top: 1px;
        flex-shrink: 0;
    }
`;

export const GoogleDriveSetupContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xxxl};
`;

export const SetupSteps = styled.div`
    background: ${theme.surfaceElevated};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.xxxl};
    border: 1px solid ${theme.border};
`;

export const SetupTitle = styled.h4`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.xxl} 0;
`;

export const StepsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xxl};
`;

export const SetupStep = styled.div`
    display: flex;
    gap: ${theme.spacing.lg};
    align-items: flex-start;
`;

export const StepNumber = styled.div`
    width: 32px;
    height: 32px;
    background: ${theme.primary};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    flex-shrink: 0;
`;

export const StepContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

export const StepTitle = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

export const StepDescription = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    line-height: 1.5;
`;

export const ExternalLink = styled.a`
    color: ${theme.primary};
    text-decoration: none;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;

    &:hover {
        text-decoration: underline;
    }
`;

export const EmailCopyBox = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    background: ${theme.surfaceElevated};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
`;

export const EmailText = styled.code`
    flex: 1;
    font-family: monospace;
    font-size: 13px;
    color: ${theme.text.primary};
    background: none;
`;

export const CopyButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: ${theme.primary}20;
    color: ${theme.primary};
    border-radius: ${theme.radius.sm};
    cursor: pointer;
    transition: all ${theme.transitions.normal};

    &:hover {
        background: ${theme.primary};
        color: white;
    }
`;

export const ExampleUrl = styled.div`
    font-family: monospace;
    font-size: 12px;
    background: ${theme.surfaceElevated};
    padding: ${theme.spacing.sm};
    border-radius: ${theme.radius.sm};
    margin-top: ${theme.spacing.sm};
    border: 1px solid ${theme.border};
`;

export const HighlightText = styled.span`
    background: ${theme.warningBg};
    color: ${theme.warning};
    padding: 2px 4px;
    border-radius: 3px;
    font-weight: 600;
`;

export const UploadArea = styled.div`
    border: 2px dashed ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.xxxl};
    background: ${theme.surfaceElevated};
    text-align: center;
    transition: all ${theme.transitions.spring};

    &:hover {
        border-color: ${theme.primary};
        background: ${theme.primaryGhost};
    }
`;

export const UploadContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.xxl};
`;

export const UploadIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${theme.primaryGhost};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: ${theme.primary};
`;

export const UploadTitle = styled.h4`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

export const UploadDescription = styled.p`
    font-size: 14px;
    color: ${theme.text.secondary};
    margin: 0;
    font-weight: 500;
`;

export const ValidationResultBox = styled.div<{ $success: boolean }>`
    display: flex;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
    margin-top: ${theme.spacing.lg};
    background: ${props => props.$success ? theme.successBg : theme.errorBg};
    border: 1px solid ${props => props.$success ? theme.success + '30' : theme.error + '30'};
    border-radius: ${theme.radius.md};
`;

export const ValidationIcon = styled.div`
    font-size: 20px;
    flex-shrink: 0;
    margin-top: 2px;
`;

export const ValidationText = styled.div`
    flex: 1;
`;

export const ValidationMessage = styled.div<{ $success: boolean }>`
    font-weight: 600;
    color: ${props => props.$success ? theme.success : theme.error};
`;

export const ValidationInstructions = styled.div`
    margin-top: ${theme.spacing.sm};
`;

export const InstructionTitle = styled.div`
    font-weight: 600;
    font-size: 13px;
    margin-bottom: ${theme.spacing.xs};
    color: ${theme.text.primary};
`;

export const InstructionsList = styled.ul`
    margin: 0;
    padding-left: ${theme.spacing.lg};
    list-style-type: disc;
`;

export const InstructionItem = styled.li`
    font-size: 12px;
    color: ${theme.text.secondary};
    margin-bottom: ${theme.spacing.xs};
    line-height: 1.4;
`;

export const RequirementsBox = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    padding: ${theme.spacing.xxl};
`;

export const RequirementsTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.lg} 0;
`;

export const RequirementsList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
`;

export const RequirementItem = styled.li`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};

    &::before {
        content: '•';
        color: ${theme.primary};
        font-weight: bold;
        font-size: 16px;
    }
`;