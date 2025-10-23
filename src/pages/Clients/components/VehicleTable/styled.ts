import styled from 'styled-components';
import { dataTableTheme } from '../../../../components/common/DataTable';

export const LicensePlateCell = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, ${dataTableTheme.primary} 0%, ${dataTableTheme.primaryLight} 100%);
    color: white;
    padding: 2px 8px;
    border-radius: ${dataTableTheme.radius.sm};
    font-weight: 700;
    font-size: 10px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    box-shadow: ${dataTableTheme.shadow.sm};
    width: 100%;
    max-width: 90px;
    min-width: 70px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 1200px) {
        font-size: 9px;
        padding: 2px 6px;
        max-width: 80px;
        min-width: 60px;
    }
`;

export const VehicleInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    min-width: 0;
`;

export const VehicleName = styled.div`
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

export const VehicleYear = styled.div`
    font-size: 10px;
    color: ${dataTableTheme.text.secondary};
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 1200px) {
        font-size: 9px;
    }
`;

export const OwnersInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    min-width: 0;
`;

export const OwnerName = styled.div`
    font-size: 11px;
    color: ${dataTableTheme.text.secondary};
    font-weight: 500;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    span {
        color: ${dataTableTheme.text.muted};
        font-style: italic;
        font-size: 10px;
    }

    @media (max-width: 1200px) {
        font-size: 10px;

        span {
            font-size: 9px;
        }
    }
`;

export const EmptyOwners = styled.div`
    color: ${dataTableTheme.text.muted};
    font-style: italic;
    font-size: 11px;

    @media (max-width: 1200px) {
        font-size: 10px;
    }
`;

export const ServiceCount = styled.div`
    font-size: 12px;
    font-weight: 700;
    color: ${dataTableTheme.text.secondary};
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;

    @media (max-width: 1200px) {
        font-size: 11px;
    }
`;

export const LastServiceDate = styled.div`
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

    span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
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

export const EmptyDate = styled.span`
    color: ${dataTableTheme.text.muted};
    font-style: italic;
`;

export const RevenueDisplay = styled.div`
    font-weight: 700;
    font-size: 12px;
    color: ${dataTableTheme.text.secondary};
    text-align: right;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 1200px) {
        font-size: 11px;
        justify-content: center;
        text-align: center;
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
        flex-wrap: wrap;
    }
`;

export const CardActions = styled.div`
    display: flex;
    gap: ${dataTableTheme.spacing.xs};
    flex-shrink: 0;
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