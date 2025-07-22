// src/components/layout/Sidebar.tsx - Updated with persistent logo cache
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
    FaRss,
    FaTimes,
    FaSms,
    FaImages,
    FaTabletAlt,
    FaChevronRight
} from 'react-icons/fa';
import UserProfileSection from './UserProfileSection';
import { useCompanyLogoPersistent } from '../../context/PersistentLogoCacheContext'; // Zmieniony import

// Brand Theme System - możliwość konfiguracji przez klienta
const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)', // Domyślny niebieski, konfigurowalny
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.1))',
    accent: '#f8fafc',
    neutral: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9'
};

// Dane menu głównego
interface MainMenuItem {
    id: string;
    label: string;
    icon: React.ReactElement;
    path?: string;
    hasSubmenu: boolean;
    badge?: string;
    isNew?: boolean;
    category: 'daily' | 'business' | 'admin';
}

const mainMenuItems: MainMenuItem[] = [
    // Codzienne operacje
    {
        id: 'calendar',
        label: 'Kalendarz',
        icon: <FaCalendarAlt />,
        path: '/calendar',
        hasSubmenu: false,
        category: 'daily'
    },
    {
        id: 'orders',
        label: 'Wizyty',
        icon: <FaClipboardCheck />,
        path: '/visits',
        hasSubmenu: false,
        category: 'daily'
    },
    {
        id: 'activity',
        label: 'Aktualności',
        icon: <FaRss />,
        path: '/activity',
        hasSubmenu: false,
        category: 'daily',
    },

    // Zarządzanie biznesem
    {
        id: 'clients',
        label: 'Klienci i pojazdy',
        icon: <FaUsers />,
        path: '/clients-vehicles',
        hasSubmenu: false,
        category: 'business'
    },
    {
        id: 'fleet',
        label: 'Flota',
        icon: <FaCar />,
        path: '/fleet',
        hasSubmenu: true,
        category: 'business',
        badge: "Faza rozwoju"
    },
    {
        id: 'finances',
        label: 'Finanse',
        icon: <FaMoneyBillWave />,
        path: '/finances',
        hasSubmenu: false,
        category: 'business'
    },

    // Narzędzia i administracja
    {
        id: 'gallery',
        label: 'Galeria',
        icon: <FaImages />,
        path: '/gallery',
        hasSubmenu: false,
        category: 'admin'
    },
    {
        id: 'tablets',
        label: 'Tablety',
        icon: <FaTabletAlt />,
        path: '/tablets',
        hasSubmenu: false,
        isNew: true,
        category: 'admin'
    },
    {
        id: 'team',
        label: 'Zespół',
        icon: <FaUsers />,
        path: '/team',
        hasSubmenu: false,
        category: 'admin',
        badge: "Faza rozwoju"
    },
    {
        id: 'sms',
        label: 'SMS',
        icon: <FaSms />,
        path: '/sms',
        hasSubmenu: false,
        category: 'admin',
        badge: "Faza rozwoju"
    },
    {
        id: 'settings',
        label: 'Ustawienia',
        icon: <FaCog />,
        path: '/settings',
        hasSubmenu: false,
        category: 'admin'
    }
];

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    onMenuItemClick: (menuId: string | null) => void;
    activeMenuItem: string | null;
    isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
                                             isOpen,
                                             toggleSidebar,
                                             onMenuItemClick,
                                             activeMenuItem,
                                             isMobile
                                         }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // ZMIENIONY HOOK - teraz używa persistentnego cache
    const { logoUrl, loading: logoLoading, error: logoError, refetchLogo } = useCompanyLogoPersistent();

    // Dodatkowe nasłuchiwanie na zmiany logo - BACKUP
    React.useEffect(() => {
        const handleLogoUpdate = () => {
            console.log('🔄 Sidebar received logo update event');
            refetchLogo();
        };

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'logoLastUpdated') {
                console.log('🔄 Sidebar detected logo localStorage change');
                refetchLogo();
            }
        };

        // Nasłuchuj na eventy
        window.addEventListener('logoUpdated', handleLogoUpdate);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('logoUpdated', handleLogoUpdate);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [refetchLogo]);

    const handleMenuItemClick = (item: MainMenuItem) => {
        if (item.hasSubmenu) {
            onMenuItemClick(item.id === activeMenuItem ? null : item.id);
        } else if (item.path) {
            onMenuItemClick(null);
            navigate(item.path);
        }
    };

    const isItemActive = (item: MainMenuItem): boolean => {
        if (item.id === activeMenuItem) return true;
        if (item.path && location.pathname.startsWith(item.path)) return true;
        return false;
    };

    const dailyItems = mainMenuItems.filter(item => item.category === 'daily');
    const businessItems = mainMenuItems.filter(item => item.category === 'business');
    const adminItems = mainMenuItems.filter(item => item.category === 'admin');

    return (
        <>
            <SidebarContainer isOpen={isOpen} isMobile={isMobile}>
                {/* Header z logo lub fallback */}
                <SidebarHeader>
                    <LogoContainer>
                        {logoUrl && !logoLoading && !logoError ? (
                            // Pokaż logo firmy gdy jest dostępne
                            <CompanyLogoContainer>
                                <CompanyLogo
                                    src={logoUrl}
                                    alt="Logo firmy"
                                    key={`sidebar-logo-${Date.now()}`} // Force refresh na zmianę
                                />
                            </CompanyLogoContainer>
                        ) : logoLoading ? (
                            // Loading state
                            <LogoLoadingContainer>
                                <LogoSpinner />
                                <CompanyName style={{fontSize: '14px', color: '#64748b'}}>Ładowanie...</CompanyName>
                            </LogoLoadingContainer>
                        ) : (
                            // Fallback - zawsze pokaż ikonę i napis gdy nie ma logo
                            <>
                                <LogoIcon>
                                    <FaCarSide />
                                </LogoIcon>
                                <LogoText>
                                    <CompanyName>DetailingPro</CompanyName>
                                </LogoText>
                            </>
                        )}
                    </LogoContainer>
                    {isMobile && (
                        <CloseButton onClick={toggleSidebar}>
                            <FaTimes />
                        </CloseButton>
                    )}
                </SidebarHeader>

                {/* Profil użytkownika */}
                <UserProfileSection />

                {/* Navigation */}
                <Navigation>
                    {/* Codzienne operacje */}
                    <NavSection>
                        <SectionHeader>Dziś</SectionHeader>
                        <MenuList>
                            {dailyItems.map(item => (
                                <MenuItem
                                    key={item.id}
                                    onClick={() => handleMenuItemClick(item)}
                                    $active={isItemActive(item)}
                                    $hasSubmenu={item.hasSubmenu}
                                >
                                    <MenuItemContent>
                                        <IconContainer $active={isItemActive(item)}>
                                            {item.icon}
                                        </IconContainer>
                                        <Label>{item.label}</Label>
                                        {item.isNew && <NewBadge>Nowe</NewBadge>}
                                        {item.badge && <ProgressBadge>{item.badge}</ProgressBadge>}
                                        {item.hasSubmenu && (
                                            <SubmenuArrow $expanded={item.id === activeMenuItem}>
                                                <FaChevronRight />
                                            </SubmenuArrow>
                                        )}
                                    </MenuItemContent>
                                </MenuItem>
                            ))}
                        </MenuList>
                    </NavSection>

                    {/* Zarządzanie biznesem */}
                    <NavSection>
                        <SectionHeader>Biznes</SectionHeader>
                        <MenuList>
                            {businessItems.map(item => (
                                <MenuItem
                                    key={item.id}
                                    onClick={() => handleMenuItemClick(item)}
                                    $active={isItemActive(item)}
                                    $hasSubmenu={item.hasSubmenu}
                                >
                                    <MenuItemContent>
                                        <IconContainer $active={isItemActive(item)}>
                                            {item.icon}
                                        </IconContainer>
                                        <Label>{item.label}</Label>
                                        {item.badge && <ProgressBadge>{item.badge}</ProgressBadge>}
                                        {item.hasSubmenu && (
                                            <SubmenuArrow $expanded={item.id === activeMenuItem}>
                                                <FaChevronRight />
                                            </SubmenuArrow>
                                        )}
                                    </MenuItemContent>
                                </MenuItem>
                            ))}
                        </MenuList>
                    </NavSection>

                    {/* Narzędzia */}
                    <NavSection>
                        <SectionHeader>Narzędzia</SectionHeader>
                        <MenuList>
                            {adminItems.map(item => (
                                <MenuItem
                                    key={item.id}
                                    onClick={() => handleMenuItemClick(item)}
                                    $active={isItemActive(item)}
                                    $hasSubmenu={item.hasSubmenu}
                                >
                                    <MenuItemContent>
                                        <IconContainer $active={isItemActive(item)}>
                                            {item.icon}
                                        </IconContainer>
                                        <Label>{item.label}</Label>
                                        {item.isNew && <NewBadge>Nowe</NewBadge>}
                                        {item.badge && <ProgressBadge>{item.badge}</ProgressBadge>}
                                        {item.hasSubmenu && (
                                            <SubmenuArrow $expanded={item.id === activeMenuItem}>
                                                <FaChevronRight />
                                            </SubmenuArrow>
                                        )}
                                    </MenuItemContent>
                                </MenuItem>
                            ))}
                        </MenuList>
                    </NavSection>
                </Navigation>

                {/* Footer */}
                <SidebarFooter>
                    <StatusLine>
                        <StatusDot />
                        <StatusText>Wszystko działa</StatusText>
                    </StatusLine>
                    <VersionInfo>v2.1.0</VersionInfo>
                </SidebarFooter>
            </SidebarContainer>

            {/* Overlay dla mobile */}
            {isMobile && isOpen && <Overlay onClick={toggleSidebar} />}
        </>
    );
};

// Styled Components - identyczne jak wcześniej + nowe style dla loading
const SidebarContainer = styled.div<{ isOpen: boolean; isMobile: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 260px;
    background: ${brandTheme.surface};
    border-right: 1px solid #e2e8f0;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    transform: translateX(${({ isOpen }) => isOpen ? '0' : '-100%'});
    transition: transform 0.3s ease;
    box-shadow: ${({ isOpen }) => isOpen ? '0 0 20px rgba(0,0,0,0.1)' : 'none'};
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
`;

const SidebarHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid #f1f5f9;
    min-height: 80px;
`;

const LogoContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
`;

// New company logo styles
const CompanyLogoContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 8px;
`;

const CompanyLogo = styled.img`
    max-width: 180px;
    max-height: 40px;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 4px;
`;

// Loading state styles
const LogoLoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 8px;
`;

const LogoSpinner = styled.div`
    width: 24px;
    height: 24px;
    border: 2px solid #e2e8f0;
    border-top: 2px solid #2563eb;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Original fallback styles
const LogoIcon = styled.div`
    width: 36px;
    height: 36px;
    background: ${brandTheme.primary};
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    flex-shrink: 0;
`;

const LogoText = styled.div`
    flex: 1;
    min-width: 0;
`;

const CompanyName = styled.div`
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    letter-spacing: -0.5px;
`;

const CloseButton = styled.button`
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    color: ${brandTheme.neutral};
    cursor: pointer;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
        background: #f1f5f9;
        color: #1e293b;
    }
`;

const Navigation = styled.nav`
    flex: 1;
    overflow-y: auto;
    padding: 16px 0;

    /* Clean scrollbar */
    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 2px;
    }
`;

const NavSection = styled.div`
    margin-bottom: 32px;

    &:last-child {
        margin-bottom: 16px;
    }
`;

const SectionHeader = styled.div`
    font-size: 11px;
    font-weight: 600;
    color: ${brandTheme.neutral};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 20px 12px;
`;

const MenuList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 12px;
`;

const MenuItem = styled.div<{ $active: boolean; $hasSubmenu: boolean }>`
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
    position: relative;

    ${({ $active }) => $active && `
        background: ${brandTheme.primaryGhost};
        
        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 20px;
            background: ${brandTheme.primary};
            border-radius: 0 2px 2px 0;
        }
    `}

    &:hover:not([data-active="true"]) {
        background: ${brandTheme.surfaceAlt};
    }
`;

const MenuItemContent = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    min-height: 44px;
`;

const IconContainer = styled.div<{ $active: boolean }>`
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ $active }) => $active ? brandTheme.primary : brandTheme.neutral};
    font-size: 16px;
    transition: color 0.2s;

    ${MenuItem}:hover & {
        color: ${brandTheme.primary};
    }
`;

const Label = styled.span`
    font-size: 14px;
    font-weight: 500;
    color: #334155;
    flex: 1;
`;

const NewBadge = styled.span`
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const ProgressBadge = styled.span`
    background: #d3e1da;
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const CountBadge = styled.span`
    background: #ef4444;
    color: white;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
`;

const SubmenuArrow = styled.div<{ $expanded: boolean }>`
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.neutral};
    font-size: 10px;
    transform: rotate(${({ $expanded }) => $expanded ? '90deg' : '0deg'});
    transition: transform 0.2s;
`;

const SidebarFooter = styled.div`
    padding: 16px 20px;
    border-top: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const StatusLine = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const StatusDot = styled.div`
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
`;

const StatusText = styled.span`
    font-size: 12px;
    color: ${brandTheme.neutral};
`;

const VersionInfo = styled.span`
    font-size: 11px;
    color: #94a3b8;
    font-weight: 500;
`;

export default Sidebar;