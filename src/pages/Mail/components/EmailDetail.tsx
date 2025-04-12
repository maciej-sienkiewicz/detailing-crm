// src/pages/Mail/components/EmailDetail.tsx
import React, { useState } from 'react';
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
    Collapse,
    useMediaQuery,
    useTheme
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
    Close as CloseIcon,
    ArrowBack as ArrowBackIcon,
    MoreVert as MoreVertIcon
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
    isMobile?: boolean;
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
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    padding: theme.spacing(2)
}));

const EmailContent = styled(Box)<{ isMobile?: boolean }>(({ theme, isMobile }) => ({
    padding: theme.spacing(isMobile ? 1 : 2),
    '& img': {
        maxWidth: '100%',
        height: 'auto'
    }
}));

const AttachmentPaper = styled(Paper)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    marginTop: theme.spacing(2),
    gap: theme.spacing(1)
}));

const ActionButtons = styled(Box)<{ isMobile?: boolean }>(({ theme, isMobile }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? theme.spacing(1) : 0
}));

const ButtonGroup = styled(Box)<{ isMobile?: boolean }>(({ theme, isMobile }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: isMobile ? 'wrap' : 'nowrap',
    justifyContent: isMobile ? 'center' : 'flex-start'
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
                                                     isMobile = false
                                                 }) => {
    const [showDetails, setShowDetails] = useState(false);
    const theme = useTheme();

    // Formatowanie daty
    const formatDate = (timestamp: number) => {
        try {
            const date = new Date(timestamp);
            return format(date, isMobile ? DATE_FORMATS.SHORT : DATE_FORMATS.FULL, { locale: pl });
        } catch (error) {
            return '';
        }
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <EmailHeader>
                <Typography
                    variant={isMobile ? "subtitle1" : "h6"}
                    noWrap={!isMobile}
                    sx={{
                        maxWidth: isMobile ? '100%' : '60%',
                        fontSize: isMobile ? '1rem' : undefined
                    }}
                >
                    {email.subject}
                </Typography>
                <EmailHeaderActions>
                    {!isMobile && (
                        <Tooltip title="Zamknij">
                            <IconButton onClick={onClose}>
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </EmailHeaderActions>
            </EmailHeader>

            <Divider />

            <EmailSender>
                <Avatar
                    sx={{ width: isMobile ? 40 : 48, height: isMobile ? 40 : 48 }}
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(email.from.name || email.from.email)}&background=random`}
                >
                    {(email.from.name?.[0] || email.from.email[0] || '').toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" sx={{ mr: 1 }}>
                            {email.from.name || email.from.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {formatDate(email.internalDate)}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary" noWrap={!isMobile}>
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

            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <EmailContent isMobile={isMobile}>
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
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                        </Box>
                    )}
                </EmailContent>
            </Box>

            <Divider />

            <ActionButtons isMobile={isMobile}>
                <ButtonGroup isMobile={isMobile}>
                    {/* Przyciski do akcji na emailu */}
                    <Button
                        startIcon={<ReplyIcon />}
                        variant="contained"
                        onClick={onReply}
                        size={isMobile ? "small" : "medium"}
                    >
                        Odpowiedz
                    </Button>
                    <Button
                        startIcon={<ForwardIcon />}
                        variant="outlined"
                        onClick={onForward}
                        size={isMobile ? "small" : "medium"}
                    >
                        Przekaż dalej
                    </Button>
                </ButtonGroup>
                <ButtonGroup isMobile={isMobile}>
                    {/* Przyciski do usuwania/przywracania */}
                    {email.labelIds.includes('TRASH') ? (
                        <>
                            {onRestore && (
                                <Button
                                    startIcon={<RestoreIcon />}
                                    variant="outlined"
                                    onClick={onRestore}
                                    size={isMobile ? "small" : "medium"}
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
                                    size={isMobile ? "small" : "medium"}
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
                            size={isMobile ? "small" : "medium"}
                        >
                            Usuń
                        </Button>
                    )}
                </ButtonGroup>
            </ActionButtons>
        </Box>
    );
};

export default EmailDetail;