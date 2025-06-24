import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameHiddenByStudentToHiddenByUser1748000000001 implements MigrationInterface {
    name = 'RenameHiddenByStudentToHiddenByUser1748000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" RENAME COLUMN "hidden_by_student" TO "hidden_by_user"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" RENAME COLUMN "hidden_by_user" TO "hidden_by_student"`);
    }
} 