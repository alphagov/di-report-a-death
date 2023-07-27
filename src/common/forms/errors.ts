export type ErrorMessage = ErrorMessageText | ErrorMessageHtml;

interface ErrorMessageBase {
    /**
     * A link href to be applied to the error message.
     * Leave this as undefined to have the message link to #id for the
     * error's id, or set to null to have it unlinked.
     */
    href?: string | null;
}

export interface ErrorMessageText extends ErrorMessageBase {
    text: string;
    html?: never;
}

export interface ErrorMessageHtml extends ErrorMessageBase {
    text?: never;
    html: string;
}

export interface ErrorCollection {
    [field: string]: ErrorMessage;
}
