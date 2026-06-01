import { Migration } from '@mikro-orm/migrations';

export class Migration20260524220340_update_plot_with_crop_type extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`alter table "plots" add "crop_type_id" uuid null;`);
    this.addSql(
      `alter table "plots" add constraint "plots_crop_type_id_foreign" foreign key ("crop_type_id") references "crop_types" ("id") on delete restrict;`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(
      `alter table "plots" drop constraint "plots_crop_type_id_foreign";`,
    );
    this.addSql(`alter table "plots" drop column "crop_type_id";`);
  }
}
