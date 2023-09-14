// From https://fettblog.eu/typescript-array-includes/
// see https://github.com/microsoft/TypeScript/issues/26255 for why this is needed
export function includes<T extends U, U>(coll: ReadonlyArray<T>, el: U): el is T {
    return coll.includes(el as T);
}

export type BooleanQuestion<T extends string> = { [key in T]: 'yes' | 'no' };
export enum OtherPensionProviderOptions {
    civil = 'civil',
    armed = 'armed',
    compensation = 'compensation',
    war = 'war',
}
export const OtherPensionProvidersMap: { [k in OtherPensionProviderOptions]: string } = {
    civil: 'Civil Service Pension Scheme',
    armed: 'Armed Forces Pension Scheme',
    compensation: 'Armed Forces Compensation Scheme',
    war: 'War Pensions Scheme (compensation scheme for veterans for injuries or illnesses pre 2005)',
};
export type PensionProviders = { 'pension-providers': 'croydon' | 'sutton' };
export type NationalInsuranceNumberKnown = BooleanQuestion<'national-insurance-number-known'>;
export type NationalInsuranceNumber = { 'national-insurance-number': string };
export type OtherPensionProviders = { 'other-pension-providers': OtherPensionProviderOptions[] };

export type Answer = Partial<
    NationalInsuranceNumberKnown & NationalInsuranceNumber & PensionProviders & OtherPensionProviders
>;
