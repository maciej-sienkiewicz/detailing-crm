// src/components/layout/UserProfileSection.tsx
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaUser, FaSignOutAlt, FaCog, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProfileSection: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Obsługa kliknięcia poza menu
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

    // Generowanie inicjałów użytkownika
    const getInitials = () => {
        if (!user) return '';
        return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    };

    // Losowy kolor na podstawie ID użytkownika
    const getUserColor = () => {
        if (!user) return '#7f8c8d';

        const colors = [
            '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
            '#1abc9c', '#d35400', '#c0392b', '#16a085', '#8e44ad'
        ];

        // Proste hashowanie ID użytkownika
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
        <UserContainer ref={menuRef}>
            <UserInfoTrigger onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {user.avatar ? (
                    <UserAvatar src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                ) : (
                    <UserInitials color={getUserColor()}>
                        {getInitials()}
                    </UserInitials>
                )}
                <UserInfo>
                    <UserName>{`${user.firstName} ${user.lastName}`}</UserName>
                    <CompanyName>{user.companyName || 'Detailing Studio'}</CompanyName>
                </UserInfo>
            </UserInfoTrigger>

            {isMenuOpen && (
                <UserMenu>
                    <UserMenuHeader>
                        <UserFullDetails>
                            <strong>{`${user.firstName} ${user.lastName}`}</strong>
                            <UserEmail>{user.email}</UserEmail>
                            <UserRole>{user.roles?.[0] || 'Użytkownik'}</UserRole>
                        </UserFullDetails>
                    </UserMenuHeader>

                    <MenuDivider />

                    <MenuItem>
                        <MenuIcon><FaUser /></MenuIcon>
                        <MenuText>Profil</MenuText>
                    </MenuItem>

                    <MenuItem>
                        <MenuIcon><FaCog /></MenuIcon>
                        <MenuText>Ustawienia konta</MenuText>
                    </MenuItem>

                    <MenuItem>
                        <MenuIcon><FaEnvelope /></MenuIcon>
                        <MenuText>Wiadomości</MenuText>
                    </MenuItem>

                    <MenuDivider />

                    <MenuItem onClick={handleLogout} isLogout>
                        <MenuIcon><FaSignOutAlt /></MenuIcon>
                        <MenuText>Wyloguj się</MenuText>
                    </MenuItem>
                </UserMenu>
            )}
        </UserContainer>
    );
};

// Styled components
const UserContainer = styled.div`
    position: relative;
    margin: 20px 0;
    padding: 10px 20px;
    border-top: 1px solid #34495e;
    border-bottom: 1px solid #34495e;
`;

const UserInfoTrigger = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 5px 0;
`;

const UserAvatar = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 12px;
    object-fit: cover;
`;

const UserInitials = styled.div<{ color: string }>`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: ${props => props.color};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
    margin-right: 12px;
`;

const UserInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

const UserName = styled.div`
    color: #ecf0f1;
    font-weight: 500;
    font-size: 14px;
`;

const CompanyName = styled.div`
    color: #bdc3c7;
    font-size: 12px;
    margin-top: 2px;
`;

const UserMenu = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    margin-top: 10px;
    overflow: hidden;
`;

const UserMenuHeader = styled.div`
    padding: 15px;
    background-color: #f8f9fa;
`;

const UserFullDetails = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 14px;
    color: #2c3e50;
`;

const UserEmail = styled.div`
    color: #7f8c8d;
    font-size: 12px;
    margin-top: 4px;
`;

const UserRole = styled.div`
    display: inline-block;
    margin-top: 8px;
    padding: 2px 8px;
    background-color: #e8f4fd;
    color: #3498db;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
`;

const MenuDivider = styled.div`
    height: 1px;
    background-color: #eee;
`;

const MenuItem = styled.div<{ isLogout?: boolean }>`
    display: flex;
    align-items: center;
    padding: 12px 15px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: ${props => props.isLogout ? '#fdecea' : '#f5f5f5'};
    }

    ${props => props.isLogout && `
    color: #e74c3c;
  `}
`;

const MenuIcon = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    margin-right: 10px;
    font-size: 14px;
`;

const MenuText = styled.span`
    font-size: 14px;
`;

export default UserProfileSection;