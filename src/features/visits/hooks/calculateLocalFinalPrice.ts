import {DiscountType, PriceResponse} from "../../../types";

const TAX_RATE = 0.23;

export const calculateLocalFinalPrice = (
    basePrice: PriceResponse,
    discountType: DiscountType,
    discountValue: number
): PriceResponse => {
    const baseNetto = basePrice.priceNetto;
    let finalNetto = baseNetto;

    switch (discountType) {
        case DiscountType.PERCENTAGE:
            finalNetto = baseNetto * (1 - discountValue / 100);
            break;
        case DiscountType.AMOUNT:
            finalNetto = baseNetto - discountValue;
            break;
        case DiscountType.FIXED_PRICE:
            finalNetto = discountValue;
            break;
        default:
            finalNetto = baseNetto;
            break;
    }

    if (finalNetto < 0) {
        finalNetto = 0;
    }

    const priceBrutto = finalNetto * (1 + TAX_RATE);
    const taxAmount = priceBrutto - finalNetto;

    return {
        priceNetto: parseFloat(finalNetto.toFixed(2)),
        priceBrutto: parseFloat(priceBrutto.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2))
    };
};