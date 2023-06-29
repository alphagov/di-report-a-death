import {randomUUID} from "crypto";

export function getSessionId(cookies: string | undefined): string {
    return getCookie(cookies, "session") ?? randomUUID()
}

export function getCookie(cookies: string | undefined, name: string): string | undefined {
    if (cookies === undefined) {
        return undefined
    }

    const cookie = cookies
        .split("; ")
        .filter(it => it.includes(name))
    return cookie[0]?.split("=")[1]
}