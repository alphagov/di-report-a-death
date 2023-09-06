import { downcaseHeaders } from '../headers';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as querystring from 'querystring';
import { ParsedUrlQuery } from 'querystring';

export interface Form {
    [key: string]: string | undefined;
}

export type FormProcessor = (form: Form) => GatewayResult;
export type GatewayResult = APIGatewayProxyResult | Promise<APIGatewayProxyResult>;

export function parseForm(
    event: APIGatewayProxyEvent,
    onSuccess: FormProcessor,
    allowedFields: string[],
): GatewayResult {
    downcaseHeaders(event);

    if ('application/x-www-form-urlencoded' !== event.headers['content-type']) {
        return {
            statusCode: 415,
            body: "Unsupported Content-Type, expected 'application/x-www-urlencoded'",
        };
    }

    const form = querystring.parse(event.body || '');
    stripEmptyFields(form);
    const singleValuedForm = formToSingleValuesOnly(form);
    return onSuccess(allowedFieldsOnly(singleValuedForm, allowedFields));
}

function stripEmptyFields(form: ParsedUrlQuery) {
    for (const key of Object.keys(form)) {
        const val = trimOrNullifyStrings(form[key]);
        if (val) {
            form[key] = val;
        } else {
            delete form[key];
        }
    }
}

function trimOrNullifyStrings(formFieldData: string | string[] | undefined): string | string[] | null {
    if (typeof formFieldData === 'string') {
        return formFieldData.trim() || null;
    } else if (Array.isArray(formFieldData)) {
        return formFieldData.map((x) => x && x.trim()).filter((x) => x);
    } else {
        return formFieldData || null;
    }
}

/**
 * If a user posts two values for the same form key, the parsed form will contain a string[]
 * at that key.
 *
 * The type system reminds us of this and will forbid using form values as strings without
 * checking for this case.
 *
 * Most of the time, all our forms expect a single value for each entry only, so this
 * gets in the way a lot.
 *
 * This function concats such values to produce a form hash with only string entries.
 */
function formToSingleValuesOnly(form: ParsedUrlQuery): Form {
    const acc: Form = {};
    for (const key in form) {
        const val = form[key];
        if (typeof val === 'object') {
            acc[key] = val.toString();
        } else {
            acc[key] = val;
        }
    }
    return acc;
}

function allowedFieldsOnly(form: Form, allowedFields: string[]): Form {
    return Object.keys(form).reduce((acc: Form, key) => {
        if (allowedFields.includes(key)) {
            acc[key] = form[key];
        }
        return acc;
    }, {});
}

export function isOrIncludes(fieldValue: Form[keyof Form], testValue: string): boolean {
    if (!fieldValue) {
        return false;
    }
    return fieldValue.includes(testValue);
}
