import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingColumns1700000000000 implements MigrationInterface {
  name = 'AddMissingColumns1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripeCustomerId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deletionRequestedAt" TIMESTAMP`,
    );

    // System configs - invoice customization
    await queryRunner.query(
      `ALTER TABLE "system_configs" ADD COLUMN IF NOT EXISTS "invoiceLogo" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_configs" ADD COLUMN IF NOT EXISTS "invoiceCompanyName" character varying DEFAULT 'Oftisoft'`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_configs" ADD COLUMN IF NOT EXISTS "invoiceEmail" character varying DEFAULT 'support@oftisoft.com'`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_configs" ADD COLUMN IF NOT EXISTS "invoiceAddress" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_configs" ADD COLUMN IF NOT EXISTS "invoiceFooter" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_configs" ADD COLUMN IF NOT EXISTS "invoiceAccentColor" character varying DEFAULT '#6366f1'`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_configs" ADD COLUMN IF NOT EXISTS "invoiceHeaderBg" character varying DEFAULT '#0f172a'`,
    );

    // Leads table
    await queryRunner.query(
      `ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "companyName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "website" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "partnerType" character varying`,
    );

    // Device tokens table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "device_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "token" character varying NOT NULL,
        "platform" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid,
        CONSTRAINT "PK_device_tokens" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "device_tokens" ADD CONSTRAINT "FK_device_tokens_user"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "stripeCustomerId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deletionRequestedAt"`);
    await queryRunner.query(`ALTER TABLE "system_configs" DROP COLUMN "invoiceLogo"`);
    await queryRunner.query(`ALTER TABLE "system_configs" DROP COLUMN "invoiceCompanyName"`);
    await queryRunner.query(`ALTER TABLE "system_configs" DROP COLUMN "invoiceEmail"`);
    await queryRunner.query(`ALTER TABLE "system_configs" DROP COLUMN "invoiceAddress"`);
    await queryRunner.query(`ALTER TABLE "system_configs" DROP COLUMN "invoiceFooter"`);
    await queryRunner.query(`ALTER TABLE "system_configs" DROP COLUMN "invoiceAccentColor"`);
    await queryRunner.query(`ALTER TABLE "system_configs" DROP COLUMN "invoiceHeaderBg"`);
    await queryRunner.query(`ALTER TABLE "leads" DROP COLUMN "companyName"`);
    await queryRunner.query(`ALTER TABLE "leads" DROP COLUMN "website"`);
    await queryRunner.query(`ALTER TABLE "leads" DROP COLUMN "partnerType"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "device_tokens"`);
  }
}
