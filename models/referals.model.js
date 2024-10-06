// Import Referal Model Object

const { referalModel } = require("../models/all.models");

const { getSuitableTranslations } = require("../global/functions");

async function addNewReferal(referalDetails, language) {
    try {
        const referal = await referalModel.findOne({ email: referalDetails.email });
        if (referal) {
            return {
                msg: getSuitableTranslations("Sorry, This Referal Is Already Exist !!", language),
                error: true,
                data: {},
            }
        }
        await (new referalModel(referalDetails)).save();
        return {
            msg: getSuitableTranslations("Creating New Referal Process Has Been Successfuly !!", language),
            error: false,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getProductReferalsCount(filters, language) {
    try {
        return {
            msg: getSuitableTranslations("Get Product Referals Count Process Has Been Successfully !!", language),
            error: false,
            data: await referalModel.countDocuments(filters),
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getAllProductReferalsInsideThePage(pageNumber, pageSize, filters, language) {
    try {
        return {
            msg: getSuitableTranslations("Get Products Count Inside The Page: {{pageNumber}} Process Has Been Successfully !!", language, { pageNumber }),
            error: false,
            data: await referalModel.find(filters).skip((pageNumber - 1) * pageSize).limit(pageSize),
        }
    }
    catch (err) {
        throw Error(err);
    }
}

module.exports = {
    addNewReferal,
    getProductReferalsCount,
    getAllProductReferalsInsideThePage,
}