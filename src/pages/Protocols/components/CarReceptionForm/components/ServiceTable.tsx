import React from 'react';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { DiscountType, DiscountTypeLabels, SelectedService } from '../../../../../types';
import {
    ServicesTableContainer,
    ServicesTable as Table,
    TableHeader,
    TableCell,
    TableFooterCell,
    DiscountContainer,
    DiscountInputGroup,
    DiscountInput,
    DiscountTypeSelect,
    DiscountPercentage,
    ActionButton,
    AddItemRow,
    TotalAmount,
    TotalValue
} from '../styles/styles';

interface ServiceTableProps {
    services: SelectedService[];
    onRemoveService: (serviceId: string) => void;
    onDiscountTypeChange: (serviceId: string, discountType: DiscountType) => void;
    onDiscountValueChange: (serviceId: string, discountValue: number) => void;
    calculateTotals: () => { totalPrice: number; totalDiscount: number; totalFinalPrice: number };
}

const ServiceTable: React.FC<ServiceTableProps> = ({
                                                       services,
                                                       onRemoveService,
                                                       onDiscountTypeChange,
                                                       onDiscountValueChange,
                                                       calculateTotals
                                                   }) => {
    const { totalPrice, totalDiscount, totalFinalPrice } = calculateTotals();

    return (
        <ServicesTableContainer>
            <Table>
                <thead>
                <tr>
                    <TableHeader>Nazwa</TableHeader>
                    <TableHeader>Cena bazowa</TableHeader>
                    <TableHeader>Rabat</TableHeader>
                    <TableHeader>Cena końcowa</TableHeader>
                    <TableHeader>Akcje</TableHeader>
                </tr>
                </thead>
                <tbody>
                {services.length === 0 ? (
                    <tr>
                        <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                            Brak wybranych usług. Użyj pola wyszukiwania, aby dodać usługi.
                        </TableCell>
                    </tr>
                ) : (
                    services.map(service => (
                        <tr key={service.id}>
                            <TableCell>{service.name}</TableCell>
                            <TableCell>{service.price.toFixed(2)} zł</TableCell>
                            <TableCell>
                                <DiscountContainer>
                                    <DiscountInputGroup>
                                        <DiscountInput
                                            type="number"
                                            min="0"
                                            max={service.discountType === DiscountType.PERCENTAGE ? 100 : undefined}
                                            value={service.discountValue}
                                            onChange={(e) => onDiscountValueChange(service.id, parseFloat(e.target.value) || 0)}
                                        />
                                        <DiscountTypeSelect
                                            value={service.discountType}
                                            onChange={(e) => onDiscountTypeChange(service.id, e.target.value as DiscountType)}
                                        >
                                            {Object.entries(DiscountTypeLabels).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </DiscountTypeSelect>
                                    </DiscountInputGroup>
                                    {service.discountType === DiscountType.PERCENTAGE && (
                                        <DiscountPercentage>
                                            ({(service.price * service.discountValue / 100).toFixed(2)} zł)
                                        </DiscountPercentage>
                                    )}
                                </DiscountContainer>
                            </TableCell>
                            <TableCell>{service.finalPrice.toFixed(2)} zł</TableCell>
                            <TableCell>
                                <ActionButton
                                    type="button"
                                    onClick={() => onRemoveService(service.id)}
                                    title="Usuń usługę"
                                >
                                    <FaTrash />
                                </ActionButton>
                            </TableCell>
                        </tr>
                    ))
                )}
                </tbody>
                <tfoot>
                <tr>
                    <TableFooterCell>Suma:</TableFooterCell>
                    <TableFooterCell>{totalPrice.toFixed(2)} zł</TableFooterCell>
                    <TableFooterCell>
                        {totalDiscount.toFixed(2)} zł
                    </TableFooterCell>
                    <TableFooterCell>{totalFinalPrice.toFixed(2)} zł</TableFooterCell>
                    <TableFooterCell></TableFooterCell>
                </tr>
                </tfoot>
            </Table>
        </ServicesTableContainer>
    );
};

export default ServiceTable;