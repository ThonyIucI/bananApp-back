import { Migration } from '@mikro-orm/migrations';

export class Migration20260426194145_create_user_plot_table extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "user_plot" ("id" uuid not null,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    "deleted_at" timestamptz null,
    "user_id" uuid not null,
    "plot_id" uuid not null,
    "assigned_at" timestamptz not null,
    "unassigned_at" timestamptz null,
    "notes" varchar(300) null,
    primary key ("id"));`);

    this.addSql(`alter table "user_plot" add constraint "user_plot_user_id_foreign" foreign key ("user_id") references "users" ("id") on delete cascade;`);
    this.addSql(`alter table "user_plot" add constraint "user_plot_plot_id_foreign" foreign key ("plot_id") references "plots" ("id") on delete cascade;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`create table "cooperative" ("id" uuid not null,
    "created_at" timestamptz(6) not null,
    "updated_at" timestamptz(6) not null,
    "deleted_at" timestamptz(6) null,
    "name" varchar(200) not null,
    "ruc" varchar(11) not null,
    "address" varchar(300) null,
    "department" varchar(100) null,
    "province" varchar(100) null,
    "district" varchar(100) null,
    "is_active" bool not null default true,
    primary key ("id"));`);
    this.addSql(`alter table "cooperative" add constraint "cooperative_ruc_unique" unique ("ruc");`);

    this.addSql(`create table "user" ("id" uuid not null,
    "created_at" timestamptz(6) not null,
    "updated_at" timestamptz(6) not null,
    "deleted_at" timestamptz(6) null,
    "first_name" varchar(100) not null,
    "last_name" varchar(100) not null,
    "email" varchar(150) not null,
    "password_hash" varchar(255) not null,
    "dni" varchar(8) null,
    "is_active" bool not null default true,
    "is_superadmin" bool not null default false,
    "must_change_password" bool not null default false,
    "failed_login_attempts" int4 not null default 0,
    "locked_until" timestamptz(6) null,
    "last_login_at" timestamptz(6) null,
    primary key ("id"));`);
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);
  }

}
