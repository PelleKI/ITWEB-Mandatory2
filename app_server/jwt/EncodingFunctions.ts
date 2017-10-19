
export function Base64UrlEncode(s: string): string {
    let ret = new Buffer(s).toString('base64');
    ret = Base64ToBase64url(ret);
    return ret;
}

export function Base64ToBase64url(s: string) {
    let ret = s;
    ret = ret.split('=').join(''); // Remove any trailing '='s
    ret = ret.split('+').join('-'); // 62nd char of encoding 
    ret = ret.split('/').join('_'); // 63rd char of encoding
    return ret;
}

export function Base64UrlDecode(s: string): string {
    let ret = s;
    ret = ret.split('-').join('+');
    ret = ret.split('_').join('/');

    switch (ret.length % 4) {
        case 0: break;
        case 2: ret += "=="; break;
        case 3: ret += "="; break;
        default: throw new Error("Illegal base64url string!");
    }

    return Buffer.from(ret, 'base64').toString();
}