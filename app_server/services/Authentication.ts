import { createHmac, Hmac, randomBytes, pbkdf2Sync } from 'crypto';
import { JWT } from '../jwt/Jwt'
import { Base64ToBase64url } from '../jwt/EncodingFunctions';
import { CurrentConfig } from '../ConfigLoader';


export function AuthMiddleware(req, res, next) {
    let AuthHeader = req.get("Authorization") as string;
    VerifyToken(AuthHeader); // Throws if token is incorrect
    next();
};

export function VerifyToken(AuthorizationHeader: string): boolean {
    if (AuthorizationHeader === undefined) {
        throw new Error("No Authorization header");
    }

    if (AuthorizationHeader.substr(0, 7) != "Bearer ") {
        throw new Error("Authorization header is not of type Bearer");
    }

    let JwtString = AuthorizationHeader.substr(7);
    let token = JWT.FromString(JwtString);

    let exp = token.GetPayload().exp;
    if(exp === undefined || exp === null || new Date(exp * 1000).getTime() < Date.now())
    {
        throw new Error("JWT expired");
    }

    // Find secret here
    let secret = CurrentConfig().AuthSecret;

    if (!VerifyHmacSha256(token, secret)) {
        console.log(CurrentConfig().AuthSecret);
        console.log(token);
        throw new Error("JWT signature incorrect");
    }
    return true;
}

export function VerifyHmacSha256(token: JWT, secret: string): boolean {
    let encodedHeader = token.GetEncodedHeader();
    console.log(encodedHeader);
    let encodedPayload = token.GetEncodedPayload();
    console.log(encodedPayload);
    let hmac = createHmac("SHA256", secret);
    hmac.update(encodedHeader + "." + encodedPayload);
    let calculatedSignature = Base64ToBase64url(hmac.digest('base64'));
    console.log(calculatedSignature);    
    console.log(calculatedSignature);        
    return calculatedSignature == token.GetSignature();
}

export function HashPassword(password: string, salt: string): string {
    return pbkdf2Sync(password, salt, 10000, 128, 'sha512').toString('hex');
}
