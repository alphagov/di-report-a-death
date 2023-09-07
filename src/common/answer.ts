// From https://fettblog.eu/typescript-array-includes/
// see https://github.com/microsoft/TypeScript/issues/26255 for why this is needed
export function includes<T extends U, U>(coll: ReadonlyArray<T>, el: U): el is T {
    return coll.includes(el as T);
}

export type Answer = Partial<
    NationalInsuranceNumberKnown & NationalInsuranceNumber & PensionProviders & OtherPensionProviders
>;

export type BooleanQuestion<T extends string> = { [key in T]: 'yes' | 'no' };

export type PensionProviders = { 'pension-providers': 'croydon' | 'sutton' };
export type NationalInsuranceNumberKnown = BooleanQuestion<'national-insurance-number-known'>;
export type NationalInsuranceNumber = { 'national-insurance-number': string };
export type OtherPensionProviders = { 'other-pension-providers': string[] };

export const otherPensionProviderOptions = ['civil', 'armed', 'armed-compensation', 'war', 'none'];

export const OtherPensionProvidersMap: { [index: string]: string } = {
    war: 'War Pensions Scheme',
    armed: 'Armed Forces Pension Scheme',
    civil: 'Civil Service Pension Scheme',
    'armed-compensation': 'Armed Forces Compensation Scheme',
    none: 'None',
};
