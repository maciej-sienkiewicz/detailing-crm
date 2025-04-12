// src/pages/Mail/components/EmailList.tsx
import React, { useRef, useCallback } from 'react';
import {
    List,
    ListItem,
    ListItemText,
    Box,
    Typography,
    IconButton,
    Checkbox,
    Divider,
    CircularProgress,
    Avatar,
    Tooltip,
    Chip,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Delete as DeleteIcon,
    Email as EmailIcon,
    DraftsOutlined as ReadIcon,
    AttachFile as AttachmentIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Email } from '../../../types/mail';

interface EmailListProps {
    emails: Email[];
    selectedEmailId: string | null;
    onEmailClick: (id: string) => void;
    onToggleStar: (id: string, isStarred: boolean) => void;
    onMarkAsRead: (id: string, isRead: boolean) => void;
    onDelete: (id: string) => void;
    hasMore: boolean;
    loadMore: () => void;
    isSearching: boolean;
    searchLoading: boolean;
}

// Styled komponenty z uwzględnieniem responsywności
const EmailListItem = styled(ListItem)<{ selected?: boolean; unread?: boolean; isMobile?: boolean }>(
    ({ theme, selected, unread, isMobile }) => ({
        cursor: 'pointer',
        backgroundColor: selected ? theme.palette.action.selected : 'transparent',
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
        ...(unread && {
            fontWeight: 'bold',
            '& .MuiTypography-root': {
                fontWeight: 'bold',
            }
        }),
        padding: isMobile ? theme.spacing(1) : theme.spacing(1, 2),
        transition: 'background-color 0.2s ease'
    })
);

const EmailContent = styled(Box)<{ isMobile?: boolean }>(({ theme, isMobile }) => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: isMobile ? '100%' : 'auto'
}));

const EmailMeta = styled(Box)<{ isMobile?: boolean }>(({ theme, isMobile }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(isMobile ? 0.5 : 1),
    color: theme.palette.text.secondary,
    flexWrap: isMobile ? 'wrap' : 'nowrap',
    marginTop: isMobile ? theme.spacing(0.5) : 0
}));

const EmailActions = styled(Box)<{ isMobile?: boolean }>(({ theme, isMobile }) => ({
    display: 'flex',
    alignItems: 'center',
    ...(isMobile && {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1)
    })
}));

const EmailSender = styled(Box)<{ isMobile?: boolean }>(({ theme, isMobile }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing(0.5),
    flexWrap: isMobile ? 'wrap' : 'nowrap'
}));

const NoEmailsMessage = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4),
    textAlign: 'center',
    width: '100%'
}));

/**
 * Komponent wyświetlający listę emaili
 */
const EmailList: React.FC<EmailListProps> = ({
                                                 emails,
                                                 selectedEmailId,
                                                 onEmailClick,
                                                 onToggleStar,
                                                 onMarkAsRead,
                                                 onDelete,
                                                 hasMore,
                                                 loadMore,
                                                 isSearching,
                                                 searchLoading
                                             }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Referencja do obserwatora przecięcia dla nieskończonego przewijania
    const observer = useRef<IntersectionObserver | null>(null);

    // Referencja do ostatniego elementu listy
    const lastEmailElementRef = useCallback((node: HTMLDivElement) => {
        if (searchLoading) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });

        if (node) observer.current.observe(node);
    }, [searchLoading, hasMore, loadMore]);

    // Formatowanie daty
    const formatDate = (timestamp: number) => {
        try {
            const date = new Date(timestamp);
            return formatDistanceToNow(date, { addSuffix: true, locale: pl });
        } catch (error) {
            return '';
        }
    };

    // Jeśli nie ma emaili
    if (emails.length === 0) {
        return (
            <NoEmailsMessage>
                <Typography variant="h6" color="text.secondary">
                    {isSearching ? 'Brak wyników wyszukiwania' : 'Brak wiadomości'}
                </Typography>
                {isSearching && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Spróbuj użyć innych słów kluczowych
                    </Typography>
                )}
            </NoEmailsMessage>
        );
    }

    return (
        <List disablePadding>
            {emails.map((email, index) => {
                const isLastEmail = index === emails.length - 1;

                return (
                    <React.Fragment key={email.id}>
                        <EmailListItem
                            selected={email.id === selectedEmailId}
                            unread={!email.isRead}
                            isMobile={isMobile}
                            ref={isLastEmail && hasMore ? lastEmailElementRef : undefined}
                            onClick={() => onEmailClick(email.id)}
                            secondaryAction={
                                <EmailActions isMobile={isMobile}>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleStar(email.id, !email.isStarred);
                                        }}
                                    >
                                        {email.isStarred ? (
                                            <StarIcon color="warning" />
                                        ) : (
                                            <StarBorderIcon />
                                        )}
                                    </IconButton>
                                    {!isMobile && (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(email.id);
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </EmailActions>
                            }
                        >
                            <Box sx={{ display: 'flex', width: '100%', pr: isMobile ? 5 : 10 }}>
                                <Box sx={{ mr: 1.5 }}>
                                    <Avatar
                                        sx={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40 }}
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(email.from.name || email.from.email)}&background=random`}
                                    >
                                        {(email.from.name?.[0] || email.from.email[0] || '').toUpperCase()}
                                    </Avatar>
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <EmailSender isMobile={isMobile}>
                                        <Typography variant="subtitle2" noWrap>
                                            {email.from.name || email.from.email}
                                        </Typography>
                                        <Typography variant="caption" sx={{ minWidth: isMobile ? 'auto' : 100, textAlign: 'right' }}>
                                            {formatDate(email.internalDate)}
                                        </Typography>
                                    </EmailSender>
                                    <Typography
                                        variant={isMobile ? "body2" : "subtitle2"}
                                        noWrap
                                        sx={{ mb: 0.5 }}
                                    >
                                        {email.subject}
                                    </Typography>
                                    <EmailContent isMobile={isMobile}>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {email.snippet}
                                        </Typography>
                                    </EmailContent>
                                    <EmailMeta isMobile={isMobile}>
                                        {email.attachments && email.attachments.length > 0 && (
                                            <Tooltip title="Zawiera załączniki">
                                                <AttachmentIcon fontSize="small" />
                                            </Tooltip>
                                        )}
                                        {email.isImportant && (
                                            <Chip
                                                size="small"
                                                label="Ważne"
                                                color="error"
                                                variant="outlined"
                                                sx={{ height: isMobile ? 20 : 24, fontSize: isMobile ? '0.625rem' : '0.75rem' }}
                                            />
                                        )}
                                        {email.labelIds.includes('DRAFT') && (
                                            <Chip
                                                size="small"
                                                label="Wersja robocza"
                                                color="warning"
                                                variant="outlined"
                                                sx={{ height: isMobile ? 20 : 24, fontSize: isMobile ? '0.625rem' : '0.75rem' }}
                                            />
                                        )}
                                    </EmailMeta>
                                </Box>
                            </Box>
                        </EmailListItem>
                        <Divider variant="inset" component="li" />
                    </React.Fragment>
                );
            })}

            {/* Wskaźnik wczytywania, gdy ładowane są kolejne emaile */}
            {(hasMore || searchLoading) && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            )}
        </List>
    );
};

export default EmailList;