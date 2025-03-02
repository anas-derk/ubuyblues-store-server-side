const mongoose = require("mongoose");

require("dotenv").config({
    path: "../.env",
});

// Create Store Schema

const storeSchema = new mongoose.Schema({
    name: {
        ar: {
            type: String,
            required: true,
        },
        en: {
            type: String,
            required: true,
        },
        de: {
            type: String,
            required: true,
        },
        tr: {
            type: String,
            required: true,
        },
    },
    imagePath: {
        type: String,
        required: true,
    },
    ownerFirstName: {
        type: String,
        required: true,
    },
    ownerLastName: {
        type: String,
        required: true,
    },
    ownerEmail: {
        type: String,
        required: true,
    },
    productsType: {
        ar: {
            type: String,
            required: true,
        },
        en: {
            type: String,
            required: true,
        },
        de: {
            type: String,
            required: true,
        },
        tr: {
            type: String,
            required: true,
        },
    },
    productsDescription: {
        ar: {
            type: String,
            required: true,
        },
        en: {
            type: String,
            required: true,
        },
        de: {
            type: String,
            required: true,
        },
        tr: {
            type: String,
            required: true,
        },
    },
    status: {
        type: String,
        default: "pending",
        enum: [
            "pending",
            "approving",
            "rejecting",
            "blocking",
        ],
    },
    isMainStore: Boolean,
    language: {
        type: String,
        enum: [
            "ar",
            "en",
            "de",
            "tr"
        ],
        default: "en"
    },
    creatingOrderDate: {
        type: Date,
        default: Date.now,
    },
    approveDate: Date,
    blockingDate: Date,
    dateOfCancelBlocking: Date,
    blockingReason: String,
});

// Create Store Model From Store Schema

const storeModel = mongoose.model("store", storeSchema);

async function changeStoreSchema() {
    try {
        await mongoose.connect(process.env.DB_URL);
        let allStores = await storeModel.find();
        for (let store of allStores) {
            await storeModel.updateOne({ _id: store._id }, {
                name: {
                    ar: store._doc.name,
                    en: store._doc.name,
                    de: store._doc.name,
                    tr: store._doc.name,
                },
                productsType: {
                    ar: store._doc.productsType,
                    en: store._doc.productsType,
                    de: store._doc.productsType,
                    tr: store._doc.productsType,
                },
                productsDescription: {
                    ar: store._doc.productsDescription,
                    en: store._doc.productsDescription,
                    de: store._doc.productsDescription,
                    tr: store._doc.productsDescription,
                },
            });
        }
        await mongoose.disconnect();
        return "Change Store Schema Process Has Been Successfuly !!";
    } catch (err) {
        await mongoose.disconnect();
        throw Error(err);
    }
}

changeStoreSchema().then((result) => console.log(result));