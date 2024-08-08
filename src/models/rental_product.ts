// src/models/rental-product.ts
import {
    Entity,
    Column,
    OneToOne,
    JoinColumn,
    PrimaryColumn
} from "typeorm"
import { Product } from "@medusajs/medusa"

@Entity()
export class RentalProduct {
    @PrimaryColumn()
    id: string

    @OneToOne(() => Product)
    @JoinColumn({ name: "product_id" })
    product: Product

    @Column()
    product_id: string

    @Column("int")
    short_term_rate: number

    @Column("int")
    medium_term_rate: number

    @Column("int")
    long_term_rate: number

    @Column("jsonb", { nullable: true })
    rental_periods: {
        short_term: { min: number; max: number };
        medium_term: { min: number; max: number };
        long_term: { min: number };
    }

    @Column("boolean", { default: true })
    is_available: boolean
}
