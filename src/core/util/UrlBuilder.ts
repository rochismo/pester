function sanitizeUrl(url: string): string {
    if (url.endsWith("/")) {
        url = url.substring(0, url.length - 2);
    }
    return url;
}

function sanitizeUri(uri: string): string {
    if (uri.startsWith("/")) {
        uri = uri.substring(1, uri.length);
    }
    return uri;
}


export function buildUrl(url: string, uri?: string): string {
    if (!uri) {
        return url;
    }
    url = sanitizeUrl(url);
    uri = sanitizeUri(uri);
    return `${url}/${uri}`;
}