import React from 'react';
import styled from 'styled-components';

interface ConfirmationDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
                                                                   isOpen,
                                                                   title,
                                                                   message,
                                                                   confirmText = 'Tak',
                                                                   cancelText = 'Anuluj',
                                                                   onConfirm,
                                                                   onCancel
                                                               }) => {
    if (!isOpen) return null;

    return (
        <DialogOverlay>
            <DialogContainer>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <DialogContent>
                    <DialogMessage>{message}</DialogMessage>
                </DialogContent>
                <DialogActions>
                    <CancelButton onClick={onCancel}>
                        {cancelText}
                    </CancelButton>
                    <ConfirmButton onClick={onConfirm}>
                        {confirmText}
                    </ConfirmButton>
                </DialogActions>
            </DialogContainer>
        </DialogOverlay>
    );
};

const DialogOverlay = styled.div`
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

const DialogContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 400px;
    max-width: 90%;
    z-index: 1001;
`;

const DialogHeader = styled.div`
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
`;

const DialogTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    color: #34495e;
`;

const DialogContent = styled.div`
    padding: 20px;
`;

const DialogMessage = styled.p`
    margin: 0;
    font-size: 16px;
    line-height: 1.5;
    color: #2c3e50;
`;

const DialogActions = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: 15px 20px;
    border-top: 1px solid #eee;
    gap: 10px;
`;

const Button = styled.button`
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
`;

const CancelButton = styled(Button)`
    background-color: white;
    color: #7f8c8d;
    border: 1px solid #ddd;
    
    &:hover {
        background-color: #f5f5f5;
    }
`;

const ConfirmButton = styled(Button)`
    background-color: #3498db;
    color: white;
    border: none;
    
    &:hover {
        background-color: #2980b9;
    }
`;

export default ConfirmationDialog;