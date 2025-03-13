import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import {
    FaCog,
    FaUsers,
    FaMoneyBillWave,
    FaClipboardList,
    FaPercent,
    FaTags,
    FaRegListAlt,
    FaCalendarCheck,
    FaCarSide,
    FaEye,
    FaWrench,
    FaWindowClose
} from 'react-icons/fa';

interface SecondaryMenuProps {
    activeMenuItem: string | null;
    isMainSidebarOpen: boolean;
}

// Struktura danych dla opcji menu drugiego poziomu
interface SubMenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
}

// Mapowanie opcji menu drugiego poziomu dla różnych elementów menu głównego
const secondaryMenuOptions: Record<string, SubMenuItem[]> = {
    settings: [
        { id: 'general', label: 'Ogólne', icon: <FaCog />, path: '/settings/general' },
        { id: 'employees', label: 'Pracownicy', icon: <FaUsers />, path: '/settings/employees' },
        { id: 'taxes', label: 'Podatki', icon: <FaMoneyBillWave />, path: '/settings/taxes' },
        { id: 'services', label: 'Lista usług i prac', icon: <FaClipboardList />, path: '/settings/services' }
    ],
    protocols: [
        { id: 'car-reception', label: 'Protokół przyjęcia pojazdu', icon: <FaCarSide />, path: '/protocols/car-reception' },
        { id: 'car-inspection', label: 'Protokół oględzin pojazdu', icon: <FaEye />, path: '/protocols/car-inspection' },
        { id: 'wheel-renovation', label: 'Protokół renowacji felg', icon: <FaWrench />, path: '/protocols/wheel-renovation' },
        { id: 'window-tinting', label: 'Protokół przyciemniania szyb', icon: <FaWindowClose />, path: '/protocols/window-tinting' }
    ],
    orders: [
        { id: 'scheduled', label: 'Zaplanowane', icon: <FaCarSide />, path: '/orders/scheduled' },
        { id: 'to-be-picked-up', label: 'Oczekujące na odbiór', icon: <FaEye />, path: '/orders/to-be-picked-up' },
        { id: 'archive', label: 'Archiwum', icon: <FaWrench />, path: '/orders/archive' },
    ],
    clients: [
        { id: 'owners', label: 'Właściciele pojazdów', icon: <FaUsers />, path: '/clients/owners' },
        { id: 'vehicles', label: 'Pojazdy', icon: <FaCog />, path: '/clients/vehicles' }
    ],
    finances: [
        { id: 'invoices', label: 'Faktury', icon: <FaRegListAlt />, path: '/finances/invoices' },
        { id: 'payments', label: 'Płatności', icon: <FaMoneyBillWave />, path: '/finances/payments' }
    ],
    warehouse: [
        { id: 'stock', label: 'Stan magazynowy', icon: <FaClipboardList />, path: '/warehouse/stock' },
        { id: 'products', label: 'Produkty', icon: <FaTags />, path: '/warehouse/products' }
    ],
    pricing: [
        { id: 'prices', label: 'Ceny', icon: <FaMoneyBillWave />, path: '/pricing/prices' },
        { id: 'discounts', label: 'Rabaty', icon: <FaPercent />, path: '/pricing/discounts' },
        { id: 'default-prices', label: 'Ceny domyślne', icon: <FaTags />, path: '/pricing/default-prices' }
    ]
};

const SecondaryMenu: React.FC<SecondaryMenuProps> = ({ activeMenuItem, isMainSidebarOpen }) => {
    const location = useLocation();

    if (!activeMenuItem || !isMainSidebarOpen || !secondaryMenuOptions[activeMenuItem]) {
        return null;
    }

    const menuItems = secondaryMenuOptions[activeMenuItem];

    return (
        <SecondaryMenuContainer
            activeMenuItem={activeMenuItem}
            isMainSidebarOpen={isMainSidebarOpen}
        >
            <MenuHeader>
                {getMenuTitle(activeMenuItem)}
            </MenuHeader>
            <MenuItems>
                {menuItems.map(item => (
                    <MenuItem
                        key={item.id}
                        to={item.path}
                        active={location.pathname === item.path}
                    >
                        <MenuItemIcon>{item.icon}</MenuItemIcon>
                        <MenuItemLabel>{item.label}</MenuItemLabel>
                    </MenuItem>
                ))}
            </MenuItems>
        </SecondaryMenuContainer>
    );
};

// Pomocnicza funkcja do uzyskania tytułu menu na podstawie jego ID
const getMenuTitle = (menuId: string): string => {
    const titles: Record<string, string> = {
        settings: 'Ustawienia',
        clients: 'Klienci',
        finances: 'Finanse',
        warehouse: 'Magazyn',
        pricing: 'Ceny i rabaty',
        protocols: 'Protokoły',
        orders: 'Zamówienia'
    };

    return titles[menuId] || menuId;
};

const SecondaryMenuContainer = styled.div<{
    activeMenuItem: string | null;
    isMainSidebarOpen: boolean;
}>`
    position: fixed;
    top: 0;
    left: 250px;
    width: 200px;
    height: 100%;
    background-color: #f5f5f5;
    border-right: 1px solid #e0e0e0;
    overflow-y: auto;
    z-index: 80;
    display: ${props => props.activeMenuItem && props.isMainSidebarOpen ? 'block' : 'none'};
`;

const MenuHeader = styled.div`
    padding: 20px;
    font-size: 18px;
    font-weight: bold;
    color: #333;
    border-bottom: 1px solid #e0e0e0;
    background-color: #f9f9f9;
`;

const MenuItems = styled.div`
    padding: 10px 0;
`;

const MenuItem = styled(Link)<{ active: boolean }>`
    display: flex;
    align-items: center;
    padding: 12px 20px;
    text-decoration: none;
    color: ${props => props.active ? '#3498db' : '#555'};
    background-color: ${props => props.active ? '#f0f7ff' : 'transparent'};
    font-weight: ${props => props.active ? 'bold' : 'normal'};
    transition: background-color 0.2s;

    &:hover {
        background-color: #eaeaea;
    }
`;

const MenuItemIcon = styled.div`
    margin-right: 12px;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const MenuItemLabel = styled.div`
    font-size: 14px;
`;

export default SecondaryMenu;