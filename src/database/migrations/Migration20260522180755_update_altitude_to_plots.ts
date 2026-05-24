import { Migration } from '@mikro-orm/migrations';

export class Migration20260522180755_update_altitude_to_plots extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`alter table "plots" add "altitude" numeric(8,2) null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "plots" drop column "altitude";`);
  }
}
