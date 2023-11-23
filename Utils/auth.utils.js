const jwt = require('jsonwebtoken');
const fs = require("fs");
const randomNumber = require('random-number');

// Generate an access token
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '58m' });
}

// Verify the access token
function verifyAccessToken(token) {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return null;
        return decoded;
    });
}

// Set a cookie with the access token
function setAccessTokenCookie(res, token) {
    res.cookie('access_token', token, {
        httpOnly: true, // Make the cookie accessible only through the server-side
        sameSite: 'None', // Allows cross-origin requests
        secure: true,
    });
}

function authorize(...roles) {
    // Refresh the access token cookie
    return function refreshAccessToken(req, res, next) {
        const token = req.cookies.access_token;

        if (!token) return res.status(401).json('Unauthorized');

        const decoded = verifyAccessToken(token);

        if (!decoded) return res.status(401).json('Unauthorized');

        // const user = decoded.user; // assuming you've added the user object to the token payload
        const { exp, iat, ...rest } = decoded
        res.userId = rest.id
        res.user_type_id = rest.user_type_id
        const newToken = generateAccessToken(rest);
        res.access_token = newToken
        setAccessTokenCookie(res, newToken);

        if (!roles.includes(rest.user_type_id)) {
            res.status(401).json(`${rest.user_type_id} user dosn't have the permission!!`);
        } else {
            next()
        }
    }
}
function normalAuth() {

    // Refresh the access token cookie
    return function refreshAccessToken(req, res, next) {

        const token = req.cookies.access_token;

        const decoded = verifyAccessToken(token);

        // const user = decoded.user; // assuming you've added the user object to the token payload
        if (decoded) {

            const { exp, iat, ...rest } = decoded
            res.userId = rest.id
            res.user_type_id = rest.user_type_id
            const newToken = generateAccessToken(rest);
            res.access_token = newToken
            setAccessTokenCookie(res, newToken);
            next()
        } else {

            return res.status(401).json({ message: "Token expired" });
        }

    }
}

function deleteFiles(req) {
    if (req.files) {
        for (const file of Object.values(req.files)) {
            if (Array.isArray(file)) {
                for (const f of file) {
                    fs.unlinkSync(f.path);
                }
            } else {
                fs.unlinkSync(file.path);
            }
        }
    }
}


// Generate an 18-digit random number
const generateCustomNumber = () => {
    const options = {
        min: 100000000000000000,
        max: 999999999999999999,
        integer: true
    };
    return randomNumber(options);
};

const columns = (data) => Object.keys(data).join(', ');
const placeholders = (data) => Object.keys(data).map(() => '?').join(', ');

module.exports = {

    generateAccessToken,
    verifyAccessToken,

    setAccessTokenCookie,
    authorize,

    deleteFiles,
    normalAuth,

    generateCustomNumber,
    columns,

    placeholders,
}
