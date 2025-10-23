import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const visibleItems = items.filter(item => !item.hidden);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                triggerRef.current &&
                dropdownRef.current &&
                !triggerRef.current.contains(event.target as Node) &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleScroll = () => {
            if (isOpen && triggerRef.current) {
                updatePosition();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleScroll);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    const updatePosition = () => {
        if (!triggerRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const dropdownHeight = 150; // Przybliżona wysokość menu
        const spaceBelow = window.innerHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;

        let top: number;
        let left = triggerRect.right - 160; // Menu szerokości 160px, wyrównane do prawej

        // Sprawdź czy otwierać w górę czy w dół
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
            // Otwórz w górę
            top = triggerRect.top - dropdownHeight;
        } else {
            // Otwórz w dół
            top = triggerRect.bottom + 4;
        }

        // Upewnij się że menu nie wychodzi poza prawą krawędź
        if (left < 10) {
            left = 10;
        }

        // Upewnij się że menu nie wychodzi poza lewą krawędź
        if (left + 160 > window.innerWidth - 10) {
            left = window.innerWidth - 170;
        }

        setPosition({ top, left });
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!isOpen) {
            updatePosition();
        }

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

    const dropdown = isOpen ? createPortal(
        <MenuDropdown
            ref={dropdownRef}
            $isOpen={isOpen}
            $size={size}
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
        >
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
        </MenuDropdown>,
        document.body
    ) : null;

    return (
        <>
            <MenuTrigger ref={triggerRef} onClick={handleToggle} $size={size} $isOpen={isOpen}>
                <FaEllipsisV />
            </MenuTrigger>
            {dropdown}
        </>
    );
};

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
    position: fixed; /* KLUCZOWA ZMIANA: fixed zamiast absolute */
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.06);
    z-index: 999999; /* BARDZO WYSOKI Z-INDEX */
    min-width: ${props => props.$size === 'small' ? '140px' : '160px'};
    opacity: ${props => props.$isOpen ? 1 : 0};
    visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
    transform: ${props => props.$isOpen ? 'scale(1)' : 'scale(0.95)'};
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    max-height: 400px;
    overflow-y: auto;

    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: #f8fafc;
    }

    &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;

        &:hover {
            background: #94a3b8;
        }
    }
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