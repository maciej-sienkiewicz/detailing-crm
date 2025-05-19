// src/components/common/ClientSearchInput.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaUserAlt, FaTimes } from 'react-icons/fa';
import { ClientExpanded } from '../../types';
import { clientApi } from '../../api/clientsApi';
import { useDebounce } from '../../hooks/useDebounce';

interface ClientSearchInputProps {
    value?: string;
    selectedClient?: ClientExpanded | null;
    onChange: (client: ClientExpanded | null) => void;
    placeholder?: string;
    disabled?: boolean;
}

const ClientSearchInput: React.FC<ClientSearchInputProps> = ({
                                                                 value,
                                                                 selectedClient,
                                                                 onChange,
                                                                 placeholder = 'Wyszukaj klienta...',
                                                                 disabled = false
                                                             }) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [results, setResults] = useState<ClientExpanded[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const debouncedQuery = useDebounce(searchQuery, 300);

    // Ustawienie początkowej wartości
    useEffect(() => {
        if (selectedClient) {
            setSearchQuery(`${selectedClient.firstName} ${selectedClient.lastName}${selectedClient.company ? ` (${selectedClient.company})` : ''}`);
        } else {
            setSearchQuery('');
        }
    }, [selectedClient]);

    // Wyszukiwanie klientów po zmianie wartości
    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            searchClients(debouncedQuery);
        } else {
            setResults([]);
        }
    }, [debouncedQuery]);

    const searchClients = async (query: string) => {
        setIsLoading(true);
        try {
            // Zakładamy, że dodamy nowy endpoint do API klientów
            const clients = await clientApi.searchClients(query);
            setResults(clients);
            setIsOpen(true);
        } catch (error) {
            console.error('Error searching clients:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (!e.target.value) {
            onChange(null);
        }
    };

    const handleSelectClient = (client: ClientExpanded) => {
        onChange(client);
        setSearchQuery(`${client.firstName} ${client.lastName}${client.company ? ` (${client.company})` : ''}`);
        setIsOpen(false);
    };

    const handleClear = () => {
        setSearchQuery('');
        onChange(null);
    };

    return (
        <Container>
            <InputWrapper>
                <SearchIcon>
                    <FaSearch />
                </SearchIcon>
                <Input
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    onFocus={() => debouncedQuery.length >= 2 && setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                />
                {searchQuery && (
                    <ClearButton onClick={handleClear}>
                        <FaTimes />
                    </ClearButton>
                )}
            </InputWrapper>

            {isOpen && results.length > 0 && (
                <ResultsDropdown>
                    {results.map(client => (
                        <ResultItem key={client.id} onClick={() => handleSelectClient(client)}>
                            <ClientIcon>
                                <FaUserAlt />
                            </ClientIcon>
                            <ClientInfo>
                                <ClientName>{client.firstName} {client.lastName}</ClientName>
                                {client.company && <ClientCompany>{client.company}</ClientCompany>}
                                <ClientContact>{client.phone} | {client.email}</ClientContact>
                            </ClientInfo>
                        </ResultItem>
                    ))}
                </ResultsDropdown>
            )}

            {isOpen && debouncedQuery.length >= 2 && results.length === 0 && !isLoading && (
                <NoResults>Nie znaleziono klientów</NoResults>
            )}

            {isLoading && (
                <LoadingIndicator>Wyszukiwanie...</LoadingIndicator>
            )}
        </Container>
    );
};

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  color: #7f8c8d;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  
  &:hover {
    color: #e74c3c;
  }
`;

const ResultsDropdown = styled.div`
  position: absolute;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 4px;
  z-index: 100;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ResultItem = styled.div`
  display: flex;
  padding: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #eee;
  }
`;

const ClientIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
`;

const ClientInfo = styled.div`
  flex: 1;
`;

const ClientName = styled.div`
  font-weight: 500;
  color: #2c3e50;
`;

const ClientCompany = styled.div`
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 4px;
`;

const ClientContact = styled.div`
  font-size: 12px;
  color: #7f8c8d;
`;

const NoResults = styled.div`
  padding: 12px;
  text-align: center;
  color: #7f8c8d;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 4px;
`;

const LoadingIndicator = styled.div`
  padding: 12px;
  text-align: center;
  color: #7f8c8d;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 4px;
`;

export default ClientSearchInput;