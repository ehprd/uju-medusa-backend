export type RentalLineItemMetadata = {
    startDate: string;
    endDate: string;
    pickupMethod: 'Delivery' | 'Pickup';
    rentPlace: string;
    returnPlace: string;
    customerName: string;
    customerPhoneNumber: string;
    customerPlace: string;
}
