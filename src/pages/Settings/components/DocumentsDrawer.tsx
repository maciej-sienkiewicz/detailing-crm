import React from 'react';
import { FaFolder, FaFile, FaPlus, FaTrash } from 'react-icons/fa';
import { Employee, EmployeeDocument } from '../../../types';
import { formatDate } from '../EmployeesPage';
import {
    DocumentsDrawerContainer,
    DrawerHeader,
    CloseButton,
    DrawerEmployeeInfo,
    ColorDot,
    DrawerEmployeeName,
    DrawerEmployeePosition,
    DrawerContent,
    DocumentsHeader,
    AddDocumentButton,
    EmptyDocuments,
    DocumentsList,
    DocumentItem,
    DocumentIcon,
    DocumentInfo,
    DocumentName,
    DocumentMeta,
    DocumentType,
    DocumentDate,
    DocumentActions,
    DocumentActionButton,
    LoadingMessage,
    ErrorMessage
} from '../styles/DocumentsDrawerStyles';

interface DocumentsDrawerProps {
    isOpen: boolean;
    employee: Employee;
    documents: EmployeeDocument[];
    loading: boolean;
    error: string | null;
    onClose: () => void;
    onAddDocument: () => void;
    onDeleteDocument: (documentId: string) => void;
}

export const DocumentsDrawer: React.FC<DocumentsDrawerProps> = ({
                                                                    isOpen,
                                                                    employee,
                                                                    documents,
                                                                    loading,
                                                                    error,
                                                                    onClose,
                                                                    onAddDocument,
                                                                    onDeleteDocument
                                                                }) => {
    return (
        <DocumentsDrawerContainer isOpen={isOpen}>
            <DrawerHeader>
                <h2>Dokumenty pracownika</h2>
                <CloseButton onClick={onClose}>&times;</CloseButton>
            </DrawerHeader>

            <DrawerEmployeeInfo>
                <ColorDot color={employee.color} />
                <DrawerEmployeeName>{employee.fullName}</DrawerEmployeeName>
                <DrawerEmployeePosition>{employee.position}</DrawerEmployeePosition>
            </DrawerEmployeeInfo>

            <DrawerContent>
                {loading ? (
                    <LoadingMessage>Ładowanie dokumentów...</LoadingMessage>
                ) : error ? (
                    <ErrorMessage>{error}</ErrorMessage>
                ) : (
                    <>
                        <DocumentsHeader>
                            <h3>Lista dokumentów</h3>
                            <AddDocumentButton onClick={onAddDocument}>
                                <FaPlus /> Dodaj dokument
                            </AddDocumentButton>
                        </DocumentsHeader>

                        {documents.length === 0 ? (
                            <EmptyDocuments>
                                <FaFolder style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.5 }} />
                                <p>Brak dokumentów dla tego pracownika</p>
                            </EmptyDocuments>
                        ) : (
                            <DocumentsList>
                                {documents.map(document => (
                                    <DocumentItem key={document.id}>
                                        <DocumentIcon><FaFile /></DocumentIcon>
                                        <DocumentInfo>
                                            <DocumentName>{document.name}</DocumentName>
                                            <DocumentMeta>
                                                <DocumentType>{document.type}</DocumentType>
                                                <DocumentDate>Dodano: {formatDate(document.uploadDate)}</DocumentDate>
                                            </DocumentMeta>
                                        </DocumentInfo>
                                        <DocumentActions>
                                            <DocumentActionButton
                                                danger
                                                onClick={() => onDeleteDocument(document.id)}
                                                title="Usuń dokument"
                                            >
                                                <FaTrash />
                                            </DocumentActionButton>
                                        </DocumentActions>
                                    </DocumentItem>
                                ))}
                            </DocumentsList>
                        )}
                    </>
                )}
            </DrawerContent>
        </DocumentsDrawerContainer>
    );
};