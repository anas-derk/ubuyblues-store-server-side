const globalPasswordRouter = require("express").Router();

const globalPasswordController = require("../controllers/global_passwords.controller");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

const { validateJWT, validateEmail } = require("../middlewares/global.middlewares");

globalPasswordRouter.put("/change-bussiness-email-password",
    validateJWT,
    (req, res, next) => {
        const emailAndPasswordAndNewPassword = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Bussiness Email", fieldValue: emailAndPasswordAndNewPassword.email, dataType: "string", isRequiredValue: true },
            { fieldName: "Bussiness Password", fieldValue: emailAndPasswordAndNewPassword.password, dataType: "string", isRequiredValue: true },
            { fieldName: "New Bussiness Password", fieldValue: emailAndPasswordAndNewPassword.newPassword, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.query.email, res, next),
    globalPasswordController.putChangeBussinessEmailPassword
);

module.exports = globalPasswordRouter;