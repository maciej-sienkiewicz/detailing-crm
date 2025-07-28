// src/components/Gallery/TagDropdown.tsx
import React from 'react';
import styled from 'styled-components';
import { FaTags } from 'react-icons/fa';
import { theme } from '../../styles/theme';

interface TagDropdownProps {
    filteredTags: string[];
    onTagAdd: (tag: string) => void;
    isEmpty: boolean;
}

const TagDropdown: React.FC<TagDropdownProps> = ({ filteredTags, onTagAdd, isEmpty }) => {
    if (isEmpty) {
        return (
            <DropdownContainer>
                <EmptyDropdown>
                    <FaTags />
                    Brak tagów spełniających kryteria
                </EmptyDropdown>
            </DropdownContainer>
        );
    }

    return (
        <DropdownContainer>
            <DropdownHeader>
                Dostępne tagi ({filteredTags.length})
            </DropdownHeader>
            {filteredTags.slice(0, 10).map(tag => (
                <TagDropdownItem key={tag} onClick={() => onTagAdd(tag)}>
                    <TagIcon><FaTags /></TagIcon>
                    {tag}
                </TagDropdownItem>
            ))}
            {filteredTags.length > 10 && (
                <DropdownFooter>
                    I {filteredTags.length - 10} więcej...
                </DropdownFooter>
            )}
        </DropdownContainer>
    );
};

const DropdownContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${theme.surface};
  border: 2px solid ${theme.borderLight};
  border-top: none;
  border-radius: 0 0 ${theme.radius.lg} ${theme.radius.lg};
  max-height: 320px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: ${theme.shadow.lg};
  animation: slideDown 0.2s ease;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.surfaceAlt};
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.borderHover};
    border-radius: 3px;
  }
`;

const DropdownHeader = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.surfaceAlt};
  font-size: 12px;
  font-weight: 600;
  color: ${theme.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid ${theme.borderLight};
`;

const TagDropdownItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: ${theme.text.secondary};
  border-bottom: 1px solid ${theme.borderLight};
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.surfaceHover};
    color: ${theme.primary};
    padding-left: ${theme.spacing.xl};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TagIcon = styled.div`
  color: ${theme.text.muted};
  font-size: 12px;
`;

const DropdownFooter = styled.div`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${theme.surfaceAlt};
  font-size: 12px;
  color: ${theme.text.muted};
  text-align: center;
  font-style: italic;
`;

const EmptyDropdown = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.xl};
  color: ${theme.text.muted};
  font-size: 14px;
  font-style: italic;
`;

export default TagDropdown;