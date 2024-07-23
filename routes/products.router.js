const productsRouter = require("express").Router();

const productsController = require("../controllers/products.controller");

const multer = require("multer");

const { validateJWT, validateName, validateNumbersIsPositive, validateNumbersIsNotFloat } = require("../middlewares/global.middlewares");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./assets/images/products");
    },
    filename: (req, file, cb) => {
        cb(null, `${Math.random()}_${Date.now()}__${file.originalname.replaceAll(" ", "_")}`);
    },
});

productsRouter.post("/add-new-product",
    validateJWT,
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
                req.uploadError = "Sorry, Invalid File Mimetype, Only JPEG and PNG Or WEBP files are allowed !!";
                return cb(null, false);
            }
            cb(null, true);
        }
    }).fields([
        { name: "productImage", maxCount: 1 },
        { name: "galleryImages", maxCount: 10 },
    ]),
    (req, res, next) => {
        const productImages = Object.assign({}, req.files);
        const productInfo = {
            ...Object.assign({}, req.body),
            imagePath: productImages.productImage[0].path.replace(/\\/g, '/'),
            galleryImagesPaths: productImages.galleryImages.map((galleryImage) => galleryImage.path.replace(/\\/g, '/')),
        };
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Name", fieldValue: productInfo.name, dataType: "string", isRequiredValue: true },
            { fieldName: "Price", fieldValue: Number(productInfo.price), dataType: "number", isRequiredValue: true },
            { fieldName: "Description", fieldValue: productInfo.description, dataType: "string", isRequiredValue: true },
            { fieldName: "Category", fieldValue: productInfo.category, dataType: "string", isRequiredValue: true },
            { fieldName: "CategoryId", fieldValue: productInfo.categoryId, dataType: "string", isRequiredValue: true },
            { fieldName: "discount", fieldValue: Number(productInfo.discount), dataType: "number", isRequiredValue: true },
            { fieldName: "quantity", fieldValue: Number(productInfo.quantity), dataType: "number", isRequiredValue: true },
            { fieldName: "Store Id", fieldValue: productInfo.storeId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateName((Object.assign({}, req.body)).name, res, next, "Sorry, Please Send Valid Product Name !!"),
    (req, res, next) => {
        const productInfo = Object.assign({}, req.body);
        validateNumbersIsPositive([productInfo.price, productInfo.discount, productInfo.quantity], res, next, ["Sorry, Please Send Valid Product Price ( Number Must Be Greater Than Zero ) !!", "Sorry, Please Send Valid Product Discount ( Number Must Be Greater Than Zero ) !!", "Sorry, Please Send Valid Product Quantity ( Number Must Be Greater Than Zero ) !!"]);
    },
    (req, res, next) => validateNumbersIsNotFloat([(Object.assign({}, req.body)).quantity], res, next, [], "Sorry, Please Send Valid Product Quantity !!"),
    productsController.postNewProduct
);

productsRouter.post("/add-new-images-to-product-gallery/:productId",
    validateJWT,
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
            req.uploadError = "Sorry, Invalid File Mimetype, Only JPEG and PNG Or WEBP files are allowed !!";
            return cb(null, false);
        }
        cb(null, true);
    }
    }).array("productGalleryImage", 10),
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    productsController.postNewImagesToProductGallery
);

productsRouter.post("/products-by-ids",
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes(
            req.body.productsIds.map((productId, index) => (
                { fieldName: `Id In Product ${index + 1}`, fieldValue: productId, dataType: "ObjectId", isRequiredValue: true }
            ))
        ,res, next);
    },
    productsController.getProductsByIds
);

productsRouter.post("/products-by-ids-and-store-id",
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.query.storeId, dataType: "ObjectId", isRequiredValue: true },
            ...req.body.productsIds.map((productId, index) => (
                { fieldName: `Id In Product ${index + 1}`, fieldValue: productId, dataType: "ObjectId", isRequiredValue: true }
            ))]
        ,res, next);
    },
    productsController.getProductsByIdsAndStoreId
);

productsRouter.get("/product-info/:productId",
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    productsController.getProductInfo
);

productsRouter.get("/products-count",
    (req, res, next) => {
        const { pageNumber, pageSize } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "page Number", fieldValue: Number(pageNumber), dataType: "number", isRequiredValue: true },
            { fieldName: "page Size", fieldValue: Number(pageSize), dataType: "number", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateNumbersIsPositive([req.query.pageNumber, req.query.pageSize], res, next, ["Sorry, Please Send Valid Page Number ( Number Must Be Greater Than Zero ) !!", "Sorry, Please Send Valid Page Size ( Number Must Be Greater Than Zero ) !!"]),
    (req, res, next) => validateNumbersIsNotFloat([req.query.pageNumber, req.query.pageSize], res, next, ["Sorry, Please Send Valid Page Number ( Number Must Be Not Float ) !!", "Sorry, Please Send Valid Page Size ( Number Must Be Not Float ) !!"]),
    productsController.getProductsCount
);

productsRouter.get("/flash-products-count",
    (req, res, next) => {
        const { pageNumber, pageSize } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "page Number", fieldValue: Number(pageNumber), dataType: "number", isRequiredValue: true },
            { fieldName: "page Size", fieldValue: Number(pageSize), dataType: "number", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateNumbersIsPositive([req.query.pageNumber, req.query.pageSize], res, next, ["Sorry, Please Send Valid Page Number ( Number Must Be Greater Than Zero ) !!", "Sorry, Please Send Valid Page Size ( Number Must Be Greater Than Zero ) !!"]),
    (req, res, next) => validateNumbersIsNotFloat([req.query.pageNumber, req.query.pageSize], res, next, ["Sorry, Please Send Valid Page Number ( Number Must Be Not Float ) !!", "Sorry, Please Send Valid Page Size ( Number Must Be Not Float ) !!"]),
    productsController.getFlashProductsCount
);

productsRouter.get("/all-flash-products-inside-the-page",
    (req, res, next) => {
        const { pageNumber, pageSize, sortBy, sortType } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "page Number", fieldValue: Number(pageNumber), dataType: "number", isRequiredValue: true },
            { fieldName: "page Size", fieldValue: Number(pageSize), dataType: "number", isRequiredValue: true },
            { fieldName: "Sort By", fieldValue: sortBy, dataType: "string", isRequiredValue: false },
            { fieldName: "Sort Type", fieldValue: sortType, dataType: "string", isRequiredValue: false },
        ], res, next);
    },
    (req, res, next) => validateNumbersIsPositive([req.query.pageNumber, req.query.pageSize], res, next, ["Sorry, Please Send Valid Page Number ( Number Must Be Greater Than Zero ) !!", "Sorry, Please Send Valid Page Size ( Number Must Be Greater Than Zero ) !!"]),
    (req, res, next) => validateNumbersIsNotFloat([req.query.pageNumber, req.query.pageSize], res, next, ["Sorry, Please Send Valid Page Number ( Number Must Be Not Float ) !!", "Sorry, Please Send Valid Page Size ( Number Must Be Not Float ) !!"]),
    productsController.getAllFlashProductsInsideThePage
);

productsRouter.get("/all-products-inside-the-page",
    (req, res, next) => {
        const { pageNumber, pageSize, sortBy, sortType } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "page Number", fieldValue: Number(pageNumber), dataType: "number", isRequiredValue: true },
            { fieldName: "page Size", fieldValue: Number(pageSize), dataType: "number", isRequiredValue: true },
            { fieldName: "Sort By", fieldValue: sortBy, dataType: "string", isRequiredValue: false },
            { fieldName: "Sort Type", fieldValue: sortType, dataType: "string", isRequiredValue: false },
        ], res, next);
    },
    (req, res, next) => validateNumbersIsPositive([req.query.pageNumber, req.query.pageSize], res, next, ["Sorry, Please Send Valid Page Number ( Number Must Be Greater Than Zero ) !!", "Sorry, Please Send Valid Page Size ( Number Must Be Greater Than Zero ) !!"]),
    (req, res, next) => validateNumbersIsNotFloat([req.query.pageNumber, req.query.pageSize], res, next, ["Sorry, Please Send Valid Page Number ( Number Must Be Not Float ) !!", "Sorry, Please Send Valid Page Size ( Number Must Be Not Float ) !!"]),
    productsController.getAllProductsInsideThePage
);

productsRouter.get("/sample-from-related-products-in-the-product/:productId",
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    productsController.getRelatedProductsInTheProduct
);

productsRouter.get("/all-gallery-images/:productId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    productsController.getAllGalleryImages
);

productsRouter.delete("/:productId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    productsController.deleteProduct
);

productsRouter.delete("/gallery-images/:productId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataType: "ObjectId", isRequiredValue: true },
            { fieldName: "Gallery Image Path", fieldValue: req.query.galleryImagePath, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    productsController.deleteImageFromProductGallery
);

productsRouter.put("/:productId",
    validateJWT,
    (req, res, next) => {
        const { name, price, description, category, discount } = req.body;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataType: "ObjectId", isRequiredValue: true },
            { fieldName: "Name", fieldValue: name, dataType: "string", isRequiredValue: false },
            { fieldName: "Price", fieldValue: Number(price), dataType: "number", isRequiredValue: false },
            { fieldName: "Description", fieldValue: description, dataType: "string", isRequiredValue: false },
            { fieldName: "Category", fieldValue: category, dataType: "string", isRequiredValue: false },
            { fieldName: "discount", fieldValue: Number(discount), dataType: "number", isRequiredValue: false },
        ], res, next);
    },
    productsController.putProduct
);

productsRouter.put("/update-product-gallery-image/:productId",
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
    }).single("productGalleryImage"),
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataType: "ObjectId", isRequiredValue: true },
            { fieldName: "Old Gallery Image Path", fieldValue: req.query.oldGalleryImagePath, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    productsController.putProductGalleryImage
);

productsRouter.put("/update-product-image/:productId",
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
    }).single("productImage"),
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    productsController.putProductImage
);

module.exports = productsRouter;