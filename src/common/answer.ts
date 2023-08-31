// From https://fettblog.eu/typescript-array-includes/
// see https://github.com/microsoft/TypeScript/issues/26255 for why this is needed
export function includes<T extends U, U>(coll: ReadonlyArray<T>, el: U): el is T {
    return coll.includes(el as T);
}

export type Answer = Partial<WhereDoYouLive & Nino & PensionProviders & TellCivilServicePension>;

export type WhereDoYouLive = { 'where-do-you-live': 'england' | 'scotland' | 'wales' | 'northern-ireland' };
export type TellCivilServicePension = { 'tell-civil-service-pension': 'yes' | 'no'};
export type PensionProviders = { 'pension-providers': 'croydon' | 'sutton'};
export type Nino = { 'nino': string};

