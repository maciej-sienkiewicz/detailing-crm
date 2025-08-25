// src/components/common/Tooltip.tsx
import React from 'react';
import styled from 'styled-components';
import {theme} from '../../styles/theme';

interface TooltipProps {
    text: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, position = 'top', children }) => {
    return (
        <TooltipContainer>
            {children}
            <TooltipContent $position={position}>
                <TooltipArrow $position={position} />
                <TooltipText>{text}</TooltipText>
            </TooltipContent>
        </TooltipContainer>
    );
};

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;

  &:hover > div:last-child {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const TooltipContent = styled.div<{ $position: 'top' | 'bottom' | 'left' | 'right' }>`
  position: absolute;
  z-index: 1000;
  padding: ${theme.spacing.lg};
  background: ${theme.text.primary};
  color: white;
  border-radius: ${theme.radius.md};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  box-shadow: ${theme.shadow.xl};
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  max-width: 350px;
  min-width: 280px;
  white-space: normal;
  word-wrap: break-word;

  ${props => {
    switch (props.$position) {
        case 'top':
            return `
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(-4px);
        `;
        case 'bottom':
            return `
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
        `;
        case 'left':
            return `
          right: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%) translateX(-4px);
        `;
        case 'right':
            return `
          left: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%) translateX(4px);
        `;
    }
}}

  &:hover {
    opacity: 1;
    visibility: visible;
    transform: ${props => {
    switch (props.$position) {
        case 'top':
            return 'translateX(-50%) translateY(0)';
        case 'bottom':
            return 'translateX(-50%) translateY(0)';
        case 'left':
            return 'translateY(-50%) translateX(0)';
        case 'right':
            return 'translateY(-50%) translateX(0)';
    }
}};
  }
`;

const TooltipArrow = styled.div<{ $position: 'top' | 'bottom' | 'left' | 'right' }>`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;

  ${props => {
    switch (props.$position) {
        case 'top':
            return `
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 6px 6px 0 6px;
          border-color: ${theme.text.primary} transparent transparent transparent;
        `;
        case 'bottom':
            return `
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 6px 6px 6px;
          border-color: transparent transparent ${theme.text.primary} transparent;
        `;
        case 'left':
            return `
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border-width: 6px 0 6px 6px;
          border-color: transparent transparent transparent ${theme.text.primary};
        `;
        case 'right':
            return `
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border-width: 6px 6px 6px 0;
          border-color: transparent ${theme.text.primary} transparent transparent;
        `;
    }
}}
`;

const TooltipText = styled.span`
  display: block;
`;