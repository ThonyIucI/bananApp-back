import { Migration } from '@mikro-orm/migrations';

export class Migration20260425213153_create_user_relations_table extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`create table "role_permission" ("id" uuid not null,
    "role_id" uuid not null,
    "permission_id" uuid not null,
    primary key ("id"));`);
    this
      .addSql(`alter table "role_permission" add constraint "role_permission_role_id_permission_id_unique" unique ("role_id",
    "permission_id");`);

    this.addSql(`create table "user_cooperative" ("id" uuid not null,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    "deleted_at" timestamptz null,
    "user_id" uuid not null,
    "cooperative_id" uuid not null,
    "member_code" varchar(20) null,
    "is_active" boolean not null default true,
    primary key ("id"));`);
    this
      .addSql(`alter table "user_cooperative" add constraint "user_cooperative_user_id_cooperative_id_unique" unique ("user_id",
    "cooperative_id");`);

    this.addSql(`create table "user_cooperative_role" ("id" uuid not null,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    "deleted_at" timestamptz null,
    "user_cooperative_id" uuid not null,
    "role_id" uuid not null,
    primary key ("id"));`);
    this
      .addSql(`alter table "user_cooperative_role" add constraint "user_cooperative_role_user_cooperative_id_role_id_unique" unique ("user_cooperative_id",
    "role_id");`);

    this.addSql(
      `alter table "role_permission" add constraint "role_permission_role_id_foreign" foreign key ("role_id") references "roles" ("id") on delete cascade;`,
    );
    this.addSql(
      `alter table "role_permission" add constraint "role_permission_permission_id_foreign" foreign key ("permission_id") references "permissions" ("id") on delete cascade;`,
    );

    this.addSql(
      `alter table "user_cooperative" add constraint "user_cooperative_user_id_foreign" foreign key ("user_id") references "users" ("id") on delete cascade;`,
    );
    this.addSql(
      `alter table "user_cooperative" add constraint "user_cooperative_cooperative_id_foreign" foreign key ("cooperative_id") references "cooperatives" ("id") on delete cascade;`,
    );

    this.addSql(
      `alter table "user_cooperative_role" add constraint "user_cooperative_role_user_cooperative_id_foreign" foreign key ("user_cooperative_id") references "user_cooperative" ("id") on delete cascade;`,
    );
    this.addSql(
      `alter table "user_cooperative_role" add constraint "user_cooperative_role_role_id_foreign" foreign key ("role_id") references "roles" ("id") on delete cascade;`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(
      `alter table "user_cooperative_role" drop constraint "user_cooperative_role_user_cooperative_id_foreign";`,
    );
  }
}
