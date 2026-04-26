import { Migration } from '@mikro-orm/migrations';

export class Migration20260425213214_create_sectors_table extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`create table "sectors" ("id" uuid not null,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    "deleted_at" timestamptz null,
    "name" varchar(100) not null,
    "cooperative_id" uuid not null,
    primary key ("id"));`);

    this.addSql(
      `alter table "sectors" add constraint "sectors_cooperative_id_foreign" foreign key ("cooperative_id") references "cooperatives" ("id") on delete cascade;`,
    );
  }
}
