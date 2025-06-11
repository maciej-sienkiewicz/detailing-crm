import {EnhancedLabel, MinimalRequiredBadge, ModernRequiredBadge, OptionalBadge, RequiredBadge} from "../styles";

interface LabelWithBadgeProps {
    htmlFor: string;
    required?: boolean;
    optional?: boolean;
    children: React.ReactNode;
    badgeVariant?: 'default' | 'modern' | 'minimal';
}

export const LabelWithBadge: React.FC<LabelWithBadgeProps> = ({
                                                                  htmlFor,
                                                                  required = false,
                                                                  optional = false,
                                                                  children,
                                                                  badgeVariant = 'default'
                                                              }) => {
    const renderBadge = () => {
        if (required) {
            switch (badgeVariant) {
                case 'modern':
                    return <ModernRequiredBadge>Wymagane</ModernRequiredBadge>;
                case 'minimal':
                    return <MinimalRequiredBadge>wymagane</MinimalRequiredBadge>;
                default:
                    return <RequiredBadge>Wymagane</RequiredBadge>;
            }
        }

        if (optional) {
            return <OptionalBadge>Opcjonalne</OptionalBadge>;
        }

        return null;
    };

    return (
        <EnhancedLabel htmlFor={htmlFor}>
            <span>{children}</span>
            {renderBadge()}
        </EnhancedLabel>
    );
};