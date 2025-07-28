// src/components/Gallery/GalleryHeader.tsx
import React from 'react';
import styled from 'styled-components';
import { FaImages } from 'react-icons/fa';
import { theme } from '../../styles/theme';

const GalleryHeader: React.FC = () => {
    return (
        <HeaderContainer>
            <PageHeader>
                <HeaderLeft>
                    <HeaderTitle>
                        <TitleIcon>
                            <FaImages />
                        </TitleIcon>
                        <TitleContent>
                            <MainTitle>Galeria zdjęć</MainTitle>
                            <Subtitle>Przeglądaj i zarządzaj zdjęciami z protokołów</Subtitle>
                        </TitleContent>
                    </HeaderTitle>
                </HeaderLeft>
            </PageHeader>
        </HeaderContainer>
    );
};

const HeaderContainer = styled.header`
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid ${theme.border};
  box-shadow: ${theme.shadow.sm};
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
`;

const PageHeader = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.lg};

  @media (max-width: 1024px) {
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    flex-direction: column;
    align-items: stretch;
    gap: ${theme.spacing.md};
  }

  @media (max-width: 768px) {
    padding: ${theme.spacing.md};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  min-width: 0;
  flex: 1;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
`;

const TitleIcon = styled.div`
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
  border-radius: ${theme.radius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: ${theme.shadow.md};
  flex-shrink: 0;
`;

const TitleContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const MainTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${theme.text.primary};
  margin: 0;
  letter-spacing: -0.5px;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const Subtitle = styled.div`
  font-size: 16px;
  color: ${theme.text.tertiary};
  font-weight: 500;
`;

export default GalleryHeader;