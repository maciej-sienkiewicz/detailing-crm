import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FaChevronDown, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const C = {
    bg: '#0f1623',
    bgHover: '#1a2335',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#4b5563',
    border: 'rgba(255, 255, 255, 0.06)',
    menuBg: '#1a2335',
    menuBorder: 'rgba(255, 255, 255, 0.1)',
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
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitials = () => {
        if (!user) return '';
        return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    };

    const getUserColor = () => {
        if (!user) return '#6366f1';

        const colors = [
            '#6366f1', '#10b981', '#f59e0b', '#ef4444',
            '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
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

const ProfileContainer = styled.div`
    position: relative;
    padding: 10px 8px;
    border-bottom: 1px solid ${C.border};
    margin: 0 0 4px;
`;

const ProfileTrigger = styled.div<{ $isOpen: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 8px 8px;
    border-radius: 8px;
    transition: background 0.15s ease;
    background: ${({ $isOpen }) => $isOpen ? C.bgHover : 'transparent'};

    &:hover {
        background: ${C.bgHover};
    }
`;

const Avatar = styled.div`
    position: relative;
    flex-shrink: 0;
`;

const AvatarImage = styled.img`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255,255,255,0.1);
`;

const AvatarInitials = styled.div<{ $color: string }>`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.5px;
`;

const OnlineStatus = styled.div`
    position: absolute;
    bottom: 0;
    right: 0;
    width: 9px;
    height: 9px;
    background: #10b981;
    border: 2px solid ${C.bg};
    border-radius: 50%;
`;

const UserInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const UserName = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${C.textPrimary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const UserRole = styled.div`
    font-size: 10px;
    color: ${C.textSecondary};
    margin-top: 1px;
`;

const DropdownIcon = styled.div<{ $isOpen: boolean }>`
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${C.textMuted};
    font-size: 9px;
    transform: rotate(${({ $isOpen }) => $isOpen ? '180deg' : '0deg'});
    transition: transform 0.2s;
`;

const DropdownMenu = styled.div`
    position: absolute;
    top: calc(100% + 4px);
    left: 8px;
    right: 8px;
    background: ${C.menuBg};
    border: 1px solid ${C.menuBorder};
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0,0,0,0.3);
    z-index: 1000;
    overflow: hidden;
`;

const MenuHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: rgba(255,255,255,0.03);
`;

const HeaderAvatar = styled.div`
    img {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
    }
`;

const HeaderInitials = styled.div<{ $color: string }>`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 13px;
`;

const HeaderInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const HeaderName = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${C.textPrimary};
`;

const HeaderEmail = styled.div`
    font-size: 10px;
    color: ${C.textSecondary};
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const MenuDivider = styled.div`
    height: 1px;
    background: ${C.border};
`;

const MenuItem = styled.div<{ $isLogout?: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
        background: ${({ $isLogout }) =>
            $isLogout ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)'};
    }
`;

const MenuItemIcon = styled.div`
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #ef4444;
`;

const MenuItemText = styled.span`
    font-size: 12px;
    font-weight: 500;
    color: #ef4444;
    flex: 1;
`;

export default UserProfileSection;
