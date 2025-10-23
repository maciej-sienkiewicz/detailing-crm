import React from 'react';
import styled from 'styled-components';
import {FaTimes, FaTags} from 'react-icons/fa';
import {theme} from '../../styles/theme';

interface SelectedTagsProps {
    selectedTags: string[];
    onTagRemove: (tag: string) => void;
}

export const SelectedTags: React.FC<SelectedTagsProps> = ({ selectedTags, onTagRemove }) => {
    if (selectedTags.length === 0) return null;

    return (
        <TagsContainer>
            {selectedTags.map(tag => (
                <SelectedTag key={tag} onClick={() => onTagRemove(tag)}>
                    <TagText>{tag}</TagText>
                    <RemoveButton>
                        <FaTimes />
                    </RemoveButton>
                </SelectedTag>
            ))}
        </TagsContainer>
    );
};

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;

const SelectedTag = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.primary};
  color: white;
  border: 1px solid ${theme.primary};
  border-radius: ${theme.radius.sm};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  transition: all ${theme.transitions.normal};

  &:hover {
    background: ${theme.primaryDark};
    border-color: ${theme.primaryDark};
  }
`;

const TagText = styled.span`
  line-height: 1;
`;

const RemoveButton = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: ${theme.fontSize.xs};
  transition: all ${theme.transitions.fast};

  ${SelectedTag}:hover & {
    background: rgba(255, 255, 255, 0.3);
  }
`;

interface QuickTagsProps {
    availableTags: string[];
    selectedTags: string[];
    onTagAdd: (tag: string) => void;
}

export const QuickTags: React.FC<QuickTagsProps> = ({ availableTags, selectedTags, onTagAdd }) => {
    if (availableTags.length === 0 || selectedTags.length > 0) return null;

    return (
        <QuickTagsContainer>
            {availableTags.slice(0, 8).map(tag => (
                <QuickTag key={tag} onClick={() => onTagAdd(tag)}>
                    {tag}
                </QuickTag>
            ))}
        </QuickTagsContainer>
    );
};

const QuickTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;

const QuickTag = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.surface};
  border: 1px solid ${theme.border};
  border-radius: ${theme.radius.sm};
  font-size: ${theme.fontSize.sm};
  font-weight: 500;
  color: ${theme.text.secondary};
  cursor: pointer;
  transition: all ${theme.transitions.normal};

  &:hover {
    background: ${theme.primary}08;
    border-color: ${theme.primary}40;
    color: ${theme.primary};
  }
`;

interface TagDropdownProps {
    filteredTags: string[];
    onTagAdd: (tag: string) => void;
    isEmpty: boolean;
}

export const TagDropdown: React.FC<TagDropdownProps> = ({ filteredTags, onTagAdd, isEmpty }) => {
    if (isEmpty) {
        return (
            <DropdownContainer>
                <EmptyMessage>
                    <FaTags />
                    Brak tagów spełniających kryteria
                </EmptyMessage>
            </DropdownContainer>
        );
    }

    return (
        <DropdownContainer>
            <DropdownHeader>
                Znalezione tagi ({filteredTags.length})
            </DropdownHeader>
            <DropdownList>
                {filteredTags.slice(0, 10).map(tag => (
                    <DropdownItem key={tag} onClick={() => onTagAdd(tag)}>
                        <TagIcon><FaTags /></TagIcon>
                        <TagName>{tag}</TagName>
                    </DropdownItem>
                ))}
            </DropdownList>
            {filteredTags.length > 10 && (
                <DropdownFooter>
                    +{filteredTags.length - 10} więcej tagów
                </DropdownFooter>
            )}
        </DropdownContainer>
    );
};

const DropdownContainer = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: ${theme.surface};
  border: 1px solid ${theme.border};
  border-radius: ${theme.radius.md};
  max-height: 300px;
  overflow: hidden;
  z-index: 100;
  box-shadow: ${theme.shadow.lg};
  animation: slideDown 0.2s ease;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DropdownHeader = styled.div`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.surfaceAlt};
  font-size: ${theme.fontSize.xs};
  font-weight: 600;
  color: ${theme.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid ${theme.border};
`;

const DropdownList = styled.div`
  max-height: 240px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.surfaceAlt};
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.border};
    border-radius: 3px;

    &:hover {
      background: ${theme.borderActive};
    }
  }
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.surface};
  border: none;
  border-bottom: 1px solid ${theme.border};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  text-align: left;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${theme.surfaceHover};
  }
`;

const TagIcon = styled.div`
  color: ${theme.text.muted};
  font-size: ${theme.fontSize.xs};
  flex-shrink: 0;
`;

const TagName = styled.span`
  font-size: ${theme.fontSize.base};
  font-weight: 500;
  color: ${theme.text.secondary};
  flex: 1;
`;

const DropdownFooter = styled.div`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.surfaceAlt};
  font-size: ${theme.fontSize.xs};
  color: ${theme.text.muted};
  text-align: center;
  font-style: italic;
  border-top: 1px solid ${theme.border};
`;

const EmptyMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.xl};
  color: ${theme.text.muted};
  font-size: ${theme.fontSize.base};
  font-style: italic;

  svg {
    font-size: ${theme.fontSize.md};
  }
`;

export default SelectedTags;