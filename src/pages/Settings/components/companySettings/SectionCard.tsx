// src/pages/Settings/components/SectionCard.tsx
import React from 'react';
import {IconType} from 'react-icons';
import {FaEdit, FaSave, FaSpinner, FaTimes} from 'react-icons/fa';
import {
    ActionButton,
    ActionGroup,
    CardBody,
    CardHeader,
    HeaderActions,
    HeaderContent,
    HeaderIcon,
    HeaderSubtitle,
    HeaderText,
    HeaderTitle,
    SettingsCard
} from '../../styles/companySettings/SectionCard.styles';

interface ActionItem {
    icon: IconType;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    primary?: boolean;
    secondary?: boolean;
    danger?: boolean;
}

interface SectionCardProps {
    icon: IconType;
    title: string;
    subtitle: string;
    children: React.ReactNode;
    isEditing?: boolean;
    saving?: boolean;
    onStartEdit?: () => void;
    onSave?: () => void;
    onCancel?: () => void;
    actions?: ActionItem[];
    testResult?: {
        success: boolean;
        message: string;
        details?: string;
    };
}

export const SectionCard: React.FC<SectionCardProps> = ({
                                                            icon: Icon,
                                                            title,
                                                            subtitle,
                                                            children,
                                                            isEditing = false,
                                                            saving = false,
                                                            onStartEdit,
                                                            onSave,
                                                            onCancel,
                                                            actions = [],
                                                            testResult
                                                        }) => {
    const getActions = () => {
        if (isEditing && onSave && onCancel) {
            return [
                {
                    icon: FaTimes,
                    label: 'Anuluj',
                    onClick: onCancel,
                    secondary: true
                },
                {
                    icon: saving ? FaSpinner : FaSave,
                    label: saving ? 'Zapisywanie...' : 'Zapisz',
                    onClick: onSave,
                    disabled: saving,
                    primary: true
                }
            ];
        }

        if (onStartEdit && !isEditing) {
            return [
                {
                    icon: FaEdit,
                    label: 'Edytuj',
                    onClick: onStartEdit,
                    secondary: true
                }
            ];
        }

        return actions;
    };

    const actionItems = getActions();

    return (
        <SettingsCard>
            <CardHeader>
                <HeaderContent>
                    <HeaderIcon>
                        <Icon />
                    </HeaderIcon>
                    <HeaderText>
                        <HeaderTitle>{title}</HeaderTitle>
                        <HeaderSubtitle>{subtitle}</HeaderSubtitle>
                    </HeaderText>
                </HeaderContent>

                {actionItems.length > 0 && (
                    <HeaderActions>
                        <ActionGroup>
                            {actionItems.map((action, index) => (
                                <ActionButton
                                    key={index}
                                    onClick={action.onClick}
                                    disabled={action.disabled}
                                    $primary={action.primary}
                                    $secondary={action.secondary}
                                    $danger={action.danger}
                                >
                                    <action.icon className={action.disabled && action.icon === FaSpinner ? 'spinning' : ''} />
                                    {action.label}
                                </ActionButton>
                            ))}
                        </ActionGroup>
                    </HeaderActions>
                )}
            </CardHeader>

            {testResult && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 24px',
                    background: testResult.success ? '#d1fae5' : '#fee2e2',
                    color: testResult.success ? '#059669' : '#dc2626',
                    borderBottom: '1px solid #e2e8f0',
                    fontWeight: 500
                }}>
                    <span>{testResult.success ? '✓' : '⚠'}</span>
                    <div style={{ flex: 1 }}>
                        <div>{testResult.message}</div>
                        {testResult.details && (
                            <div style={{
                                fontSize: '12px',
                                marginTop: '4px',
                                opacity: 0.8
                            }}>
                                {testResult.details}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <CardBody>
                {children}
            </CardBody>
        </SettingsCard>
    );
};