const adsRouter = require("express").Router();

const adsController = require("../controllers/ads.controller");

const multer = require("multer");

const { validateJWT, validateName, validateNumbersIsPositive, validateNumbersIsNotFloat } = require("../middlewares/global.middlewares");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./assets/images/ads");
    },
    filename: (req, file, cb) => {
        cb(null, `${Math.random()}_${Date.now()}__${file.originalname.replaceAll(" ", "_")}`);
    },
});

adsRouter.post("/add-new-ad",
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
        const adInfo = {
            ...Object.assign({}, req.body),
            imagePath: req.file.path,
        };
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Ad Content", fieldValue: adInfo.content, dataType: "string", isRequiredValue: true },
            { fieldName: "Store Id", fieldValue: adInfo.storeId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    brandsController.postNewBrand
);