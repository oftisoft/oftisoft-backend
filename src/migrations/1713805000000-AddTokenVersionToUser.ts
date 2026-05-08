import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenVersionToUser implements MigrationInterface {
  name = 'AddTokenVersionToUser1713805000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tokenVersion" integer DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "tokenVersion"`,
    );
  }
}
