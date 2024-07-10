const {
    getResponseObject,
    sendApproveStoreEmail,
    sendRejectStoreEmail,
    sendBlockStoreEmail,
    sendDeleteStoreEmail,
    sendConfirmRequestAddStoreArrivedEmail
} = require("../global/functions");

const storesManagmentFunctions = require("../models/stores.model");

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
        res.json(await storesManagmentFunctions.getStoresCount(getFiltersObject(req.query)));
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getAllStoresInsideThePage(req, res) {
    try{
        const filters = req.query;
        res.json(await storesManagmentFunctions.getAllStoresInsideThePage(filters.pageNumber, filters.pageSize, getFiltersObject(filters)));
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getStoreDetails(req, res) {
    try{
        res.json(await storesManagmentFunctions.getStoreDetails(req.params.storeId));
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getMainStoreDetails(req, res) {
    try{
        res.json(await storesManagmentFunctions.getMainStoreDetails());
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function postNewStore(req, res) {
    try{
        const uploadError = req.uploadError;
        if (uploadError) {
            res.status(400).json(getResponseObject(uploadError, true, {}));
            return;
        }
        const imagePath = req.file.path;
        const result = await storesManagmentFunctions.createNewStore(Object.assign({}, { ...req.body, imagePath }));
        if (result.error) {
            unlinkSync(imagePath);
        }
        await sendConfirmRequestAddStoreArrivedEmail(result.data.email, result.data.language);
        res.json(result);
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function postApproveStore(req, res) {
    try{
        const result = await storesManagmentFunctions.approveStore(req.data._id, req.params.storeId, req.query.password);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
                return;
            }
            res.json(result);
            return;
        }
        res.json(await sendApproveStoreEmail(result.data.email, req.query.password, result.data.adminId, req.params.storeId, result.data.language));
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function putStoreInfo(req, res) {
    try{
        const result = await storesManagmentFunctions.updateStoreInfo(req.data._id, req.params.storeId, req.body);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
                return;
            }
        }
        res.json(result);
    }
    catch(err){
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function putBlockingStore(req, res) {
    try{
        const result = await storesManagmentFunctions.blockingStore(req.data._id, req.params.storeId, req.query.blockingReason);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
                return;
            }
            res.json(result);
            return;
        }
        res.json(await sendBlockStoreEmail(result.data.email, result.data.adminId, req.params.storeId, result.data.language));
    }
    catch(err){
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function putCancelBlockingStore(req, res) {
    try{
        const result = await storesManagmentFunctions.cancelBlockingStore(req.data._id, req.params.storeId);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
                return;
            }
        }
        res.json(result);
    }
    catch(err){
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function putStoreImage(req, res) {
    try {
        const uploadError = req.uploadError;
        if (uploadError) {
            res.status(400).json(getResponseObject(uploadError, true, {}));
            return;
        }
        const newStoreImagePath = req.file.path;
        const result = await storesManagmentFunctions.changeStoreImage(req.params.storeId, newStoreImagePath.replace(/\\/g, '/'));
        if (!result.error) {
            unlinkSync(result.data.deletedStoreImagePath);
            res.json({
                ...result,
                data: {
                    newStoreImagePath: req.file.path,
                }
            });
        } else {
            unlinkSync(newStoreImagePath);
            res.json(result);
        }
}
    catch (err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function deleteStore(req, res) {
    try{
        const result = await storesManagmentFunctions.deleteStore(req.data._id, req.params.storeId);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
                return;
            }
            res.json(result);
            return;
        }
        unlinkSync(result.data.storeImagePath);
        res.json(await sendDeleteStoreEmail(result.data.email, result.data.adminId, req.params.storeId, result.data.language));
    }
    catch(err){
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function deleteRejectStore(req, res) {
    try{
        const result = await storesManagmentFunctions.rejectStore(req.data._id, req.params.storeId);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
                return;
            }
            res.json(result);
            return;
        }
        unlinkSync(result.data.storeImagePath); 
        res.json(await sendRejectStoreEmail(result.data.ownerEmail, result.data.language));
    }
    catch(err){
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
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