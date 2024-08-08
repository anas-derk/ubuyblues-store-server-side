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

function validateEmail(email, res, nextFunc, errorMsg = "Sorry, Please Send Valid Email !!") {
    if (!isEmail(email)) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateUserType(userType, res, nextFunc, errorMsg = "Sorry, Please Send Valid User Type !!") {
    if (userType !== "user" && userType !== "admin") {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validatePassword(password, res, nextFunc, errorMsg = "Sorry, Please Send Valid Password !!") {
    if (!isValidPassword(password)) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateCode(code, res, nextFunc, errorMsg = "Please Send Valid Code !!") {
    if (code.length !== 4) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateLanguage(language, res, nextFunc, errorMsg = "Sorry, Please Send Valid Language !!") {
    if (!isValidLanguage(language)) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateNumbersIsPositive(numbers, res, nextFunc, errorMsgs, defaultMsg = "Sorry, Please Send Valid Number ( Number Must Be Greater Than Zero ) !!") {
    for(let i = 0; i < numbers.length; i++) {
        if (numbers[i] < 0) {
            res.status(400).json(getResponseObject(errorMsgs[i] ? errorMsgs[i] : defaultMsg, true, {}));
            return;
        }
    }
    nextFunc();
}

function validateNumbersIsNotFloat(numbers, res, nextFunc, errorMsgs, defaultMsg = "Sorry, Please Send Valid Number ( Number Must Be Not Float ) !!") {
    for(let i = 0; i < numbers.length; i++) {
        if (numbers[i] % 1 !== 0) {
            res.status(400).json(getResponseObject(errorMsgs[i] ? errorMsgs[i] : defaultMsg, true, {}));
            return;
        }
    }
    nextFunc();
}

function validateCountry(country, res, nextFunc, errorMsg = "Sorry, Please Send Valid Country ( kuwait Or Germany Or Turkey ) !!") {
    if (!["kuwait", "germany" , "turkey"].includes(country)) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateName(name, res, nextFunc, errorMsg = "Sorry, Please Send Valid Name !!") {
    if (!name.match(/^([\u0600-\u06FF\s]+|[a-zA-Z\s]+)$/)) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateIsNotExistDublicateProductId(products, res, nextFunc) {
    let seenProductIds = {};
    for(let product of products) {
        if (seenProductIds[product.productId]) {
            res.status(400).json(getResponseObject(`Sorry, Dublicate Product Id: ${product.productId} !!`, true, {}));
            return;
        }
        seenProductIds[product.productId] = true;
    }
    nextFunc();
}

function validateCheckoutStatus(checkoutStatus, res, nextFunc, errorMsg = "Sorry, Please Send Valid Checkout Status ( 'Checkout Incomplete' Or 'Checkout Successfull' ) !!") {
    if (!["Checkout Incomplete", "Checkout Successfull"].includes(checkoutStatus)) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateSortMethod(sortBy, res, nextFunc, errorMsg = "Sorry, Please Send Valid Sort Method ( 'postOfDate' Or 'price' ) !!") {
    if (!["postOfDate", "price"].includes(sortBy)) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateSortType(sortType, res, nextFunc, errorMsg = "Sorry, Please Send Valid Sort Type ( '-1' For Descending Sort Or '1' For Ascending Sort ) !!") {
    if (!["postOfDate", "price"].includes(sortType)) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateIsExistErrorInFiles(req, res, next) {
    const uploadError = req.uploadError;
    if (uploadError) {
        res.status(400).json(getResponseObject(uploadError, true, {}));
        return;
    }
    next();
}

function validateShippingMethod(req, res, next) {
    const shippingMethod = req.body.shippingMethod;
    if (!["normal", "ubuyblues"].includes(shippingMethod.forLocalProducts)) {
        res.status(400).json(getResponseObject("Sorry Shipping Method For Local Products Is Not Valid ( Please Send 'normal' or 'ubuyblues' Value )", true, {}));
        return;
    }
    if (!["normal", "fast"].includes(shippingMethod.forInternationalProducts)) {
        res.status(400).json(getResponseObject("Sorry Shipping Method For International Products Is Not Valid ( Please Send 'normal' or 'fast' Value )", true, {}));
        return;
    }
    next();
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
    validateNumbersIsPositive,
    validateNumbersIsNotFloat,
    validateCountry,
    validateName,
    validateIsNotExistDublicateProductId,
    validateCheckoutStatus,
    validateSortMethod,
    validateSortType,
    validateIsExistErrorInFiles,
    validateShippingMethod,
    keyGeneratorForRequestsRateLimit,
}