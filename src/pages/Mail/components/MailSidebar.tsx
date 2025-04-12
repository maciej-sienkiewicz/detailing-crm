// src/pages/Mail/components/MailSidebar.tsx
import React from 'react';
import {
    Drawer,
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
    Mail as MailIcon
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
    'custom': <LabelIcon />
};

interface MailSidebarProps {
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

// Styled komponenty
const DrawerContainer = styled(Drawer)(({ theme }) => ({
    width: 250,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: 250,
        boxSizing: 'border-box',
        background: theme.palette.background.default,
        boxShadow: theme.shadows[2]
    },
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
    }
}));

const ComposeButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(2),
    boxShadow: theme.shadows[2],
    fontWeight: 'bold'
}));

/**
 * Pasek boczny z folderami i kontem użytkownika
 */
const MailSidebar: React.FC<MailSidebarProps> = ({
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
        <DrawerContainer variant="permanent">
            <Box>
                {/* Konto użytkownika */}
                <AccountSelector onClick={handleAccountMenuOpen}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {currentAccount?.name?.[0] || 'U'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" noWrap>
                            {currentAccount?.name || 'Użytkownik'}
                        </Typography>
                        <Typography variant="caption" noWrap>
                            {currentAccount?.email || ''}
                        </Typography>
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
                <List>
                    {systemLabels.map((label) => (
                        <ListItem key={label.id} disablePadding>
                            <ListItemButton
                                selected={selectedLabelId === label.id}
                                onClick={() => onLabelChange(label.id)}
                            >
                                <ListItemIcon>
                                    {label.type === 'inbox' ? (
                                        <Badge badgeContent={4} color="error">
                                            {labelIcons[label.type] || <MailIcon />}
                                        </Badge>
                                    ) : (
                                        labelIcons[label.type] || <MailIcon />
                                    )}
                                </ListItemIcon>
                                <ListItemText primary={label.name} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            )}

            <Divider />

            {/* Nagłówek sekcji etykiet niestandardowych */}
            <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
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
            <List>
                {customLabels.length > 0 ? (
                    customLabels.map((label) => (
                        <ListItem key={label.id} disablePadding>
                            <ListItemButton
                                selected={selectedLabelId === label.id}
                                onClick={() => onLabelChange(label.id)}
                            >
                                <ListItemIcon>
                                    <LabelIcon sx={{ color: label.color || 'inherit' }} />
                                </ListItemIcon>
                                <ListItemText primary={label.name} />
                            </ListItemButton>
                        </ListItem>
                    ))
                ) : (
                    <ListItem>
                        <Typography variant="body2" color="text.secondary" sx={{ py: 1, px: 2 }}>
                            Brak niestandardowych etykiet
                        </Typography>
                    </ListItem>
                )}
            </List>
        </DrawerContainer>
    );
};

export default MailSidebar;