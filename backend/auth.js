import { expressjwt } from 'express-jwt';
import jwt from 'jsonwebtoken'
import { getUser, loginUser } from './db/user.js';

const secret = Buffer.from('Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt', 'base64');
const refreshSecret = Buffer.from('An8Q5tyZ/Z1MHltc4F/kTkVJMlrbKiZt', 'base64')

export const authMiddleware = expressjwt({
    algorithms: ['HS256'],
    credentialsRequired: false,
    secret,
});

export async function loginCallback(email, password) {
    const user = await loginUser(email);
    if (!user || user.password !== password) {
        return { error: "Invalid Username or password" };
    } else {
        const claims = { sub: user.id, email: user.email };
        const token = jwt.sign(claims, secret, {expiresIn: "10d"});
        const refreshToken = jwt.sign({
            sub: user.id,
        }, refreshSecret, { expiresIn: '1d' });
        return { accessToken: token, user, refreshToken }
    }
}

export async function checkToken(accessToken) {
    let decodedValue = null
    jwt.verify(accessToken, secret, (err, decoded) => {
        if(decoded)
            decodedValue = {id: decoded.sub, email: decoded.email};
    });
    return decodedValue;
}

export async function refreshAuthToken(refreshToken) {
    const decode = jwt.verify(refreshToken, refreshSecret);
    if(!decode) {
        return null
    };
    const user = await getUser(decode.sub);
    const claims = { sub: user._id, email: user.email };
    const token = jwt.sign(claims, secret, {expiresIn: "10d"});
    const out_data = {accessToken: token, user, refreshToken}
    return out_data;
}