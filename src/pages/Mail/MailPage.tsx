// src/pages/Mail/MailPage.tsx
// Przebudowana wersja z rozwiązanym konfliktem nazw

import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, useMediaQuery, useTheme, IconButton } from '@mui/material';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import EmailComposer from './components/EmailComposer';
import MailToolbar from './components/MailToolbar';
import MailAccountSetup from './components/MailAccountSetup';
import MailFolders from './components/MailFolders';
import { useMailAccount } from './hooks/useMailAccount';
import { useMailLabels } from './hooks/useMailLabels';
import { useEmails } from './hooks/useEmails';
import { useMailSearch } from './hooks/useMailSearch';
import { Email, EmailDraft } from '../../types/mail';
import styled from 'styled-components';
import { Menu as MenuIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

// Główny kontener poczty
const MailContainer = styled(Box)`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-color: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

// Główny kontener treści
const MailContent = styled(Box)`
    display: flex;
    flex: 1;
    overflow: hidden;
    width: 100%;
`;

// Kontener dla folderów poczty
const MailFoldersWrapper = styled(Box)<{ open: boolean, isTablet: boolean }>`
    width: ${props => props.isTablet ? (props.open ? '250px' : '0') : '250px'};
    min-width: ${props => props.isTablet ? (props.open ? '250px' : '0') : '250px'};
    max-width: 250px;
    flex-shrink: 0;
    flex-grow: 0;
    transition: width 0.3s ease, min-width 0.3s ease;
    height: 100%;
    border-right: 1px solid #e0e0e0;
    background-color: #f8f9fa;
    z-index: 5;
    overflow: hidden;
`;

// Kontener dla głównej zawartości
const MainContentWrapper = styled(Box)`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
`;

// Kontener dla listy emaili i szczegółów
const EmailsWrapper = styled(Box)`
    display: flex;
    flex: 1;
    overflow: hidden;
    width: 100%;
`;

// Kontener dla listy emaili
const EmailListWrapper = styled(Box)<{ isDetailOpen: boolean, isMobile: boolean }>`
    width: ${props => props.isMobile
            ? (props.isDetailOpen ? '0' : '100%')
            : (props.isDetailOpen ? '40%' : '100%')};
    min-width: ${props => props.isMobile
            ? (props.isDetailOpen ? '0' : '100%')
            : (props.isDetailOpen ? '40%' : '100%')};
    overflow: auto;
    transition: width 0.3s ease, min-width 0.3s ease;
    border-right: ${props => props.isDetailOpen ? '1px solid #e0e0e0' : 'none'};
`;

// Kontener dla szczegółów emaila
const EmailDetailWrapper = styled(Box)<{ isOpen: boolean, isMobile: boolean }>`
    width: ${props => props.isMobile
            ? (props.isOpen ? '100%' : '0')
            : (props.isOpen ? '60%' : '0')};
    min-width: ${props => props.isMobile
            ? (props.isOpen ? '100%' : '0')
            : (props.isOpen ? '60%' : '0')};
    overflow: auto;
    transition: width 0.3s ease, min-width 0.3s ease;
`;

/**
 * Główny komponent strony poczty
 */
const MailPage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // Stan dla panelu folderów poczty
    const [foldersOpen, setFoldersOpen] = useState(!isTablet);

    // Reagowanie na zmiany rozmiaru ekranu
    useEffect(() => {
        setFoldersOpen(!isTablet);
    }, [isTablet]);

    // Zarządzanie kontami pocztowymi
    const {
        accounts,
        currentAccount,
        loading: accountLoading,
        error: accountError,
        authorizeGmailAccount,
        authorizeImapAccount,
        signOut,
        switchAccount
    } = useMailAccount();

    // Etykiety/foldery
    const {
        labels,
        loading: labelsLoading,
        error: labelsError
    } = useMailLabels(currentAccount?.id);

    // Stan UI
    const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [draftToEdit, setDraftToEdit] = useState<EmailDraft | null>(null);
    const [replyingTo, setReplyingTo] = useState<Email | null>(null);
    const [forwardingEmail, setForwardingEmail] = useState<Email | null>(null);

    // Wyszukiwanie
    const {
        query,
        results: searchResults,
        loading: searchLoading,
        handleQueryChange,
        contactSuggestions,
        searchContacts
    } = useMailSearch(currentAccount?.id);

    // Emaile dla wybranego folderu
    const {
        emails,
        loading: emailsLoading,
        error: emailsError,
        hasMore,
        loadMore,
        refreshEmails,
        markAsRead,
        toggleStar,
        moveToTrash,
        restoreFromTrash,
        permanentlyDelete
    } = useEmails(selectedLabelId, currentAccount?.id);

    // Ustawienie domyślnego folderu po załadowaniu etykiet
    useEffect(() => {
        if (labels.length > 0 && !selectedLabelId) {
            // Domyślnie wybieramy folder "Odebrane" (INBOX)
            const inboxLabel = labels.find(label => label.type === 'inbox');
            if (inboxLabel) {
                setSelectedLabelId(inboxLabel.id);
            } else {
                // Jeśli nie ma folderu "Odebrane", wybieramy pierwszy z listy
                setSelectedLabelId(labels[0].id);
            }
        }
    }, [labels, selectedLabelId]);

    // Sprawdzenie czy powinniśmy wyświetlić ekran konfiguracji konta
    const shouldShowAccountSetup = !currentAccount || accounts.length === 0;

    // Pobranie wybranego emaila z listy
    const selectedEmail = emails.find(email => email.id === selectedEmailId) || null;

    // Obsługa zmiany folderu
    const handleLabelChange = (labelId: string) => {
        setSelectedLabelId(labelId);
        setSelectedEmailId(null); // Resetowanie wybranego emaila przy zmianie folderu

        // Na mobilnych urządzeniach, zamykamy panel folderów po wybraniu folderu
        if (isMobile) {
            setFoldersOpen(false);
        }
    };

    // Obsługa kliknięcia na email
    const handleEmailClick = (emailId: string) => {
        setSelectedEmailId(emailId);

        // Oznaczenie jako przeczytany, jeśli jeszcze nie jest
        const email = emails.find(e => e.id === emailId);
        if (email && !email.isRead) {
            markAsRead(emailId, true);
        }
    };

    // Obsługa powrotu z widoku szczegółów na mobilnych urządzeniach
    const handleBackToList = () => {
        setSelectedEmailId(null);
    };

    // Obsługa tworzenia nowej wiadomości
    const handleCompose = () => {
        setDraftToEdit(null);
        setReplyingTo(null);
        setForwardingEmail(null);
        setIsComposerOpen(true);
    };

    // Obsługa odpowiedzi na email
    const handleReply = (email: Email) => {
        setReplyingTo(email);
        setForwardingEmail(null);
        setDraftToEdit(null);
        setIsComposerOpen(true);
    };

    // Obsługa przekazania emaila dalej
    const handleForward = (email: Email) => {
        setForwardingEmail(email);
        setReplyingTo(null);
        setDraftToEdit(null);
        setIsComposerOpen(true);
    };

    // Obsługa zamknięcia kompozytora
    const handleCloseComposer = () => {
        setIsComposerOpen(false);
        setDraftToEdit(null);
        setReplyingTo(null);
        setForwardingEmail(null);
    };

    // Obsługa edycji wersji roboczej
    const handleEditDraft = (draft: EmailDraft) => {
        setDraftToEdit(draft);
        setReplyingTo(null);
        setForwardingEmail(null);
        setIsComposerOpen(true);
    };

    // Przełączanie panelu folderów
    const toggleFolders = () => {
        setFoldersOpen(prev => !prev);
    };

    // Jeśli nie ma konta, pokazujemy ekran konfiguracji
    if (shouldShowAccountSetup) {
        return (
            <Box sx={{ p: 3, height: '100%', overflowX: 'hidden' }}>
                <MailAccountSetup
                    onGmailAuth={authorizeGmailAccount}
                    onImapAuth={authorizeImapAccount}
                    loading={accountLoading}
                    error={accountError}
                />
            </Box>
        );
    }

    return (
        <MailContainer>
            <MailToolbar
                query={query}
                onQueryChange={handleQueryChange}
                onRefresh={refreshEmails}
                selectedEmailId={selectedEmailId}
                onCompose={handleCompose}
                onToggleSidebar={toggleFolders}
                showMenuButton={isTablet}
                onBackToList={isMobile && selectedEmailId ? handleBackToList : undefined}
            />

            <MailContent>
                {/* Boczny panel z folderami poczty - zmieniona nazwa z MailSidebar na MailFolders */}
                <MailFoldersWrapper open={foldersOpen} isTablet={isTablet}>
                    <MailFolders
                        labels={labels}
                        selectedLabelId={selectedLabelId}
                        onLabelChange={handleLabelChange}
                        onCompose={handleCompose}
                        accounts={accounts}
                        currentAccount={currentAccount}
                        onSwitchAccount={switchAccount}
                        onSignOut={signOut}
                        loading={labelsLoading}
                    />
                </MailFoldersWrapper>

                <MainContentWrapper>
                    <EmailsWrapper>
                        {/* Lista emaili */}
                        <EmailListWrapper
                            isDetailOpen={!!selectedEmailId}
                            isMobile={isMobile}
                        >
                            {emailsLoading && !emails.length ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                    <CircularProgress />
                                </Box>
                            ) : emailsError ? (
                                <Typography color="error" sx={{ p: 2 }}>
                                    {emailsError}
                                </Typography>
                            ) : (
                                <EmailList
                                    emails={query ? searchResults : emails}
                                    selectedEmailId={selectedEmailId}
                                    onEmailClick={handleEmailClick}
                                    onToggleStar={toggleStar}
                                    onMarkAsRead={markAsRead}
                                    onDelete={moveToTrash}
                                    hasMore={hasMore && !query}
                                    loadMore={loadMore}
                                    isSearching={!!query}
                                    searchLoading={searchLoading}
                                />
                            )}
                        </EmailListWrapper>

                        {/* Szczegóły emaila */}
                        <EmailDetailWrapper
                            isOpen={!!selectedEmailId}
                            isMobile={isMobile}
                        >
                            {selectedEmailId && selectedEmail && (
                                <EmailDetail
                                    email={selectedEmail}
                                    onReply={() => handleReply(selectedEmail)}
                                    onForward={() => handleForward(selectedEmail)}
                                    onDelete={() => {
                                        moveToTrash(selectedEmail.id);
                                        setSelectedEmailId(null);
                                    }}
                                    onRestore={
                                        selectedEmail.labelIds.includes('TRASH')
                                            ? () => restoreFromTrash(selectedEmail.id)
                                            : undefined
                                    }
                                    onPermanentDelete={
                                        selectedEmail.labelIds.includes('TRASH')
                                            ? () => {
                                                permanentlyDelete(selectedEmail.id);
                                                setSelectedEmailId(null);
                                            }
                                            : undefined
                                    }
                                    onClose={() => setSelectedEmailId(null)}
                                    isMobile={isMobile}
                                />
                            )}
                        </EmailDetailWrapper>
                    </EmailsWrapper>
                </MainContentWrapper>
            </MailContent>

            {/* Komponent do kompozycji wiadomości */}
            {isComposerOpen && (
                <EmailComposer
                    open={isComposerOpen}
                    onClose={handleCloseComposer}
                    draftToEdit={draftToEdit}
                    replyingTo={replyingTo}
                    forwardingEmail={forwardingEmail}
                    contactSuggestions={contactSuggestions}
                    onSearchContacts={searchContacts}
                    accountEmail={currentAccount?.email || ''}
                    fullScreen={isMobile}
                />
            )}
        </MailContainer>
    );
};

export default MailPage;