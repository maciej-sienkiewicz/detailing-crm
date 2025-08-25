// src/components/layout/UserProfileSection.tsx
import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {FaChevronDown, FaSignOutAlt} from 'react-icons/fa';
import {useAuth} from '../../context/AuthContext';
import {useNavigate} from 'react-router-dom';

// Brand Theme System
const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.1))',
    surface: '#ffffff',
    surfaceAlt: '#f8fafc',
    neutral: '#64748b',
    border: '#e2e8f0'
};

const UserProfileSection: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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

    const getInitials = () => {
        if (!user) return '';
        return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    };

    const getUserColor = () => {
        if (!user) return brandTheme.primary;

        const colors = [
            '#3b82f6', // Blue
            '#10b981', // Emerald
            '#f59e0b', // Amber
            '#ef4444', // Red
            '#8b5cf6', // Purple
            '#06b6d4', // Cyan
            '#84cc16', // Lime
            '#f97316'  // Orange
        ];

        const hash = String(user.userId).split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);

        return colors[Math.abs(hash) % colors.length];
    };

    const handleLogout = () => {
        setIsMenuOpen(false);
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <ProfileContainer ref={menuRef}>
            <ProfileTrigger onClick={() => setIsMenuOpen(!isMenuOpen)} $isOpen={isMenuOpen}>
                <Avatar>
                    {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                    ) : (
                        <AvatarInitials $color={getUserColor()}>
                            {getInitials()}
                        </AvatarInitials>
                    )}
                    <OnlineStatus />
                </Avatar>

                <UserInfo>
                    <UserName>{`${user.firstName} ${user.lastName}`}</UserName>
                    <UserRole>{user.roles?.[0] || 'Administrator'}</UserRole>
                </UserInfo>

                <DropdownIcon $isOpen={isMenuOpen}>
                    <FaChevronDown />
                </DropdownIcon>
            </ProfileTrigger>

            {isMenuOpen && (
                <DropdownMenu>
                    <MenuHeader>
                        <HeaderAvatar>
                            {user.avatar ? (
                                <img src={user.avatar} alt="Avatar" />
                            ) : (
                                <HeaderInitials $color={getUserColor()}>
                                    {getInitials()}
                                </HeaderInitials>
                            )}
                        </HeaderAvatar>
                        <HeaderInfo>
                            <HeaderName>{`${user.firstName} ${user.lastName}`}</HeaderName>
                            <HeaderEmail>{user.email}</HeaderEmail>
                        </HeaderInfo>
                    </MenuHeader>

                    <MenuDivider />


                    <MenuItem onClick={handleLogout} $isLogout>
                        <MenuItemIcon><FaSignOutAlt /></MenuItemIcon>
                        <MenuItemText>Wyloguj się</MenuItemText>
                    </MenuItem>
                </DropdownMenu>
            )}
        </ProfileContainer>
    );
};

// Styled Components - Clean & Minimal
const ProfileContainer = styled.div`
    position: relative;
    padding: 16px 20px;
    border-bottom: 1px solid ${brandTheme.border};
`;

const ProfileTrigger = styled.div<{ $isOpen: boolean }>`
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;

    ${({ $isOpen }) => $isOpen && `
        background: ${brandTheme.surfaceAlt};
    `}

    &:hover {
        background: ${brandTheme.surfaceAlt};
    }
`;

const Avatar = styled.div`
    position: relative;
    flex-shrink: 0;
`;

const AvatarImage = styled.img`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid ${brandTheme.border};
`;

const AvatarInitials = styled.div<{ $color: string }>`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    border: 2px solid ${brandTheme.border};
`;

const OnlineStatus = styled.div`
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    background: #10b981;
    border: 2px solid white;
    border-radius: 50%;
`;

const UserInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const UserName = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const UserRole = styled.div`
    font-size: 12px;
    color: ${brandTheme.neutral};
    margin-top: 2px;
`;

const DropdownIcon = styled.div<{ $isOpen: boolean }>`
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.neutral};
    font-size: 10px;
    transform: rotate(${({ $isOpen }) => $isOpen ? '180deg' : '0deg'});
    transition: transform 0.2s;
`;

const DropdownMenu = styled.div`
    position: absolute;
    top: calc(100% + 8px);
    left: 20px;
    right: 20px;
    background: white;
    border: 1px solid ${brandTheme.border};
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    overflow: hidden;
`;

const MenuHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: ${brandTheme.surfaceAlt};
`;

const HeaderAvatar = styled.div`
    img {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        object-fit: cover;
    }
`;

const HeaderInitials = styled.div<{ $color: string }>`
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 16px;
`;

const HeaderInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const HeaderName = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
`;

const HeaderEmail = styled.div`
    font-size: 12px;
    color: ${brandTheme.neutral};
    margin-top: 2px;
`;

const HeaderCompany = styled.div`
    font-size: 11px;
    color: #94a3b8;
    margin-top: 2px;
`;

const MenuDivider = styled.div`
    height: 1px;
    background: ${brandTheme.border};
`;

const MenuItems = styled.div`
    padding: 8px;
`;

const MenuItem = styled.div<{ $isLogout?: boolean }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: ${({ $isLogout }) =>
                $isLogout ? 'rgba(239, 68, 68, 0.1)' : brandTheme.surfaceAlt
        };
    }

    ${({ $isLogout }) => $isLogout && `
        color: #dc2626;
    `}
`;

const MenuItemIcon = styled.div`
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: ${brandTheme.neutral};
`;

const MenuItemText = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    flex: 1;
`;

const NotificationBadge = styled.span`
    background: #ef4444;
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 8px;
    min-width: 16px;
    text-align: center;
`;

export default UserProfileSection;