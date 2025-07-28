// src/components/Gallery/SelectedTags.tsx
import React from 'react';
import styled from 'styled-components';
import { FaTags, FaTimes } from 'react-icons/fa';
import { theme } from '../../styles/theme';

interface SelectedTagsProps {
    selectedTags: string[];
    onTagRemove: (tag: string) => void;
}

const SelectedTags: React.FC<SelectedTagsProps> = ({ selectedTags, onTagRemove }) => {
    if (selectedTags.length === 0) return null;

    return (
        <SelectedTagsSection>
            <SectionLabel>
                <FaTags />
                Aktywne filtry ({selectedTags.length})
            </SectionLabel>
            <TagsContainer>
                {selectedTags.map(tag => (
                    <SelectedTagBadge key={tag} onClick={() => onTagRemove(tag)}>
                        <TagText>{tag}</TagText>
                        <RemoveIcon><FaTimes /></RemoveIcon>
                    </SelectedTagBadge>
                ))}
            </TagsContainer>
        </SelectedTagsSection>
    );
};

const SelectedTagsSection = styled.div`
  padding: ${theme.spacing.lg};
  background: ${theme.surfaceAlt};
  border: 1px solid ${theme.borderLight};
  border-radius: ${theme.radius.lg};
  border-left: 4px solid ${theme.primary};
`;

const SectionLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: 14px;
  font-weight: 600;
  color: ${theme.text.secondary};
  margin-bottom: ${theme.spacing.md};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  svg {
    color: ${theme.primary};
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

const SelectedTagBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
  color: white;
  border-radius: ${theme.radius.md};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all ${theme.transitions.spring};
  box-shadow: ${theme.shadow.sm};

  &:hover {
    background: linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 100%);
    transform: translateY(-2px);
    box-shadow: ${theme.shadow.md};
  }
`;

const TagText = styled.span`
  line-height: 1;
`;

const RemoveIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 10px;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

export default SelectedTags;