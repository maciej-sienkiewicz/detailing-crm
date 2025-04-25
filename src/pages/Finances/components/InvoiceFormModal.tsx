import React from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { Invoice } from '../../../types';
import InvoiceForm from './InvoiceForm';

interface InvoiceFormModalProps {
    isOpen: boolean;
    invoice?: Invoice;
    onSave: (invoice: Partial<Invoice>) => void;
    onClose: () => void;
}

const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
                                                               isOpen,
                                                               invoice,
                                                               onSave,
                                                               onClose
                                                           }) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>
                        {invoice ? 'Edytuj fakturę' : 'Dodaj nową fakturę'}
                    </ModalTitle>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>
                <ModalContent>
                    <InvoiceForm
                        invoice={invoice}
                        onSave={onSave}
                        onCancel={onClose}
                    />
                </ModalContent>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Style komponentów
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
    padding: 20px;
`;

const ModalContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 900px;
    max-width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
    background-color: #f8f9fa;
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 18px;
    color: #2c3e50;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #7f8c8d;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;

    &:hover {
        color: #34495e;
    }
`;

const ModalContent = styled.div`
    overflow-y: auto;
    padding: 0;
`;

export default InvoiceFormModal;