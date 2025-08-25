import {useCallback, useState} from 'react';
import {VisitListItem} from '../../../api/visitsApiNew';

export interface UseVisitsSelectionReturn {
    selectedVisits: Set<string>;
    isVisitSelected: (visitId: string) => boolean;
    isAllSelected: boolean;
    isPartiallySelected: boolean;
    toggleVisit: (visitId: string) => void;
    toggleAll: (visits: VisitListItem[]) => void;
    clearSelection: () => void;
    getSelectedVisits: (visits: VisitListItem[]) => VisitListItem[];
    selectedCount: number;
}

export const useVisitsSelection = (): UseVisitsSelectionReturn => {
    const [selectedVisits, setSelectedVisits] = useState<Set<string>>(new Set());

    const isVisitSelected = useCallback((visitId: string): boolean => {
        return selectedVisits.has(visitId);
    }, [selectedVisits]);

    const toggleVisit = useCallback((visitId: string) => {
        setSelectedVisits(prev => {
            const newSet = new Set(prev);
            if (newSet.has(visitId)) {
                newSet.delete(visitId);
            } else {
                newSet.add(visitId);
            }
            return newSet;
        });
    }, []);

    const toggleAll = useCallback((visits: VisitListItem[]) => {
        setSelectedVisits(prev => {
            const allIds = visits.map(visit => visit.id);
            const allSelected = allIds.every(id => prev.has(id));

            if (allSelected) {
                const newSet = new Set(prev);
                allIds.forEach(id => newSet.delete(id));
                return newSet;
            } else {
                return new Set([...prev, ...allIds]);
            }
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedVisits(new Set());
    }, []);

    const getSelectedVisits = useCallback((visits: VisitListItem[]): VisitListItem[] => {
        return visits.filter(visit => selectedVisits.has(visit.id));
    }, [selectedVisits]);

    const isAllSelected = useCallback((visits: VisitListItem[]): boolean => {
        if (visits.length === 0) return false;
        return visits.every(visit => selectedVisits.has(visit.id));
    }, [selectedVisits]);

    const isPartiallySelected = useCallback((visits: VisitListItem[]): boolean => {
        if (visits.length === 0) return false;
        const selectedCount = visits.filter(visit => selectedVisits.has(visit.id)).length;
        return selectedCount > 0 && selectedCount < visits.length;
    }, [selectedVisits]);

    return {
        selectedVisits,
        isVisitSelected,
        isAllSelected: false,
        isPartiallySelected: false,
        toggleVisit,
        toggleAll,
        clearSelection,
        getSelectedVisits,
        selectedCount: selectedVisits.size
    };
};