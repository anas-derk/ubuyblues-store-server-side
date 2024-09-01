const { getResponseObject, handleResizeImagesAndConvertFormatToWebp } = require("../global/functions");

const productsManagmentFunctions = require("../models/products.model");

const { unlinkSync } = require("fs");

async function postNewProduct(req, res) {
    try {
        const productImages = Object.assign({}, req.files);
        let files = [productImages.productImage[0].buffer], outputImageFilePaths = [`assets/images/products/${Math.random()}_${Date.now()}__${productImages.productImage[0].originalname.replaceAll(" ", "_").replace(/\.[^/.]+$/, ".webp")}`];
        productImages.galleryImages.forEach((file) => {
            files.push(file.buffer);
            outputImageFilePaths.push(`assets/images/products/${Math.random()}_${Date.now()}__${file.originalname.replaceAll(" ", "_").replace(/\.[^/.]+$/, ".webp")}`)
        });
        await handleResizeImagesAndConvertFormatToWebp(files, outputImageFilePaths);
        const productInfo = {
            ...Object.assign({}, req.body),
            imagePath: outputImageFilePaths[0],
            galleryImagesPaths: outputImageFilePaths.slice(1),
        };
        if(Number(productInfo.discount) < 0 || Number(productInfo.discount) > Number(productInfo.price)) {
            res.status(400).json(getResponseObject("Sorry, Please Send Valid Discount Value !!", true, {}));
            return;
        }
        const result = await productsManagmentFunctions.addNewProduct(req.data._id, productInfo);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
                return;
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function postNewImagesToProductGallery(req, res) {
    try {
        let files = [], outputImageFilePaths = [];
        req.files.forEach((file) => {
            files.push(file.buffer);
            outputImageFilePaths.push(`assets/images/products/${Math.random()}_${Date.now()}__${file.originalname.replaceAll(" ", "_").replace(/\.[^/.]+$/, ".webp")}`)
        });
        await handleResizeImagesAndConvertFormatToWebp(files, outputImageFilePaths);
        const result = await productsManagmentFunctions.addNewImagesToProductGallery(req.data._id, req.params.productId, outputImageFilePaths);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
                return;
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getProductsByIds(req, res) {
    try{
        res.json(await productsManagmentFunctions.getProductsByIds(req.body.productsIds));
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getProductsByIdsAndStoreId(req, res) {
    try{
        res.json(await productsManagmentFunctions.getProductsByIdsAndStoreId(req.query.storeId, req.body.productsIds));
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

function getFiltersAndSortDetailsObject(queryObject) {
    let filtersObject = {}, sortDetailsObject = {};
    for (let objectKey in queryObject) {
        if (objectKey === "categoryId") filtersObject[objectKey] = queryObject[objectKey];
        if (objectKey === "storeId") filtersObject[objectKey] = queryObject[objectKey];
        if (objectKey === "name") filtersObject[objectKey] = { $regex: new RegExp(queryObject[objectKey], 'i') }
        if (objectKey === "sortBy") sortDetailsObject[objectKey] = queryObject[objectKey];
        if (objectKey === "sortType") sortDetailsObject[objectKey] = queryObject[objectKey];
    }
    return {filtersObject, sortDetailsObject};
}

async function getProductInfo(req, res) {
    try {
        res.json(await productsManagmentFunctions.getProductInfo(req.params.productId));
    }
    catch (err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getFlashProductsCount(req, res) {
    try {
        res.json(await productsManagmentFunctions.getFlashProductsCount(getFiltersAndSortDetailsObject(req.query).filtersObject));
    }
    catch (err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getProductsCount(req, res) {
    try {
        res.json(await productsManagmentFunctions.getProductsCount(getFiltersAndSortDetailsObject(req.query).filtersObject));
    }
    catch (err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getAllFlashProductsInsideThePage(req, res) {
    try {
        const queryObject = req.query;
        const filtersAndSortDetailsObject = getFiltersAndSortDetailsObject(queryObject);
        let sortDetailsObject = {};
        if (filtersAndSortDetailsObject.sortDetailsObject) {
            sortDetailsObject[filtersAndSortDetailsObject.sortDetailsObject.sortBy] = Number(filtersAndSortDetailsObject.sortDetailsObject.sortType);
        }
        res.json(await productsManagmentFunctions.getAllFlashProductsInsideThePage(queryObject.pageNumber, queryObject.pageSize, filtersAndSortDetailsObject.filtersObject, sortDetailsObject));
    }
    catch (err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getAllProductsInsideThePage(req, res) {
    try {
        const queryObject = req.query;
        const filtersAndSortDetailsObject = getFiltersAndSortDetailsObject(queryObject);
        let sortDetailsObject = {};
        if (Object.keys(filtersAndSortDetailsObject.sortDetailsObject).length > 0 ) {
            sortDetailsObject[filtersAndSortDetailsObject.sortDetailsObject.sortBy] = Number(filtersAndSortDetailsObject.sortDetailsObject.sortType);
        }
        res.json(await productsManagmentFunctions.getAllProductsInsideThePage(queryObject.pageNumber, queryObject.pageSize, filtersAndSortDetailsObject.filtersObject, sortDetailsObject));
    }
    catch (err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getRelatedProductsInTheProduct(req, res) {
    try{
        res.json(await productsManagmentFunctions.getRelatedProductsInTheProduct(req.params.productId));
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getAllGalleryImages(req, res) {
    try{
        const result = await productsManagmentFunctions.getAllGalleryImages(req.data._id, req.params.productId);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
                return;
            }
        }
        res.json(result);
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function deleteProduct(req, res) {
    try {
        const result = await productsManagmentFunctions.deleteProduct(req.data._id, req.params.productId);
        if(!result.error) {
            unlinkSync(result.data.deletedProductImagePath);
            for (let productImagePath of result.data.galleryImagePathsForDeletedProduct) {
                unlinkSync(productImagePath);
            }
        }
        else {
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
                return;
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function deleteImageFromProductGallery(req, res) {
    try {
        const galleryImagePath = req.query.galleryImagePath;
        const result = await productsManagmentFunctions.deleteImageFromProductGallery(req.data._id, req.params.productId, req.query.galleryImagePath);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
                return;
            }
            if (result.msg === "Sorry, This Product Is Not Exist !!"){
                res.json(result);
                return;
            }
        }
        unlinkSync(galleryImagePath);
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function putProduct(req, res) {
    try {
        const result = await productsManagmentFunctions.updateProduct(req.data._id, req.params.productId, req.body);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
                return;
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function putProductGalleryImage(req, res) {
    try {
        const outputImageFilePath = `assets/images/products/${Math.random()}_${Date.now()}__${req.file.originalname.replaceAll(" ", "_").replace(/\.[^/.]+$/, ".webp")}`;
        await handleResizeImagesAndConvertFormatToWebp([req.file.buffer], outputImageFilePath);
        const oldGalleryImagePath = req.query.oldGalleryImagePath;
        const result = await productsManagmentFunctions.updateProductGalleryImage(req.data._id, req.params.productId, oldGalleryImagePath, outputImageFilePath);
        if (!result.error) {
            // unlinkSync(oldGalleryImagePath);
        }
        else {
            unlinkSync(outputImageFilePath);
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
                return;
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function putProductImage(req, res) {
    try {
        const outputImageFilePath = `assets/images/products/${Math.random()}_${Date.now()}__${req.file.originalname.replaceAll(" ", "_").replace(/\.[^/.]+$/, ".webp")}`;
        await handleResizeImagesAndConvertFormatToWebp([req.file.buffer], [outputImageFilePath]);
        const result = await productsManagmentFunctions.updateProductImage(req.data._id, req.params.productId, outputImageFilePath);
        if (!result.error) {
            // unlinkSync(result.data.deletedProductImagePath);
        }
        else {
            unlinkSync(outputImageFilePath);
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
                return;
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

module.exports = {
    postNewProduct,
    postNewImagesToProductGallery,
    getProductsCount,
    getFlashProductsCount,
    getAllFlashProductsInsideThePage,
    getAllProductsInsideThePage,
    getProductInfo,
    getRelatedProductsInTheProduct,
    getProductsByIds,
    getProductsByIdsAndStoreId,
    getAllGalleryImages,
    deleteProduct,
    deleteImageFromProductGallery,
    putProduct,
    putProductGalleryImage,
    putProductImage,
}