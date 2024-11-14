const {
    getResponseObject,
    sendApproveStoreEmail,
    sendRejectStoreEmail,
    sendBlockStoreEmail,
    sendDeleteStoreEmail,
    sendConfirmRequestAddStoreArrivedEmail,
    sendReceiveAddStoreRequestEmail,
    handleResizeImagesAndConvertFormatToWebp,
    getSuitableTranslations
} = require("../global/functions");

const storesOPerationsManagmentFunctions = require("../models/stores.model");

const { unlinkSync } = require("fs");

function getFiltersObject(filters) {
    let filtersObject = {};
    for (let objectKey in filters) {
        if (objectKey === "_id") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "name") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "status") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "ownerFirstName") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "ownerLastName") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "ownerEmail") filtersObject[`ownerEmail`] = filters[objectKey];
    }
    return filtersObject;
}

async function getStoresCount(req, res) {
    try{
        res.json(await storesOPerationsManagmentFunctions.getStoresCount(getFiltersObject(req.query), req.query.language));
    }
    catch(err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getAllStoresInsideThePage(req, res) {
    try{
        const filters = req.query;
        res.json(await storesOPerationsManagmentFunctions.getAllStoresInsideThePage(filters.pageNumber, filters.pageSize, getFiltersObject(filters), filters.language));
    }
    catch(err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getStoreDetails(req, res) {
    try{
        res.json(await storesOPerationsManagmentFunctions.getStoreDetails(req.params.storeId, req.query.language));
    }
    catch(err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getMainStoreDetails(req, res) {
    try{
        res.json(await storesOPerationsManagmentFunctions.getMainStoreDetails(req.query.language));
    }
    catch(err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function postNewStore(req, res) {
    try{
        const outputImageFilePath = `assets/images/stores/${Math.random()}_${Date.now()}__${req.file.originalname.replaceAll(" ", "_").replace(/\.[^/.]+$/, ".webp")}`;
        await handleResizeImagesAndConvertFormatToWebp([req.file.buffer], [outputImageFilePath]);
        const result = await storesOPerationsManagmentFunctions.createNewStore({...Object.assign({}, req.body), imagePath: outputImageFilePath}, req.query.language);
        if (result.error) {
            unlinkSync(outputImageFilePath);
        }
        else {
            try{
                await sendConfirmRequestAddStoreArrivedEmail(result.data.ownerEmail, result.data.language);
                await sendReceiveAddStoreRequestEmail("info@ubuyblues.com", result.data);
            } catch(err) {
                console.log(err);
            }
        }
        res.json(result);
    }
    catch(err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function postApproveStore(req, res) {
    try{
        const result = await storesOPerationsManagmentFunctions.approveStore(req.data._id, req.params.storeId, req.query.password, req.query.language);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied Because This Admin Is Not Website Owner !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                return res.status(401).json(result);
            }
            return res.json(result);
        }
        res.json(await sendApproveStoreEmail(result.data.email, req.query.password, result.data.adminId, req.params.storeId, result.data.language));
    }
    catch(err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function putStoreInfo(req, res) {
    try{
        const result = await storesOPerationsManagmentFunctions.updateStoreInfo(req.data._id, req.params.storeId, req.body, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, This Store Is Not Found !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch(err){
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function putBlockingStore(req, res) {
    try{
        const result = await storesOPerationsManagmentFunctions.blockingStore(req.data._id, req.params.storeId, req.query.blockingReason, req.query.language);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied Because This Admin Is Not Website Owner !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                return res.status(401).json(result);
            }
            return res.json(result);
        }
        res.json(await sendBlockStoreEmail(result.data.email, result.data.adminId, req.params.storeId, result.data.language));
    }
    catch(err){
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function putCancelBlockingStore(req, res) {
    try{
        const result = await storesOPerationsManagmentFunctions.cancelBlockingStore(req.data._id, req.params.storeId, req.query.language);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied Because This Admin Is Not Website Owner !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch(err){
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function putStoreImage(req, res) {
    try {
        const outputImageFilePath = `assets/images/stores/${Math.random()}_${Date.now()}__${req.file.originalname.replaceAll(" ", "_").replace(/\.[^/.]+$/, ".webp")}`;
        await handleResizeImagesAndConvertFormatToWebp([req.file.buffer], [outputImageFilePath]);
        const result = await storesOPerationsManagmentFunctions.changeStoreImage(req.data._id, req.params.storeId, outputImageFilePath, req.query.language);
        if (!result.error) {
            unlinkSync(result.data.deletedStoreImagePath);
            res.json({
                ...result,
                data: {
                    newStoreImagePath: outputImageFilePath,
                }
            });
        } else {
            unlinkSync(newStoreImagePath);
            if (result.msg === "Sorry, Permission Denied Because This Admin Is Not Website Owner !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                return res.status(401).json(result);
            }
            return res.json(result);
        }
}
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function deleteStore(req, res) {
    try{
        const result = await storesOPerationsManagmentFunctions.deleteStore(req.data._id, req.params.storeId, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, This Store Is Not Found !!") {
                return res.status(401).json(result);
            }
            return res.json(result);
        }
        unlinkSync(result.data.storeImagePath);
        res.json(await sendDeleteStoreEmail(result.data.email, result.data.adminId, req.params.storeId, result.data.language));
    }
    catch(err){
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function deleteRejectStore(req, res) {
    try{
        const result = await storesOPerationsManagmentFunctions.rejectStore(req.data._id, req.params.storeId, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, This Store Is Not Found !!") {
                return res.status(401).json(result);
            }
            return res.json(result);
        }
        unlinkSync(result.data.storeImagePath); 
        res.json(await sendRejectStoreEmail(result.data.ownerEmail, result.data.language));
    }
    catch(err){
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

module.exports = {
    getAllStoresInsideThePage,
    getStoresCount,
    getStoreDetails,
    getMainStoreDetails,
    postNewStore,
    postApproveStore,
    putStoreInfo,
    putBlockingStore,
    putStoreImage,
    putCancelBlockingStore,
    deleteStore,
    deleteRejectStore,
}