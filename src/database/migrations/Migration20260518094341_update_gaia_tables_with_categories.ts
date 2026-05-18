import { Migration } from '@mikro-orm/migrations';

export class Migration20260518094341_update_gaia_tables_with_categories extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table "gaia_queries" add "input_mode" text not null default 'text';`);
    this.addSql(`create index "gaia_queries_input_mode_index" on "gaia_queries" ("input_mode");`);
    this.addSql(`alter table "gaia_queries" add constraint "gaia_queries_input_mode_check" check ("input_mode" in ('text',
    'voice'));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop index "gaia_queries_input_mode_index";`);
    this.addSql(`alter table "gaia_queries" drop constraint "gaia_queries_input_mode_check";`);
    this.addSql(`alter table "gaia_queries" drop column "input_mode";`);
  }

}
