const usersRouter = require("express").Router();

const usersController = require("../controllers/users.controller");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

const { validateJWT, validateEmail, validatePassword, validateUserType, validateLanguage } = require("../middlewares/global.middlewares");

const usersMiddlewares = require("../middlewares/users.midddlewares");

usersRouter.get("/login",
    async (req, res, next) => {
        const emailAndPassword = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Email", fieldValue: emailAndPassword.email, dataType: "string", isRequiredValue: true },
            { fieldName: "Password", fieldValue: emailAndPassword.password, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.query.email, res, next),
    (req, res, next) => validatePassword(req.query.password, res, next),
    usersController.login
);

usersRouter.get("/login-with-google",
    async (req, res, next) => {
        const loginData = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Email", fieldValue: loginData.email, dataType: "string", isRequiredValue: true },
            { fieldName: "First Name", fieldValue: loginData.first_name, dataType: "string", isRequiredValue: true },
            { fieldName: "Last Name", fieldValue: loginData.last_name, dataType: "string", isRequiredValue: true },
            { fieldName: "Preview Name", fieldValue: loginData.preview_name, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    usersController.loginWithGoogle
);

usersRouter.get("/user-info",
    validateJWT,
    usersController.getUserInfo
);

usersRouter.get("/all-users", usersController.getAllUsers);

usersRouter.get("/forget-password",
    async (req, res, next) => {
        const userData = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Email", fieldValue: userData.email, dataType: "string", isRequiredValue: true },
            { fieldName: "User Type", fieldValue: userData.userType, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.query.email, res, next),
    (req, res, next) => validateUserType(req.query.userType, res, next),
    usersController.getForgetPassword
);

usersRouter.post("/create-new-user",
    async (req, res, next) => {
        const userData = req.body;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Email", fieldValue: userData.email, dataType: "string", isRequiredValue: true },
            { fieldName: "Password", fieldValue: userData.password, dataType: "string", isRequiredValue: true },
            { fieldName: "Language", fieldValue: userData.language, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.body.email, res, next),
    (req, res, next) => validatePassword(req.body.password, res, next),
    (req, res, next) => validateLanguage(req.body.language, res, next),
    usersController.createNewUser
);

usersRouter.post("/send-account-verification-code",
    usersMiddlewares.sendingVerificationCodeLimiterMiddleware,
    async (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Email", fieldValue: req.query.email, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.query.email, res, next),
    usersController.postAccountVerificationCode
);

usersRouter.put("/update-user-info", validateJWT, usersController.putUserInfo);

usersRouter.put("/update-verification-status",
    async (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Email", fieldValue: req.query.email, dataType: "string", isRequiredValue: true },
            { fieldName: "Code", fieldValue: req.query.code, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.query.email, res, next),
    usersController.putVerificationStatus
);

usersRouter.put("/reset-password",
    async (req, res, next) => {
        const userData = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Email", fieldValue: userData.email, dataType: "string", isRequiredValue: true },
            { fieldName: "User Type", fieldValue: userData.userType, dataType: "string", isRequiredValue: true },
            { fieldName: "Code", fieldValue: userData.code, dataType: "string", isRequiredValue: true },
            { fieldName: "New Password", fieldValue: userData.newPassword, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.query.email, res, next),
    (req, res, next) => validateUserType(req.query.userType, res, next),
    (req, res, next) => validatePassword(req.query.newPassword, res, next),
    usersController.putResetPassword
);

module.exports = usersRouter;