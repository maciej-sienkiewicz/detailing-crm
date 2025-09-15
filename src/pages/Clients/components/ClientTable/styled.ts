// src/pages/Clients/components/ClientTable/styled.ts - Ulepszone responsive style
import styled from 'styled-components';
import { dataTableTheme } from '../../../../components/common/DataTable';

export const SelectionCheckbox = styled.div<{ $selected?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    color: ${props => props.$selected ? dataTableTheme.primary : dataTableTheme.text.muted};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    padding: ${dataTableTheme.spacing.xs};
    border-radius: ${dataTableTheme.radius.sm};
    width: 100%;

    &:hover {
        color: ${dataTableTheme.primary};
        background: ${dataTableTheme.primaryGhost};
        transform: scale(1.1);
    }
`;

export const ClientInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${dataTableTheme.spacing.xs};
    width: 100%;
    min-width: 0; /* Umożliwia skracanie tekstu */
`;

export const ClientName = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.sm};
    font-weight: 600;
    font-size: 15px;
    color: ${dataTableTheme.text.primary};
    line-height: 1.3;
    min-width: 0;

    /* Zapewnienie że nazwa nie wychodzi poza kontener */
    overflow: hidden;

    @media (max-width: 1200px) {
        font-size: 14px;
        flex-wrap: wrap;
        gap: ${dataTableTheme.spacing.xs};
    }
`;

export const ContactInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${dataTableTheme.spacing.xs};
    width: 100%;
    min-width: 0;
`;

export const ContactItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.sm};
    font-size: 13px;
    min-width: 0;

    @media (max-width: 1200px) {
        font-size: 12px;
        gap: ${dataTableTheme.spacing.xs};
    }
`;

export const ContactIcon = styled.div`
    color: ${dataTableTheme.text.muted};
    font-size: 12px;
    width: 16px;
    display: flex;
    justify-content: center;
    flex-shrink: 0;

    @media (max-width: 1200px) {
        width: 14px;
        font-size: 11px;
    }
`;

export const ContactText = styled.span`
    color: ${dataTableTheme.text.secondary};
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    flex: 1;

    @media (max-width: 1200px) {
        font-size: 12px;
    }
`;

export const CompanyInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${dataTableTheme.spacing.xs};
    width: 100%;
    min-width: 0;
`;

export const CompanyName = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.xs};
    font-size: 14px;
    font-weight: 500;
    color: ${dataTableTheme.text.primary};
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    svg {
        color: ${dataTableTheme.text.muted};
        font-size: 12px;
        flex-shrink: 0;
    }

    @media (max-width: 1200px) {
        font-size: 13px;

        svg {
            font-size: 11px;
        }
    }
`;

export const TaxId = styled.div`
    font-size: 12px;
    color: ${dataTableTheme.text.muted};
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 1200px) {
        font-size: 11px;
    }
`;

export const EmptyCompany = styled.div`
    color: ${dataTableTheme.text.muted};
    font-style: italic;
    font-size: 13px;

    @media (max-width: 1200px) {
        font-size: 12px;
    }
`;

export const LastVisitDate = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.xs};
    font-size: 13px;
    font-weight: 500;
    color: ${dataTableTheme.text.secondary};
    justify-content: center;
    text-align: center;

    svg {
        color: ${dataTableTheme.text.muted};
        font-size: 11px;
        flex-shrink: 0;
    }

    @media (max-width: 1200px) {
        font-size: 12px;
        flex-direction: column;
        gap: 2px;

        svg {
            font-size: 10px;
        }
    }
`;

export const MetricsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.sm};
    justify-content: center;

    @media (max-width: 1200px) {
        flex-direction: column;
        gap: ${dataTableTheme.spacing.xs};
    }
`;

export const MetricItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 0;
`;

export const MetricValue = styled.div`
    font-weight: 700;
    font-size: 16px;
    color: ${dataTableTheme.text.secondary};
    line-height: 1.2;

    @media (max-width: 1200px) {
        font-size: 14px;
    }
`;

export const MetricLabel = styled.div`
    font-size: 11px;
    color: ${dataTableTheme.text.muted};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: center;

    @media (max-width: 1200px) {
        font-size: 10px;
    }
`;

export const MetricSeparator = styled.div`
    color: ${dataTableTheme.borderHover};
    font-weight: bold;
    font-size: 16px;

    @media (max-width: 1200px) {
        display: none;
    }
`;

export const RevenueDisplay = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    text-align: right;
    width: 100%;
`;

export const RevenueAmount = styled.div`
    font-weight: 700;
    font-size: 16px;
    color: ${dataTableTheme.text.secondary};
    line-height: 1.2;

    @media (max-width: 1200px) {
        font-size: 14px;
    }
`;

export const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${dataTableTheme.spacing.md};
    gap: ${dataTableTheme.spacing.sm};
`;

export const CardTitle = styled.h4`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.sm};
    font-size: 16px;
    font-weight: 600;
    color: ${dataTableTheme.text.primary};
    margin: 0;
    flex: 1;
    min-width: 0;

    @media (max-width: 768px) {
        font-size: 15px;
    }
`;

export const CardHeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.sm};
    flex-shrink: 0;
`;

export const CardActions = styled.div`
    display: flex;
    gap: ${dataTableTheme.spacing.xs};
    flex-wrap: wrap;
`;

export const CardContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${dataTableTheme.spacing.sm};
`;

export const CardRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 24px;
    gap: ${dataTableTheme.spacing.sm};
`;

export const CardLabel = styled.span`
    font-size: 14px;
    color: ${dataTableTheme.text.tertiary};
    font-weight: 500;
    flex-shrink: 0;

    @media (max-width: 768px) {
        font-size: 13px;
    }
`;

export const CardValue = styled.span`
    font-size: 14px;
    color: ${dataTableTheme.text.secondary};
    font-weight: 600;
    text-align: right;
    word-break: break-word;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (max-width: 768px) {
        font-size: 13px;
    }
`;