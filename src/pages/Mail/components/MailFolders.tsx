// src/pages/Mail/components/MailFolders.tsx
// Przemianowany z MailSidebar na MailFolders, aby uniknąć konfliktu nazw

import React from 'react';
import {
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Divider,
    Button,
    Box,
    Typography,
    Avatar,
    Menu,
    MenuItem,
    Tooltip,
    CircularProgress,
    Badge
} from '@mui/material';
import {
    Inbox as InboxIcon,
    Send as SendIcon,
    Drafts as DraftsIcon,
    Delete as DeleteIcon,
    Report as SpamIcon,
    Star as StarIcon,
    Label as LabelIcon,
    Add as AddIcon,
    Edit as EditIcon,
    AccountCircle,
    ExitToApp as LogoutIcon,
    Mail as MailIcon,
    Archive as ArchiveIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { EmailLabel, MailAccount } from '../../../types/mail';

// Typy ikon dla różnych typów etykiet
const labelIcons: Record<string, React.ReactNode> = {
    'inbox': <InboxIcon />,
    'sent': <SendIcon />,
    'draft': <DraftsIcon />,
    'trash': <DeleteIcon />,
    'spam': <SpamIcon />,
    'important': <StarIcon color="warning" />,
    'starred': <StarIcon color="warning" />,
    'custom': <LabelIcon />,
    'archive': <ArchiveIcon />
};

interface MailFoldersProps {
    labels: EmailLabel[];
    selectedLabelId: string | null;
    onLabelChange: (labelId: string) => void;
    onCompose: () => void;
    accounts: MailAccount[];
    currentAccount: MailAccount | null;
    onSwitchAccount: (accountId: string) => void;
    onSignOut: (accountId?: string) => Promise<boolean>;
    loading: boolean;
}

// Komponent musi mieć ściśle kontrolowaną szerokość
const FoldersContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%', // 100% szerokości rodzica, który ma ograniczenie
    maxWidth: '250px', // Maksymalna szerokość
    backgroundColor: theme.palette.background.default,
    overflowY: 'auto',
    overflowX: 'hidden' // Zapobiega przewijaniu w poziomie
}));

const AccountSelector = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        borderRadius: theme.shape.borderRadius
    },
    width: '100%', // Pełna szerokość
    boxSizing: 'border-box', // Uwzględnia padding w szerokości
    overflow: 'hidden' // Zapobiega przewijaniu
}));

const ComposeButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(2),
    boxShadow: theme.shadows[2],
    fontWeight: 'bold',
    width: 'calc(100% - 32px)', // 100% minus marginesy
    boxSizing: 'border-box'
}));

// Dla nazwy konta i adresu email - musimy zapewnić, że tekst nie łamie układu
const AccountName = styled(Typography)({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%'
});

const AccountEmail = styled(Typography)({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%'
});

// Poprawione style dla listy i elementów listy
const StyledList = styled(List)({
    width: '100%',
    padding: 0
});

const StyledListItem = styled(ListItem)({
    padding: 0,
    width: '100%'
});

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
    width: '100%',
    padding: theme.spacing(1, 2)
}));

// Funkcja pomocnicza do lokalizacji nazw etykiet
const getLocalizedLabelName = (label: EmailLabel): string => {
    if (label.name && label.name.match(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/)) {
        return label.name;
    }

    const typeTranslations: Record<string, string> = {
        'inbox': 'Odebrane',
        'sent': 'Wysłane',
        'draft': 'Wersje robocze',
        'trash': 'Kosz',
        'spam': 'Spam',
        'important': 'Ważne',
        'starred': 'Oznaczone gwiazdką',
        'archive': 'Archiwum'
    };

    return typeTranslations[label.type] || label.name;
};

/**
 * Komponent wyświetlający foldery i etykiety poczty
 */
const MailFolders: React.FC<MailFoldersProps> = ({
                                                     labels,
                                                     selectedLabelId,
                                                     onLabelChange,
                                                     onCompose,
                                                     accounts,
                                                     currentAccount,
                                                     onSwitchAccount,
                                                     onSignOut,
                                                     loading
                                                 }) => {
    // Stan dla menu konta
    const [accountMenuAnchor, setAccountMenuAnchor] = React.useState<null | HTMLElement>(null);

    // Grupowanie etykiet według typu
    const systemLabels = labels.filter(label => label.type !== 'custom');
    const customLabels = labels.filter(label => label.type === 'custom');

    // Obsługa menu konta
    const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAccountMenuAnchor(event.currentTarget);
    };

    const handleAccountMenuClose = () => {
        setAccountMenuAnchor(null);
    };

    const handleSwitchAccount = (accountId: string) => {
        onSwitchAccount(accountId);
        handleAccountMenuClose();
    };

    const handleSignOut = async () => {
        const success = await onSignOut();
        if (success) {
            handleAccountMenuClose();
        }
    };

    return (
        <FoldersContainer>
            <Box sx={{ width: '100%' }}>
                {/* Konto użytkownika */}
                <AccountSelector onClick={handleAccountMenuOpen}>
                    <Avatar sx={{ bgcolor: 'primary.main', flexShrink: 0 }}>
                        {currentAccount?.name?.[0] || 'U'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>
                        <AccountName variant="subtitle1" noWrap>
                            {currentAccount?.name || 'Użytkownik'}
                        </AccountName>
                        <AccountEmail variant="caption" noWrap>
                            {currentAccount?.email || ''}
                        </AccountEmail>
                    </Box>
                </AccountSelector>

                {/* Menu konta */}
                <Menu
                    anchorEl={accountMenuAnchor}
                    open={Boolean(accountMenuAnchor)}
                    onClose={handleAccountMenuClose}
                >
                    {accounts.map(account => (
                        <MenuItem
                            key={account.id}
                            onClick={() => handleSwitchAccount(account.id)}
                            selected={account.id === currentAccount?.id}
                        >
                            <ListItemIcon>
                                <AccountCircle color={account.providerType === 'gmail' ? 'error' : 'primary'} />
                            </ListItemIcon>
                            <ListItemText
                                primary={account.name || account.email}
                                secondary={account.email}
                                primaryTypographyProps={{ noWrap: true, style: { maxWidth: '180px' } }}
                                secondaryTypographyProps={{ noWrap: true, style: { maxWidth: '180px' } }}
                            />
                        </MenuItem>
                    ))}
                    <Divider />
                    <MenuItem onClick={handleSignOut}>
                        <ListItemIcon>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Wyloguj się" />
                    </MenuItem>
                </Menu>

                {/* Przycisk do tworzenia wiadomości */}
                <ComposeButton
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    fullWidth
                    onClick={onCompose}
                >
                    Nowa wiadomość
                </ComposeButton>
            </Box>

            <Divider />

            {/* Lista folderów systemowych */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            ) : (
                <StyledList>
                    {systemLabels.map((label) => (
                        <StyledListItem key={label.id} disablePadding>
                            <StyledListItemButton
                                selected={selectedLabelId === label.id}
                                onClick={() => onLabelChange(label.id)}
                            >
                                <ListItemIcon sx={{ minWidth: 35 }}>
                                    {label.type === 'inbox' ? (
                                        <Badge badgeContent={4} color="error">
                                            {labelIcons[label.type] || <MailIcon />}
                                        </Badge>
                                    ) : (
                                        labelIcons[label.type] || <MailIcon />
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    primary={getLocalizedLabelName(label)}
                                    primaryTypographyProps={{
                                        noWrap: true,
                                        style: { maxWidth: '160px' }
                                    }}
                                />
                            </StyledListItemButton>
                        </StyledListItem>
                    ))}
                </StyledList>
            )}

            <Divider />

            {/* Nagłówek sekcji etykiet niestandardowych */}
            <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Typography variant="subtitle2" color="text.secondary" noWrap>
                    Etykiety
                </Typography>
                <Tooltip title="Dodaj etykietę">
                    <Button
                        size="small"
                        sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                        <AddIcon fontSize="small" />
                    </Button>
                </Tooltip>
            </Box>

            {/* Lista etykiet niestandardowych */}
            <StyledList>
                {customLabels.length > 0 ? (
                    customLabels.map((label) => (
                        <StyledListItem key={label.id} disablePadding>
                            <StyledListItemButton
                                selected={selectedLabelId === label.id}
                                onClick={() => onLabelChange(label.id)}
                            >
                                <ListItemIcon sx={{ minWidth: 35 }}>
                                    <LabelIcon sx={{ color: label.color || 'inherit' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={getLocalizedLabelName(label)}
                                    primaryTypographyProps={{
                                        noWrap: true,
                                        style: { maxWidth: '160px' }
                                    }}
                                />
                            </StyledListItemButton>
                        </StyledListItem>
                    ))
                ) : (
                    <ListItem>
                        <Typography variant="body2" color="text.secondary" sx={{ py: 1, px: 2 }}>
                            Brak niestandardowych etykiet
                        </Typography>
                    </ListItem>
                )}
            </StyledList>
        </FoldersContainer>
    );
};

export default MailFolders;