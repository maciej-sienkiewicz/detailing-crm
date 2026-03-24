import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
    FaCalendarAlt,
    FaCar,
    FaCarSide,
    FaChevronRight,
    FaClipboardCheck,
    FaCog,
    FaImages,
    FaMoneyBillWave,
    FaRss,
    FaSms,
    FaTabletAlt,
    FaTimes,
    FaUsers,
    FaTachometerAlt
} from 'react-icons/fa';
import UserProfileSection from './UserProfileSection';
import { useCompanyLogoUrl } from '../../hooks/useCompanyLogo';
import { FaRepeat } from "react-icons/fa6";

interface MainMenuItem {
    id: string;
    label: string;
    icon: React.ReactElement;
    path?: string;
    hasSubmenu: boolean;
    badge?: string;
    isNew?: boolean;
    category: 'main' | 'daily' | 'business' | 'admin';
}

const mainMenuItems: MainMenuItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <FaTachometerAlt />,
        path: '/dashboard',
        hasSubmenu: false,
        category: 'main'
    },
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
        id: 'recurring-events',
        label: 'Cykliczne',
        icon: <FaRepeat />,
        path: '/recurring-events',
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
        badge: "Beta"
    },
    {
        id: 'finances',
        label: 'Finanse',
        icon: <FaMoneyBillWave />,
        path: '/finances',
        hasSubmenu: false,
        category: 'business'
    },
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
        category: 'admin'
    },
    {
        id: 'team',
        label: 'Zespół',
        icon: <FaUsers />,
        path: '/team',
        hasSubmenu: false,
        category: 'admin',
    },
    {
        id: 'sms',
        label: 'SMS',
        icon: <FaSms />,
        path: '/sms',
        hasSubmenu: false,
        category: 'admin',
        badge: "Beta"
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

    const { logoUrl, isLoading: logoLoading } = useCompanyLogoUrl();

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

    const mainItems = mainMenuItems.filter(item => item.category === 'main');
    const dailyItems = mainMenuItems.filter(item => item.category === 'daily');
    const businessItems = mainMenuItems.filter(item => item.category === 'business');
    const adminItems = mainMenuItems.filter(item => item.category === 'admin');

    return (
        <>
            <SidebarContainer isOpen={isOpen} isMobile={isMobile}>
                <SidebarHeader>
                    <LogoContainer>
                        {logoLoading ? (
                            <LogoLoadingContainer>
                                <LogoSpinner />
                            </LogoLoadingContainer>
                        ) : logoUrl ? (
                            <CompanyLogoContainer>
                                <CompanyLogo
                                    src={logoUrl}
                                    alt="Logo firmy"
                                    onError={() => {}}
                                />
                            </CompanyLogoContainer>
                        ) : (
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

                <UserProfileSection />

                <Navigation>
                    <NavSection>
                        <MenuList>
                            {mainItems.map(item => (
                                <MenuItem
                                    key={item.id}
                                    onClick={() => handleMenuItemClick(item)}
                                    $active={isItemActive(item)}
                                    $hasSubmenu={item.hasSubmenu}
                                >
                                    <MenuItemContent>
                                        <IconWrap $active={isItemActive(item)}>
                                            {item.icon}
                                        </IconWrap>
                                        <Label $active={isItemActive(item)}>{item.label}</Label>
                                    </MenuItemContent>
                                </MenuItem>
                            ))}
                        </MenuList>
                    </NavSection>

                    <Divider />

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
                                        <IconWrap $active={isItemActive(item)}>
                                            {item.icon}
                                        </IconWrap>
                                        <Label $active={isItemActive(item)}>{item.label}</Label>
                                        {item.isNew && <NewBadge>Nowe</NewBadge>}
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
                                        <IconWrap $active={isItemActive(item)}>
                                            {item.icon}
                                        </IconWrap>
                                        <Label $active={isItemActive(item)}>{item.label}</Label>
                                        {item.badge && <BetaBadge>{item.badge}</BetaBadge>}
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
                                        <IconWrap $active={isItemActive(item)}>
                                            {item.icon}
                                        </IconWrap>
                                        <Label $active={isItemActive(item)}>{item.label}</Label>
                                        {item.isNew && <NewBadge>Nowe</NewBadge>}
                                        {item.badge && <BetaBadge>{item.badge}</BetaBadge>}
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

                <SidebarFooter>
                    <StatusLine>
                        <StatusDot />
                        <StatusText>Online</StatusText>
                    </StatusLine>
                    <VersionInfo>v2.1.0</VersionInfo>
                </SidebarFooter>
            </SidebarContainer>

            {isMobile && isOpen && <Overlay onClick={toggleSidebar} />}
        </>
    );
};

// ─── Animations ───────────────────────────────────────────────────────────────

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

// ─── Colors ───────────────────────────────────────────────────────────────────

const C = {
    bg: '#0f1623',
    bgHover: '#1a2335',
    activeBg: 'rgba(99, 102, 241, 0.14)',
    activeGlow: 'rgba(99, 102, 241, 0.25)',
    accent: '#818cf8',
    accentBright: '#a5b4fc',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#4b5563',
    border: 'rgba(255, 255, 255, 0.06)',
    divider: 'rgba(255, 255, 255, 0.05)',
    logoGradStart: '#6366f1',
    logoGradEnd: '#8b5cf6',
};

// ─── Styled Components ────────────────────────────────────────────────────────

const SidebarContainer = styled.div<{ isOpen: boolean; isMobile: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 240px;
    background: ${C.bg};
    border-right: 1px solid ${C.border};
    z-index: 1000;
    display: flex;
    flex-direction: column;
    transform: translateX(${({ isOpen }) => isOpen ? '0' : '-100%'});
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${({ isOpen }) => isOpen ? '4px 0 24px rgba(0,0,0,0.35)' : 'none'};
`;

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(2px);
    z-index: 999;
`;

const SidebarHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 16px 16px;
    border-bottom: 1px solid ${C.border};
    min-height: 72px;
`;

const LogoContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
`;

const CompanyLogoContainer = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    padding: 2px 0;
`;

const CompanyLogo = styled.img`
    max-width: 150px;
    max-height: 34px;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 4px;
    filter: brightness(0) invert(1);
    opacity: 0.92;
`;

const LogoLoadingContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 6px;
`;

const LogoSpinner = styled.div`
    width: 20px;
    height: 20px;
    border: 2px solid ${C.border};
    border-top: 2px solid ${C.accent};
    border-radius: 50%;
    animation: spin 0.9s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LogoIcon = styled.div`
    width: 34px;
    height: 34px;
    background: linear-gradient(135deg, ${C.logoGradStart}, ${C.logoGradEnd});
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
`;

const LogoText = styled.div`
    flex: 1;
    min-width: 0;
`;

const CompanyName = styled.div`
    font-size: 15px;
    font-weight: 700;
    color: ${C.textPrimary};
    letter-spacing: -0.3px;
`;

const CloseButton = styled.button`
    width: 28px;
    height: 28px;
    border: none;
    background: ${C.bgHover};
    color: ${C.textSecondary};
    cursor: pointer;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
    font-size: 13px;

    &:hover {
        background: rgba(255,255,255,0.1);
        color: ${C.textPrimary};
    }
`;

const Navigation = styled.nav`
    flex: 1;
    overflow-y: auto;
    padding: 10px 0 8px;

    &::-webkit-scrollbar { width: 3px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.1);
        border-radius: 2px;
    }
`;

const NavSection = styled.div`
    margin-bottom: 4px;
`;

const Divider = styled.div`
    height: 1px;
    background: ${C.divider};
    margin: 4px 16px 12px;
`;

const SectionHeader = styled.div`
    font-size: 10px;
    font-weight: 600;
    color: ${C.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin: 0 16px 4px;
    padding-top: 8px;
`;

const MenuList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 0 8px;
`;

const MenuItem = styled.div<{ $active: boolean; $hasSubmenu: boolean }>`
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.15s ease, box-shadow 0.15s ease;
    position: relative;

    background: ${({ $active }) => $active ? C.activeBg : 'transparent'};
    box-shadow: ${({ $active }) => $active ? `0 0 0 1px rgba(99,102,241,0.2), inset 0 0 20px ${C.activeGlow}` : 'none'};

    &:hover {
        background: ${({ $active }) => $active ? C.activeBg : C.bgHover};
    }
`;

const MenuItemContent = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    min-height: 38px;
`;

const IconWrap = styled.div<{ $active: boolean }>`
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    flex-shrink: 0;
    color: ${({ $active }) => $active ? C.accentBright : C.textSecondary};
    transition: color 0.15s;

    ${MenuItem}:hover & {
        color: ${({ $active }) => $active ? C.accentBright : C.textPrimary};
    }
`;

const Label = styled.span<{ $active: boolean }>`
    font-size: 13px;
    font-weight: ${({ $active }) => $active ? '600' : '400'};
    color: ${({ $active }) => $active ? C.textPrimary : C.textSecondary};
    flex: 1;
    transition: color 0.15s;

    ${MenuItem}:hover & {
        color: ${C.textPrimary};
    }
`;

const NewBadge = styled.span`
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
`;

const BetaBadge = styled.span`
    background: rgba(99, 102, 241, 0.2);
    color: ${C.accent};
    font-size: 9px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 20px;
    letter-spacing: 0.2px;
    border: 1px solid rgba(99, 102, 241, 0.3);
`;

const SubmenuArrow = styled.div<{ $expanded: boolean }>`
    width: 12px;
    height: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${C.textMuted};
    font-size: 9px;
    transform: rotate(${({ $expanded }) => $expanded ? '90deg' : '0deg'});
    transition: transform 0.2s;
`;

const SidebarFooter = styled.div`
    padding: 12px 16px;
    border-top: 1px solid ${C.border};
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const StatusLine = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
`;

const StatusDot = styled.div`
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    animation: ${pulse} 2.5s ease-in-out infinite;
`;

const StatusText = styled.span`
    font-size: 11px;
    color: ${C.textMuted};
`;

const VersionInfo = styled.span`
    font-size: 10px;
    color: ${C.textMuted};
    font-weight: 500;
`;

export default Sidebar;
