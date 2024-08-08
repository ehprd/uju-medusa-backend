// src/models/rental-product.ts
import {
    Entity,
    PrimaryColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm"
import { BaseEntity } from "@medusajs/medusa"
import { Product } from "@medusajs/medusa"

@Entity()
export class RentalProduct extends BaseEntity {
    @PrimaryColumn()
    id: string

    @Column({ type: "varchar" })
    product_id: string

    @ManyToOne(() => Product)
    @JoinColumn({ name: "product_id" })
    product: Product

    @Column({ type: "int" })
    short_term_rate: number

    @Column({ type: "int" })
    medium_term_rate: number

    @Column({ type: "int" })
    long_term_rate: number

    @Column({ type: "boolean", default: true })
    is_available: boolean
}
