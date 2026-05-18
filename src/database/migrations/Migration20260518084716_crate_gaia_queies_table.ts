import { Migration } from '@mikro-orm/migrations';

export class Migration20260518084716_crate_gaia_queies_table extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "gaia_queries" ("id" uuid not null,
    "user_id" uuid not null,
    "category" text null,
    "topic" varchar(120) null,
    "summary" varchar(300) null,
    "feedback" text null,
    "feedback_at" timestamptz null,
    "created_at" timestamptz not null,
    primary key ("id"));`);
    this.addSql(`create index "gaia_queries_category_index" on "gaia_queries" ("category");`);
    this.addSql(`create index "gaia_queries_feedback_index" on "gaia_queries" ("feedback");`);
    this.addSql(`create index "gaia_queries_user_id_created_at_index" on "gaia_queries" ("user_id",
    "created_at");`);

    this.addSql(`alter table "gaia_queries" add constraint "gaia_queries_user_id_foreign" foreign key ("user_id") references "users" ("id") on delete cascade;`);
    this.addSql(`alter table "gaia_queries" add constraint "gaia_queries_category_check" check ("category" in ('FERTILIZERS',
    'FOLIAR',
    'SOIL',
    'PESTS',
    'IRRIGATION',
    'HARVEST',
    'CROP_MANAGEMENT',
    'TASK_RECORD',
    'GENERAL'));`);
    this.addSql(`alter table "gaia_queries" add constraint "gaia_queries_feedback_check" check ("feedback" in ('HELPFUL',
    'NOT_HELPFUL'));`);
  }

}
