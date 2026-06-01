import { Migration } from '@mikro-orm/migrations';

export class Migration20260531192116_update_task_module extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`create table "task_type_detail_options" ("id" uuid not null,
    "detail_schema_id" uuid not null,
    "label" varchar(200) not null,
    "key" varchar(50) not null,
    "sort_order" int not null default 0,
    "is_active" boolean not null default true,
    primary key ("id"));`);
    this.addSql(
      `create index "task_type_detail_options_detail_schema_id_key_index" on "task_type_detail_options" ("detail_schema_id", "key");`,
    );

    this.addSql(
      `alter table "task_type_detail_options" add constraint "task_type_detail_options_detail_schema_id_foreign" foreign key ("detail_schema_id") references "task_type_detail_schemas" ("id") on delete cascade;`,
    );

    this.addSql(
      `alter table "task_type_detail_schemas" drop column "enum_options";`,
    );

    this.addSql(
      `alter table "field_tasks" add "labor_days" numeric(8,2) null;`,
    );

    this.addSql(`alter table "field_task_details" drop column "value_numeric",
    drop column "value_date",
    drop column "value_boolean";`);
    this.addSql(
      `alter table "field_task_details" rename column "value_text" to "value";`,
    );
  }

  override down(): void | Promise<void> {
    this
      .addSql(`alter table "field_task_details" add "value_numeric" numeric(15,6) null,
    add "value_date" timestamptz(6) null,
    add "value_boolean" bool null;`);
    this.addSql(
      `alter table "field_task_details" rename column "value" to "value_text";`,
    );

    this.addSql(`alter table "field_tasks" drop column "labor_days";`);

    this.addSql(
      `alter table "task_type_detail_schemas" add "enum_options" jsonb null;`,
    );

    this.addSql(`drop table if exists "task_type_detail_options";`);
  }
}
