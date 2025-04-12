// src/pages/Mail/components/MailToolbar.tsx
import React from 'react';
import {
    AppBar,
    Toolbar,
    InputBase,
    IconButton,
    Box,
    Tooltip,
    alpha,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Archive as ArchiveIcon,
    Label as LabelIcon,
    MoreVert as MoreIcon,
    Menu as MenuIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

interface MailToolbarProps {
    query: string;
    onQueryChange: (query: string) => void;
    onRefresh: () => void;
    selectedEmailId: string | null;
    onCompose: () => void;
    onToggleSidebar?: () => void;
    showMenuButton?: boolean;
    onBackToList?: () => void;
}

// Styled komponenty
const ToolbarContainer = styled(AppBar)(({ theme }) => ({
    position: 'static',
    color: 'default',
    backgroundColor: '#fff',
    boxShadow: 'none',
    borderBottom: '1px solid #e0e0e0',
    zIndex: 5
}));

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
    border: '1px solid #e0e0e0',
    flexGrow: 1
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#757575'
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
    },
}));

const ActionsToolbar = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
}));

/**
 * Pasek narzędzi dla modułu poczty
 */
const MailToolbar: React.FC<MailToolbarProps> = ({
                                                     query,
                                                     onQueryChange,
                                                     onRefresh,
                                                     selectedEmailId,
                                                     onCompose,
                                                     onToggleSidebar,
                                                     showMenuButton,
                                                     onBackToList
                                                 }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <ToolbarContainer>
            <Toolbar>
                {showMenuButton && (
                    <IconButton
                        edge="start"
                        onClick={onToggleSidebar}
                        sx={{ mr: 1 }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}

                {onBackToList && (
                    <IconButton
                        edge="start"
                        onClick={onBackToList}
                        sx={{ mr: 1 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                )}

                {/* Ukrywamy wyszukiwarkę na małych ekranach jeśli wyświetlamy szczegóły emaila */}
                {(!isMobile || !selectedEmailId) && (
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Szukaj..."
                            inputProps={{ 'aria-label': 'search' }}
                            value={query}
                            onChange={(e) => onQueryChange(e.target.value)}
                        />
                    </Search>
                )}

                <ActionsToolbar>
                    <Tooltip title="Odśwież">
                        <IconButton onClick={onRefresh}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>

                    {selectedEmailId ? (
                        <>
                            {!isMobile && (
                                <>
                                    <Tooltip title="Archiwizuj">
                                        <IconButton>
                                            <ArchiveIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Usuń">
                                        <IconButton>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Etykiety">
                                        <IconButton>
                                            <LabelIcon />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )}
                            <Tooltip title="Więcej">
                                <IconButton>
                                    <MoreIcon />
                                </IconButton>
                            </Tooltip>
                        </>
                    ) : (
                        <Tooltip title="Nowa wiadomość">
                            <IconButton onClick={onCompose}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </ActionsToolbar>
            </Toolbar>
        </ToolbarContainer>
    );
};

export default MailToolbar;