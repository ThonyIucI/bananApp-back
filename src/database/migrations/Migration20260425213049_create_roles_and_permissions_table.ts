import { Migration } from '@mikro-orm/migrations';

export class Migration20260425213049_create_roles_and_permissions_table extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`create table "permissions" ("id" uuid not null,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    "deleted_at" timestamptz null,
    "key" varchar(100) not null,
    "description" varchar(300) null,
    primary key ("id"));`);
    this.addSql(
      `alter table "permissions" add constraint "permissions_key_unique" unique ("key");`,
    );

    this.addSql(`create table "roles" ("id" uuid not null,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    "deleted_at" timestamptz null,
    "key" varchar(50) not null,
    "name" varchar(100) not null,
    "description" varchar(300) null,
    primary key ("id"));`);
    this.addSql(
      `alter table "roles" add constraint "roles_key_unique" unique ("key");`,
    );
    this.addSql(
      `alter table "roles" add constraint "roles_name_unique" unique ("name");`,
    );
  }
}
