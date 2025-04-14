// src/pages/Mail/components/EmailComposer.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    IconButton,
    Autocomplete,
    Chip,
    Divider,
    Typography,
    Tooltip,
    Paper,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Close as CloseIcon,
    Send as SendIcon,
    Save as SaveIcon,
    Attachment as AttachmentIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Email, EmailDraft, ClientContact, EmailAddress } from '../../../types/mail';
import { TEMPLATES } from '../services/config/mailConfig';
import mailService from '../services/mailService';

interface EmailComposerProps {
    open: boolean;
    onClose: () => void;
    draftToEdit: EmailDraft | null;
    replyingTo: Email | null;
    forwardingEmail: Email | null;
    contactSuggestions: ClientContact[];
    onSearchContacts: (query: string) => void;
    accountEmail: string;
}

/**
 * Komponent do tworzenia/edycji wiadomości email
 */
const EmailComposer: React.FC<EmailComposerProps> = ({
                                                         open,
                                                         onClose,
                                                         draftToEdit,
                                                         replyingTo,
                                                         forwardingEmail,
                                                         contactSuggestions,
                                                         onSearchContacts,
                                                         accountEmail
                                                     }) => {
    // Stan formularza
    const [to, setTo] = useState<EmailAddress[]>([]);
    const [cc, setCc] = useState<EmailAddress[]>([]);
    const [bcc, setBcc] = useState<EmailAddress[]>([]);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [showCc, setShowCc] = useState(false);
    const [showBcc, setShowBcc] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Ref do inputa plików
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Ustawienie początkowych wartości formularza
    useEffect(() => {
        if (draftToEdit) {
            // Edycja wersji roboczej
            setTo(draftToEdit.to);
            setCc(draftToEdit.cc || []);
            setBcc(draftToEdit.bcc || []);
            setSubject(draftToEdit.subject);
            setBody(draftToEdit.body.html || draftToEdit.body.plain);
            setShowCc(!!draftToEdit.cc?.length);
            setShowBcc(!!draftToEdit.bcc?.length);
        } else if (replyingTo) {
            // Odpowiedź na email
            setTo([replyingTo.from]);
            setSubject(`${TEMPLATES.REPLY_PREFIX}${replyingTo.subject}`);

            // Formatowanie oryginalnej wiadomości w odpowiedzi
            const originalMessage = `
        <br/><br/>
        <div style="padding-left: 16px; border-left: 2px solid #ccc;">
          <p><strong>Od:</strong> ${replyingTo.from.name || replyingTo.from.email} &lt;${replyingTo.from.email}&gt;<br/>
          <strong>Wysłano:</strong> ${new Date(replyingTo.internalDate).toLocaleString()}<br/>
          <strong>Do:</strong> ${replyingTo.to.map(t => `${t.name || t.email} &lt;${t.email}&gt;`).join(', ')}</p>
          <strong>Temat:</strong> ${replyingTo.subject}</p>
          <div>
            ${replyingTo.body?.html || replyingTo.body?.plain || replyingTo.snippet}
          </div>
        </div>
      `;

            // Dodanie sygnatury i oryginalnej wiadomości
            const signature = TEMPLATES.SIGNATURE
                .replace('%NAME%', accountEmail.split('@')[0])
                .replace('%COMPANY%', 'Detailing CRM')
                .replace('%EMAIL%', accountEmail)
                .replace('%PHONE%', '+48 123 456 789');

            setBody(`<div><br/></div>${signature}${originalMessage}`);
        } else if (forwardingEmail) {
            // Przekazanie emaila dalej
            setSubject(`${TEMPLATES.FORWARD_PREFIX}${forwardingEmail.subject}`);

            // Formatowanie oryginalnej wiadomości w przekazaniu
            const originalMessage = `
        <br/><br/>
        <div>---------- Wiadomość przekazana dalej ----------</div>
        <div><strong>Od:</strong> ${forwardingEmail.from.name || forwardingEmail.from.email} &lt;${forwardingEmail.from.email}&gt;<br/>
        <strong>Data:</strong> ${new Date(forwardingEmail.internalDate).toLocaleString()}<br/>
        <strong>Temat:</strong> ${forwardingEmail.subject}<br/>
        <strong>Do:</strong> ${forwardingEmail.to.map(t => `${t.name || t.email} &lt;${t.email}&gt;`).join(', ')}</div>
        <br/>
        <div>
          ${forwardingEmail.body?.html || forwardingEmail.body?.plain || forwardingEmail.snippet}
        </div>
      `;

            // Dodanie sygnatury i oryginalnej wiadomości
            const signature = TEMPLATES.SIGNATURE
                .replace('%NAME%', accountEmail.split('@')[0])
                .replace('%COMPANY%', 'Detailing CRM')
                .replace('%EMAIL%', accountEmail)
                .replace('%PHONE%', '+48 123 456 789');

            setBody(`<div><br/></div>${signature}${originalMessage}`);
        } else {
            // Nowa wiadomość
            setTo([]);
            setCc([]);
            setBcc([]);
            setSubject('');

            // Dodanie sygnatury
            const signature = TEMPLATES.SIGNATURE
                .replace('%NAME%', accountEmail.split('@')[0])
                .replace('%COMPANY%', 'Detailing CRM')
                .replace('%EMAIL%', accountEmail)
                .replace('%PHONE%', '+48 123 456 789');

            setBody(signature);
        }
    }, [draftToEdit, replyingTo, forwardingEmail, accountEmail]);

    // Konfiguracja edytora Quill
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image'],
            ['clean']
        ],
    };

    // Obsługa dodawania załączników
    const handleAttachmentClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Przygotowanie danych do wysłania
    const prepareEmailData = (): EmailDraft => ({
        id: draftToEdit?.id,
        to,
        cc: showCc ? cc : [],
        bcc: showBcc ? bcc : [],
        subject,
        body: {
            plain: body.replace(/<[^>]*>/g, ''),
            html: body
        },
        attachments: files
    });

    // Wysyłanie wiadomości
    const handleSend = async () => {
        setIsSending(true);
        setErrorMessage(null);

        try {
            const emailData = prepareEmailData();
            console.log('Sending email:', emailData);

            // Wywołanie serwisu do wysyłania wiadomości
            const messageId = await mailService.sendEmail(emailData);
            console.log('Email wysłany pomyślnie, ID:', messageId);

            // Zamknięcie kompozytora po pomyślnym wysłaniu
            onClose();
        } catch (error) {
            console.error('Błąd podczas wysyłania wiadomości:', error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'Nie udało się wysłać wiadomości. Sprawdź połączenie z serwerem.'
            );
        } finally {
            setIsSending(false);
        }
    };

    // Zapisywanie wersji roboczej
    const handleSaveDraft = async () => {
        setIsSending(true);
        setErrorMessage(null);

        try {
            const emailData = prepareEmailData();
            console.log('Saving draft:', emailData);

            // Wywołanie serwisu do zapisywania wersji roboczej
            const messageId = await mailService.saveDraft(emailData);
            console.log('Wersja robocza zapisana pomyślnie, ID:', messageId);

            // Zamknięcie kompozytora po pomyślnym zapisaniu
            onClose();
        } catch (error) {
            console.error('Błąd podczas zapisywania wersji roboczej:', error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'Nie udało się zapisać wersji roboczej. Sprawdź połączenie z serwerem.'
            );
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: { height: '80vh' }
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                        {draftToEdit ? 'Edytuj wiadomość' :
                            replyingTo ? 'Odpowiedź' :
                                forwardingEmail ? 'Przekaż dalej' : 'Nowa wiadomość'}
                    </Typography>
                    <IconButton edge="end" onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <Divider />

                <DialogContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
                    {/* Pole "Do" */}
                    <Autocomplete
                        multiple
                        options={contactSuggestions}
                        getOptionLabel={(option) =>
                            typeof option === 'string' ? option : option.email
                        }
                        freeSolo
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    variant="outlined"
                                    label={option.name ? `${option.name} <${option.email}>` : option.email}
                                    {...getTagProps({ index })}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                label="Do"
                                placeholder="Adres email odbiorcy"
                                margin="dense"
                                fullWidth
                            />
                        )}
                        onChange={(_, newValue) => {
                            const emailAddresses = newValue.map(item => {
                                if (typeof item === 'string') {
                                    return { email: item };
                                } else {
                                    return { name: item.name, email: item.email };
                                }
                            });
                            setTo(emailAddresses);
                        }}
                        onInputChange={(_, newInputValue) => {
                            if (newInputValue.length >= 2) {
                                onSearchContacts(newInputValue);
                            }
                        }}
                        value={to}
                    />

                    {/* Link do rozwijania pól CC/BCC */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {!showCc && (
                            <Button
                                size="small"
                                onClick={() => setShowCc(true)}
                                sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                            >
                                Dodaj DW
                            </Button>
                        )}
                        {!showBcc && (
                            <Button
                                size="small"
                                onClick={() => setShowBcc(true)}
                                sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                            >
                                Dodaj UDW
                            </Button>
                        )}
                    </Box>

                    {/* Pola CC i BCC jeśli są widoczne */}
                    {showCc && (
                        <Autocomplete
                            multiple
                            options={contactSuggestions}
                            getOptionLabel={(option) =>
                                typeof option === 'string' ? option : option.email
                            }
                            freeSolo
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        variant="outlined"
                                        label={option.name ? `${option.name} <${option.email}>` : option.email}
                                        {...getTagProps({ index })}
                                    />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    label="DW"
                                    placeholder="Kopia do"
                                    margin="dense"
                                    fullWidth
                                />
                            )}
                            onChange={(_, newValue) => {
                                const emailAddresses = newValue.map(item => {
                                    if (typeof item === 'string') {
                                        return { email: item };
                                    } else {
                                        return { name: item.name, email: item.email };
                                    }
                                });
                                setCc(emailAddresses);
                            }}
                            onInputChange={(_, newInputValue) => {
                                if (newInputValue.length >= 2) {
                                    onSearchContacts(newInputValue);
                                }
                            }}
                            value={cc}
                        />
                    )}

                    {showBcc && (
                        <Autocomplete
                            multiple
                            options={contactSuggestions}
                            getOptionLabel={(option) =>
                                typeof option === 'string' ? option : option.email
                            }
                            freeSolo
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        variant="outlined"
                                        label={option.name ? `${option.name} <${option.email}>` : option.email}
                                        {...getTagProps({ index })}
                                    />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    label="UDW"
                                    placeholder="Ukryta kopia do"
                                    margin="dense"
                                    fullWidth
                                />
                            )}
                            onChange={(_, newValue) => {
                                const emailAddresses = newValue.map(item => {
                                    if (typeof item === 'string') {
                                        return { email: item };
                                    } else {
                                        return { name: item.name, email: item.email };
                                    }
                                });
                                setBcc(emailAddresses);
                            }}
                            onInputChange={(_, newInputValue) => {
                                if (newInputValue.length >= 2) {
                                    onSearchContacts(newInputValue);
                                }
                            }}
                            value={bcc}
                        />
                    )}

                    {/* Pole tematu */}
                    <TextField
                        label="Temat"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        margin="dense"
                        fullWidth
                    />

                    {/* Edytor tekstu */}
                    <Box sx={{ flexGrow: 1, my: 2, '& .ql-container': { height: 'calc(100% - 42px)' } }}>
                        <ReactQuill
                            value={body}
                            onChange={setBody}
                            modules={modules}
                            style={{ height: '100%' }}
                        />
                    </Box>

                    {/* Załączniki */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />

                    {files.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Załączniki ({files.length})
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {files.map((file, index) => (
                                    <Paper
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            p: 1,
                                            gap: 1,
                                            maxWidth: '100%'
                                        }}
                                    >
                                        <AttachmentIcon fontSize="small" />
                                        <Typography noWrap sx={{ maxWidth: 150 }}>
                                            {file.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </Typography>
                                        <IconButton size="small" onClick={() => handleRemoveFile(index)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Paper>
                                ))}
                            </Box>
                        </Box>
                    )}
                </DialogContent>

                <Divider />

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button variant="outlined" startIcon={<AttachmentIcon />} onClick={handleAttachmentClick}>
                        Załącz plik
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                        onClick={handleSaveDraft}
                        startIcon={isSending ? <CircularProgress size={24} /> : <SaveIcon />}
                        disabled={isSending}
                    >
                        {isSending ? 'Zapisywanie...' : 'Zapisz wersję roboczą'}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSend}
                        startIcon={isSending ? <CircularProgress size={24} /> : <SendIcon />}
                        disabled={to.length === 0 || !subject || isSending}
                    >
                        {isSending ? 'Wysyłanie...' : 'Wyślij'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Powiadomienie o błędzie */}
            <Snackbar
                open={!!errorMessage}
                autoHideDuration={6000}
                onClose={() => setErrorMessage(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default EmailComposer;