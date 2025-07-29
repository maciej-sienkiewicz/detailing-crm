import styled from 'styled-components';
import { FaMoneyBill, FaCreditCard, FaFileInvoice, FaReceipt, FaFileAlt, FaEdit, FaListAlt, FaCalculator, FaUniversity } from 'react-icons/fa';
import { theme } from '../../../../styles/theme';

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

export const ModalContainer = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    box-shadow: ${theme.shadow.xl};
    width: 700px;
    max-width: 95%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease;

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;

export const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing.xl} ${theme.spacing.xxxl};
    border-bottom: 2px solid ${theme.border};
    background: ${theme.surfaceAlt};
`;

export const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
`;

export const HeaderIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${theme.successBg};
    color: ${theme.success};
    border-radius: ${theme.radius.lg};
    font-size: 18px;
`;

export const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

export const ModalTitle = styled.h3`
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: ${theme.text.primary};
    letter-spacing: -0.025em;
`;

export const ModalSubtitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

export const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${theme.surfaceHover};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.sm};
    color: ${theme.text.muted};
    cursor: pointer;
    transition: all ${theme.transitions.normal};

    &:hover {
        background: ${theme.errorBg};
        border-color: ${theme.error};
        color: ${theme.error};
        transform: translateY(-1px);
    }
`;

export const ModalBody = styled.div`
    padding: ${theme.spacing.xxxl};
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xxxl};

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: ${theme.surfaceAlt};
    }

    &::-webkit-scrollbar-thumb {
        background: ${theme.border};
        border-radius: 3px;
    }
`;

export const AmountSection = styled.div`
    display: flex;
    justify-content: center;
`;

export const AmountCard = styled.div<{ $modified: boolean }>`
    background: ${props => props.$modified ? theme.infoBg : theme.surfaceAlt};
    border: 2px solid ${props => props.$modified ? theme.info : theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.xl};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    min-width: 280px;
    position: relative;
`;

export const AmountIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${theme.success};
    color: white;
    border-radius: ${theme.radius.lg};
    font-size: 20px;
`;

export const AmountDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

export const AmountLabel = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

export const AmountValue = styled.div`
    font-size: 24px;
    font-weight: 700;
    color: ${theme.success};
    font-variant-numeric: tabular-nums;
`;

export const ModifiedHint = styled.div`
    font-size: 12px;
    color: ${theme.info};
    font-style: italic;
    font-weight: 500;
`;

export const PaymentSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
`;

export const DocumentSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
    min-height: 200px;
`;

export const SectionTitle = styled.h4`
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};

    svg {
        color: ${theme.primary};
        font-size: 16px;
    }
`;

export const OptionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${theme.spacing.lg};
    min-height: 120px;
`;

export const PaymentOption = styled.div<{ $selected: boolean }>`
    background: ${props => props.$selected ? theme.primaryGhost : theme.surface};
    border: 2px solid ${props => props.$selected ? theme.primary : theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.xl};
    cursor: pointer;
    transition: all ${theme.transitions.spring};
    position: relative;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
    min-height: 120px;
    width: 100%;

    &:hover {
        border-color: ${theme.primary};
        transform: translateY(-2px);
        box-shadow: ${theme.shadow.md};
    }
`;

export const DocumentOption = styled(PaymentOption)`
    min-height: 120px;
    width: 100%;
`;

export const OptionIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${theme.surfaceAlt};
    color: ${theme.primary};
    border-radius: ${theme.radius.lg};
    font-size: 20px;
    margin-bottom: ${theme.spacing.sm};
`;

export const OptionContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

export const OptionTitle = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

export const OptionDescription = styled.div`
    font-size: 13px;
    color: ${theme.text.muted};
    line-height: 1.4;
`;

export const SelectionIndicator = styled.div<{ $selected: boolean }>`
    position: absolute;
    top: ${theme.spacing.sm};
    right: ${theme.spacing.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: ${props => props.$selected ? theme.success : theme.border};
    color: white;
    border-radius: 50%;
    font-size: 12px;
    transition: all ${theme.transitions.normal};
    opacity: ${props => props.$selected ? 1 : 0.3};
`;

export const PaymentDaysSection = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    animation: slideIn 0.3s ease;

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

export const PaymentDaysLabel = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

export const PaymentDaysInput = styled.input`
    width: 80px;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 2px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    transition: all ${theme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primaryGhost};
    }

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    &[type=number] {
        -moz-appearance: textfield;
    }
`;

export const PaymentDaysUnit = styled.span`
    font-size: 14px;
    font-weight: 500;
    color: ${theme.text.secondary};
`;

export const InvoiceOptionsSection = styled.div`
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
    margin-top: ${theme.spacing.lg};
    animation: slideIn 0.3s ease;

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

export const InvoiceOptionsTitle = styled.h5`
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

export const EditInvoiceItemsButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    background: ${theme.primaryGhost};
    color: ${theme.primary};
    border: 2px solid ${theme.primary}40;
    border-radius: ${theme.radius.md};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all ${theme.transitions.normal};
    width: 100%;

    &:hover {
        background: ${theme.primary}20;
        border-color: ${theme.primary};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.sm};
    }
`;

export const CustomItemsSummary = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: ${theme.successBg};
    border: 1px solid ${theme.success};
    border-radius: ${theme.radius.md};
    padding: ${theme.spacing.lg};
`;

export const SummaryInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
`;

export const SummaryIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${theme.success};
    color: white;
    border-radius: ${theme.radius.sm};
    font-size: 14px;
`;

export const SummaryText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

export const SummaryTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.success};
`;

export const SummaryDetails = styled.div`
    font-size: 12px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

export const EditInvoiceButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    background: none;
    color: ${theme.primary};
    border: 1px solid ${theme.primary};
    border-radius: ${theme.radius.sm};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all ${theme.transitions.normal};

    &:hover {
        background: ${theme.primaryGhost};
        transform: translateY(-1px);
    }
`;

export const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xl} ${theme.spacing.xxxl};
    border-top: 2px solid ${theme.border};
    background: ${theme.surfaceAlt};
`;

export const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border: 2px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${theme.transitions.spring};
    min-height: 44px;
    min-width: 120px;

    &:hover {
        background: ${theme.surfaceHover};
        color: ${theme.text.primary};
        border-color: ${theme.borderHover};
        box-shadow: ${theme.shadow.sm};
    }
`;

export const PrimaryButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    background: linear-gradient(135deg, ${theme.success} 0%, #27ae60 100%);
    color: white;
    border: 2px solid transparent;
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${theme.transitions.spring};
    box-shadow: ${theme.shadow.sm};
    min-height: 44px;
    min-width: 180px;

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, #27ae60 0%, ${theme.success} 100%);
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        background: ${theme.text.disabled};
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
`;

export const MoneyIcon = styled(FaMoneyBill)``;
export const CreditCardIcon = styled(FaCreditCard)``;
export const BankIcon = styled(FaUniversity)``;
export const FileInvoiceIcon = styled(FaFileInvoice)``;
export const ReceiptIcon = styled(FaReceipt)``;
export const FileAltIcon = styled(FaFileAlt)``;
export const EditIcon = styled(FaEdit)``;
export const ListAltIcon = styled(FaListAlt)``;
export const CalculatorIcon = styled(FaCalculator)``;