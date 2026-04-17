export declare class PhoneNumberVO {
    readonly callingCode: string;
    readonly number: string;
    private constructor();
    static create(callingCode: string, number: string): PhoneNumberVO;
    full(): string;
}
