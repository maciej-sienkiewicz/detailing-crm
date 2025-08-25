// src/pages/Settings/components/ValidationStatus.tsx
import React from 'react';
import {FaCheckCircle, FaExclamationTriangle, FaSpinner} from 'react-icons/fa';
import styled from 'styled-components';

interface ValidationStatusProps {
    valid: boolean;
    loading?: boolean;
}

export const ValidationStatus: React.FC<ValidationStatusProps> = ({ valid, loading }) => {
    return (
        <ValidationContainer $valid={valid}>
            {loading ? (
                <FaSpinner className="spinning" />
            ) : valid ? (
                <FaCheckCircle />
            ) : (
                <FaExclamationTriangle />
            )}
        </ValidationContainer>
    );
};

const ValidationContainer = styled.div<{ $valid: boolean }>`
    font-size: 14px;
    color: ${props => props.$valid ? '#059669' : '#d97706'};
    margin-left: auto;

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;