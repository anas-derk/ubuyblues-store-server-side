// Import Admin Model Object

const { appearedSectionsModel, adminModel } = require("../models/all.models");

async function getAllSections() {
    try {
        return {
            msg: "Get All Sections Process Has Been Successfully !!",
            error: false,
            data: await appearedSectionsModel.find({}),
        }
    } catch (err) {
        throw Error(err);
    }
}

async function updateSectionsStatus(authorizationId,sectionsStatus) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin) {
            if (admin.isWebsiteOwner) {
                for (let i = 0; i < 4; i++) {
                    await appearedSectionsModel.updateOne({ _id: sectionsStatus[i]._id }, { isAppeared: sectionsStatus[i].isAppeared });
                }
                return {
                    msg: "Updating Section Status Has Been Successfully !!",
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
    } catch (err) {
        throw Error(err);
    }
}

module.exports = {
    updateSectionsStatus,
    getAllSections,
}