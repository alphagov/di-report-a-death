// From https://fettblog.eu/typescript-array-includes/
// see https://github.com/microsoft/TypeScript/issues/26255 for why this is needed
export function includes<T extends U, U>(coll: ReadonlyArray<T>, el: U): el is T {
    return coll.includes(el as T);
}

export type Answer = Partial<WhereDoYouLive & TestQuestion>;

export type WhereDoYouLive = { 'where-do-you-live': 'england' | 'scotland' | 'wales' | 'northern-ireland' };

export type TestQuestion = { 'test-question': 'test-answer' };
