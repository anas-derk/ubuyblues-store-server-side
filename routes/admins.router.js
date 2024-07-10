const adminsRouter = require("express").Router();

const adminsController = require("../controllers/admins.controller");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

const { validateJWT, validateEmail, validatePassword } = require("../middlewares/global.middlewares");

adminsRouter.get("/login",
    (req, res, next) => {
        const emailAndPassword = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Email", fieldValue: emailAndPassword.email, dataType: "string", isRequiredValue: true },
            { fieldName: "Password", fieldValue: emailAndPassword.password, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.query.email, res, next),
    (req, res, next) => validatePassword(req.query.password, res, next),
    adminsController.getAdminLogin
);

adminsRouter.get("/user-info", validateJWT, adminsController.getAdminUserInfo);

adminsRouter.get("/admins-count", validateJWT, adminsController.getAdminsCount);

adminsRouter.get("/all-admins-inside-the-page",
    validateJWT,
    (req, res, next) => {
        const filters = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "page Number", fieldValue: Number(filters.pageNumber), dataType: "number", isRequiredValue: true },
            { fieldName: "page Size", fieldValue: Number(filters.pageSize), dataType: "number", isRequiredValue: true },
        ], res, next);
    },
    adminsController.getAllAdminsInsideThePage
);

adminsRouter.post("/add-new-admin",
    validateJWT,
    (req, res, next) => {
        const adminInfo = req.body;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "First Name", fieldValue: adminInfo.firstName, dataType: "string", isRequiredValue: true },
            { fieldName: "Last Name", fieldValue: adminInfo.lastName, dataType: "string", isRequiredValue: true },
            { fieldName: "Email", fieldValue: adminInfo.email, dataType: "string", isRequiredValue: true },
            { fieldName: "Password", fieldValue: adminInfo.password, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.body.email, res, next),
    (req, res, next) => validatePassword(req.body.password, res, next),
    adminsController.postAddNewAdmin
);

adminsRouter.put("/update-admin-info/:adminId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Admin Id", fieldValue: req.params.adminId, dataType: "ObjectId", isRequiredValue: false },
        ], res, next);
    },
    adminsController.putAdminInfo
);

adminsRouter.delete("/delete-admin/:adminId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Admin Id", fieldValue: req.params.adminId, dataType: "ObjectId", isRequiredValue: false },
        ], res, next);
    },
    adminsController.deleteAdmin
);

module.exports = adminsRouter;