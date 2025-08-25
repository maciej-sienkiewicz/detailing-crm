import React, {useState} from 'react';
import styled from 'styled-components';
import {
    FaCalendarAlt,
    FaClipboardList,
    FaFileDownload,
    FaFileExcel,
    FaFilePdf,
    FaFileWord,
    FaSearch,
    FaShieldAlt,
    FaTimes,
    FaUserTie
} from 'react-icons/fa';
import {
    Button,
    ButtonGroup,
    CloseButton,
    ModalBody,
    ModalContainer,
    ModalHeader,
    ModalOverlay
} from '../styles/ModalStyles';

// Brand Theme
const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    surface: '#ffffff',
    surfaceAlt: '#f8fafc',
    text: {
        primary: '#1e293b',
        secondary: '#475569',
        muted: '#64748b'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px'
    },
    radius: {
        md: '8px',
        lg: '12px'
    },
    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7'
    }
};

// Typy szablonów dokumentów
interface DocumentTemplate {
    id: string;
    name: string;
    description: string;
    category: 'hr' | 'legal' | 'forms' | 'reports';
    fileType: 'pdf' | 'doc' | 'xlsx';
    downloadUrl: string;
    lastUpdated: string;
    isPopular?: boolean;
}

// Przykładowe szablony dokumentów
const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
    // HR Templates
    {
        id: 'vacation_request',
        name: 'Wniosek urlopowy',
        description: 'Standardowy wniosek o udzielenie urlopu wypoczynkowego',
        category: 'hr',
        fileType: 'doc',
        downloadUrl: '/templates/wniosek_urlopowy.docx',
        lastUpdated: '2024-12-15',
        isPopular: true
    },
    {
        id: 'sick_leave',
        name: 'Zgłoszenie zwolnienia chorobowego',
        description: 'Formularz zgłoszenia nieobecności z powodu choroby',
        category: 'hr',
        fileType: 'pdf',
        downloadUrl: '/templates/zwolnienie_chorobowe.pdf',
        lastUpdated: '2024-12-10'
    },
    {
        id: 'overtime_request',
        name: 'Wniosek o nadgodziny',
        description: 'Formularz zgłoszenia pracy w godzinach nadliczbowych',
        category: 'hr',
        fileType: 'doc',
        downloadUrl: '/templates/wniosek_nadgodziny.docx',
        lastUpdated: '2024-12-01'
    },
    {
        id: 'training_request',
        name: 'Wniosek o szkolenie',
        description: 'Formularz wniosku o uczestnictwo w szkoleniu zewnętrznym',
        category: 'hr',
        fileType: 'doc',
        downloadUrl: '/templates/wniosek_szkolenie.docx',
        lastUpdated: '2024-11-20'
    },

    // Legal Templates
    {
        id: 'nda_agreement',
        name: 'Umowa o zachowaniu poufności',
        description: 'Standardowa umowa NDA dla pracowników',
        category: 'legal',
        fileType: 'pdf',
        downloadUrl: '/templates/umowa_nda.pdf',
        lastUpdated: '2024-12-05',
        isPopular: true
    },
    {
        id: 'gdpr_consent',
        name: 'Zgoda RODO',
        description: 'Formularz zgody na przetwarzanie danych osobowych',
        category: 'legal',
        fileType: 'pdf',
        downloadUrl: '/templates/zgoda_rodo.pdf',
        lastUpdated: '2024-11-30'
    },
    {
        id: 'safety_training',
        name: 'Karta szkolenia BHP',
        description: 'Dokumentacja przeprowadzonego szkolenia bezpieczeństwa',
        category: 'legal',
        fileType: 'doc',
        downloadUrl: '/templates/szkolenie_bhp.docx',
        lastUpdated: '2024-12-08'
    },

    // Forms Templates
    {
        id: 'equipment_request',
        name: 'Wniosek o sprzęt',
        description: 'Formularz zamówienia sprzętu biurowego lub narzędzi',
        category: 'forms',
        fileType: 'doc',
        downloadUrl: '/templates/wniosek_sprzet.docx',
        lastUpdated: '2024-12-12'
    },
    {
        id: 'expense_report',
        name: 'Rozliczenie kosztów',
        description: 'Formularz rozliczenia kosztów służbowych',
        category: 'forms',
        fileType: 'xlsx',
        downloadUrl: '/templates/rozliczenie_kosztow.xlsx',
        lastUpdated: '2024-12-14',
        isPopular: true
    },
    {
        id: 'incident_report',
        name: 'Zgłoszenie incydentu',
        description: 'Formularz zgłoszenia incydentu w miejscu pracy',
        category: 'forms',
        fileType: 'pdf',
        downloadUrl: '/templates/zgloszenie_incydentu.pdf',
        lastUpdated: '2024-11-25'
    },

    // Reports Templates
    {
        id: 'monthly_report',
        name: 'Raport miesięczny',
        description: 'Szablon miesięcznego raportu z pracy',
        category: 'reports',
        fileType: 'doc',
        downloadUrl: '/templates/raport_miesieczny.docx',
        lastUpdated: '2024-12-13'
    },
    {
        id: 'performance_review',
        name: 'Ocena okresowa',
        description: 'Formularz oceny okresowej pracownika',
        category: 'reports',
        fileType: 'doc',
        downloadUrl: '/templates/ocena_okresowa.docx',
        lastUpdated: '2024-12-07',
        isPopular: true
    }
];

interface DocumentTemplatesModalProps {
    onClose: () => void;
}

export const DocumentTemplatesModal: React.FC<DocumentTemplatesModalProps> = ({ onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = [
        { id: 'all', label: 'Wszystkie kategorie', icon: FaClipboardList },
        { id: 'hr', label: 'Zasoby ludzkie', icon: FaUserTie },
        { id: 'legal', label: 'Dokumenty prawne', icon: FaShieldAlt },
        { id: 'forms', label: 'Formularze', icon: FaClipboardList },
        { id: 'reports', label: 'Raporty', icon: FaCalendarAlt }
    ];

    // Filtrowanie szablonów
    const filteredTemplates = DOCUMENT_TEMPLATES.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Pobieranie ikony dla typu pliku
    const getFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'pdf':
                return <FaFilePdf />;
            case 'doc':
                return <FaFileWord />;
            case 'xlsx':
                return <FaFileExcel />;
            default:
                return <FaFileDownload />;
        }
    };

    // Pobieranie koloru dla typu pliku
    const getFileColor = (fileType: string) => {
        switch (fileType) {
            case 'pdf':
                return '#dc2626';
            case 'doc':
                return '#2563eb';
            case 'xlsx':
                return '#059669';
            default:
                return brandTheme.text.muted;
        }
    };

    // Obsługa pobierania szablonu
    const handleDownload = (template: DocumentTemplate) => {
        // W prawdziwej aplikacji tutaj byłoby rzeczywiste pobieranie pliku
        console.log('Downloading template:', template.name);

        // Symulacja pobierania
        const link = document.createElement('a');
        link.href = template.downloadUrl;
        link.download = `${template.name}.${template.fileType}`;
        link.click();
    };

    // Formatowanie daty
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <ModalOverlay>
            <ModalContainer style={{ maxWidth: '900px', maxHeight: '90vh' }}>
                <ModalHeader>
                    <h2>Szablony dokumentów</h2>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                </ModalHeader>

                <ModalBody>
                    {/* Filtry i wyszukiwanie */}
                    <FiltersSection>
                        <SearchWrapper>
                            <SearchIcon>
                                <FaSearch />
                            </SearchIcon>
                            <SearchInput
                                type="text"
                                placeholder="Szukaj szablonów..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <ClearSearchButton onClick={() => setSearchQuery('')}>
                                    <FaTimes />
                                </ClearSearchButton>
                            )}
                        </SearchWrapper>

                        <CategoriesFilter>
                            {categories.map(category => {
                                const Icon = category.icon;
                                return (
                                    <CategoryButton
                                        key={category.id}
                                        $active={selectedCategory === category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                    >
                                        <Icon />
                                        {category.label}
                                    </CategoryButton>
                                );
                            })}
                        </CategoriesFilter>
                    </FiltersSection>

                    {/* Licznik wyników */}
                    <ResultsCounter>
                        Znaleziono: <strong>{filteredTemplates.length}</strong> {filteredTemplates.length === 1 ? 'szablon' : 'szablonów'}
                    </ResultsCounter>

                    {/* Lista szablonów */}
                    {filteredTemplates.length === 0 ? (
                        <EmptyState>
                            <EmptyIcon>
                                <FaClipboardList />
                            </EmptyIcon>
                            <EmptyTitle>Brak szablonów</EmptyTitle>
                            <EmptyDescription>
                                Nie znaleziono szablonów spełniających kryteria wyszukiwania
                            </EmptyDescription>
                        </EmptyState>
                    ) : (
                        <TemplatesGrid>
                            {filteredTemplates.map(template => (
                                <TemplateCard key={template.id}>
                                    {template.isPopular && (
                                        <PopularBadge>Popularne</PopularBadge>
                                    )}

                                    <TemplateHeader>
                                        <TemplateIcon $color={getFileColor(template.fileType)}>
                                            {getFileIcon(template.fileType)}
                                        </TemplateIcon>
                                        <TemplateInfo>
                                            <TemplateName>{template.name}</TemplateName>
                                            <TemplateType>
                                                {template.fileType.toUpperCase()}
                                            </TemplateType>
                                        </TemplateInfo>
                                    </TemplateHeader>

                                    <TemplateDescription>
                                        {template.description}
                                    </TemplateDescription>

                                    <TemplateFooter>
                                        <UpdateDate>
                                            Aktualizacja: {formatDate(template.lastUpdated)}
                                        </UpdateDate>
                                        <DownloadButton
                                            onClick={() => handleDownload(template)}
                                        >
                                            <FaFileDownload />
                                            Pobierz
                                        </DownloadButton>
                                    </TemplateFooter>
                                </TemplateCard>
                            ))}
                        </TemplatesGrid>
                    )}

                    <ButtonGroup>
                        <Button type="button" secondary onClick={onClose}>
                            Zamknij
                        </Button>
                    </ButtonGroup>
                </ModalBody>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components
const FiltersSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.lg};
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
`;

const SearchWrapper = styled.div`
    position: relative;
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${brandTheme.text.muted};
    font-size: 16px;
    z-index: 2;
`;

const SearchInput = styled.input`
    width: 100%;
    height: 44px;
    padding: 0 48px 0 48px;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-radius: ${brandTheme.radius.lg};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

const ClearSearchButton = styled.button`
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    border: none;
    background: ${brandTheme.surfaceAlt};
    color: ${brandTheme.text.muted};
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: all 0.2s ease;

    &:hover {
        background: #fee2e2;
        color: #dc2626;
    }
`;

const CategoriesFilter = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    flex-wrap: wrap;
`;

const CategoryButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border: 2px solid ${props => props.$active ? brandTheme.primary : 'rgba(0, 0, 0, 0.1)'};
    background: ${props => props.$active ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${props => props.$active ? brandTheme.primary : brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
    }
`;

const ResultsCounter = styled.div`
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    font-size: 14px;
    font-weight: 500;
    border-radius: ${brandTheme.radius.md};
    margin-bottom: ${brandTheme.spacing.lg};

    strong {
        font-weight: 700;
    }
`;

const TemplatesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: ${brandTheme.spacing.lg};
    margin-bottom: ${brandTheme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const TemplateCard = styled.div`
    position: relative;
    background: ${brandTheme.surface};
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-color: ${brandTheme.primary};
    }
`;

const PopularBadge = styled.div`
    position: absolute;
    top: ${brandTheme.spacing.sm};
    right: ${brandTheme.spacing.sm};
    background: ${brandTheme.status.warning};
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.md};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const TemplateHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.md};
`;

const TemplateIcon = styled.div<{ $color: string }>`
    width: 48px;
    height: 48px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
`;

const TemplateInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const TemplateName = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.xs} 0;
    line-height: 1.3;
`;

const TemplateType = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 600;
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.md};
    display: inline-block;
`;

const TemplateDescription = styled.p`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    line-height: 1.5;
    margin: 0 0 ${brandTheme.spacing.lg} 0;
`;

const TemplateFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const UpdateDate = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
`;

const DownloadButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    border: 1px solid ${brandTheme.primary}30;
    border-radius: ${brandTheme.radius.md};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primary};
        color: white;
        transform: translateY(-1px);
    }
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.md};
    text-align: center;
    color: ${brandTheme.text.muted};
`;

const EmptyIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${brandTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: ${brandTheme.spacing.lg};
`;

const EmptyTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.sm} 0;
`;

const EmptyDescription = styled.p`
    font-size: 14px;
    margin: 0;
    line-height: 1.5;
`;