// src/migrations/1691234567890-CreateRentalProductTable.ts
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm"

export class CreateRentalProductTable1691234567890 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "rental_product",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        isPrimary: true,
                    },
                    {
                        name: "product_id",
                        type: "varchar",
                    },
                    {
                        name: "short_term_rate",
                        type: "int",
                    },
                    {
                        name: "medium_term_rate",
                        type: "int",
                    },
                    {
                        name: "long_term_rate",
                        type: "int",
                    },
                    {
                        name: "is_available",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        )

        await queryRunner.createForeignKey(
            "rental_product",
            new TableForeignKey({
                columnNames: ["product_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "product",
                onDelete: "CASCADE",
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("rental_product")
    }
}
