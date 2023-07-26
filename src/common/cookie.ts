export function getCookie(cookies: string | undefined, name: string): string | undefined {
    if (cookies === undefined) {
        return undefined;
    }

    const cookie = cookies.split('; ').filter((it) => it.startsWith(`${name}=`));
    return cookie[0]?.split('=')[1];
}
