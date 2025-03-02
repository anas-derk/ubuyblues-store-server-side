const mongoose = require("mongoose");

require("dotenv").config({
    path: "../.env",
});

// Create Product Schema

const productSchema = new mongoose.Schema({
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
    price: {
        type: Number,
        required: true,
    },
    description: {
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
    categories: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: "categorie",
            required: true
        }],
    },
    discount: {
        type: Number,
        default: 0,
    },
    discountInOfferPeriod: {
        type: Number,
        default: 0,
    },
    offerDescription: String,
    numberOfOrders: {
        type: Number,
        default: 0,
    },
    quantity: {
        type: Number,
        default: 1,
    },
    countries: {
        type: Array,
        default: ["KW"],
    },
    ratings: {
        type: Object,
        default: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        }
    },
    postOfDate: {
        type: Date,
        default: Date.now,
    },
    imagePath: {
        type: String,
        required: true,
    },
    threeDImagePath: {
        type: String,
        required: true,
    },
    galleryImagesPaths: Array,
    startDiscountPeriod: Date,
    endDiscountPeriod: Date,
    storeId: {
        type: String,
        required: true,
    }
});

// Create Product Model From Product Schema

const productModel = mongoose.model("product", productSchema);

async function changeProductSchema() {
    try {
        await mongoose.connect(process.env.DB_URL);
        let allProducts = await productModel.find();
        for (let product of allProducts) {
            await productModel.updateOne({ _id: product._id }, {
                name: {
                    ar: product._doc.name,
                    en: product._doc.name,
                    de: product._doc.name,
                    tr: product._doc.name,
                },
                description: {
                    ar: product._doc.description,
                    en: product._doc.description,
                    de: product._doc.description,
                    tr: product._doc.description,
                },
            });
        }
        await mongoose.disconnect();
        return "Change Product Schema Process Has Been Successfuly !!";
    } catch (err) {
        await mongoose.disconnect();
        throw Error(err);
    }
}

changeProductSchema().then((result) => console.log(result));