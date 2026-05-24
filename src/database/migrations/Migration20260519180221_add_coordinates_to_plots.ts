import { Migration } from '@mikro-orm/migrations';

export class Migration20260519180221_add_coordinates_to_plots extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`alter table "plots" add "latitude" numeric(9,6) null,
    add "longitude" numeric(9,6) null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "plots" drop column "latitude",
    drop column "longitude";`);
  }
}
