const referalsRouter = require("express").Router();

const referalsController = require("../controllers/referals.controller");

const { validateEmail, validateName } = require("../middlewares/global.middlewares");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

referalsRouter.post("/add-new-referal",
    (req, res, next) => {
        const { productId, name, email, content } = req.body;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: productId, dataType: "ObjectId", isRequiredValue: true },
            { fieldName: "name", fieldValue: name, dataType: "string", isRequiredValue: true },
            { fieldName: "email", fieldValue: email, dataType: "string", isRequiredValue: true },
            { fieldName: "Referal Content", fieldValue: content, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.body.email, res, next),
    (req, res, next) => validateName(req.body.name, res, next),
    referalsController.postAddNewReferal
);

referalsRouter.get("/product-referals-count/:productId",
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    referalsController.getProductReferalsCount
);

referalsRouter.get("/all-product-referals-inside-the-page/:productId",
    (req, res, next) => {
        const { pageNumber, pageSize } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataType: "ObjectId", isRequiredValue: true },
            { fieldName: "page Number", fieldValue: Number(pageNumber), dataType: "number", isRequiredValue: true },
            { fieldName: "page Size", fieldValue: Number(pageSize), dataType: "number", isRequiredValue: true },
        ], res, next);
    },
    referalsController.getAllProductReferalsInsideThePage
);

module.exports = referalsRouter;