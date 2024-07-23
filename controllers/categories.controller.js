const { getResponseObject } = require("../global/functions");

const categoriesManagmentFunctions = require("../models/categories.model");

function getFiltersObject(filters) {
    let filtersObject = {};
    for (let objectKey in filters) {
        if (objectKey === "storeId") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "categoryId") filtersObject[objectKey] = filters[objectKey];
    }
    return filtersObject;
}

async function postNewCategory(req, res) {
    try{
        const result = await categoriesManagmentFunctions.addNewCategory(req.data._id, req.body.categoryName);
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

async function getAllCategories(req, res) {
    try {
        res.json(await categoriesManagmentFunctions.getAllCategories(getFiltersObject(req.query)));
    }
    catch (err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getCategoryInfo(req, res) {
    try {
        res.json(await categoriesManagmentFunctions.getCategoryInfo(req.params.categoryId));
    }
    catch (err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getCategoriesCount(req, res) {
    try {
        res.json(await categoriesManagmentFunctions.getCategoriesCount(getFiltersObject(req.query)));
    }
    catch (err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getAllCategoriesInsideThePage(req, res) {
    try {
        const filters = req.query;
        res.json(await categoriesManagmentFunctions.getAllCategoriesInsideThePage(filters.pageNumber, filters.pageSize, getFiltersObject(filters)));
    }
    catch (err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function deleteCategory(req, res) {
    try{
        const result = await categoriesManagmentFunctions.deleteCategory(req.data._id, req.params.categoryId);
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

async function putCategory(req, res) {
    try{
        const result = await categoriesManagmentFunctions.updateCategory(req.data._id, req.params.categoryId, req.body.newCategoryName);
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
    postNewCategory,
    getAllCategories,
    getCategoriesCount,
    getAllCategoriesInsideThePage,
    getCategoryInfo,
    deleteCategory,
    putCategory,
}