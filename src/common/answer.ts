// From https://fettblog.eu/typescript-array-includes/
// see https://github.com/microsoft/TypeScript/issues/26255 for why this is needed
export function includes<T extends U, U>(coll: ReadonlyArray<T>, el: U): el is T {
    return coll.includes(el as T);
}

export type Answer = Partial<
    WhereDoYouLive & NationalInsuranceNumberKnown & NationalInsuranceNumber & PensionProviders & TellCivilServicePension
>;

export type BooleanQuestion<T extends string> = { [key in T]: 'yes' | 'no' };

export type WhereDoYouLive = { 'where-do-you-live': 'england' | 'scotland' | 'wales' | 'northern-ireland' };
export type TellCivilServicePension = BooleanQuestion<'tell-civil-service-pension'>;
export type PensionProviders = { 'pension-providers': 'croydon' | 'sutton' };
export type NationalInsuranceNumberKnown = BooleanQuestion<'national-insurance-number-known'>;
export type NationalInsuranceNumber = { 'national-insurance-number': string };
