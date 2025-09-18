// src/components/ClientAnalytics/index.ts
export { default as ClientAnalyticsSection } from './ClientAnalyticsSection';
export { default as ClientBasicMetrics } from './ClientBasicMetrics';
export { default as ClientRevenueTrend } from './ClientRevenueTrend';
export { default as ClientTopServices } from './ClientTopServices';
export { default as ClientComparison } from './ClientComparison';
export { default as AnalyticsToggle } from './AnalyticsToggle';

// Hooks
export {
    useClientAnalytics,
    useClientAnalyticsSummary,
    useCompanyAverages,
    useBatchClientAnalytics
} from '../../hooks/useClientAnalytics';

// Utilities
export * from '../../utils/clientAnalyticsUtils';