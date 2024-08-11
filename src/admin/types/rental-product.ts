export type CreateRentalProductInput = {
    product_id: string,
    rentPlace: string,
    returnPlace: string,
    short_term_rate: number
    medium_term_rate: number
    long_term_rate: number
    rental_periods?: {
        short_term: { min: number; max: number }
        medium_term: { min: number; max: number }
        long_term: { min: number }
    }
}

export type UpdateRentalProductInput = Partial<CreateRentalProductInput> & {
    is_available?: boolean
}

export type RentalProductSelector = {
    id?: string
    product_id?: string
    is_available?: boolean
}
