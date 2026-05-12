import { Migration } from '@mikro-orm/migrations';

export class Migration20260505020014_create_table_email_verifications extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`create table "email_verification_codes" ("id" uuid not null,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    "deleted_at" timestamptz null,
    "user_id" uuid not null,
    "code_hash" varchar(64) not null,
    "expires_at" timestamptz not null,
    "used_at" timestamptz null,
    primary key ("id"));`);

    this.addSql(`create table "user_roles" ("id" uuid not null,
    "created_at" timestamptz not null,
    "updated_at" timestamptz not null,
    "deleted_at" timestamptz null,
    "user_id" uuid not null,
    "role_id" uuid not null,
    primary key ("id"));`);
    this
      .addSql(`alter table "user_roles" add constraint "user_roles_user_id_role_id_unique" unique ("user_id",
    "role_id");`);

    this.addSql(
      `alter table "email_verification_codes" add constraint "email_verification_codes_user_id_foreign" foreign key ("user_id") references "users" ("id") on delete cascade;`,
    );

    this.addSql(
      `alter table "user_roles" add constraint "user_roles_user_id_foreign" foreign key ("user_id") references "users" ("id") on delete cascade;`,
    );
    this.addSql(
      `alter table "user_roles" add constraint "user_roles_role_id_foreign" foreign key ("role_id") references "roles" ("id") on delete cascade;`,
    );

    this.addSql(`alter table "users" add "email_verified_at" timestamptz null,
    add "google_id" varchar(100) null,
    add "avatar_url" varchar(500) null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`create schema if not exists "extensions";`);
    this.addSql(`alter table "users" drop column "email_verified_at",
    drop column "google_id",
    drop column "avatar_url";`);

    this
      .addSql(`create view "extensions"."pg_stat_statements_info" as SELECT dealloc,
    stats_reset
   FROM pg_stat_statements_info() pg_stat_statements_info(dealloc,
    stats_reset);`);

    this.addSql(`create view "extensions"."pg_stat_statements" as SELECT userid,
    dbid,
    toplevel,
    queryid,
    query,
    plans,
    total_plan_time,
    min_plan_time,
    max_plan_time,
    mean_plan_time,
    stddev_plan_time,
    calls,
    total_exec_time,
    min_exec_time,
    max_exec_time,
    mean_exec_time,
    stddev_exec_time,
    rows,
    shared_blks_hit,
    shared_blks_read,
    shared_blks_dirtied,
    shared_blks_written,
    local_blks_hit,
    local_blks_read,
    local_blks_dirtied,
    local_blks_written,
    temp_blks_read,
    temp_blks_written,
    shared_blk_read_time,
    shared_blk_write_time,
    local_blk_read_time,
    local_blk_write_time,
    temp_blk_read_time,
    temp_blk_write_time,
    wal_records,
    wal_fpi,
    wal_bytes,
    jit_functions,
    jit_generation_time,
    jit_inlining_count,
    jit_inlining_time,
    jit_optimization_count,
    jit_optimization_time,
    jit_emission_count,
    jit_emission_time,
    jit_deform_count,
    jit_deform_time,
    stats_since,
    minmax_stats_since
   FROM pg_stat_statements(true) pg_stat_statements(userid,
    dbid,
    toplevel,
    queryid,
    query,
    plans,
    total_plan_time,
    min_plan_time,
    max_plan_time,
    mean_plan_time,
    stddev_plan_time,
    calls,
    total_exec_time,
    min_exec_time,
    max_exec_time,
    mean_exec_time,
    stddev_exec_time,
    rows,
    shared_blks_hit,
    shared_blks_read,
    shared_blks_dirtied,
    shared_blks_written,
    local_blks_hit,
    local_blks_read,
    local_blks_dirtied,
    local_blks_written,
    temp_blks_read,
    temp_blks_written,
    shared_blk_read_time,
    shared_blk_write_time,
    local_blk_read_time,
    local_blk_write_time,
    temp_blk_read_time,
    temp_blk_write_time,
    wal_records,
    wal_fpi,
    wal_bytes,
    jit_functions,
    jit_generation_time,
    jit_inlining_count,
    jit_inlining_time,
    jit_optimization_count,
    jit_optimization_time,
    jit_emission_count,
    jit_emission_time,
    jit_deform_count,
    jit_deform_time,
    stats_since,
    minmax_stats_since);`);
  }
}
