import { Migration } from '@mikro-orm/migrations';

export class Migration20260426200845_add_subplot_to_bundlings extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`alter table "bundlings" add column "sub_plot_id" uuid null;`);

    this.addSql(`alter table "bundlings" add constraint "bundlings_sub_plot_id_foreign"
      foreign key ("sub_plot_id") references "sub_plots" ("id") on delete set null;`);

    this.addSql(`create index "bundlings_sub_plot_id_idx" on "bundlings" ("sub_plot_id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "bundlings" drop constraint "bundlings_sub_plot_id_foreign";`);
    this.addSql(`drop index "bundlings_sub_plot_id_idx";`);
    this.addSql(`alter table "bundlings" drop column "sub_plot_id";`);
  }
}
