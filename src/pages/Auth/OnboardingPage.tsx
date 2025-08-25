// src/pages/Auth/OnboardingPage.tsx
import React from 'react';
import styled from 'styled-components';
import {Link} from 'react-router-dom';
import {FaArrowRight, FaCalendarAlt, FaCarSide, FaChartBar, FaMoneyBillWave, FaUsers} from 'react-icons/fa';

const OnboardingPage: React.FC = () => {
    return (
        <OnboardingContainer>
            <Hero>
                <HeroContent>
                    <HeroLogo>
                        <FaCarSide size={50} />
                        <LogoText>Detailing CRM</LogoText>
                    </HeroLogo>
                    <HeroTitle>Profesjonalne zarządzanie biznesem detailingowym</HeroTitle>
                    <HeroDescription>
                        Kompleksowe rozwiązanie dla firm zajmujących się detailingiem samochodowym,
                        które pomoże Ci zarządzać wizytami, klientami, pojazdami i finansami w jednym miejscu.
                    </HeroDescription>
                    <CallToAction>
                        <CTAButton to="/login">
                            Rozpocznij pracę <FaArrowRight />
                        </CTAButton>
                        <DemoButton href="#">Zobacz jak to działa</DemoButton>
                    </CallToAction>
                </HeroContent>
                <HeroImage src="/hero-car.jpg" alt="Detailing samochodu" />
            </Hero>

            <Features>
                <SectionHeader>
                    <SectionTitle>Wszystko, czego potrzebujesz w jednym miejscu</SectionTitle>
                    <SectionSubtitle>
                        Detailing CRM to kompleksowe narzędzie, które pomoże Ci prowadzić i rozwijać
                        Twój biznes detailingowy.
                    </SectionSubtitle>
                </SectionHeader>

                <FeatureCards>
                    <FeatureCard>
                        <FeatureIcon>
                            <FaCalendarAlt />
                        </FeatureIcon>
                        <FeatureTitle>Zarządzanie kalendarzem</FeatureTitle>
                        <FeatureDescription>
                            Zaplanuj wizyty, zarządzaj harmonogramem i automatycznie wysyłaj przypomnienia
                            do klientów.
                        </FeatureDescription>
                    </FeatureCard>

                    <FeatureCard>
                        <FeatureIcon>
                            <FaUsers />
                        </FeatureIcon>
                        <FeatureTitle>Baza klientów</FeatureTitle>
                        <FeatureDescription>
                            Przechowuj dane klientów, historię wizyt, informacje o pojazdach
                            i preferencjach.
                        </FeatureDescription>
                    </FeatureCard>

                    <FeatureCard>
                        <FeatureIcon>
                            <FaMoneyBillWave />
                        </FeatureIcon>
                        <FeatureTitle>Finanse i faktury</FeatureTitle>
                        <FeatureDescription>
                            Wystawiaj faktury, śledź płatności i zarządzaj finansami
                            swojego biznesu.
                        </FeatureDescription>
                    </FeatureCard>

                    <FeatureCard>
                        <FeatureIcon>
                            <FaChartBar />
                        </FeatureIcon>
                        <FeatureTitle>Raporty i analizy</FeatureTitle>
                        <FeatureDescription>
                            Analizuj wyniki swojego biznesu, śledź trendy i podejmuj
                            lepsze decyzje biznesowe.
                        </FeatureDescription>
                    </FeatureCard>
                </FeatureCards>
            </Features>

            <GetStartedSection>
                <GetStartedContent>
                    <GetStartedTitle>Gotowy, by usprawnić swój biznes?</GetStartedTitle>
                    <GetStartedDescription>
                        Dołącz do setek firm detailingowych, które już korzystają z naszego
                        systemu. Zacznij już teraz i zobacz, jak Detailing CRM może pomóc
                        w rozwoju Twojego biznesu.
                    </GetStartedDescription>
                    <GetStartedCTA to="/login">
                        Zaloguj się <FaArrowRight />
                    </GetStartedCTA>
                </GetStartedContent>
            </GetStartedSection>

            <Footer>
                <FooterContent>
                    <FooterLogo>
                        <FaCarSide />
                        <span>Detailing CRM</span>
                    </FooterLogo>
                    <FooterLinks>
                        <FooterLink href="#">O nas</FooterLink>
                        <FooterLink href="#">Funkcje</FooterLink>
                        <FooterLink href="#">Cennik</FooterLink>
                        <FooterLink href="#">Kontakt</FooterLink>
                        <FooterLink href="#">Wsparcie</FooterLink>
                    </FooterLinks>
                    <FooterCopyright>
                        &copy; {new Date().getFullYear()} Detailing CRM. Wszystkie prawa zastrzeżone.
                    </FooterCopyright>
                </FooterContent>
            </Footer>
        </OnboardingContainer>
    );
};

// Styled components
const OnboardingContainer = styled.div`
  font-family: 'Roboto', sans-serif;
  color: #2c3e50;
`;

const Hero = styled.section`
  display: flex;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  
  @media (max-width: 992px) {
    flex-direction: column;
    padding: 60px 0;
  }
`;

const HeroContent = styled.div`
  flex: 1;
  padding: 0 5% 0 10%;
  
  @media (max-width: 992px) {
    padding: 0 5%;
    text-align: center;
    margin-bottom: 40px;
  }
`;

const HeroLogo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  color: #3498db;
  
  @media (max-width: 992px) {
    justify-content: center;
  }
`;

const LogoText = styled.h1`
  font-size: 28px;
  margin-left: 15px;
  font-weight: 700;
`;

const HeroTitle = styled.h2`
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
  
  @media (max-width: 992px) {
    font-size: 32px;
  }
  
  @media (max-width: 576px) {
    font-size: 28px;
  }
`;

const HeroDescription = styled.p`
  font-size: 18px;
  color: #7f8c8d;
  margin-bottom: 40px;
  max-width: 600px;
  line-height: 1.6;
  
  @media (max-width: 992px) {
    margin: 0 auto 40px auto;
  }
`;

const CallToAction = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 992px) {
    justify-content: center;
  }
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 30px;
  background-color: #3498db;
  color: white;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
  transition: background-color 0.3s;
  text-decoration: none;
  
  &:hover {
    background-color: #2980b9;
    text-decoration: none;
  }
`;

const DemoButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 30px;
  background-color: transparent;
  color: #3498db;
  border: 1px solid #3498db;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s;
  text-decoration: none;
  
  &:hover {
    background-color: rgba(52, 152, 219, 0.1);
    text-decoration: none;
  }
`;

const HeroImage = styled.img`
  flex: 1;
  max-width: 50%;
  height: 100vh;
  object-fit: cover;
  object-position: center;
  
  @media (max-width: 992px) {
    max-width: 100%;
    height: 400px;
  }
`;

const Features = styled.section`
  padding: 100px 10%;
  background-color: white;
  
  @media (max-width: 992px) {
    padding: 60px 5%;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  max-width: 700px;
  margin: 0 auto 60px auto;
`;

const SectionTitle = styled.h2`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 18px;
  color: #7f8c8d;
  line-height: 1.6;
`;

const FeatureCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
`;

const FeatureCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 30px;
  transition: transform 0.3s, box-shadow 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  font-size: 30px;
  color: #3498db;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 15px;
`;

const FeatureDescription = styled.p`
  font-size: 16px;
  color: #7f8c8d;
  line-height: 1.6;
`;

const GetStartedSection = styled.section`
  padding: 80px 10%;
  background-color: #3498db;
  color: white;
  
  @media (max-width: 992px) {
    padding: 60px 5%;
  }
`;

const GetStartedContent = styled.div`
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
`;

const GetStartedTitle = styled.h2`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const GetStartedDescription = styled.p`
  font-size: 18px;
  margin-bottom: 40px;
  line-height: 1.6;
  opacity: 0.9;
`;

const GetStartedCTA = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 30px;
  background-color: white;
  color: #3498db;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s;
  text-decoration: none;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
  }
`;

const Footer = styled.footer`
  padding: 60px 10% 30px 10%;
  background-color: #2c3e50;
  color: white;
  
  @media (max-width: 992px) {
    padding: 40px 5% 20px 5%;
  }
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 30px;
  
  span {
    margin-left: 10px;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (max-width: 576px) {
    gap: 15px;
  }
`;

const FooterLink = styled.a`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 16px;
  
  &:hover {
    color: white;
    text-decoration: none;
  }
`;

const FooterCopyright = styled.p`
  font-size: 14px;
  opacity: 0.7;
`;

export default OnboardingPage;