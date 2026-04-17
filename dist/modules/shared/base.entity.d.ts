export declare const BaseProperties: {
    id: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, Omit<import("@mikro-orm/core").EmptyOptions, "primary"> & {
        primary: true;
    } & {
        onCreate: (...args: any[]) => any;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    createdAt: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<Date, import("@mikro-orm/core").EmptyOptions & {
        onCreate: (...args: any[]) => any;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    updatedAt: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<Date, import("@mikro-orm/core").EmptyOptions & {
        onCreate: (...args: any[]) => any;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    deletedAt: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<Date, Omit<import("@mikro-orm/core").EmptyOptions, "nullable"> & {
        nullable: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
};
