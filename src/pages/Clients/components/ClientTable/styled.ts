import styled from 'styled-components';
import { dataTableTheme } from '../../../../components/common/DataTable';

export const SelectionCheckbox = styled.div<{ $selected?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    color: ${props => props.$selected ? dataTableTheme.primary : dataTableTheme.text.muted};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 2px;
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
    gap: 2px;
    width: 100%;
    min-width: 0;
`;

export const ClientName = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    font-size: 12px;
    color: ${dataTableTheme.text.primary};
    line-height: 1.3;
    min-width: 0;
    overflow: hidden;

    @media (max-width: 1200px) {
        font-size: 11px;
        flex-wrap: wrap;
        gap: 4px;
    }
`;

export const ContactInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    min-width: 0;
`;

export const ContactItem = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    min-width: 0;

    @media (max-width: 1200px) {
        font-size: 10px;
        gap: 4px;
    }
`;

export const ContactIcon = styled.div`
    color: ${dataTableTheme.text.muted};
    font-size: 10px;
    width: 12px;
    display: flex;
    justify-content: center;
    flex-shrink: 0;

    @media (max-width: 1200px) {
        width: 10px;
        font-size: 9px;
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
        font-size: 10px;
    }
`;

export const CompanyInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    min-width: 0;
`;

export const CompanyName = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 500;
    color: ${dataTableTheme.text.primary};
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    svg {
        color: ${dataTableTheme.text.muted};
        font-size: 10px;
        flex-shrink: 0;
    }

    @media (max-width: 1200px) {
        font-size: 10px;

        svg {
            font-size: 9px;
        }
    }
`;

export const TaxId = styled.div`
    font-size: 10px;
    color: ${dataTableTheme.text.muted};
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 1200px) {
        font-size: 9px;
    }
`;

export const EmptyCompany = styled.div`
    color: ${dataTableTheme.text.muted};
    font-style: italic;
    font-size: 11px;

    @media (max-width: 1200px) {
        font-size: 10px;
    }
`;

export const LastVisitDate = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 500;
    color: ${dataTableTheme.text.secondary};
    justify-content: center;
    text-align: center;

    svg {
        color: ${dataTableTheme.text.muted};
        font-size: 9px;
        flex-shrink: 0;
    }

    @media (max-width: 1200px) {
        font-size: 10px;
        flex-direction: column;
        gap: 2px;

        svg {
            font-size: 8px;
        }
    }
`;

export const MetricsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    justify-content: center;

    @media (max-width: 1200px) {
        flex-direction: column;
        gap: 2px;
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
    font-size: 12px;
    color: ${dataTableTheme.text.secondary};
    line-height: 1.2;

    @media (max-width: 1200px) {
        font-size: 11px;
    }
`;

export const MetricLabel = styled.div`
    font-size: 9px;
    color: ${dataTableTheme.text.muted};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    text-align: center;

    @media (max-width: 1200px) {
        font-size: 8px;
    }
`;

export const MetricSeparator = styled.div`
    color: ${dataTableTheme.borderHover};
    font-weight: bold;
    font-size: 12px;

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
    font-size: 12px;
    color: ${dataTableTheme.text.secondary};
    line-height: 1.2;

    @media (max-width: 1200px) {
        font-size: 11px;
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
    font-size: 14px;
    font-weight: 600;
    color: ${dataTableTheme.text.primary};
    margin: 0;
    flex: 1;
    min-width: 0;

    @media (max-width: 768px) {
        font-size: 13px;
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
    min-height: 20px;
    gap: ${dataTableTheme.spacing.sm};
`;

export const CardLabel = styled.span`
    font-size: 12px;
    color: ${dataTableTheme.text.tertiary};
    font-weight: 500;
    flex-shrink: 0;

    @media (max-width: 768px) {
        font-size: 11px;
    }
`;

export const CardValue = styled.span`
    font-size: 12px;
    color: ${dataTableTheme.text.secondary};
    font-weight: 600;
    text-align: right;
    word-break: break-word;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (max-width: 768px) {
        font-size: 11px;
    }
`;