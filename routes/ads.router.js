const adsRouter = require("express").Router();

const adsController = require("../controllers/ads.controller");

const multer = require("multer");

const { validateJWT } = require("../middlewares/global.middlewares");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./assets/images/ads");
    },
    filename: (req, file, cb) => {
        cb(null, `${Math.random()}_${Date.now()}__${file.originalname.replaceAll(" ", "_")}`);
    },
});

adsRouter.post("/add-new-text-ad",
    validateJWT,
    (req, res, next) => {
        const { content, storeId } = req.body;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Content", fieldValue: content, dataType: "string", isRequiredValue: true },
            { fieldName: "Store Id", fieldValue: storeId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    adsController.postNewTextAd
);

adsRouter.post("/add-new-image-ad",
    validateJWT,
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
    }).single("adImage"),
    (req, res, next) => {
        const bodyData = Object.assign({}, req.body);
        const adInfo = {
            ...{ storeId } = bodyData,
            imagePath: req.file.path,
        };
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: adInfo.storeId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    adsController.postNewImageAd,
);

adsRouter.get("/all-ads", adsController.getAllAds);

adsRouter.delete("/:adId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Ad Id", fieldValue: req.params.adId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    adsController.deleteAd
);

adsRouter.put("/update-ad-image/:adId",
    validateJWT,
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
                req.uploadError = "Sorry, Invalid File Mimetype, Only JPEG and PNG Or WEBP files are allowed !!";
                return cb(null, false);
            }
            cb(null, true);
        }
    }).single("adImage"),
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Ad Id", fieldValue: req.params.adId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    adsController.putAdImage
);

adsRouter.put("/update-ad-content/:adId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Ad Id", fieldValue: req.params.adId, dataType: "ObjectId", isRequiredValue: true },
            { fieldName: "New Ad Content", fieldValue: req.body.content, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    adsController.putTextAdContent
);

module.exports = adsRouter;