import React from 'react';
import styled from 'styled-components';
import {Link, useLocation} from 'react-router-dom';
import {FaArchive, FaCalendarAlt} from 'react-icons/fa';
import {FaCarRear} from "react-icons/fa6";

const brandTheme = {
    primary: '#818cf8',
    primaryGhost: 'rgba(99, 102, 241, 0.14)',
    surface: '#161d2e',
    surfaceAlt: '#1a2335',
    neutral: '#6b7280',
    border: 'rgba(255,255,255,0.07)'
};

interface SecondaryMenuProps {
    activeMenuItem: string | null;
    isMainSidebarOpen: boolean;
    isMobile: boolean;
}

interface SubMenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
    description: string;
}

const secondaryMenuOptions: Record<string, SubMenuItem[]> = {
    fleet: [
        {
            id: 'calendar',
            label: 'Kalendarz',
            icon: <FaCalendarAlt />,
            path: '/fleet/calendar',
            description: 'Harmonogram floty'
        },
        {
            id: 'vehicles',
            label: 'Pojazdy',
            icon: <FaCarRear />,
            path: '/fleet/vehicles',
            description: 'Zarządzanie flotą'
        },
        {
            id: 'rentals',
            label: 'Historia',
            icon: <FaArchive />,
            path: '/fleet/rentals',
            description: 'Wypożyczenia'
        }
    ]
};

const SecondaryMenu: React.FC<SecondaryMenuProps> = ({
                                                         activeMenuItem,
                                                         isMainSidebarOpen,
                                                         isMobile
                                                     }) => {
    const location = useLocation();

    if (!activeMenuItem || !isMainSidebarOpen || !secondaryMenuOptions[activeMenuItem]) {
        return null;
    }

    const menuItems = secondaryMenuOptions[activeMenuItem];

    return (
        <MenuContainer
            $show={!!activeMenuItem && isMainSidebarOpen}
            $isMobile={isMobile}
        >
            <MenuHeader>
                <HeaderTitle>{getMenuTitle(activeMenuItem)}</HeaderTitle>
                <ItemCount>{menuItems.length} opcji</ItemCount>
            </MenuHeader>

            <MenuContent>
                {menuItems.map(item => (
                    <MenuItem
                        key={item.id}
                        to={item.path}
                        $active={location.pathname === item.path}
                    >
                        <ItemIcon $active={location.pathname === item.path}>
                            {item.icon}
                        </ItemIcon>
                        <ItemContent>
                            <ItemLabel>{item.label}</ItemLabel>
                            <ItemDescription>{item.description}</ItemDescription>
                        </ItemContent>
                    </MenuItem>
                ))}
            </MenuContent>
        </MenuContainer>
    );
};

const getMenuTitle = (menuId: string): string => {
    const titles: Record<string, string> = {
        fleet: 'Flota',
        pricing: 'Cennik'
    };
    return titles[menuId] || menuId;
};

const MenuContainer = styled.div<{ $show: boolean; $isMobile: boolean }>`
    position: fixed;
    top: 0;
    left: ${({ $isMobile }) => $isMobile ? '0' : '240px'};
    width: ${({ $isMobile }) => $isMobile ? '100%' : '200px'};
    height: 100vh;
    background: ${brandTheme.surface};
    border-right: 1px solid ${brandTheme.border};
    z-index: 999;
    display: ${({ $show }) => $show ? 'flex' : 'none'};
    flex-direction: column;
    transform: ${({ $isMobile }) => $isMobile ? 'translateX(220px)' : 'none'};
    box-shadow: 4px 0 20px rgba(0,0,0,0.3);
`;

const MenuHeader = styled.div`
    padding: 16px;
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;

const HeaderTitle = styled.h3`
    font-size: 15px;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0 0 3px 0;
`;

const ItemCount = styled.div`
    font-size: 11px;
    color: ${brandTheme.neutral};
`;

const MenuContent = styled.div`
    flex: 1;
    padding: 12px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const MenuItem = styled(Link)<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border-radius: 6px;
    text-decoration: none;
    transition: all 0.2s ease;
    border: 1px solid transparent;

    ${({ $active }) => $active ? `
        background: ${brandTheme.primaryGhost};
        border-color: rgba(99, 102, 241, 0.25);
    ` : `
        &:hover {
            background: rgba(255,255,255,0.05);
            border-color: rgba(255,255,255,0.1);
        }
    `}
`;

const ItemIcon = styled.div<{ $active: boolean }>`
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    background: ${({ $active }) => $active ? brandTheme.primary : brandTheme.surfaceAlt};
    color: ${({ $active }) => $active ? 'white' : brandTheme.neutral};
    transition: all 0.2s;
    flex-shrink: 0;

    ${MenuItem}:hover & {
        background: ${brandTheme.primary};
        color: white;
    }
`;

const ItemContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const ItemLabel = styled.div`
    font-size: 12px;
    font-weight: 500;
    color: #e2e8f0;
    margin-bottom: 2px;
`;

const ItemDescription = styled.div`
    font-size: 10px;
    color: ${brandTheme.neutral};
`;

export default SecondaryMenu;