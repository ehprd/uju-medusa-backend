import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateRentalProductTable1691234567890 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // UUID 확장 추가
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

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
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: "medium_term_rate",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: "long_term_rate",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: "rentPlace",
                        type: "varchar",
                    },
                    {
                        name: "returnPlace",
                        type: "varchar",
                    },
                    {
                        name: "rental_periods",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp with time zone",
                        default: "now()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp with time zone",
                        default: "now()",
                    },
                ],
                foreignKeys: [
                    {
                        name: "fk_rental_product_product",
                        columnNames: ["product_id"],
                        referencedTableName: "product",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
            }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("rental_product")
    }
}
