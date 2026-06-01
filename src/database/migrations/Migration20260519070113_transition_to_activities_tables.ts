import { Migration } from '@mikro-orm/migrations';

export class Migration20260519070113_transition_to_activities_tables extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`create table "crop_types" ("id" uuid not null,
    "key" varchar(100) not null,
    "label" varchar(200) not null,
    "lifecycle_type" text not null,
    "is_active" boolean not null default true,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    primary key ("id"));`);
    this.addSql(
      `alter table "crop_types" add constraint "crop_types_key_unique" unique ("key");`,
    );

    this.addSql(`create table "task_types" ("id" uuid not null,
    "key" varchar(100) not null,
    "label" varchar(200) not null,
    "is_active" boolean not null default true,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    primary key ("id"));`);
    this.addSql(
      `alter table "task_types" add constraint "task_types_key_unique" unique ("key");`,
    );

    this
      .addSql(`create table "crop_type_task_type" ("task_type_id" uuid not null,
    "crop_type_id" uuid not null,
    primary key ("task_type_id",
    "crop_type_id"));`);

    this.addSql(`create table "task_type_detail_schemas" ("id" uuid not null,
    "task_type_id" uuid not null,
    "detail_key" varchar(100) not null,
    "label" varchar(200) not null,
    "value_type" text not null,
    "is_required" boolean not null default true,
    "enum_options" jsonb null,
    "validation_rules" jsonb null,
    "sort_order" int not null default 0,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    primary key ("id"));`);
    this
      .addSql(`create index "task_type_detail_schemas_task_type_id_detail_key_index" on "task_type_detail_schemas" ("task_type_id",
    "detail_key");`);

    this.addSql(`create table "field_tasks" ("id" uuid not null,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    "deleted_at" timestamptz null,
    "plot_id" uuid not null,
    "sub_plot_id" uuid null,
    "task_type_id" uuid not null,
    "performed_at" timestamptz not null,
    "performed_by_user_id" uuid not null,
    "area_covered_ha" numeric(8,4) null,
    "cost" numeric(10,2) null,
    "notes" text null,
    "local_uuid" varchar(36) null,
    "synced_at" timestamptz null,
    primary key ("id"));`);
    this.addSql(
      `alter table "field_tasks" add constraint "field_tasks_local_uuid_unique" unique ("local_uuid");`,
    );

    this.addSql(`create table "field_task_details" ("id" uuid not null,
    "field_task_id" uuid not null,
    "detail_key" varchar(100) not null,
    "value_text" text null,
    "value_numeric" numeric(15,6) null,
    "value_date" timestamptz null,
    "value_boolean" boolean null,
    "created_at" timestamptz not null,
    primary key ("id"));`);
    this
      .addSql(`create index "field_task_details_field_task_id_detail_key_index" on "field_task_details" ("field_task_id",
    "detail_key");`);

    this
      .addSql(`alter table "crop_types" add constraint "crop_types_lifecycle_type_check" check ("lifecycle_type" in ('continuous_perennial',
    'determinate_annual',
    'seasonal_perennial'));`);

    this.addSql(
      `alter table "crop_type_task_type" add constraint "crop_type_task_type_task_type_id_foreign" foreign key ("task_type_id") references "task_types" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "crop_type_task_type" add constraint "crop_type_task_type_crop_type_id_foreign" foreign key ("crop_type_id") references "crop_types" ("id") on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table "task_type_detail_schemas" add constraint "task_type_detail_schemas_task_type_id_foreign" foreign key ("task_type_id") references "task_types" ("id") on delete cascade;`,
    );
    this
      .addSql(`alter table "task_type_detail_schemas" add constraint "task_type_detail_schemas_value_type_check" check ("value_type" in ('text',
    'numeric',
    'date',
    'boolean',
    'enum'));`);

    this.addSql(
      `alter table "field_tasks" add constraint "field_tasks_plot_id_foreign" foreign key ("plot_id") references "plots" ("id") on delete cascade;`,
    );
    this.addSql(
      `alter table "field_tasks" add constraint "field_tasks_sub_plot_id_foreign" foreign key ("sub_plot_id") references "sub_plots" ("id") on delete set null;`,
    );
    this.addSql(
      `alter table "field_tasks" add constraint "field_tasks_task_type_id_foreign" foreign key ("task_type_id") references "task_types" ("id") on delete restrict;`,
    );
    this.addSql(
      `alter table "field_tasks" add constraint "field_tasks_performed_by_user_id_foreign" foreign key ("performed_by_user_id") references "users" ("id") on delete cascade;`,
    );

    this.addSql(
      `alter table "field_task_details" add constraint "field_task_details_field_task_id_foreign" foreign key ("field_task_id") references "field_tasks" ("id") on delete cascade;`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(
      `alter table "crop_type_task_type" drop constraint "crop_type_task_type_crop_type_id_foreign";`,
    );
    this.addSql(
      `alter table "crop_type_task_type" drop constraint "crop_type_task_type_task_type_id_foreign";`,
    );
    this.addSql(
      `alter table "task_type_detail_schemas" drop constraint "task_type_detail_schemas_task_type_id_foreign";`,
    );
    this.addSql(
      `alter table "field_tasks" drop constraint "field_tasks_task_type_id_foreign";`,
    );
    this.addSql(
      `alter table "field_task_details" drop constraint "field_task_details_field_task_id_foreign";`,
    );
  }
}
