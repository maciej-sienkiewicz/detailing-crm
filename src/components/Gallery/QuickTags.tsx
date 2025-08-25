// src/components/Gallery/QuickTags.tsx
import React from 'react';
import styled from 'styled-components';
import {FaTags} from 'react-icons/fa';
import {theme} from '../../styles/theme';

interface QuickTagsProps {
    availableTags: string[];
    selectedTags: string[];
    onTagAdd: (tag: string) => void;
}

const QuickTags: React.FC<QuickTagsProps> = ({ availableTags, selectedTags, onTagAdd }) => {
    if (availableTags.length === 0 || selectedTags.length > 0) return null;

    return (
        <QuickTagsSection>
            <SectionLabel>
                <FaTags />
                Popularne tagi
            </SectionLabel>
            <TagsContainer>
                {availableTags.slice(0, 8).map(tag => (
                    <QuickTag key={tag} onClick={() => onTagAdd(tag)}>
                        {tag}
                    </QuickTag>
                ))}
            </TagsContainer>
        </QuickTagsSection>
    );
};

const QuickTagsSection = styled.div``;

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
  gap: ${theme.spacing.sm};
`;

const QuickTag = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.surfaceAlt};
  border: 1px solid ${theme.borderLight};
  border-radius: ${theme.radius.md};
  font-size: 13px;
  font-weight: 500;
  color: ${theme.text.secondary};
  cursor: pointer;
  transition: all ${theme.transitions.normal};

  &:hover {
    background: ${theme.primaryGhost};
    border-color: ${theme.primary};
    color: ${theme.primary};
    transform: translateY(-1px);
    box-shadow: ${theme.shadow.sm};
  }

  &:active {
    transform: translateY(0);
  }
`;

export default QuickTags;