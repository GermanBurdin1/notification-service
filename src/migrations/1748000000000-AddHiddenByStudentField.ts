import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddHiddenByStudentField1748000000000 implements MigrationInterface {
    name = 'AddHiddenByStudentField1748000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ajout du champ pour permettre aux users de masquer les notifications
        await queryRunner.addColumn("notifications", new TableColumn({
            name: "hidden_by_student",
            type: "boolean",
            default: false
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("notifications", "hidden_by_student");
    }
} 