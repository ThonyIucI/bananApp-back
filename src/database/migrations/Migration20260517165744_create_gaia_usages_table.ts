import { Migration } from '@mikro-orm/migrations';

export class Migration20260517165744_create_gaia_usages_table extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`create table "gaia_usages" ("id" uuid not null,
    "user_id" uuid not null,
    "usage_date" varchar(10) not null,
    "interaction_count" int not null default 0,
    "token_estimate" int null,
    primary key ("id"));`);
    this
      .addSql(`create index "gaia_usages_user_id_usage_date_index" on "gaia_usages" ("user_id",
    "usage_date");`);

    this.addSql(
      `alter table "gaia_usages" add constraint "gaia_usages_user_id_foreign" foreign key ("user_id") references "users" ("id") on delete cascade;`,
    );

    this.addSql(
      `alter table "user_roles" alter column "id" type text using ("id"::text);`,
    );
    this.addSql(
      `alter table "user_roles" drop constraint "user_roles_role_id_foreign";`,
    );
    this.addSql(
      `alter table "user_roles" drop constraint "user_roles_user_id_foreign";`,
    );

    this.addSql(
      `alter table "users" add "subscription_tier" text not null default 'free';`,
    );
    this
      .addSql(`alter table "users" add constraint "users_subscription_tier_check" check ("subscription_tier" in ('free',
    'pro',
    'promax'));`);

    this.addSql(`drop index "bundlings_sub_plot_id_idx";`);

    this.addSql(
      `alter table "user_roles" drop constraint "user_roles_user_id_role_id_unique";`,
    );
    this.addSql(`alter table "user_roles" drop column "created_at",
    drop column "updated_at",
    drop column "deleted_at";`);
    this.addSql(
      `alter table "user_roles" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "user_roles" add constraint "user_roles_role_id_foreign" foreign key ("role_id") references "roles" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "user_roles" add constraint "user_roles_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "user_roles" alter column "id" drop default;`);
    this.addSql(
      `alter table "user_roles" drop constraint "user_roles_user_id_foreign";`,
    );
    this.addSql(
      `alter table "user_roles" drop constraint "user_roles_role_id_foreign";`,
    );

    this.addSql(
      `create index "bundlings_sub_plot_id_idx" on "bundlings" ("sub_plot_id");`,
    );

    this
      .addSql(`alter table "user_roles" add "created_at" timestamptz(6) not null,
    add "updated_at" timestamptz(6) not null,
    add "deleted_at" timestamptz(6) null;`);
    this.addSql(
      `alter table "user_roles" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "user_roles" add constraint "user_roles_user_id_foreign" foreign key ("user_id") references "users" ("id") on update no action on delete cascade;`,
    );
    this.addSql(
      `alter table "user_roles" add constraint "user_roles_role_id_foreign" foreign key ("role_id") references "roles" ("id") on update no action on delete cascade;`,
    );
    this
      .addSql(`alter table "user_roles" add constraint "user_roles_user_id_role_id_unique" unique ("user_id",
    "role_id");`);

    this.addSql(
      `alter table "users" drop constraint "users_subscription_tier_check";`,
    );
    this.addSql(`alter table "users" drop column "subscription_tier";`);
  }
}
