import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    FaCalendarAlt,
    FaUsers,
    FaCar,
    FaClipboardList,
    FaCog,
    FaMoneyBillWave,
    FaWarehouse,
    FaPercentage,
    FaRegListAlt,
    FaUsersCog,
    FaFileAlt,
    FaCarSide,
    FaSearchPlus,
    FaCogs,
    FaWindowMaximize,
    FaClipboardCheck,
    FaChartBar,
    FaRss
} from 'react-icons/fa';

// Dane menu głównego
interface MainMenuItem {
    id: string;
    label: string;
    icon: React.ReactElement;
    path?: string;
    hasSubmenu: boolean;
}

const mainMenuItems: MainMenuItem[] = [
    {
        id: 'calendar',
        label: 'Kalendarz',
        icon: <FaCalendarAlt />,
        path: '/calendar',
        hasSubmenu: false
    },
    {
        id: 'activity',
        label: 'Aktualności',
        icon: <FaRss />,
        path: '/activity',
        hasSubmenu: false
    },
    {
        id: 'orders',
        label: 'Zlecenia',
        icon: <FaClipboardCheck />,
        path: '/orders',
        hasSubmenu: false
    },
    {
        id: 'clients',
        label: 'Klienci',
        icon: <FaUsers />,
        hasSubmenu: true
    },
    {
        id: 'reports',
        label: 'Raporty',
        icon: <FaChartBar />,
        path: '/reports',
        hasSubmenu: false
    },
    {
        id: 'finances',
        label: 'Finanse',
        icon: <FaMoneyBillWave />,
        hasSubmenu: true
    },
    {
        id: 'warehouse',
        label: 'Magazyn',
        icon: <FaWarehouse />,
        hasSubmenu: true
    },
    {
        id: 'pricing',
        label: 'Ceny i rabaty',
        icon: <FaPercentage />,
        hasSubmenu: true
    },
    {
        id: 'settings',
        label: 'Ustawienia',
        icon: <FaCog />,
        hasSubmenu: true
    }
];

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    onMenuItemClick: (menuId: string | null) => void;
    activeMenuItem: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({
                                             isOpen,
                                             toggleSidebar,
                                             onMenuItemClick,
                                             activeMenuItem
                                         }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleMenuItemClick = (item: MainMenuItem) => {
        if (item.hasSubmenu) {
            onMenuItemClick(item.id === activeMenuItem ? null : item.id);
        } else if (item.path) {
            // Jeśli element menu nie ma submenu, przechodzimy do określonej ścieżki
            onMenuItemClick(null);

            // Zawsze nawiguj do ścieżki, co spowoduje przeładowanie komponentu
            // i zamknięcie formularza jeśli jest otwarty
            navigate(item.path);
        }
    };

    const isItemActive = (item: MainMenuItem): boolean => {
        // Dla elementów z submenu
        if (item.id === activeMenuItem) {
            return true;
        }

        // Dla elementów bez submenu
        if (item.path && location.pathname.startsWith(item.path)) {
            return true;
        }

        return false;
    };

    return (
        <>
            {/* Usuwamy overlay, który przyciemniał ekran */}
            <SidebarContainer isOpen={isOpen}>
                <SidebarHeader>
                    <Logo>Detailing CRM</Logo>
                </SidebarHeader>

                <SidebarMenu>
                    {mainMenuItems.map(item => (
                        <MenuItemContainer
                            key={item.id}
                            onClick={() => handleMenuItemClick(item)}
                            active={isItemActive(item)}
                        >
                            {item.path && !item.hasSubmenu ? (
                                <MenuItemLink
                                    to={item.path}
                                    $active={location.pathname.startsWith(item.path)}
                                    onClick={(e) => {
                                        // Zatrzymaj domyślną nawigację Link
                                        // żeby obsłużyć ją w handleMenuItemClick
                                        e.preventDefault();
                                    }}
                                >
                                    <MenuIcon>{item.icon}</MenuIcon>
                                    <MenuLabel>{item.label}</MenuLabel>
                                </MenuItemLink>
                            ) : (
                                <>
                                    <MenuIcon>{item.icon}</MenuIcon>
                                    <MenuLabel>{item.label}</MenuLabel>
                                </>
                            )}
                        </MenuItemContainer>
                    ))}
                </SidebarMenu>
            </SidebarContainer>
        </>
    );
};

export const HamburgerButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 20px;
    left: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #3498db;
    color: white;
    border: none;
    cursor: pointer;
    z-index: 50;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

    &:hover {
        background-color: #2980b9;
    }
`;

const SidebarOverlay = styled.div<{ isOpen: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 90;
    opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
    visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
    transition: opacity 0.3s, visibility 0.3s;
`;

const SidebarContainer = styled.div<{ isOpen: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 250px;
    background-color: #2c3e50;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    z-index: 100;
    transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(-100%)')};
    transition: transform 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
`;

const SidebarHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid #34495e;
`;

const Logo = styled.div`
    font-size: 18px;
    font-weight: bold;
    color: white;
`;

const SidebarMenu = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px 0;
`;

const MenuItemContainer = styled.div<{ active: boolean }>`
    display: flex;
    align-items: center;
    padding: 12px 20px;
    cursor: pointer;
    color: ${({ active }) => (active ? 'white' : '#ecf0f1')};
    background-color: ${({ active }) => (active ? '#34495e' : 'transparent')};
    font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
    transition: background-color 0.2s;

    &:hover {
        background-color: #34495e;
    }
`;

const MenuItemLink = styled(Link)<{ $active: boolean }>`
    display: flex;
    align-items: center;
    width: 100%;
    text-decoration: none;
    color: inherit;
`;

const MenuIcon = styled.div`
    margin-right: 15px;
    font-size: 16px;
    width: 16px;
    text-align: center;
`;

const MenuLabel = styled.div`
    font-size: 14px;
`;

export default Sidebar;