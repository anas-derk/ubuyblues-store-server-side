const mongoose = require("mongoose");

require("dotenv").config({
    path: "../.env",
});

// Create Category Schema

const categorySchema = new mongoose.Schema({
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
    storeId: {
        type: String,
        required: true,
    },
    parent: {
        type: mongoose.Types.ObjectId,
        ref: "categorie",
        default: null
    },
});

// Create Category Model From Category Schema

const categoryModel = mongoose.model("categorie", categorySchema);

async function changeCategorySchema() {
    try {
        await mongoose.connect(process.env.DB_URL);
        let allCategories = await categoryModel.find();
        for (let category of allCategories) {
            await categoryModel.updateOne({ _id: category._id }, {
                name: {
                    ar: category._doc.name,
                    en: category._doc.name,
                    de: category._doc.name,
                    tr: category._doc.name,
                }
            });
        }
        await mongoose.disconnect();
        return "Change Category Schema Process Has Been Successfuly !!";
    } catch (err) {
        await mongoose.disconnect();
        throw Error(err);
    }
}

changeCategorySchema().then((result) => console.log(result));