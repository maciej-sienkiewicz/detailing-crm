// src/features/services/index.ts
/**
 * Main export file for services feature module
 * Provides shared components and hooks for service management
 */

// Components
export { ServiceSection } from './components/ServiceSection';
export { ServiceSearch } from './components/ServiceSearch';
export { ServiceTable } from './components/ServiceTable';

// Hooks
export { useServiceCalculations } from './hooks/useServiceCalculations';

// Types (re-exported from main types)
export type { Service, SelectedService, DiscountType, PriceResponse } from '../../types';