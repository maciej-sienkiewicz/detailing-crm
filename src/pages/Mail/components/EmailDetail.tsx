// src/pages/Mail/components/EmailDetail.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Divider,
    Paper,
    Avatar,
    Chip,
    Button,
    Tooltip,
    Collapse
} from '@mui/material';
import {
    Reply as ReplyIcon,
    Forward as ForwardIcon,
    Delete as DeleteIcon,
    RestoreFromTrash as RestoreIcon,
    DeleteForever as DeleteForeverIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    ExpandMore as ExpandMoreIcon,
    AttachFile as AttachmentIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Email } from '../../../types/mail';
import { DATE_FORMATS } from '../services/config/mailConfig';

interface EmailDetailProps {
    email: Email;
    onReply: () => void;
    onForward: () => void;
    onDelete: () => void;
    onRestore?: () => void;
    onPermanentDelete?: () => void;
    onClose: () => void;
    onMarkAsRead: (isRead: boolean) => void;
}

// Styled komponenty
const EmailHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2)
}));

const EmailHeaderActions = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1)
}));

const EmailSender = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2)
}));

const EmailContent = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2)
}));

const AttachmentPaper = styled(Paper)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    marginTop: theme.spacing(2),
    gap: theme.spacing(1)
}));

/**
 * Komponent wyświetlający szczegóły wybranego emaila
 */
const EmailDetail: React.FC<EmailDetailProps> = ({
                                                     email,
                                                     onReply,
                                                     onForward,
                                                     onDelete,
                                                     onRestore,
                                                     onPermanentDelete,
                                                     onClose,
                                                     onMarkAsRead
                                                 }) => {
    const [showDetails, setShowDetails] = useState(false);

    // Oznacz email jako przeczytany przy pierwszym wyświetleniu
    useEffect(() => {
        if (email && !email.isRead) {
            console.log(`Oznaczanie emaila ${email.id} jako przeczytany przy wyświetleniu szczegółów`);
            onMarkAsRead(true);
        }
    }, [email.id, email.isRead, onMarkAsRead]);

    // Formatowanie daty
    const formatDate = (timestamp: number) => {
        try {
            const date = new Date(timestamp);
            return format(date, DATE_FORMATS.FULL, { locale: pl });
        } catch (error) {
            return '';
        }
    };

    return (
        <Box>
            <EmailHeader>
                <Typography variant="h6" noWrap sx={{ maxWidth: '60%' }}>
                    {email.subject}
                </Typography>
                <EmailHeaderActions>
                    <Tooltip title="Zamknij">
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </EmailHeaderActions>
            </EmailHeader>

            <Divider />

            <EmailSender>
                <Avatar
                    sx={{ width: 48, height: 48 }}
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(email.from.name || email.from.email)}&background=random`}
                >
                    {(email.from.name?.[0] || email.from.email[0] || '').toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1">
                            {email.from.name || email.from.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {formatDate(email.internalDate)}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Do: {email.to.map(to => to.name || to.email).join(', ')}
                        </Typography>
                        <Button
                            size="small"
                            endIcon={<ExpandMoreIcon sx={{
                                transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s'
                            }} />}
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            {showDetails ? 'Ukryj szczegóły' : 'Pokaż szczegóły'}
                        </Button>
                    </Box>
                </Box>
            </EmailSender>

            <Collapse in={showDetails}>
                <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
                    {email.cc && email.cc.length > 0 && (
                        <Typography variant="body2" color="text.secondary">
                            DW: {email.cc.map(cc => cc.name || cc.email).join(', ')}
                        </Typography>
                    )}
                    {email.bcc && email.bcc.length > 0 && (
                        <Typography variant="body2" color="text.secondary">
                            UDW: {email.bcc.map(bcc => bcc.name || bcc.email).join(', ')}
                        </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                        Od: {email.from.email}
                    </Typography>
                </Box>
            </Collapse>

            <Divider />

            <EmailContent>
                {email.body?.html ? (
                    <Box
                        sx={{ width: '100%' }}
                        dangerouslySetInnerHTML={{ __html: email.body.html }}
                    />
                ) : (
                    <Typography whiteSpace="pre-wrap" variant="body1">
                        {email.body?.plain || email.snippet}
                    </Typography>
                )}

                {/* Załączniki */}
                {email.attachments && email.attachments.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Załączniki ({email.attachments.length})
                        </Typography>
                        {email.attachments.map((attachment) => (
                            <AttachmentPaper key={attachment.id} elevation={1}>
                                <AttachmentIcon />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" noWrap>
                                        {attachment.filename}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {(attachment.size / 1024).toFixed(2)} KB
                                    </Typography>
                                </Box>
                                <Button size="small" variant="outlined">
                                    Pobierz
                                </Button>
                            </AttachmentPaper>
                        ))}
                    </Box>
                )}
            </EmailContent>

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                <Box>
                    {/* Przyciski do akcji na emailu */}
                    <Button
                        startIcon={<ReplyIcon />}
                        variant="contained"
                        onClick={onReply}
                        sx={{ mr: 1 }}
                    >
                        Odpowiedz
                    </Button>
                    <Button
                        startIcon={<ForwardIcon />}
                        variant="outlined"
                        onClick={onForward}
                    >
                        Przekaż dalej
                    </Button>
                </Box>
                <Box>
                    {/* Przyciski do usuwania/przywracania */}
                    {email.labelIds.includes('TRASH') ? (
                        <>
                            {onRestore && (
                                <Button
                                    startIcon={<RestoreIcon />}
                                    variant="outlined"
                                    onClick={onRestore}
                                    sx={{ mr: 1 }}
                                >
                                    Przywróć
                                </Button>
                            )}
                            {onPermanentDelete && (
                                <Button
                                    startIcon={<DeleteForeverIcon />}
                                    variant="outlined"
                                    color="error"
                                    onClick={onPermanentDelete}
                                >
                                    Usuń trwale
                                </Button>
                            )}
                        </>
                    ) : (
                        <Button
                            startIcon={<DeleteIcon />}
                            variant="outlined"
                            onClick={onDelete}
                            color="error"
                        >
                            Usuń
                        </Button>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default EmailDetail;