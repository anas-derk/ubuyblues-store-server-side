const { getResponseObject, sendVerificationCodeToUserEmail, sendCongratulationsOnCreatingNewAccountEmail } = require("../global/functions");

const usersOPerationsManagmentFunctions = require("../models/users.model");

const { sign } = require("jsonwebtoken");

const {
    isBlockingFromReceiveTheCodeAndReceiveBlockingExpirationDate,
    addNewAccountVerificationCode,
    isAccountVerificationCodeValid
} = require("../models/account_codes.model");

async function login(req, res) {
    try{
        const   email = req.query.email,
                password = req.query.password;
        const result = await usersOPerationsManagmentFunctions.login(email.toLowerCase(), password);
        if (!result.error) {
            const token = sign(result.data, process.env.secretKey, {
                expiresIn: "1h",
            });
            res.json({
                msg: result.msg,
                error: result.error,
                data: {
                    ...result.data,
                    token,
                },
            });
            return;
        }
        res.json(result);
    }
    catch(err){
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function loginWithGoogle(req, res) {
    try{
        const result = await usersOPerationsManagmentFunctions.loginWithGoogle(req.query);
        const token = sign(result.data, process.env.secretKey, {
            expiresIn: "1h",
        });
        res.json({
            msg: result.msg,
            error: result.error,
            data: {
                ...result.data,
                token,
            },
        });
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getUserInfo(req, res) {
    try{
        res.json(await usersOPerationsManagmentFunctions.getUserInfo(req.data._id));
    }
    catch(err){
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getAllUsers(req, res) {
    try{
        res.json(await usersOPerationsManagmentFunctions.getAllUsers());
    }
    catch(err){
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getForgetPassword(req, res) {
    try{
        const { email, userType } = req.query;
        let result = await usersOPerationsManagmentFunctions.isExistUserAccount(email, userType);
        if (!result.error) {
            if (userType === "user") {
                if (!result.data.isVerified) {
                    res.json({
                        msg: "Sorry, The Email For This User Is Not Verified !!",
                        error: true,
                        data: result.data,
                    });
                    return;
                }
            }
            result = await isBlockingFromReceiveTheCodeAndReceiveBlockingExpirationDate(email);
            if (result.error) {
                res.json(result);
                return;
            }
            result = await sendVerificationCodeToUserEmail(email);
            if (!result.error) {
                res.json(await addNewAccountVerificationCode(email, result.data, "to reset password"));
                return;
            }
        }
        res.json(result);
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function createNewUser(req, res) {
    try {
        const userData = req.body;
        const result = await usersOPerationsManagmentFunctions.createNewUser(userData.email.toLowerCase(), userData.password, userData.language);
        if (result.error) {
            res.json(result);
            return;
        }
        await sendCongratulationsOnCreatingNewAccountEmail(userData.email, userData.language);
        res.json(result);
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function postAccountVerificationCode(req, res) {
    try{
        const email = req.query.email;
        let result = await usersOPerationsManagmentFunctions.isExistUserAndVerificationEmail(email);
        if (!result.error) {
            result = await isBlockingFromReceiveTheCodeAndReceiveBlockingExpirationDate(email);
            if (result.error) {
                res.json(result);
                return;
            }
            result = await sendVerificationCodeToUserEmail(email);
            if (!result.error) {
                res.json(await addNewAccountVerificationCode(email, result.data, "to activate account"));
                return;
            }
        }
        res.json(result);
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function putUserInfo(req, res) {
    try{
        res.json(await usersOPerationsManagmentFunctions.updateUserInfo(req.data._id, req.body));
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function putVerificationStatus(req, res) {
    try{
        const emailAndCode = req.query;
        let result = await isAccountVerificationCodeValid(emailAndCode.email, emailAndCode.code, "to activate account");
        if (!result.error) {
            result = await usersOPerationsManagmentFunctions.updateVerificationStatus(emailAndCode.email);
            if (!result.error) {
                const token = sign(result.data, process.env.secretKey, {
                    expiresIn: "1h",
                });
                res.json({
                    msg: result.msg,
                    error: result.error,
                    data: {
                        ...result.data,
                        token,
                    },
                });
                return;
            }
        }
        res.json(result);
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function putResetPassword(req, res) {
    try{
        const { email, userType, code, newPassword } = req.query;
        const result = await isAccountVerificationCodeValid(email, code, "to reset password");
        if (!result.error) {
            res.json(await usersOPerationsManagmentFunctions.resetUserPassword(email, userType, newPassword));
            return;
        }
        res.json(result);
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

module.exports = {
    createNewUser,
    postAccountVerificationCode,
    login,
    loginWithGoogle,
    getUserInfo,
    getAllUsers,
    getForgetPassword,
    putUserInfo,
    putVerificationStatus,
    putResetPassword,
}