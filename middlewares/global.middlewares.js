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

function validateEmail(email, res, nextFunc, msg = "Sorry, Please Send Valid Email !!") {
    if (!isEmail(email)) {
        res.status(400).json(getResponseObject(msg, true, {}));
        return;
    }
    nextFunc();
}

function validateUserType(userType, res, nextFunc, msg = "Sorry, Please Send Valid User Type !!") {
    if (userType !== "user" && userType !== "admin") {
        res.status(400).json(getResponseObject(msg, true, {}));
        return;
    }
    nextFunc();
}

function validatePassword(password, res, nextFunc, msg = "Sorry, Please Send Valid Password !!") {
    if (!isValidPassword(password)) {
        res.status(400).json(getResponseObject(msg, true, {}));
        return;
    }
    nextFunc();
}

function validateCode(code, res, nextFunc, msg = "Please Send Valid Code !!") {
    if (code.length !== 4) {
        res.status(400).json(getResponseObject(msg, true, {}));
        return;
    }
    nextFunc();
}

function validateLanguage(language, res, nextFunc, msg = "Sorry, Please Send Valid Language !!") {
    if (!isValidLanguage(language)) {
        res.status(400).json(getResponseObject(msg, true, {}));
        return;
    }
    nextFunc();
}

function validateNumberIsPositive(number, res, nextFunc, msg = "Sorry, Please Send Valid Number ( Number Must Be Greater Than Zero ) !!") {
    if (number < 0) {
        res.status(400).json(getResponseObject(msg, true, {}));
        return;
    }
    nextFunc();
}

function validateNumberIsNotFloat(number, res, nextFunc, msg = "Sorry, Please Send Valid Number ( Number Must Be Not Float ) !!") {
    if (number % 1 !== 0) {
        res.status(400).json(getResponseObject(msg, true, {}));
        return;
    }
    nextFunc();
}

function validateCountry(country, res, nextFunc, msg = "Sorry, Please Send Valid Country ( kuwait Or Germany Or Turkey ) !!") {
    if (!["kuwait", "germany" , "turkey"].includes(country)) {
        res.status(400).json(getResponseObject(msg, true, {}));
        return;
    }
    nextFunc();
}

function validateName(name, res, nextFunc, msg = "Sorry, Please Send Valid Name !!") {
    if (!name.match(/^([\u0600-\u06FF\s]+|[a-zA-Z\s]+)$/)) {
        res.status(400).json(getResponseObject(msg, true, {}));
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
    validateName,
    keyGeneratorForRequestsRateLimit,
}