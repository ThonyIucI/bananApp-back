import { Migration } from '@mikro-orm/migrations';

export class Migration20260425212920_create_cooperatives_table extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`create table "cooperatives" ("id" uuid not null,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    "deleted_at" timestamptz null,
    "name" varchar(200) not null,
    "ruc" varchar(11) not null,
    "address" varchar(300) null,
    "department" varchar(100) null,
    "province" varchar(100) null,
    "district" varchar(100) null,
    "is_active" boolean not null default true,
    primary key ("id"));`);
    this.addSql(
      `alter table "cooperatives" add constraint "cooperatives_ruc_unique" unique ("ruc");`,
    );
  }
}
