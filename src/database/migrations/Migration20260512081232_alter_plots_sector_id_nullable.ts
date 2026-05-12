import { Migration } from '@mikro-orm/migrations';

export class Migration20260512081232_alter_plots_sector_id_nullable extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`alter table "plots" drop constraint "plots_sector_id_foreign";`);
    this.addSql(`alter table "plots" alter column "sector_id" drop not null;`);
    this.addSql(
      `alter table "plots" add constraint "plots_sector_id_foreign" foreign key ("sector_id") references "sectors" ("id") on delete set null;`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "plots" drop constraint "plots_sector_id_foreign";`);
    this.addSql(`alter table "plots" alter column "sector_id" set not null;`);
    this.addSql(
      `alter table "plots" add constraint "plots_sector_id_foreign" foreign key ("sector_id") references "sectors" ("id") on delete cascade;`,
    );
  }
}
