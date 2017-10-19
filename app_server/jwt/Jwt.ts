import { Base64ToBase64url, Base64UrlDecode, Base64UrlEncode } from './EncodingFunctions';
import { createHmac, Hmac } from 'crypto';


export interface JWTHeader {
    alg: string;
    typ: string;
};

export class JWT {
    private signature: string;
    GetSignature(): string {
        return this.signature;
    }

    private header: JWTHeader;
    GetEncodedHeader(): string {
        return Base64UrlEncode(JSON.stringify(this.header));
    };

    private payload: any;
    GetPayload(): any {
        let obj = {}
        Object.assign(obj, this.payload);
        return obj;
    }
    GetEncodedPayload(): string {
        return Base64UrlEncode(JSON.stringify(this.payload));
    }

    constructor(header: JWTHeader, payload: any, signingFunction: (token: JWT) => string) {
        this.header = header;
        this.payload = payload;
        this.signature = signingFunction(this);
    }

    static CreateJWT(payload: any, secret: string) {
        return new JWT({alg: "SHA256", typ: "JWT"}, payload, (token) => JWT.HmacSha256SigningFunction(token, secret));
    }

    // Figure out better function name
    private static HmacSha256SigningFunction(token: JWT, secret: string) {
        let encodedHeader = token.GetEncodedHeader();
        let encodedPayload = token.GetEncodedPayload();    
        let hmac = createHmac("SHA256", secret);
        hmac.update(encodedHeader + "." + encodedPayload);
        return Base64ToBase64url(hmac.digest('base64'));
    }

    static FromString(s: string): JWT {
        let parts = s.split('.');
        if (parts.length != 3) {
            throw new Error("Supplied string does not contain the correct amount of seperators");
        }

        let header = JSON.parse(Buffer.from(parts[0], 'base64').toString()) as JWTHeader;
        if ((header.alg == null || header.typ == null) || header.typ != "JWT") {
            throw new Error("Header incorrect");
        }

        let payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

        let token = new JWT(header, payload, (token) => "");
        token.signature = parts[2];
        return token;
    }

    ToString(): string {
        return this.GetEncodedHeader() + "." + this.GetEncodedPayload() + "." + this.signature;
    }
}