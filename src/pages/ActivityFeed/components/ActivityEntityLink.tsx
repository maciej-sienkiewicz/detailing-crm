import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import {
    FaCalendarAlt,
    FaUser,
    FaCar,
    FaClipboardCheck,
    FaFileInvoiceDollar,
    FaComments
} from 'react-icons/fa';
import { ActivityEntity } from '../../../types/activity';

interface ActivityEntityLinkProps {
    entity: ActivityEntity;
}

const ActivityEntityLink: React.FC<ActivityEntityLinkProps> = ({ entity }) => {
    // Generuj link i ikonę w zależności od typu encji
    const getLinkDetails = () => {
        switch (entity.type) {
            case 'APPOINTMENT':
                return {
                    icon: <FaCalendarAlt />,
                    path: `/calendar?id=${entity.id}`,
                    text: entity.displayName || 'Wizyta'
                };
            case 'client':
                return {
                    icon: <FaUser />,
                    path: `/clients/owners?id=${entity.id}`,
                    text: entity.displayName || 'Klient'
                };
            case 'vehicle':
                return {
                    icon: <FaCar />,
                    path: `/clients/vehicles?id=${entity.id}`,
                    text: entity.displayName || 'Pojazd'
                };
            case 'protocol':
                return {
                    icon: <FaClipboardCheck />,
                    path: `/orders/car-reception/${entity.id}`,
                    text: entity.displayName || 'Protokół'
                };
            case 'invoice':
                return {
                    icon: <FaFileInvoiceDollar />,
                    path: `/finances/invoices?id=${entity.id}`,
                    text: entity.displayName || 'Faktura'
                };
            case 'comment':
                return {
                    icon: <FaComments />,
                    path: `/orders/car-reception/${entity.relatedId}?comment=${entity.id}`,
                    text: entity.displayName || 'Komentarz'
                };
            default:
                return {
                    icon: null,
                    path: '#',
                    text: entity.displayName || 'Obiekt'
                };
        }
    };

    const { icon, path, text } = getLinkDetails();

    return (
        <EntityLink to={path}>
            {icon && <EntityIcon>{icon}</EntityIcon>}
            <EntityText>{text}</EntityText>
        </EntityLink>
    );
};

const EntityLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: #3498db;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const EntityIcon = styled.span`
  font-size: 12px;
  margin-right: 5px;
`;

const EntityText = styled.span`
  font-size: 13px;
`;

export default ActivityEntityLink;