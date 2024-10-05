const { getResponseObject, handleResizeImagesAndConvertFormatToWebp } = require("../global/functions");

const adsOPerationsManagmentFunctions = require("../models/ads.model");

const { unlinkSync } = require("fs");

function getFiltersObject(filters) {
    let filtersObject = {};
    for (let objectKey in filters) {
        if (objectKey === "storeId") filtersObject[objectKey] = filters[objectKey];
    }
    return filtersObject;
}

async function postNewTextAd(req, res) {
    try{
        const result = await adsOPerationsManagmentFunctions.addNewAd(req.data._id, { content: req.body.content, type: "text" });
        if (result.error) {
            if (result.msg !== "Sorry, Can't Add New Text Ad Because Arrive To Max Limits For Text Ads Count ( Limits: 10 ) !!") {
                return res.status(401).json(result);
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
        const outputImageFilePath = `assets/images/ads/${Math.random()}_${Date.now()}__${req.file.originalname.replaceAll(" ", "_").replace(/\.[^/.]+$/, ".webp")}`;
        await handleResizeImagesAndConvertFormatToWebp([req.file.buffer], [outputImageFilePath]);
        const bodyData = Object.assign({}, req.body);
        const adInfo = {
            ...bodyData,
            imagePath: outputImageFilePath,
            type: "image"
        };
        const result = await adsOPerationsManagmentFunctions.addNewAd(req.data._id, adInfo);
        if (result.error) {
            if (result.msg !== "Sorry, Can't Add New Text Ad Because Arrive To Max Limits For Text Ads Count ( Limits: 10 ) !!") {
                return res.status(401).json(result);
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
        const filters = req.query;
        res.json(await adsOPerationsManagmentFunctions.getAllAds(getFiltersObject(filters), req.__));

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
            if (result.msg !== "Sorry, This Ad Is Not Exist !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function putAdImage(req, res) {
    try {
        const outputImageFilePath = `assets/images/ads/${Math.random()}_${Date.now()}__${req.file.originalname.replaceAll(" ", "_").replace(/\.[^/.]+$/, ".webp")}`;
        await handleResizeImagesAndConvertFormatToWebp([req.file.buffer], [outputImageFilePath]);
        const result = await adsOPerationsManagmentFunctions.updateAdImage(req.data._id, req.params.adId, outputImageFilePath);
        if (!result.error) {
            unlinkSync(result.data.oldAdImagePath);
        }
        else {
            unlinkSync(outputImageFilePath);
            if (result.msg !== "Sorry, Type Of Ad Is Not Image !!" || result.msg !== "Sorry, This Ad Is Not Exist !!") {
                return res.status(401).json(result);
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
            if (result.msg !== "Sorry, Type Of Ad Is Not Text !!" || result.msg !== "Sorry, This Ad Is Not Exist !!") {
                return res.status(401).json(result);
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