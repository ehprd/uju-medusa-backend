import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddRentalFieldsToLineItem1691234567891 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns("line_item", [
            new TableColumn({
                name: "rental_product_id",
                type: "varchar",
                isNullable: true,
            }),
            new TableColumn({
                name: "rental_details",
                type: "jsonb",
                isNullable: true,
            }),
        ])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("line_item", "rental_product_id")
        await queryRunner.dropColumn("line_item", "rental_details")
    }
}
