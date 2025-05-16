// src/pages/Auth/LoginPage.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaUserAlt, FaLock, FaSignInAlt, FaCarSide } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, error, loading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await login(email, password);
            navigate('/calendar');
        } catch (err) {
            console.error('Login error:', err);
        }
    };

    return (
        <LoginContainer>
            <ContentWrapper>
                <LeftPanel>
                    <BrandSection>
                        <Logo>
                            <FaCarSide size={40} />
                            <LogoText>Detailing CRM</LogoText>
                        </Logo>
                        <Tagline>Profesjonalne zarządzanie biznesem detailingowym</Tagline>
                    </BrandSection>

                    <FeaturesList>
                        <FeatureItem>
                            <FeatureIcon>✓</FeatureIcon>
                            <FeatureText>Zarządzanie wizytami i kalendarz</FeatureText>
                        </FeatureItem>
                        <FeatureItem>
                            <FeatureIcon>✓</FeatureIcon>
                            <FeatureText>Protokoły przyjęcia pojazdów</FeatureText>
                        </FeatureItem>
                        <FeatureItem>
                            <FeatureIcon>✓</FeatureIcon>
                            <FeatureText>Baza klientów i pojazdów</FeatureText>
                        </FeatureItem>
                        <FeatureItem>
                            <FeatureIcon>✓</FeatureIcon>
                            <FeatureText>Faktury i finanse</FeatureText>
                        </FeatureItem>
                        <FeatureItem>
                            <FeatureIcon>✓</FeatureIcon>
                            <FeatureText>Komunikacja z klientami</FeatureText>
                        </FeatureItem>
                        <FeatureItem>
                            <FeatureIcon>✓</FeatureIcon>
                            <FeatureText>Raporty i analizy</FeatureText>
                        </FeatureItem>
                    </FeaturesList>

                    <FooterInfo>
                        © {new Date().getFullYear()} Detailing CRM. Wszystkie prawa zastrzeżone.
                    </FooterInfo>
                </LeftPanel>

                <RightPanel>
                    <LoginBox>
                        <LoginHeader>Logowanie do systemu</LoginHeader>

                        {error && <ErrorMessage>{error}</ErrorMessage>}

                        <LoginForm onSubmit={handleSubmit}>
                            <FormGroup>
                                <InputIcon>
                                    <FaUserAlt />
                                </InputIcon>
                                <Input
                                    type="email"
                                    placeholder="Adres email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <InputIcon>
                                    <FaLock />
                                </InputIcon>
                                <Input
                                    type="password"
                                    placeholder="Hasło"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </FormGroup>

                            <RememberForgotRow>
                                <RememberMeLabel>
                                    <CheckboxInput
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                    />
                                    <span>Zapamiętaj mnie</span>
                                </RememberMeLabel>

                                <ForgotPasswordLink href="#">Zapomniałem hasła</ForgotPasswordLink>
                            </RememberForgotRow>

                            <LoginButton type="submit" disabled={loading}>
                                {loading ? (
                                    'Logowanie...'
                                ) : (
                                    <>
                                        <FaSignInAlt /> Zaloguj się
                                    </>
                                )}
                            </LoginButton>
                        </LoginForm>

                        <LoginFooter>
                            <DemoAccount>
                                <strong>Konto demo:</strong> demo@example.com / password
                            </DemoAccount>
                            <SupportLink href="#">Potrzebujesz pomocy? Skontaktuj się z nami</SupportLink>
                        </LoginFooter>
                    </LoginBox>
                </RightPanel>
            </ContentWrapper>
        </LoginContainer>
    );
};

// Styled components
const LoginContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const ContentWrapper = styled.div`
  display: flex;
  width: 100%;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
  background-color: #2c3e50;
  color: white;
  
  @media (max-width: 992px) {
    padding: 20px;
  }
`;

const BrandSection = styled.div`
  margin-bottom: 40px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  color: #3498db;
`;

const LogoText = styled.h1`
  font-size: 28px;
  margin-left: 12px;
  font-weight: 600;
`;

const Tagline = styled.p`
  font-size: 18px;
  opacity: 0.9;
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
`;

const FeatureIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: rgba(52, 152, 219, 0.2);
  border-radius: 50%;
  margin-right: 12px;
  color: #3498db;
  font-weight: bold;
`;

const FeatureText = styled.span`
  opacity: 0.9;
`;

const FooterInfo = styled.div`
  font-size: 14px;
  opacity: 0.7;
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  
  @media (max-width: 992px) {
    padding: 20px;
  }
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 400px;
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 576px) {
    padding: 20px;
  }
`;

const LoginHeader = styled.h2`
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  background-color: #fdecea;
  color: #e74c3c;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.span`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const RememberForgotRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
`;

const RememberMeLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  
  span {
    margin-left: 6px;
    color: #34495e;
  }
`;

const CheckboxInput = styled.input`
  cursor: pointer;
`;

const ForgotPasswordLink = styled.a`
  color: #3498db;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LoginButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const LoginFooter = styled.div`
  margin-top: 30px;
  text-align: center;
`;

const DemoAccount = styled.div`
  font-size: 13px;
  margin-bottom: 12px;
  color: #7f8c8d;
`;

const SupportLink = styled.a`
  font-size: 13px;
  color: #3498db;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default LoginPage;