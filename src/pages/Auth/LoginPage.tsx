// src/pages/Auth/ModernLoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
    FaUserAlt,
    FaLock,
    FaSignInAlt,
    FaCarSide,
    FaRegCheckCircle,
    FaChevronRight
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../../components/common/AnimatedBackground';
import AnimatedGradientBackground from '../../components/common/AnimatedGradientBackground';
import ParticlesNetwork from '../../components/common/ParticlesNetwork';

const ModernLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, error, loading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    // Efekt animacji na start
    const [pageLoaded, setPageLoaded] = useState(false);
    useEffect(() => {
        setPageLoaded(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await login(email, password);
            navigate('/calendar');
        } catch (err) {
            console.error('Login error:', err);
        }
    };

    // Lista korzyści z użycia systemu
    const benefits = [
        "Profesjonalne zarządzanie wizytami i kalendarz",
        "Kompleksowa baza klientów i pojazdów",
        "Automatyczne faktury i finanse",
        "Szczegółowe raporty i analizy biznesowe",
        "Dostęp mobilny z dowolnego urządzenia",
        "Bezpieczeństwo i kopie zapasowe danych"
    ];

    return (
        <AnimatedGradientBackground
            colors={['#3498db', '#2980b9', '#2c3e50', '#1a2a3a']}
            speed={10}
            blurAmount={150}
            opacity={0.07}
        >
            <LoginPageContainer>
                {/* Dodatkowe animowane elementy tła */}
                <AnimatedBackground
                    type="hexagons"
                    count={15}
                    color1="#3498db"
                    color2="#2c3e50"
                    opacity={0.04}
                    speed={5}
                    size="medium"
                />

                {/* Dodajemy interaktywną sieć cząstek */}
                <ParticlesNetwork
                    color="#3498db"
                    particleCount={70}
                    linkDistance={180}
                    moveSpeed={0.8}
                    opacity={0.3}
                    lineWidth={0.6}
                    size={2}
                />

                <LoginPageContent $loaded={pageLoaded}>
                    <LeftPanel>
                        <BrandingContainer>
                            <LogoContainer>
                                <LogoIcon>
                                    <FaCarSide />
                                </LogoIcon>
                                <LogoText>Detailing CRM</LogoText>
                            </LogoContainer>

                            <Tagline>Profesjonalne zarządzanie biznesem detailingowym</Tagline>

                            <Separator />

                            <BenefitsList>
                                {benefits.map((benefit, index) => (
                                    <BenefitItem key={index} $delay={index * 0.1}>
                                        <BenefitIcon>
                                            <FaRegCheckCircle />
                                        </BenefitIcon>
                                        <BenefitText>{benefit}</BenefitText>
                                    </BenefitItem>
                                ))}
                            </BenefitsList>

                            <TestimonialContainer>
                                <TestimonialText>
                                    "Detailing CRM zrewolucjonizował sposób zarządzania naszym biznesem. Nie wyobrażamy sobie działalności bez tego narzędzia."
                                </TestimonialText>
                                <TestimonialAuthor>
                                    <TestimonialAvatar src="https://randomuser.me/api/portraits/men/32.jpg" />
                                    <TestimonialInfo>
                                        <TestimonialName>Piotr Kowalski</TestimonialName>
                                        <TestimonialCompany>Premium Auto Detailing</TestimonialCompany>
                                    </TestimonialInfo>
                                </TestimonialAuthor>
                            </TestimonialContainer>
                        </BrandingContainer>
                    </LeftPanel>

                    <RightPanel>
                        <LoginFormContainer>
                            <LoginHeader>
                                <WelcomeText>Witaj ponownie</WelcomeText>
                                <SubtitleText>Zaloguj się do swojego konta</SubtitleText>
                            </LoginHeader>

                            {error && (
                                <ErrorContainer>
                                    <ErrorMessage>{error}</ErrorMessage>
                                </ErrorContainer>
                            )}

                            <LoginForm onSubmit={handleSubmit}>
                                <FormGroup $focused={isEmailFocused}>
                                    <InputIcon $focused={isEmailFocused}>
                                        <FaUserAlt />
                                    </InputIcon>
                                    <Input
                                        type="email"
                                        placeholder="Adres email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setIsEmailFocused(true)}
                                        onBlur={() => setIsEmailFocused(false)}
                                        required
                                    />
                                    <InputFocusBg $visible={isEmailFocused} />
                                </FormGroup>

                                <FormGroup $focused={isPasswordFocused}>
                                    <InputIcon $focused={isPasswordFocused}>
                                        <FaLock />
                                    </InputIcon>
                                    <Input
                                        type="password"
                                        placeholder="Hasło"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setIsPasswordFocused(true)}
                                        onBlur={() => setIsPasswordFocused(false)}
                                        required
                                    />
                                    <InputFocusBg $visible={isPasswordFocused} />
                                </FormGroup>

                                <FormOptions>
                                    <RememberMeLabel>
                                        <CustomCheckbox checked={rememberMe} onChange={() => setRememberMe(!rememberMe)}>
                                            {rememberMe && <FaRegCheckCircle className="check-icon" />}
                                        </CustomCheckbox>
                                        <span>Zapamiętaj mnie</span>
                                    </RememberMeLabel>

                                    <ForgotPasswordLink href="#">Zapomniałem hasła</ForgotPasswordLink>
                                </FormOptions>

                                <SubmitButton type="submit" disabled={loading}>
                                    {loading ? (
                                        <ButtonContent>
                                            <LoadingSpinner />
                                            <span>Logowanie...</span>
                                        </ButtonContent>
                                    ) : (
                                        <ButtonContent>
                                            <FaSignInAlt />
                                            <span>Zaloguj się</span>
                                        </ButtonContent>
                                    )}
                                </SubmitButton>
                            </LoginForm>

                            <DemoAccountBox>
                                <DemoTitle>Konto demonstracyjne</DemoTitle>
                                <DemoCredentials>demo@example.com / password</DemoCredentials>
                                <DemoAction>
                                    <DemoButton onClick={() => {
                                        setEmail('demo@example.com');
                                        setPassword('password');
                                    }}>
                                        Wypełnij danymi demo <FaChevronRight className="arrow" />
                                    </DemoButton>
                                </DemoAction>
                            </DemoAccountBox>

                            <SupportLinks>
                                <SupportLink href="#">Pomoc techniczna</SupportLink>
                                <SupportLink href="#">Kontakt</SupportLink>
                                <SupportLink href="#">Polityka prywatności</SupportLink>
                            </SupportLinks>
                        </LoginFormContainer>
                    </RightPanel>
                </LoginPageContent>
            </LoginPageContainer>
        </AnimatedGradientBackground>
    );
};

// Animacje
const fadeInUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const fadeIn = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const spin = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`;

const gradientShift = keyframes`
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
`;

// Styled components
const LoginPageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
    overflow: hidden;
    position: relative;
`;

const LoginPageContent = styled.div<{ $loaded: boolean }>`
    display: flex;
    width: 90%;
    max-width: 1200px;
    min-height: 650px;
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    opacity: ${props => props.$loaded ? 1 : 0};
    transform: ${props => props.$loaded ? 'translateY(0)' : 'translateY(20px)'};
    transition: all 0.6s ease-out;

    @media (max-width: 992px) {
        flex-direction: column;
        max-width: 500px;
    }
`;

const LeftPanel = styled.div`
    flex: 1;
    background: linear-gradient(135deg, #2c3e50 0%, #1a2a3a 100%);
    color: white;
    padding: 40px;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%);
        opacity: 0.7;
        pointer-events: none;
    }

    @media (max-width: 992px) {
        padding: 30px;
    }
`;

const BrandingContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const LogoContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    animation: ${fadeInUp} 0.8s forwards;
`;

const LogoIcon = styled.div`
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-right: 12px;
    box-shadow: 0 8px 16px rgba(41, 128, 185, 0.3);
`;

const LogoText = styled.h1`
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(to right, #fff, #e9e9e9);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
`;

const Tagline = styled.p`
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 24px 0;
    animation: ${fadeInUp} 0.8s 0.2s forwards;
    opacity: 0;
`;

const Separator = styled.div`
    height: 1px;
    background: linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.3), rgba(255,255,255,0.1));
    margin: 24px 0;
    animation: ${fadeIn} 1.2s forwards;
`;

const BenefitsList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0 0 auto 0;
`;

const BenefitItem = styled.li<{ $delay: number }>`
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    opacity: 0;
    animation: ${fadeInUp} 0.6s ${props => 0.3 + props.$delay}s forwards;
`;

const BenefitIcon = styled.div`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(52, 152, 219, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3498db;
    margin-right: 16px;
    flex-shrink: 0;
    font-size: 12px;
`;

const BenefitText = styled.span`
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
`;

const TestimonialContainer = styled.div`
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 24px;
    margin-top: 32px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    opacity: 0;
    animation: ${fadeInUp} 0.6s 0.7s forwards;
`;

const TestimonialText = styled.p`
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    font-style: italic;
    margin: 0 0 16px 0;
    line-height: 1.6;
`;

const TestimonialAuthor = styled.div`
    display: flex;
    align-items: center;
`;

const TestimonialAvatar = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 12px;
    border: 2px solid #3498db;
`;

const TestimonialInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

const TestimonialName = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: white;
`;

const TestimonialCompany = styled.div`
    font-size: 12px;
    color: #3498db;
`;

const RightPanel = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background-color: white;

    @media (max-width: 992px) {
        padding: 30px;
    }
`;

const LoginFormContainer = styled.div`
    width: 100%;
    max-width: 400px;
`;

const LoginHeader = styled.div`
    text-align: center;
    margin-bottom: 40px;
    opacity: 0;
    animation: ${fadeInUp} 0.6s 0.3s forwards;
`;

const WelcomeText = styled.h2`
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 8px 0;
`;

const SubtitleText = styled.p`
    font-size: 16px;
    color: #7f8c8d;
    margin: 0;
`;

const ErrorContainer = styled.div`
    background-color: #fdecea;
    border-left: 4px solid #e74c3c;
    color: #c0392b;
    padding: 12px 16px;
    border-radius: 4px;
    margin-bottom: 24px;
    font-size: 14px;
    animation: ${fadeIn} 0.3s forwards;
`;

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;

    &::before {
        content: '⚠️';
        margin-right: 8px;
    }
`;

const LoginForm = styled.form`
    opacity: 0;
    animation: ${fadeInUp} 0.6s 0.4s forwards;
`;

const FormGroup = styled.div<{ $focused: boolean }>`
    position: relative;
    margin-bottom: 24px;
    border-radius: 8px;
    border: 1px solid ${props => props.$focused ? '#3498db' : '#e9ecef'};
    transition: all 0.3s ease;
    background-color: white;
    overflow: hidden;

    &:hover {
        border-color: ${props => props.$focused ? '#3498db' : '#cbd3da'};
    }
`;

const InputIcon = styled.div<{ $focused: boolean }>`
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.$focused ? '#3498db' : '#95a5a6'};
    transition: color 0.3s ease;
    font-size: 16px;
`;

const Input = styled.input`
    width: 100%;
    padding: 16px 16px 16px 48px;
    border: none;
    font-size: 15px;
    outline: none;
    background: transparent;
    color: #2c3e50;
    position: relative;
    z-index: 2;

    &::placeholder {
        color: #95a5a6;
    }
`;

const InputFocusBg = styled.div<{ $visible: boolean }>`
    position: absolute;
    inset: 0;
    background-color: rgba(52, 152, 219, 0.04);
    opacity: ${props => props.$visible ? 1 : 0};
    transition: opacity 0.3s ease;
    z-index: 1;
`;

const FormOptions = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    font-size: 14px;
`;

const RememberMeLabel = styled.label`
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    color: #7f8c8d;

    span {
        margin-left: 8px;
    }
`;

const CustomCheckbox = styled.div<{ checked: boolean }>`
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 1px solid ${props => props.checked ? '#3498db' : '#cbd3da'};
    background-color: ${props => props.checked ? '#3498db' : 'transparent'};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    color: white;
    font-size: 12px;

    .check-icon {
        opacity: ${props => props.checked ? 1 : 0};
        transform: ${props => props.checked ? 'scale(1)' : 'scale(0.8)'};
        transition: all 0.2s ease;
    }

    &:hover {
        border-color: #3498db;
    }
`;

const ForgotPasswordLink = styled.a`
    color: #3498db;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
        color: #2980b9;
        text-decoration: underline;
    }
`;

const SubmitButton = styled.button`
    width: 100%;
    padding: 16px;
    border: none;
    border-radius: 8px;
    background: linear-gradient(135deg, #3498db, #2980b9);
    background-size: 200% 200%;
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
    position: relative;
    overflow: hidden;

    &:hover:not(:disabled) {
        box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
        transform: translateY(-2px);
        animation: ${gradientShift} 2s ease infinite;
    }

    &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
    }

    &:disabled {
        background: #95a5a6;
        cursor: not-allowed;
        box-shadow: none;
    }
`;

const ButtonContent = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
`;

const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: ${spin} 0.8s linear infinite;
`;

const DemoAccountBox = styled.div`
    margin-top: 40px;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px dashed #cbd3da;
    opacity: 0;
    animation: ${fadeInUp} 0.6s 0.5s forwards;
`;

const DemoTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 4px;
`;

const DemoCredentials = styled.div`
    font-family: monospace;
    font-size: 13px;
    color: #7f8c8d;
    padding: 6px 8px;
    background-color: rgba(0, 0, 0, 0.04);
    border-radius: 4px;
    margin-bottom: 12px;
`;

const DemoAction = styled.div`
    display: flex;
    justify-content: flex-end;
`;

const DemoButton = styled.button`
    background: none;
    border: none;
    color: #3498db;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0;
    transition: color 0.2s ease;

    .arrow {
        transition: transform 0.2s ease;
    }

    &:hover {
        color: #2980b9;

        .arrow {
            transform: translateX(3px);
        }
    }
`;

const SupportLinks = styled.div`
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 32px;
    opacity: 0;
    animation: ${fadeInUp} 0.6s 0.6s forwards;

    @media (max-width: 480px) {
        flex-direction: column;
        align-items: center;
        gap: 16px;
    }
`;

const SupportLink = styled.a`
    color: #7f8c8d;
    font-size: 13px;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
        color: #3498db;
        text-decoration: underline;
    }
`;

export default ModernLoginPage;