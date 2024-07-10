const referalsRouter = require("express").Router();

const referalsController = require("../controllers/referals.controller");

const { validateEmail } = require("../middlewares/global.middlewares");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

referalsRouter.post("/add-new-referal",
    (req, res, next) => {
        const referalDetails = req.body;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: referalDetails.productId, dataType: "string", isRequiredValue: true },
            { fieldName: "name", fieldValue: referalDetails.name, dataType: "string", isRequiredValue: true },
            { fieldName: "email", fieldValue: referalDetails.email, dataType: "string", isRequiredValue: true },
            { fieldName: "Referal Content", fieldValue: referalDetails.content, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.body.email, res, next),
    referalsController.postAddNewReferal
);

referalsRouter.get("/product-referals-count/:productId",
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    referalsController.getProductReferalsCount
);

referalsRouter.get("/all-product-referals-inside-the-page/:productId",
    (req, res, next) => {
        const filters = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataType: "string", isRequiredValue: true },
            { fieldName: "page Number", fieldValue: Number(filters.pageNumber), dataType: "number", isRequiredValue: true },
            { fieldName: "page Size", fieldValue: Number(filters.pageSize), dataType: "number", isRequiredValue: true },
        ], res, next);
    },
    referalsController.getAllProductReferalsInsideThePage
);

module.exports = referalsRouter;