// src/pages/Clients/components/ClientTable/styled.ts
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
`;

export const ClientName = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.sm};
    font-weight: 600;
    font-size: 15px;
    color: ${dataTableTheme.text.primary};
    line-height: 1.3;
`;

export const ContactInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${dataTableTheme.spacing.xs};
    width: 100%;
`;

export const ContactItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.sm};
    font-size: 13px;
`;

export const ContactIcon = styled.div`
    color: ${dataTableTheme.text.muted};
    font-size: 12px;
    width: 16px;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
`;

export const ContactText = styled.span`
    color: ${dataTableTheme.text.secondary};
    font-weight: 500;
    word-break: break-all;
`;

export const CompanyInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${dataTableTheme.spacing.xs};
    width: 100%;
`;

export const CompanyName = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.xs};
    font-size: 14px;
    font-weight: 500;
    color: ${dataTableTheme.text.primary};

    svg {
        color: ${dataTableTheme.text.muted};
        font-size: 12px;
    }
`;

export const TaxId = styled.div`
    font-size: 12px;
    color: ${dataTableTheme.text.muted};
    font-weight: 500;
`;

export const EmptyCompany = styled.div`
    color: ${dataTableTheme.text.muted};
    font-style: italic;
    font-size: 13px;
`;

export const LastVisitDate = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.xs};
    font-size: 13px;
    font-weight: 500;
    color: ${dataTableTheme.text.secondary};

    svg {
        color: ${dataTableTheme.text.muted};
        font-size: 11px;
    }
`;

export const MetricsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.sm};
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
`;

export const MetricLabel = styled.div`
    font-size: 11px;
    color: ${dataTableTheme.text.muted};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

export const MetricSeparator = styled.div`
    color: ${dataTableTheme.borderHover};
    font-weight: bold;
    font-size: 16px;
`;

export const RevenueDisplay = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;

export const RevenueAmount = styled.div`
    font-weight: 700;
    font-size: 16px;
    color: ${dataTableTheme.text.secondary};
    line-height: 1.2;
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
`;

export const CardLabel = styled.span`
    font-size: 14px;
    color: ${dataTableTheme.text.tertiary};
    font-weight: 500;
    flex-shrink: 0;
`;

export const CardValue = styled.span`
    font-size: 14px;
    color: ${dataTableTheme.text.secondary};
    font-weight: 600;
    text-align: right;
    word-break: break-word;
    flex: 1;
    margin-left: ${dataTableTheme.spacing.sm};
`;