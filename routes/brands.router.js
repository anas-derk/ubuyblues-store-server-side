const brandsRouter = require("express").Router();

const brandsController = require("../controllers/brands.controller");

const { validateJWT, validateIsExistErrorInFiles, validateNumbersIsGreaterThanZero, validateNumbersIsNotFloat } = require("../middlewares/global.middlewares");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

const multer = require("multer");

brandsRouter.post("/add-new-brand",
    validateJWT,
    multer({
        storage: multer.memoryStorage(),
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
    }).single("brandImg"),
    validateIsExistErrorInFiles,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Brand Title", fieldValue: (Object.assign({}, req.body)).title, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    brandsController.postNewBrand
);

brandsRouter.get("/last-seven-brands-by-store-id",
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.params.storeId, dataType: "ObjectId", isRequiredValue: false },
        ], res, next);
    },
    brandsController.getLastSevenBrandsByStoreId
);

brandsRouter.get("/brands-count",
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.query.storeId, dataType: "ObjectId", isRequiredValue: false },
        ], res, next);
    },
    brandsController.getBrandsCount
);

brandsRouter.get("/all-brands-inside-the-page",
    (req, res, next) => {
        const { pageNumber, pageSize } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "page Number", fieldValue: Number(pageNumber), dataType: "number", isRequiredValue: true },
            { fieldName: "page Size", fieldValue: Number(pageSize), dataType: "number", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateNumbersIsGreaterThanZero([req.query.pageNumber, req.query.pageSize], res, next, ["Sorry, Please Send Valid Page Number ( Number Must Be Greater Than Zero ) !!", "Sorry, Please Send Valid Page Size ( Number Must Be Greater Than Zero ) !!"]),
    (req, res, next) => validateNumbersIsNotFloat([req.query.pageNumber, req.query.pageSize], res, next, ["Sorry, Please Send Valid Page Number ( Number Must Be Not Float ) !!", "Sorry, Please Send Valid Page Size ( Number Must Be Not Float ) !!"]),
    brandsController.getAllBrandsInsideThePage
);

brandsRouter.delete("/:brandId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "brand Id", fieldValue: req.params.brandId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    brandsController.deleteBrand
);

brandsRouter.put("/:brandId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "brand Id", fieldValue: req.params.brandId, dataType: "ObjectId", isRequiredValue: true },
            { fieldName: "New Brand Title", fieldValue: req.body.newBrandTitle, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    brandsController.putBrandInfo
);

brandsRouter.put("/change-brand-image/:brandId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "brand Id", fieldValue: req.params.brandId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    multer({
        storage: multer.memoryStorage(),
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
    }).single("brandImage"),
    validateIsExistErrorInFiles,
    brandsController.putBrandImage
);

module.exports = brandsRouter;