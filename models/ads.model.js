// Import Product Model Object

const { adsModel, adminModel } = require("../models/all.models");

async function addNewAd(authorizationId, adsInfo) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin){
            if (!admin.isBlocked && admin.storeId === adsInfo.storeId) {
                const textAdsCount = await adsModel.countDocuments({ type: adsInfo.type });
                if (textAdsCount >= 10) {
                    return {
                        msg: "Sorry, Can't Add New Text Ad Because Arrive To Max Limits For Text Ads Count ( Limits: 10 ) !!",
                        error: true,
                        data: {},
                    }
                }
                await (new adsModel(adsInfo)).save();
                return {
                    msg: "Adding New Text Ad Process Has Been Successfully",
                    error: false,
                    data: {},
                }
            }
            return {
                msg: "Sorry, Permission Denied !!",
                error: true,
                data: {},
            }
        }
        return {
            msg: "Sorry, This Admin Is Not Exist !!",
            error: true,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getAllAds() {
    try{
        return {
            msg: "Get All Ads Process Has Been Successfully !!",
            error: false,
            data: await adsModel.find(),
        }
    }
    catch(err) {
        throw Error(err);
    }
}

module.exports = {
    addNewAd,
    getAllAds
}