// src/hooks/useUnsavedChangesWarning.ts
import { useEffect, useRef, useCallback } from 'react';

interface UseUnsavedChangesWarningProps {
    hasUnsavedChanges: boolean;
    message?: string;
}

export const useUnsavedChangesWarning = ({
                                             hasUnsavedChanges,
                                             message = 'Masz niezapisane zmiany. Czy na pewno chcesz opuścić tę stronę?'
                                         }: UseUnsavedChangesWarningProps) => {
    const hasUnsavedChangesRef = useRef(hasUnsavedChanges);

    // Update ref when hasUnsavedChanges changes
    useEffect(() => {
        hasUnsavedChangesRef.current = hasUnsavedChanges;
    }, [hasUnsavedChanges]);

    // Handle browser refresh/close
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (hasUnsavedChangesRef.current) {
                event.preventDefault();
                event.returnValue = message;
                return message;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [message]);

    // Function to check if navigation should be blocked
    const shouldBlockNavigation = useCallback(() => {
        return hasUnsavedChangesRef.current;
    }, []);

    return {
        shouldBlockNavigation
    };
};