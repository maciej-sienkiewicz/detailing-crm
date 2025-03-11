import React from 'react';
import styled from 'styled-components';
import { FaClock } from 'react-icons/fa';

interface Task {
    id: string;
    title: string;
    customer: string;
    startDate: string;
    endDate: string;
    daysOverdue: number;
}

interface OverdueTasksWidgetProps {
    tasks: Task[];
}

const OverdueTasksWidget: React.FC<OverdueTasksWidgetProps> = ({ tasks }) => {
    if (tasks.length === 0) {
        return <EmptyState>Brak przeterminowanych zadań</EmptyState>;
    }

    return (
        <Container>
            {tasks.map(task => (
                <TaskItem key={task.id} daysOverdue={task.daysOverdue}>
                    <TaskHeader>
                        <TaskTitle>{task.title}</TaskTitle>
                        <OverdueDays>
                            <FaClock /> {task.daysOverdue} {task.daysOverdue === 1 ? 'dzień' :
                            (task.daysOverdue > 1 && task.daysOverdue < 5) ? 'dni' : 'dni'} po terminie
                        </OverdueDays>
                    </TaskHeader>
                    <TaskCustomer>{task.customer}</TaskCustomer>
                    <TaskDates>
                        <DateItem>Przyjęto: {task.startDate}</DateItem>
                        <DateItem>Planowane zakończenie: {task.endDate}</DateItem>
                    </TaskDates>
                </TaskItem>
            ))}
        </Container>
    );
};

const Container = styled.div`
  width: 100%;
  max-height: 260px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const EmptyState = styled.div`
  padding: 20px;
  text-align: center;
  color: #7f8c8d;
  background-color: #f9f9f9;
  border-radius: 4px;
  width: 100%;
`;

const TaskItem = styled.div<{ daysOverdue: number }>`
  background-color: ${props => {
    // Bardziej czerwone tło dla bardziej przeterminowanych zadań
    if (props.daysOverdue > 7) return '#fff0f0';
    if (props.daysOverdue > 3) return '#fff5f5';
    return '#fff9f9';
}};
  border-left: 3px solid #e74c3c;
  padding: 12px 15px;
  border-radius: 4px;
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
`;

const TaskTitle = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: #2c3e50;
`;

const OverdueDays = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #e74c3c;
  font-size: 12px;
  font-weight: 500;
`;

const TaskCustomer = styled.div`
  font-size: 13px;
  color: #7f8c8d;
  margin-bottom: 8px;
`;

const TaskDates = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DateItem = styled.div`
  font-size: 12px;
  color: #7f8c8d;
`;

export default OverdueTasksWidget;