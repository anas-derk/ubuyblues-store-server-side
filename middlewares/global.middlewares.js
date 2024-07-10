const { getResponseObject, isEmail, isValidPassword, isValidLanguage } = require("../global/functions");
const { verify } = require("jsonwebtoken");

function validateJWT(req, res, next) {
    const token = req.headers.authorization;
    verify(token, process.env.secretKey, async (err, decode) => {
        if (err) {
            res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
            return;
        }
        req.data = decode;
        next();
    });
}

function validateEmail(email, res, nextFunc) {
    if (!isEmail(email)) {
        res.status(400).json(getResponseObject("Sorry, Please Send Valid Email !!", true, {}));
        return;
    }
    nextFunc();
}

function validateUserType(userType, res, nextFunc) {
    if (userType !== "user" && userType !== "admin") {
        res.status(400).json(getResponseObject("Sorry, Please Send Valid User Type !!", true, {}));
        return;
    }
    nextFunc();
}

function validatePassword(password, res, nextFunc) {
    if (!isValidPassword(password)) {
        res.status(400).json(getResponseObject("Sorry, Please Send Valid Password !!", true, {}));
        return;
    }
    nextFunc();
}

function validateCode(code, res, nextFunc) {
    if (code.length !== 4) {
        res.status(400).json(getResponseObject("Please Send Valid Code !!", true, {}));
        return;
    }
    nextFunc();
}

function validateLanguage(language, res, nextFunc) {
    if (!isValidLanguage(language)) {
        res.status(400).json(getResponseObject("Sorry, Please Send Valid Language !!", true, {}));
        return;
    }
    nextFunc();
}

function validateNumberIsPositive(number, res, nextFunc) {
    if (number < 0) {
        res.status(400).json(getResponseObject("Sorry, Please Send Valid Number ( Number Must Be Greater Than Zero ) !!", true, {}));
        return;
    }
    nextFunc();
}

function validateNumberIsNotFloat(number, res, nextFunc) {
    if (number % 1 !== 0) {
        res.status(400).json(getResponseObject("Sorry, Please Send Valid Number ( Number Must Be Not Float ) !!", true, {}));
        return;
    }
    nextFunc();
}

function validateCountry(country, res, nextFunc) {
    if (!["kuwait", "germany" , "turkey"].includes(country)) {
        res.status(400).json(getResponseObject("Sorry, Please Send Valid Country ( kuwait Or Germany Or Turkey ) !!", true, {}));
        return;
    }
    nextFunc();
}

function keyGeneratorForRequestsRateLimit(req) {
    const ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const ipWithoutPort = ipAddress.split(',')[0];
    return ipWithoutPort;
}

module.exports = {
    validateJWT,
    validateEmail,
    validateUserType,
    validatePassword,
    validateCode,
    validateLanguage,
    validateNumberIsPositive,
    validateNumberIsNotFloat,
    validateCountry,
    keyGeneratorForRequestsRateLimit,
}