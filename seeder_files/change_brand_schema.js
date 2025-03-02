const mongoose = require("mongoose");

require("dotenv").config({
    path: "../.env",
});

// Create Brand Schema

const brandSchema = new mongoose.Schema({
    imagePath: {
        type: String,
        required: true,
    },
    title: {
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
    }
});

// Create Brand Model From Brand Schema

const brandModel = mongoose.model("brand", brandSchema);

async function changeBrandScheam() {
    try {
        await mongoose.connect(process.env.DB_URL);
        let allBrands = await brandModel.find();
        for (let brand of allBrands) {
            await brandModel.updateOne({ _id: brand._id }, {
                title: {
                    ar: brand._doc.title,
                    en: brand._doc.title,
                    de: brand._doc.title,
                    tr: brand._doc.title,
                }
            });
        }
        await mongoose.disconnect();
        return "Change Brand Schema Process Has Been Successfuly !!";
    } catch (err) {
        await mongoose.disconnect();
        throw Error(err);
    }
}

changeBrandScheam().then((result) => console.log(result));