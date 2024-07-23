// Import Product Model Object

const { adsModel, adminModel } = require("../models/all.models");

async function addNewAd(authorizationId, adsInfo) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin){
            if (!admin.isBlocked) {
                const textAdsCount = await adsModel.countDocuments({ type: adsInfo.type });
                if (textAdsCount >= 10) {
                    return {
                        msg: "Sorry, Can't Add New Text Ad Because Arrive To Max Limits For Text Ads Count ( Limits: 10 ) !!",
                        error: true,
                        data: {},
                    }
                }
                await (new adsModel({ ...adsInfo, storeId: admin.storeId })).save();
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

async function getAllAds(filters) {
    try{
        return {
            msg: "Get All Ads Process Has Been Successfully !!",
            error: false,
            data: await adsModel.find(filters),
        }
    }
    catch(err) {
        throw Error(err);
    }
}

async function deleteAd(authorizationId, adId) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin){
            if (!admin.isBlocked) {
                const adInfo = await adsModel.findOne({
                    _id: adId,
                });
                if (adInfo) {
                    if (adInfo.storeId === admin.storeId) {
                        await adInfo.deleteOne({
                            _id: adId,
                        });
                        return {
                            msg: "Deleting Ad Process Has Been Successfuly !!",
                            error: false,
                            data: adInfo.type === "image" ? {
                                deletedAdImagePath: adInfo.imagePath,
                            } : {},
                        }
                    }
                    return {
                        msg: "Sorry, Permission Denied !!",
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: "Sorry, This Ad Is Not Exist !!",
                    error: true,
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

async function updateAdImage(authorizationId, adId, newAdImagePath) {
    try{
        const admin = await adminModel.findById(authorizationId);
        if (admin){
            if (!admin.isBlocked) {
                const adInfo = await adsModel.findById(adId);
                if (adInfo) {
                    if (adInfo.storeId === admin.storeId) {
                        if (adInfo.type === "image") {
                            await adsModel.updateOne({ _id: adId }, {
                                imagePath: newAdImagePath,
                            });
                            return {
                                msg: "Change Ad Image Process Has Been Successfully !!",
                                error: false,
                                data: {
                                    oldAdImagePath: adInfo.imagePath,
                                    newAdImagePath
                                },
                            }
                        }
                        return {
                            msg: "Sorry, Type Of Ad Is Not Image !!",
                            error: true,
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
                    msg: "Sorry, This Ad Is Not Exist !!",
                    error: true,
                    data: adInfo.imagePath,
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
    catch(err) {
        throw Error(err);
    }
}

async function updateTextAdContent(authorizationId, adId, newTextAdContent) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin){
            if (!admin.isBlocked) {
                const adInfo = await adsModel.findOne({ _id: adId });
                if (adInfo) {
                    if (adInfo.storeId === admin.storeId) {
                        if (adInfo.type === "text") {
                            await adsModel.updateOne( { _id: adId } , { content: newTextAdContent });
                            return {
                                msg:  "Updating Text Ad Content Process Has Been Successfuly ...",
                                error: false,
                                data: {},
                            }
                        }
                        return {
                            msg: "Sorry, Type Of Ad Is Not Text !!",
                            error: true,
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
                    msg: "Sorry, This Ad Is Not Exist !!",
                    error: true,
                    data: {},
                };
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

module.exports = {
    addNewAd,
    getAllAds,
    deleteAd,
    updateAdImage,
    updateTextAdContent
}