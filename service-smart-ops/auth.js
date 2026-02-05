const jwt = require('jsonwebtoken');
const config = require('./config/default');

const auth = (req, res, next) => {
    // 1. Handle CORS Preflight (OPTIONS)
    // The browser sends this without a token to check permissions.
    // We must allow it to pass or return 200 OK.
    if (req.method === 'OPTIONS') {
        return next();
    }

    // 2. Get Token from Header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Return 401 Unauthorized if no token
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    // 3. Verify Token
    try {
        // Java service uses Decoders.BASE64.decode(secretKey), so we must do the same.
        const secretBytes = Buffer.from(config.jwtSecret, 'base64');
        const decoded = jwt.verify(token, secretBytes);

        req.user = decoded;
        req.businessId = decoded.businessId; // Convenience extraction

        next();
    } catch (err) {
        console.error("Token verification failed:", err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = auth;
