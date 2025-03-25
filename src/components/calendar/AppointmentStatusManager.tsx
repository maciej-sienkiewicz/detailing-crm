import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaExchangeAlt } from 'react-icons/fa';
import { AppointmentStatus, AppointmentStatusLabels, AppointmentStatusColors } from '../../types';

interface AppointmentStatusBadgeProps {
    status: AppointmentStatus;
    showLabel?: boolean;
}

export const AppointmentStatusBadge: React.FC<AppointmentStatusBadgeProps> = ({ status, showLabel = true }) => {
    const statusColor = AppointmentStatusColors[status];
    const statusLabel = AppointmentStatusLabels[status];

    return (
        <Badge style={{ backgroundColor: statusColor }}>
            {showLabel && statusLabel}
        </Badge>
    );
};

interface AppointmentStatusManagerProps {
    status: AppointmentStatus;
    onStatusChange: (newStatus: AppointmentStatus) => void;
    disabledStatuses?: AppointmentStatus[];
}

export const AppointmentStatusManager: React.FC<AppointmentStatusManagerProps> = ({
                                                                                      status,
                                                                                      onStatusChange,
                                                                                      disabledStatuses = []
                                                                                  }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Zamykanie menu po kliknięciu poza komponentem
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    const handleStatusSelect = (newStatus: AppointmentStatus) => {
        onStatusChange(newStatus);
        setIsMenuOpen(false);
    };

    return (
        <Container ref={menuRef}>
            <StatusRow>
                <AppointmentStatusBadge status={status} />
            </StatusRow>

            {isMenuOpen && (
                <StatusMenu>
                    {Object.entries(AppointmentStatusLabels)
                        .filter(([statusValue]) => {
                            // Nie pokazuj aktualnego statusu
                            if (statusValue === status) return false;
                            // Nie pokazuj statusów z listy wyłączonych
                            if (disabledStatuses.includes(statusValue as AppointmentStatus)) return false;
                            return true;
                        })
                        .map(([statusValue, label]) => (
                            <StatusMenuItem
                                key={statusValue}
                                onClick={() => handleStatusSelect(statusValue as AppointmentStatus)}
                                style={{
                                    color: AppointmentStatusColors[statusValue as AppointmentStatus],
                                    borderLeftColor: AppointmentStatusColors[statusValue as AppointmentStatus]
                                }}
                            >
                                {label}
                            </StatusMenuItem>
                        ))
                    }
                </StatusMenu>
            )}
        </Container>
    );
};

const Badge = styled.div`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: white;
`;

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusActionButton = styled.button`
  background: none;
  border: none;
  color: #7f8c8d;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 4px;

  &:hover {
    background-color: #f0f0f0;
    color: #34495e;
  }
`;

const StatusMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  margin-top: 8px;
  overflow: hidden;
`;

const StatusMenuItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  border-left: 3px solid;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #eee;
  }
`;