import { LineItem as MedusaLineItem } from "@medusajs/medusa"
import { Column, Entity } from "typeorm"

@Entity()
export class LineItem extends MedusaLineItem {
    @Column({ nullable: true })
    rental_product_id: string

    @Column({ type: "jsonb", nullable: true })
    rental_details: {
        start_date: Date
        end_date: Date
        rental_days: number
    }
}
