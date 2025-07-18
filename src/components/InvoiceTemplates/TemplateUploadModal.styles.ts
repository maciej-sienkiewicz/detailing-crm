import styled from 'styled-components';
import { settingsTheme } from '../../pages/Settings/styles/theme';

export const FileUploadArea = styled.div`
    position: relative;
    border: 2px dashed ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.lg};
    padding: ${settingsTheme.spacing.xl};
    text-align: center;
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
        border-color: ${settingsTheme.primary};
        background: ${settingsTheme.primaryGhost};
    }
`;

export const FileInput = styled.input`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;

    &:disabled {
        cursor: not-allowed;
    }
`;

export const FileUploadContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    pointer-events: none;
`;

export const FileUploadText = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
`;

export const FileUploadHint = styled.div`
    font-size: 12px;
    color: ${settingsTheme.text.muted};
`;