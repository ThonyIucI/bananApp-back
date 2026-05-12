import { Migration } from '@mikro-orm/migrations';

export class Migration20260510085129_sync_correct_tables extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`create table "registration_challenges" ("id" uuid not null,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    "deleted_at" timestamptz null,
    "email" varchar(150) not null,
    "code_hash" varchar(64) not null,
    "expires_at" timestamptz not null,
    primary key ("id"));`);
    this.addSql(
      `alter table "registration_challenges" add constraint "registration_challenges_email_unique" unique ("email");`,
    );
  }

  override down(): void | Promise<void> {}
}
