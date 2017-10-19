
export function RunTests(): Promise<void> {
    console.log("Tests:");
    return Promise.resolve()
        .then(AuthMiddlewareTests);

}



import { VerifyToken, VerifyHmacSha256 } from '../services/Authentication';
import { JWT } from '../jwt/Jwt';
import { CurrentConfig } from '../ConfigLoader';

function AuthMiddlewareTests() {
    console.log("AuthMiddlewareTests:");
    console.log("\n<VerifyHmacSha256>");
    let token = JWT.CreateJWT({ hurh: "hurh" }, "SECRET");
    let result = VerifyHmacSha256(token, "SECRET");
    console.log(token);
    console.log(result ? "Verified" : "Not verified");

    console.log("\n<VerifyToken>");
    try {
        let token = JWT.CreateJWT({ hurh: "hurh", exp: Date.now() / 1000 + 100 }, CurrentConfig().AuthSecret);
        VerifyToken("Bearer " + token.ToString());
        console.log("Verified");
    }
    catch (err) {
        let ex = err as Error;
        console.log(ex.message);
    }
    return;
}
