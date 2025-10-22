import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaEllipsisV } from 'react-icons/fa';

export interface ContextMenuItem {
    id: string;
    label: string;
    icon?: React.ComponentType;
    onClick: () => void;
    variant?: 'default' | 'danger' | 'primary';
    disabled?: boolean;
    hidden?: boolean;
}

interface ContextMenuProps {
    items: ContextMenuItem[];
    size?: 'small' | 'medium' | 'large';
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ items, size = 'medium' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const visibleItems = items.filter(item => !item.hidden);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleItemClick = (e: React.MouseEvent, item: ContextMenuItem) => {
        e.stopPropagation();
        if (!item.disabled) {
            item.onClick();
            setIsOpen(false);
        }
    };

    if (visibleItems.length === 0) {
        return null;
    }

    return (
        <MenuContainer ref={menuRef}>
            <MenuTrigger onClick={handleToggle} $size={size} $isOpen={isOpen}>
                <FaEllipsisV />
            </MenuTrigger>

            <MenuDropdown $isOpen={isOpen} $size={size}>
                {visibleItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <MenuItem
                            key={item.id}
                            onClick={(e) => handleItemClick(e, item)}
                            $variant={item.variant || 'default'}
                            $disabled={item.disabled}
                        >
                            {IconComponent && (
                                <MenuItemIcon>
                                    <IconComponent />
                                </MenuItemIcon>
                            )}
                            <MenuItemLabel>{item.label}</MenuItemLabel>
                        </MenuItem>
                    );
                })}
            </MenuDropdown>
        </MenuContainer>
    );
};

const MenuContainer = styled.div`
    position: relative;
    display: inline-flex;
`;

const MenuTrigger = styled.button<{ $size: 'small' | 'medium' | 'large'; $isOpen: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$isOpen ? 'rgba(26, 54, 93, 0.08)' : 'rgba(26, 54, 93, 0.04)'};
    border: 1px solid ${props => props.$isOpen ? 'var(--brand-primary, #1a365d)' : '#e2e8f0'};
    border-radius: 4px;
    color: ${props => props.$isOpen ? 'var(--brand-primary, #1a365d)' : '#64748b'};
    cursor: pointer;
    transition: all 0.15s ease;

    ${props => {
        switch (props.$size) {
            case 'small':
                return `
                    width: 24px;
                    height: 24px;
                    font-size: 10px;
                `;
            case 'large':
                return `
                    width: 32px;
                    height: 32px;
                    font-size: 13px;
                `;
            default: // medium
                return `
                    width: 28px;
                    height: 28px;
                    font-size: 11px;
                `;
        }
    }}

    &:hover {
        background: rgba(26, 54, 93, 0.08);
        border-color: var(--brand-primary, #1a365d);
        color: var(--brand-primary, #1a365d);
        transform: translateY(-1px);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    &:active {
        transform: translateY(0);
    }
`;

const MenuDropdown = styled.div<{ $isOpen: boolean; $size: 'small' | 'medium' | 'large' }>`
    position: absolute;
    top: calc(100% + 3px);
    right: 0;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
    z-index: 1000;
    min-width: ${props => props.$size === 'small' ? '140px' : '160px'};
    opacity: ${props => props.$isOpen ? 1 : 0};
    visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
    transform: ${props => props.$isOpen ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.95)'};
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: top right;
    overflow: hidden;
`;

const MenuItem = styled.button<{ $variant: 'default' | 'danger' | 'primary'; $disabled?: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 7px 12px;
    border: none;
    background: transparent;
    text-align: left;
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.12s ease;
    font-size: 12px;
    font-weight: 500;
    opacity: ${props => props.$disabled ? 0.5 : 1};

    ${props => {
        switch (props.$variant) {
            case 'danger':
                return `
                    color: #dc2626;
                    
                    &:hover:not(:disabled) {
                        background: #fef2f2;
                        color: #b91c1c;
                    }
                `;
            case 'primary':
                return `
                    color: var(--brand-primary, #1a365d);
                    
                    &:hover:not(:disabled) {
                        background: rgba(26, 54, 93, 0.04);
                        color: var(--brand-primary-dark, #0f2027);
                    }
                `;
            default:
                return `
                    color: #334155;
                    
                    &:hover:not(:disabled) {
                        background: #f8fafc;
                        color: #0f172a;
                    }
                `;
        }
    }}

    &:first-child {
        border-radius: 6px 6px 0 0;
    }

    &:last-child {
        border-radius: 0 0 6px 6px;
    }

    &:only-child {
        border-radius: 6px;
    }
`;

const MenuItemIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    width: 14px;
    flex-shrink: 0;
`;

const MenuItemLabel = styled.span`
    flex: 1;
    white-space: nowrap;
`;