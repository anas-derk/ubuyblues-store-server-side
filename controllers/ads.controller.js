const { getResponseObject } = require("../global/functions");

const adsOPerationsManagmentFunctions = require("../models/ads.model");

async function postNewTextAd(req, res) {
    try{
        const { storeId, content } = req.body;
        res.json(await adsOPerationsManagmentFunctions.addNewAd(req.data._id, { storeId, content, type: "text" }));
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function postNewImageAd(req, res) {
    try{
        const uploadError = req.uploadError;
        if (uploadError) {
            res.status(400).json(getResponseObject(uploadError, true, {}));
            return;
        }
        const bodyData = Object.assign({}, req.body);
        const adInfo = {
            ...{ storeId } = bodyData,
            imagePath: req.file.path,
        };
        res.json(await adsOPerationsManagmentFunctions.addNewAd(req.data._id, { ...adInfo, type: "image"}));
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getAllAds(req, res) {
    try{
        res.json(await adsOPerationsManagmentFunctions.getAllAds());
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function deleteAd(req, res) {
    try {
        const result = await adsOPerationsManagmentFunctions.deleteAd(req.data._id, req.params.adId);
        if(!result.error && result.data?.deletedAdImagePath) {
            unlinkSync(result.data.deletedAdImagePath);
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

module.exports = {
    postNewTextAd,
    postNewImageAd,
    getAllAds,
    deleteAd
}