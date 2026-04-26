import { Migration } from '@mikro-orm/migrations';

export class Migration20260425213537_create_bundlings_table extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`create table "ribbon_calendars" ("id" uuid not null,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    "deleted_at" timestamptz null,
    "cooperative_id" uuid not null,
    "year" int not null,
    "start_color_index" int not null default 0,
    primary key ("id"));`);

    this.addSql(`create table "bundlings" ("id" uuid not null,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    "deleted_at" timestamptz null,
    "plot_id" uuid not null,
    "enfundador_user_id" uuid not null,
    "quantity" int not null,
    "ribbon_calendar_id" uuid null,
    "ribbon_color_free" varchar(50) null,
    "bundled_at" timestamptz not null,
    "notes" varchar(500) null,
    "local_uuid" uuid not null,
    "synced_at" timestamptz null,
    primary key ("id"));`);
    this.addSql(
      `alter table "bundlings" add constraint "bundlings_local_uuid_unique" unique ("local_uuid");`,
    );

    this.addSql(
      `alter table "ribbon_calendars" add constraint "ribbon_calendars_cooperative_id_foreign" foreign key ("cooperative_id") references "cooperatives" ("id") on delete cascade;`,
    );

    this.addSql(
      `alter table "bundlings" add constraint "bundlings_plot_id_foreign" foreign key ("plot_id") references "plots" ("id") on delete cascade;`,
    );
    this.addSql(
      `alter table "bundlings" add constraint "bundlings_enfundador_user_id_foreign" foreign key ("enfundador_user_id") references "users" ("id") on delete cascade;`,
    );
    this.addSql(
      `alter table "bundlings" add constraint "bundlings_ribbon_calendar_id_foreign" foreign key ("ribbon_calendar_id") references "ribbon_calendars" ("id") on delete set null;`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(
      `alter table "bundlings" drop constraint "bundlings_ribbon_calendar_id_foreign";`,
    );
  }
}
