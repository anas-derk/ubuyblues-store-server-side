const { getResponseObject } = require("../global/functions");

const adsOPerationsManagmentFunctions = require("../models/ads.model");

const { unlinkSync } = require("fs");

async function postNewTextAd(req, res) {
    try{
        const { content } = req.body;
        const result = await adsOPerationsManagmentFunctions.addNewAd(req.data._id, { content, type: "text" });
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

async function postNewImageAd(req, res) {
    try{
        const uploadError = req.uploadError;
        if (uploadError) {
            res.status(400).json(getResponseObject(uploadError, true, {}));
            return;
        }
        const bodyData = Object.assign({}, req.body);
        const adInfo = {
            ...bodyData,
            imagePath: req.file.path,
            type: "image"
        };
        const result = await adsOPerationsManagmentFunctions.addNewAd(req.data._id, adInfo);
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
        console.log(err);
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function putAdImage(req, res) {
    try {
        const uploadError = req.uploadError;
        if (uploadError) {
            res.status(400).json(getResponseObject(uploadError, true, {}));
            return;
        }
        const result = await adsOPerationsManagmentFunctions.updateAdImage(req.data._id, req.params.adId, req.file.path.replace(/\\/g, '/'));
        if (!result.error) {
            unlinkSync(result.data.oldAdImagePath);
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

async function putTextAdContent(req, res) {
    try{
        const result = await adsOPerationsManagmentFunctions.updateTextAdContent(req.data._id, req.params.adId, req.body.content);
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

module.exports = {
    postNewTextAd,
    postNewImageAd,
    getAllAds,
    deleteAd,
    putAdImage,
    putTextAdContent
}