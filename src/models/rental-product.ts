import {
    Entity,
    PrimaryColumn,
    Column,
    BeforeInsert, OneToOne, JoinColumn
} from "typeorm"
import {BaseEntity, Product} from "@medusajs/medusa"
import { generateEntityId } from "@medusajs/medusa/dist/utils"

@Entity()
export class RentalProduct extends BaseEntity {
    @PrimaryColumn({ type: "varchar" })
    id: string

    @OneToOne(() => Product)
    @JoinColumn({ name: "product_id" })
    product: Product

    @Column()
    product_id: string

    @Column()
    short_term_rate: number

    @Column()
    medium_term_rate: number

    @Column()
    long_term_rate: number

    @Column()
    rentPlace: string

    @Column()
    returnPlace: string

    @Column("jsonb")
    rental_periods: {
        short_term: { min: number; max: number }
        medium_term: { min: number; max: number }
        long_term: { min: number }
    }

    @BeforeInsert()
    private beforeInsert(): void {
        this.id = generateEntityId(this.id, "rental")
    }
}
