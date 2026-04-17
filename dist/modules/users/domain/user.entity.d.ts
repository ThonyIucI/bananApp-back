declare const UserSchema: import("@mikro-orm/core").EntitySchemaWithMeta<"User", string, import("@mikro-orm/core").InferEntityFromProperties<{
    readonly firstName: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, import("@mikro-orm/core").EmptyOptions, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly lastName: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, import("@mikro-orm/core").EmptyOptions, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly email: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, import("@mikro-orm/core").EmptyOptions, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly passwordHash: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, Omit<import("@mikro-orm/core").EmptyOptions, "hidden"> & {
        hidden: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly dni: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, Omit<import("@mikro-orm/core").EmptyOptions, "nullable"> & {
        nullable: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly isActive: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<NonNullable<boolean | null | undefined>, Omit<import("@mikro-orm/core").EmptyOptions, "default"> & {
        default: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly isSuperadmin: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<NonNullable<boolean | null | undefined>, Omit<import("@mikro-orm/core").EmptyOptions, "default"> & {
        default: false;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly mustChangePassword: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<NonNullable<boolean | null | undefined>, Omit<import("@mikro-orm/core").EmptyOptions, "default"> & {
        default: false;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly failedLoginAttempts: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<number, Omit<import("@mikro-orm/core").EmptyOptions, "default"> & {
        default: 0;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly lockedUntil: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<Date, Omit<import("@mikro-orm/core").EmptyOptions, "nullable"> & {
        nullable: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly lastLoginAt: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<Date, Omit<import("@mikro-orm/core").EmptyOptions, "nullable"> & {
        nullable: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly id: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, Omit<import("@mikro-orm/core").EmptyOptions, "primary"> & {
        primary: true;
    } & {
        onCreate: (...args: any[]) => any;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly createdAt: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<Date, import("@mikro-orm/core").EmptyOptions & {
        onCreate: (...args: any[]) => any;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly updatedAt: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<Date, import("@mikro-orm/core").EmptyOptions & {
        onCreate: (...args: any[]) => any;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly deletedAt: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<Date, Omit<import("@mikro-orm/core").EmptyOptions, "nullable"> & {
        nullable: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
}, undefined, never, never, false>, never, {
    readonly firstName: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, import("@mikro-orm/core").EmptyOptions, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly lastName: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, import("@mikro-orm/core").EmptyOptions, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly email: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, import("@mikro-orm/core").EmptyOptions, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly passwordHash: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, Omit<import("@mikro-orm/core").EmptyOptions, "hidden"> & {
        hidden: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly dni: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, Omit<import("@mikro-orm/core").EmptyOptions, "nullable"> & {
        nullable: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly isActive: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<NonNullable<boolean | null | undefined>, Omit<import("@mikro-orm/core").EmptyOptions, "default"> & {
        default: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly isSuperadmin: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<NonNullable<boolean | null | undefined>, Omit<import("@mikro-orm/core").EmptyOptions, "default"> & {
        default: false;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly mustChangePassword: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<NonNullable<boolean | null | undefined>, Omit<import("@mikro-orm/core").EmptyOptions, "default"> & {
        default: false;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly failedLoginAttempts: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<number, Omit<import("@mikro-orm/core").EmptyOptions, "default"> & {
        default: 0;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly lockedUntil: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<Date, Omit<import("@mikro-orm/core").EmptyOptions, "nullable"> & {
        nullable: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly lastLoginAt: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<Date, Omit<import("@mikro-orm/core").EmptyOptions, "nullable"> & {
        nullable: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly id: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, Omit<import("@mikro-orm/core").EmptyOptions, "primary"> & {
        primary: true;
    } & {
        onCreate: (...args: any[]) => any;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly createdAt: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<Date, import("@mikro-orm/core").EmptyOptions & {
        onCreate: (...args: any[]) => any;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly updatedAt: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<Date, import("@mikro-orm/core").EmptyOptions & {
        onCreate: (...args: any[]) => any;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly deletedAt: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<Date, Omit<import("@mikro-orm/core").EmptyOptions, "nullable"> & {
        nullable: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
}, import("@mikro-orm/core").EntityCtor<import("@mikro-orm/core").InferEntityFromProperties<{
    readonly firstName: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, import("@mikro-orm/core").EmptyOptions, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly lastName: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, import("@mikro-orm/core").EmptyOptions, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly email: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, import("@mikro-orm/core").EmptyOptions, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly passwordHash: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, Omit<import("@mikro-orm/core").EmptyOptions, "hidden"> & {
        hidden: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly dni: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, Omit<import("@mikro-orm/core").EmptyOptions, "nullable"> & {
        nullable: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly isActive: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<NonNullable<boolean | null | undefined>, Omit<import("@mikro-orm/core").EmptyOptions, "default"> & {
        default: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly isSuperadmin: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<NonNullable<boolean | null | undefined>, Omit<import("@mikro-orm/core").EmptyOptions, "default"> & {
        default: false;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly mustChangePassword: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<NonNullable<boolean | null | undefined>, Omit<import("@mikro-orm/core").EmptyOptions, "default"> & {
        default: false;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly failedLoginAttempts: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<number, Omit<import("@mikro-orm/core").EmptyOptions, "default"> & {
        default: 0;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly lockedUntil: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<Date, Omit<import("@mikro-orm/core").EmptyOptions, "nullable"> & {
        nullable: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly lastLoginAt: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<Date, Omit<import("@mikro-orm/core").EmptyOptions, "nullable"> & {
        nullable: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly id: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<string, Omit<import("@mikro-orm/core").EmptyOptions, "primary"> & {
        primary: true;
    } & {
        onCreate: (...args: any[]) => any;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly createdAt: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<Date, import("@mikro-orm/core").EmptyOptions & {
        onCreate: (...args: any[]) => any;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly updatedAt: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<Date, import("@mikro-orm/core").EmptyOptions & {
        onCreate: (...args: any[]) => any;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
    readonly deletedAt: Pick<import("@mikro-orm/core").UniversalPropertyOptionsBuilder<Date, Omit<import("@mikro-orm/core").EmptyOptions, "nullable"> & {
        nullable: true;
    }, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>, keyof import("@mikro-orm/core").PropertyOptions<any> | ("~options" | "~type" | "$type" | "strictNullable")>;
}, undefined, never, never, false>>>;
export declare class User extends UserSchema.class {
    static make(props: {
        firstName: string;
        lastName: string;
        email: string;
        passwordHash: string;
        dni?: string;
    }): User;
    set(props: {
        firstName?: string;
        lastName?: string;
        email?: string;
        dni?: string;
        isActive?: boolean;
        mustChangePassword?: boolean;
    }): void;
    get fullName(): string;
    isLocked(): boolean;
    recordFailedLogin(maxAttempts?: number, lockMinutes?: number): void;
    recordSuccessfulLogin(): void;
    private validate;
}
export {};
