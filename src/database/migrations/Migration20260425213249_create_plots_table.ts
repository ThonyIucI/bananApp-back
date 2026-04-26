import { Migration } from '@mikro-orm/migrations';

export class Migration20260425213249_create_user_plots_table extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`create table "plots" ("id" uuid not null,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    "deleted_at" timestamptz null,
    "name" varchar(200) not null,
    "sector_id" uuid not null,
    "owner_user_id" uuid not null,
    "worker_user_id" uuid null,
    "area_hectares" numeric(8,4) not null,
    "cadastral_code" varchar(50) null,
    primary key ("id"));`);

    this.addSql(`create table "sub_plots" ("id" uuid not null,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    "deleted_at" timestamptz null,
    "name" varchar(200) not null,
    "plot_id" uuid not null,
    "responsible_user_id" uuid null,
    "area_hectares" numeric(8,4) not null,
    primary key ("id"));`);

    this.addSql(
      `alter table "plots" add constraint "plots_sector_id_foreign" foreign key ("sector_id") references "sectors" ("id") on delete cascade;`,
    );
    this.addSql(
      `alter table "plots" add constraint "plots_owner_user_id_foreign" foreign key ("owner_user_id") references "users" ("id") on delete cascade;`,
    );
    this.addSql(
      `alter table "plots" add constraint "plots_worker_user_id_foreign" foreign key ("worker_user_id") references "users" ("id") on delete set null;`,
    );

    this.addSql(
      `alter table "sub_plots" add constraint "sub_plots_plot_id_foreign" foreign key ("plot_id") references "plots" ("id") on delete cascade;`,
    );
    this.addSql(
      `alter table "sub_plots" add constraint "sub_plots_responsible_user_id_foreign" foreign key ("responsible_user_id") references "users" ("id") on delete set null;`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(
      `alter table "sub_plots" drop constraint "sub_plots_plot_id_foreign";`,
    );
  }
}
