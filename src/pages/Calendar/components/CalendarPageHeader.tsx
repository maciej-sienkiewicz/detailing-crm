// src/pages/Calendar/components/CalendarPageHeader.tsx
import React from 'react';
import styled from 'styled-components';
import {FaArrowLeft, FaCalendarAlt, FaImages, FaPlus} from 'react-icons/fa';
import {useCalendarPageContext} from '../CalendarPageProvider';
import {theme} from '../../../styles/theme';
import {PageHeader, PrimaryButton} from "../../../components/common/PageHeader";

export const CalendarPageHeader: React.FC = () => {
    const { actions } = useCalendarPageContext();

    return (
        <PageHeader
            icon={FaCalendarAlt}
            title="Kalendarz wizyt"
            subtitle="Zarządzanie terminami i protokołami"
            actions={
                <PrimaryButton onClick={actions.handleNewAppointmentClick}>
                    <FaPlus /> Nowa wizyta
                </PrimaryButton>
            }
        />
    );
};