// src/pages/Mail/MailPage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import MailSidebar from './components/MailSidebar';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import EmailComposer from './components/EmailComposer';
import MailToolbar from './components/MailToolbar';
import MailAccountSetup from './components/MailAccountSetup';
import { useMailAccount } from './hooks/useMailAccount';
import { useMailLabels } from './hooks/useMailLabels';
import { useEmails } from './hooks/useEmails';
import { useMailSearch } from './hooks/useMailSearch';
import { Email, EmailDraft } from '../../types/mail';

/**
 * Główny komponent strony poczty
 */
const MailPage: React.FC = () => {
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

    // Jeśli nie ma konta, pokazujemy ekran konfiguracji
    if (shouldShowAccountSetup) {
        return (
            <Box sx={{ p: 3, height: '100%' }}>
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
        <Box sx={{ display: 'flex', height: '100%' }}>
            {/* Pasek boczny z folderami */}
            <MailSidebar
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

            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
                {/* Pasek narzędzi */}
                <MailToolbar
                    query={query}
                    onQueryChange={handleQueryChange}
                    onRefresh={refreshEmails}
                    selectedEmailId={selectedEmailId}
                    onCompose={handleCompose}
                />

                <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                    {/* Lista emaili */}
                    <Box sx={{ width: selectedEmailId ? '40%' : '100%', overflow: 'auto' }}>
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
                    </Box>

                    {/* Szczegóły emaila */}
                    {selectedEmailId && selectedEmail && (
                        <Box sx={{ width: '60%', borderLeft: 1, borderColor: 'divider', overflow: 'auto' }}>
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
                            />
                        </Box>
                    )}
                </Box>
            </Box>

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
                />
            )}
        </Box>
    );
};

export default MailPage;