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
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    Close as CloseIcon,
    Send as SendIcon,
    Save as SaveIcon,
    Attachment as AttachmentIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Email, EmailDraft, ClientContact, EmailAddress } from '../../../types/mail';
import { TEMPLATES } from '../services/config/mailConfig';
import { styled } from '@mui/material/styles';

interface EmailComposerProps {
    open: boolean;
    onClose: () => void;
    draftToEdit: EmailDraft | null;
    replyingTo: Email | null;
    forwardingEmail: Email | null;
    contactSuggestions: ClientContact[];
    onSearchContacts: (query: string) => void;
    accountEmail: string;
    fullScreen?: boolean;
}

// Styled komponenty
const ComposerDialogTitle = styled(DialogTitle)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 2)
}));

const ComposerDialogContent = styled(DialogContent)<{ isMobile?: boolean }>(({ theme, isMobile }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: theme.spacing(isMobile ? 1 : 2),
    overflow: 'hidden'
}));

const ComposerDialogActions = styled(DialogActions)(({ theme }) => ({
    padding: theme.spacing(1, 2),
    borderTop: '1px solid #e0e0e0'
}));

const EditorContainer = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    '& .ql-container': {
        height: 'calc(100% - 42px)',
        fontSize: '1rem'
    },
    '& .ql-editor': {
        minHeight: '150px'
    }
}));

const AttachmentsList = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
    marginTop: theme.spacing(1)
}));

const AttachmentItem = styled(Paper)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 1),
    gap: theme.spacing(1),
    maxWidth: '100%'
}));

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
                                                         accountEmail,
                                                         fullScreen = false
                                                     }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')) || fullScreen;

    // Stan formularza
    const [to, setTo] = useState<EmailAddress[]>([]);
    const [cc, setCc] = useState<EmailAddress[]>([]);
    const [bcc, setBcc] = useState<EmailAddress[]>([]);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [showCc, setShowCc] = useState(false);
    const [showBcc, setShowBcc] = useState(false);

    // Lokalne sugestie kontaktów - używane zamiast odpytywania API
    const [localSuggestions, setLocalSuggestions] = useState<ClientContact[]>([]);

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

    // Lokalne wyszukiwanie kontaktów - nie korzystamy z API klientów
    const handleSearchContacts = (query: string) => {
        if (!query || query.length < 2) {
            setLocalSuggestions([]);
            return;
        }

        // Filtracja z lokalnych sugestii bez odpytywania API
        const filtered = contactSuggestions.filter(contact =>
            contact.name.toLowerCase().includes(query.toLowerCase()) ||
            contact.email.toLowerCase().includes(query.toLowerCase())
        );

        setLocalSuggestions(filtered);

        // Nadal wywołujemy oryginalną funkcję dla kompatybilności
        // ale w rzeczywistości nie będzie ona już odpytywać API
        onSearchContacts(query);
    };

    // Konfiguracja edytora Quill
    const modules = {
        toolbar: [
            [{ 'header': isMobile ? [1, 2, false] : [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            isMobile ? [] : [{ 'color': [] }, { 'background': [] }],
            ['link', !isMobile && 'image'].filter(Boolean),
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
    const handleSend = () => {
        const emailData = prepareEmailData();
        console.log('Sending email:', emailData);
        // Tutaj byłoby faktyczne wysyłanie do API
        onClose();
    };

    // Zapisywanie wersji roboczej
    const handleSaveDraft = () => {
        const emailData = prepareEmailData();
        console.log('Saving draft:', emailData);
        // Tutaj byłoby faktyczne zapisywanie do API
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            fullScreen={isMobile}
            PaperProps={{
                sx: { height: isMobile ? '100%' : '80vh' }
            }}
        >
            <ComposerDialogTitle>
                <Typography variant="h6">
                    {draftToEdit ? 'Edytuj wiadomość' :
                        replyingTo ? 'Odpowiedź' :
                            forwardingEmail ? 'Przekaż dalej' : 'Nowa wiadomość'}
                </Typography>
                <IconButton edge="end" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </ComposerDialogTitle>

            <Divider />

            <ComposerDialogContent isMobile={isMobile}>
                {/* Pole "Do" */}
                <Autocomplete
                    multiple
                    options={localSuggestions.length > 0 ? localSuggestions : contactSuggestions}
                    getOptionLabel={(option) =>
                        typeof option === 'string' ? option : option.email
                    }
                    freeSolo
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
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
                            size={isMobile ? "small" : "medium"}
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
                            handleSearchContacts(newInputValue);
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
                        options={localSuggestions.length > 0 ? localSuggestions : contactSuggestions}
                        getOptionLabel={(option) =>
                            typeof option === 'string' ? option : option.email
                        }
                        freeSolo
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    variant="outlined"
                                    size={isMobile ? "small" : "medium"}
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
                                size={isMobile ? "small" : "medium"}
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
                                handleSearchContacts(newInputValue);
                            }
                        }}
                        value={cc}
                    />
                )}

                {showBcc && (
                    <Autocomplete
                        multiple
                        options={localSuggestions.length > 0 ? localSuggestions : contactSuggestions}
                        getOptionLabel={(option) =>
                            typeof option === 'string' ? option : option.email
                        }
                        freeSolo
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    variant="outlined"
                                    size={isMobile ? "small" : "medium"}
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
                                size={isMobile ? "small" : "medium"}
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
                                handleSearchContacts(newInputValue);
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
                    size={isMobile ? "small" : "medium"}
                />

                {/* Edytor tekstu */}
                <EditorContainer>
                    <ReactQuill
                        value={body}
                        onChange={setBody}
                        modules={modules}
                        style={{ height: '100%' }}
                    />
                </EditorContainer>

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
                        <AttachmentsList>
                            {files.map((file, index) => (
                                <AttachmentItem
                                    key={index}
                                    elevation={1}
                                >
                                    <AttachmentIcon fontSize="small" />
                                    <Typography noWrap sx={{ maxWidth: isMobile ? 100 : 150 }}>
                                        {file.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {(file.size / 1024).toFixed(0)} KB
                                    </Typography>
                                    <IconButton size="small" onClick={() => handleRemoveFile(index)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </AttachmentItem>
                            ))}
                        </AttachmentsList>
                    </Box>
                )}
            </ComposerDialogContent>

            <ComposerDialogActions>
                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<AttachmentIcon />}
                        onClick={handleAttachmentClick}
                        size={isMobile ? "small" : "medium"}
                    >
                        Załącz plik
                    </Button>

                    <Box sx={{ display: 'flex', gap: 1, mt: isMobile ? 1 : 0, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                        <Button
                            onClick={handleSaveDraft}
                            startIcon={<SaveIcon />}
                            size={isMobile ? "small" : "medium"}
                        >
                            Zapisz
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSend}
                            startIcon={<SendIcon />}
                            disabled={to.length === 0 || !subject}
                            size={isMobile ? "small" : "medium"}
                        >
                            Wyślij
                        </Button>
                    </Box>
                </Box>
            </ComposerDialogActions>
        </Dialog>
    );
};

export default EmailComposer;