import { Migration } from '@mikro-orm/migrations';

export class Migration20260425212805_create_users_table extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`create table "users" ("id" uuid not null,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    "deleted_at" timestamptz null,
    "first_name" varchar(100) not null,
    "last_name" varchar(100) not null,
    "email" varchar(150) not null,
    "password_hash" varchar(255) not null,
    "dni" varchar(8) null,
    "is_active" boolean not null default true,
    "is_superadmin" boolean not null default false,
    "must_change_password" boolean not null default false,
    "failed_login_attempts" int not null default 0,
    "locked_until" timestamptz null,
    "last_login_at" timestamptz null,
    primary key ("id"));`);

    this.addSql(
      `alter table "users" add constraint "users_email_unique" unique ("email");`,
    );
  }
}
