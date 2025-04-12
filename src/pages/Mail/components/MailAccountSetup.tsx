// src/pages/Mail/components/MailAccountSetup.tsx
import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    CircularProgress,
    Divider,
    Tabs,
    Tab,
    Grid,
    Alert,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import {
    Google as GoogleIcon,
    Mail as MailIcon
} from '@mui/icons-material';
import { DEFAULT_MAIL_PROVIDERS } from '../services/config/imapConfig';
import { MailServerConfig } from '../../../types/mail';

interface MailAccountSetupProps {
    onGmailAuth: () => Promise<boolean>;
    onImapAuth: (email: string, password: string, server?: MailServerConfig) => Promise<boolean>;
    loading: boolean;
    error: string | null;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`mail-setup-tabpanel-${index}`}
            aria-labelledby={`mail-setup-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

/**
 * Komponent konfiguracji konta pocztowego
 */
const MailAccountSetup: React.FC<MailAccountSetupProps> = ({
                                                               onGmailAuth,
                                                               onImapAuth,
                                                               loading,
                                                               error
                                                           }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [activeStep, setActiveStep] = useState(0);

    // Stan dla IMAP
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [customServer, setCustomServer] = useState(false);
    const [imapHost, setImapHost] = useState('');
    const [imapPort, setImapPort] = useState('993');
    const [imapSecure, setImapSecure] = useState(true);
    const [smtpHost, setSmtpHost] = useState('');
    const [smtpPort, setSmtpPort] = useState('465');
    const [smtpSecure, setSmtpSecure] = useState(true);

    // Obsługa zmiany zakładek
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    // Obsługa autoryzacji Gmail
    const handleGmailAuth = async () => {
        try {
            const success = await onGmailAuth();
            return success;
        } catch (error) {
            console.error('Error during Gmail auth:', error);
            return false;
        }
    };

    // Obsługa autoryzacji IMAP
    const handleImapAuth = async () => {
        if (!email || !password) {
            return false;
        }

        try {
            // Jeśli używamy niestandardowego serwera, przekazujemy jego konfigurację
            let serverConfig: MailServerConfig | undefined = undefined;

            if (customServer) {
                serverConfig = {
                    imapHost,
                    imapPort: parseInt(imapPort, 10),
                    imapSecure,
                    smtpHost,
                    smtpPort: parseInt(smtpPort, 10),
                    smtpSecure
                };
            } else {
                // Próba automatycznego wykrycia konfiguracji
                const domain = email.split('@')[1];
                if (domain && DEFAULT_MAIL_PROVIDERS[domain as keyof typeof DEFAULT_MAIL_PROVIDERS]) {
                    serverConfig = DEFAULT_MAIL_PROVIDERS[domain as keyof typeof DEFAULT_MAIL_PROVIDERS];
                }
            }

            return await onImapAuth(email, password, serverConfig);
        } catch (error) {
            console.error('Error during IMAP auth:', error);
            return false;
        }
    };

    // Przechodzenie do następnego kroku
    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    // Przechodzenie do poprzedniego kroku
    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    // Obsługa wprowadzania adresu email
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setEmail(newEmail);

        // Automatyczne wykrywanie domeny i ustawienie serwerów
        const domain = newEmail.split('@')[1];
        if (domain && DEFAULT_MAIL_PROVIDERS[domain as keyof typeof DEFAULT_MAIL_PROVIDERS]) {
            const config = DEFAULT_MAIL_PROVIDERS[domain as keyof typeof DEFAULT_MAIL_PROVIDERS];
            setImapHost(config.imapHost);
            setImapPort(config.imapPort.toString());
            setImapSecure(config.imapSecure);
            setSmtpHost(config.smtpHost);
            setSmtpPort(config.smtpPort.toString());
            setSmtpSecure(config.smtpSecure);
        }
    };

    return (
        <Paper elevation={3} sx={{ maxWidth: 600, mx: 'auto', p: 0 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h5" align="center">
                    Dodaj konto pocztowe
                </Typography>
                <Typography variant="subtitle1" align="center" color="text.secondary">
                    Zintegruj swoją skrzynkę pocztową z CRM
                </Typography>
            </Box>

            <Tabs value={activeTab} onChange={handleTabChange} centered>
                <Tab
                    icon={<GoogleIcon />}
                    label="Gmail"
                    id="mail-setup-tab-0"
                    aria-controls="mail-setup-tabpanel-0"
                />
                <Tab
                    icon={<MailIcon />}
                    label="IMAP/SMTP"
                    id="mail-setup-tab-1"
                    aria-controls="mail-setup-tabpanel-1"
                />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
                <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Zaloguj się przez Google
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Twoje dane logowania są bezpieczne i nigdy nie będą przechowywane w naszej aplikacji.
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<GoogleIcon />}
                        onClick={handleGmailAuth}
                        disabled={loading}
                        sx={{ mt: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Zaloguj się przez Google'}
                    </Button>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
                <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                    <Step>
                        <StepLabel>Dane logowania</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Konfiguracja serwerów</StepLabel>
                    </Step>
                </Stepper>

                {activeStep === 0 ? (
                    <Box>
                        <TextField
                            label="Adres e-mail"
                            type="email"
                            fullWidth
                            margin="normal"
                            value={email}
                            onChange={handleEmailChange}
                            required
                        />
                        <TextField
                            label="Hasło"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={!email || !password}
                            >
                                Dalej
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box>
                        <Box sx={{ mb: 2 }}>
                            <Button
                                variant="outlined"
                                color={customServer ? 'primary' : 'secondary'}
                                onClick={() => setCustomServer(true)}
                                sx={{ mr: 1 }}
                            >
                                Konfiguracja ręczna
                            </Button>
                            <Button
                                variant="outlined"
                                color={!customServer ? 'primary' : 'secondary'}
                                onClick={() => setCustomServer(false)}
                            >
                                Wykryj automatycznie
                            </Button>
                        </Box>

                        {customServer ? (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Ustawienia IMAP
                                    </Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <TextField
                                        label="Serwer IMAP"
                                        fullWidth
                                        value={imapHost}
                                        onChange={(e) => setImapHost(e.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        label="Port"
                                        fullWidth
                                        value={imapPort}
                                        onChange={(e) => setImapPort(e.target.value)}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                                        Ustawienia SMTP
                                    </Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <TextField
                                        label="Serwer SMTP"
                                        fullWidth
                                        value={smtpHost}
                                        onChange={(e) => setSmtpHost(e.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        label="Port"
                                        fullWidth
                                        value={smtpPort}
                                        onChange={(e) => setSmtpPort(e.target.value)}
                                        required
                                    />
                                </Grid>
                            </Grid>
                        ) : (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                    Dla domeny <strong>{email.split('@')[1] || 'unknown'}</strong>
                                    {DEFAULT_MAIL_PROVIDERS[email.split('@')[1] as keyof typeof DEFAULT_MAIL_PROVIDERS] ? (
                                        ' znaleziono automatyczne ustawienia.'
                                    ) : (
                                        ' nie znaleziono automatycznych ustawień. Użyj konfiguracji ręcznej.'
                                    )}
                                </Typography>
                            </Alert>
                        )}

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <Button onClick={handleBack}>
                                Wstecz
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleImapAuth}
                                disabled={loading || (customServer && (!imapHost || !smtpHost))}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Połącz'}
                            </Button>
                        </Box>
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </TabPanel>
        </Paper>
    );
};

export default MailAccountSetup;