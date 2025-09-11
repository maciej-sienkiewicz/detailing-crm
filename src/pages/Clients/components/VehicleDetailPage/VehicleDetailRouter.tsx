import React from 'react';
import { Routes, Route } from 'react-router-dom';
import VehicleDetailPage from './VehicleDetailPage';

const VehicleDetailRouter: React.FC = () => {
    return (
        <Routes>
            <Route path="/vehicle/:id" element={<VehicleDetailPage />} />
        </Routes>
    );
};

export default VehicleDetailRouter;