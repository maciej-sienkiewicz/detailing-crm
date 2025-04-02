import React from 'react';
import styled from 'styled-components';
import { FaComment, FaInfoCircle, FaCheck } from 'react-icons/fa';

interface ClientCommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    comments: Array<{
        id: string;
        author: string;
        content: string;
        timestamp: string;
        type: 'internal' | 'customer' | 'system';
    }>;
}

const ClientCommentsModal: React.FC<ClientCommentsModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     comments = []
                                                                 }) => {
    if (!isOpen) return null;

    // Filtrujemy tylko komentarze przeznaczone dla klienta
    const customerComments = comments.filter(comment => comment.type === 'customer');

    // Formatujemy datę
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>
                        <ModalIcon><FaComment /></ModalIcon>
                        Informacje dla klienta
                    </ModalTitle>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                </ModalHeader>
                <ModalBody>
                    {customerComments.length === 0 ? (
                        <EmptyMessage>
                            <FaInfoCircle /> Brak informacji dla klienta.
                        </EmptyMessage>
                    ) : (
                        <>
                            <ModalDescription>
                                Poniższe informacje zostały oznaczone jako ważne dla klienta. Proszę omówić je podczas wydawania pojazdu.
                            </ModalDescription>

                            <CommentsList>
                                {customerComments.map(comment => (
                                    <CommentItem key={comment.id}>
                                        <CommentHeader>
                                            <CommentAuthor>{comment.author}</CommentAuthor>
                                            <CommentDate>{formatDate(comment.timestamp)}</CommentDate>
                                        </CommentHeader>
                                        <CommentContent>{comment.content}</CommentContent>
                                    </CommentItem>
                                ))}
                            </CommentsList>
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <ConfirmButton onClick={onClose}>
                        <FaCheck /> {customerComments.length > 0 ? 'Przekazałem informacje' : 'Kontynuuj'}
                    </ConfirmButton>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 550px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 1001;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  color: #34495e;
  display: flex;
  align-items: center;
`;

const ModalIcon = styled.span`
  color: #3498db;
  margin-right: 10px;
  font-size: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #7f8c8d;
  
  &:hover {
    color: #34495e;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const ModalDescription = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: #34495e;
  margin-top: 0;
  margin-bottom: 20px;
`;

const EmptyMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #7f8c8d;
  font-size: 15px;
  padding: 20px;
  text-align: center;
  justify-content: center;
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const CommentItem = styled.div`
  background-color: #eafaf1;
  border-left: 3px solid #27ae60;
  border-radius: 4px;
  padding: 15px;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const CommentAuthor = styled.div`
  font-weight: 500;
  color: #34495e;
  font-size: 14px;
`;

const CommentDate = styled.div`
  color: #7f8c8d;
  font-size: 12px;
`;

const CommentContent = styled.div`
  color: #34495e;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-line;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid #eee;
`;

const ConfirmButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #2980b9;
  }
`;

export default ClientCommentsModal;