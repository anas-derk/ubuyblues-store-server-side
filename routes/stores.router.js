const storesRouter = require("express").Router();

const storesController = require("../controllers/stores.controller");

const { validateJWT, validatePassword, validateEmail, validateLanguage } = require("../middlewares/global.middlewares");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./assets/images/stores");
    },
    filename: (req, file, cb) => {
        cb(null, `${Math.random()}_${Date.now()}__${file.originalname.replaceAll(" ", "_")}`);
    },
});

storesRouter.get("/stores-count", storesController.getStoresCount);

storesRouter.get("/all-stores-inside-the-page",
    (req, res, next) => {
        const filters = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "page Number", fieldValue: Number(filters.pageNumber), dataType: "number", isRequiredValue: true },
            { fieldName: "page Size", fieldValue: Number(filters.pageSize), dataType: "number", isRequiredValue: true },
            { fieldName: "Store Id", fieldValue: filters._id, dataType: "ObjectId", isRequiredValue: false },
        ], res, next);
    },
    storesController.getAllStoresInsideThePage
);

storesRouter.get("/store-details/:storeId",
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.params.storeId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    storesController.getStoreDetails
);

storesRouter.get("/main-store-details", storesController.getMainStoreDetails);

storesRouter.post("/create-new-store",
    multer({
        storage,
        fileFilter: (req, file, cb) => {
            if (!file) {
                req.uploadError = "Sorry, No File Uploaded, Please Upload The File";
                return cb(null, false);
            }
            if (
                file.mimetype !== "image/jpeg" &&
                file.mimetype !== "image/png" &&
                file.mimetype !== "image/webp"
            ){
                req.uploadError = "Sorry, Invalid File Mimetype, Only JPEG, PNG And Webp files are allowed !!";
                return cb(null, false);
            }
            cb(null, true);
        }
    }).single("storeImg"),
    (req, res, next) => {
        const { name, ownerFirstName, ownerLastName, ownerEmail, productsType, productsDescription, language } = req.body;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Name", fieldValue: name, dataType: "string", isRequiredValue: true },
            { fieldName: "Owner First Name", fieldValue: ownerFirstName, dataType: "string", isRequiredValue: true },
            { fieldName: "Owner Last Name", fieldValue: ownerLastName, dataType: "string", isRequiredValue: true },
            { fieldName: "Owner Email", fieldValue: ownerEmail, dataType: "string", isRequiredValue: true },
            { fieldName: "Products Type", fieldValue: productsType, dataType: "string", isRequiredValue: true },
            { fieldName: "Products Description", fieldValue: productsDescription, dataType: "string", isRequiredValue: true },
            { fieldName: "Language", fieldValue: language, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.body.ownerEmail, res, next),
    (req, res, next) => validateLanguage(req.body.language, res, next),
    storesController.postNewStore
);

storesRouter.post("/approve-store/:storeId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.params.storeId, dataType: "ObjectId", isRequiredValue: true },
            { fieldName: "Password", fieldValue: req.query.password, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validatePassword(req.query.password, res, next),
    storesController.postApproveStore
);

storesRouter.put("/update-store-info/:storeId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.params.storeId, dataType: "ObjectId", isRequiredValue: false },
        ], res, next);
    },
    storesController.putStoreInfo
);

storesRouter.put("/blocking-store/:storeId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.params.storeId, dataType: "ObjectId", isRequiredValue: true },
            { fieldName: "Blocking Reason", fieldValue: req.query.blockingReason, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    storesController.putBlockingStore
);

storesRouter.put("/cancel-blocking/:storeId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.params.storeId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    storesController.putCancelBlockingStore
);

storesRouter.put("/change-store-image/:storeId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.params.storeId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    multer({
        storage,
        fileFilter: (req, file, cb) => {
            if (!file) {
                req.uploadError = "Sorry, No Files Uploaded, Please Upload The Files";
                return cb(null, false);
            }
            if (
                file.mimetype !== "image/jpeg" &&
                file.mimetype !== "image/png" &&
                file.mimetype !== "image/webp"
            ){
                req.uploadError = "Sorry, Invalid File Mimetype, Only JPEG, PNG And Webp files are allowed !!";
                return cb(null, false);
            }
            cb(null, true);
        }
    }).single("storeImage") ,
    storesController.putStoreImage
);

storesRouter.delete("/delete-store/:storeId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.params.storeId, dataType: "ObjectId", isRequiredValue: false },
        ], res, next);
    },
    storesController.deleteStore
);

storesRouter.delete("/reject-store/:storeId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.params.storeId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    storesController.deleteRejectStore
);

module.exports = storesRouter;