// src/pages/Clients/components/VehicleTable/styled.ts
import styled from 'styled-components';
import { dataTableTheme } from '../../../../components/common/DataTable';

export const LicensePlateCell = styled.div`
    display: inline-block;
    background: linear-gradient(135deg, ${dataTableTheme.primary} 0%, ${dataTableTheme.primaryLight} 100%);
    color: white;
    padding: 6px 12px;
    border-radius: ${dataTableTheme.radius.md};
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 1px;
    text-transform: uppercase;
    box-shadow: ${dataTableTheme.shadow.sm};
    width: fit-content;
`;

export const VehicleInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${dataTableTheme.spacing.xs};
    width: 100%;
`;

export const VehicleName = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.sm};
    font-weight: 600;
    font-size: 15px;
    color: ${dataTableTheme.text.primary};
    line-height: 1.3;
`;

export const VehicleYear = styled.div`
    font-size: 12px;
    color: ${dataTableTheme.text.secondary};
    font-weight: 500;
`;

export const OwnersInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${dataTableTheme.spacing.xs};
    width: 100%;
`;

export const OwnerName = styled.div`
    font-size: 13px;
    color: ${dataTableTheme.text.secondary};
    font-weight: 500;
    line-height: 1.3;
`;

export const EmptyOwners = styled.div`
    color: ${dataTableTheme.text.muted};
    font-style: italic;
    font-size: 13px;
`;

export const ServiceCount = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${dataTableTheme.text.secondary};
    text-align: center;
`;

export const LastServiceDate = styled.div`
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

export const EmptyDate = styled.span`
    color: ${dataTableTheme.text.muted};
    font-style: italic;
`;

export const RevenueDisplay = styled.div`
    font-weight: 700;
    font-size: 16px;
    color: ${dataTableTheme.text.secondary};
    text-align: right;
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

export const CardActions = styled.div`
    display: flex;
    gap: ${dataTableTheme.spacing.xs};
    flex-shrink: 0;
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