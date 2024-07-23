const categoriesRouter = require("express").Router();

const categoriesController = require("../controllers/categories.controller");

const { validateJWT } = require("../middlewares/global.middlewares");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

categoriesRouter.post("/add-new-category",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Category Name", fieldValue: req.body.categoryName, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    categoriesController.postNewCategory
);

categoriesRouter.get("/category-info/:categoryId",
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Category Id", fieldValue: req.params.categoryId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    categoriesController.getCategoryInfo
);

categoriesRouter.get("/all-categories", categoriesController.getAllCategories);

categoriesRouter.get("/categories-count",
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.query.storeId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    categoriesController.getCategoriesCount
);

categoriesRouter.get("/all-categories-inside-the-page",
    (req, res, next) => {
        const { pageNumber, pageSize } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "page Number", fieldValue: Number(pageNumber), dataType: "number", isRequiredValue: true },
            { fieldName: "page Size", fieldValue: Number(pageSize), dataType: "number", isRequiredValue: true },
        ], res, next);
    },
    categoriesController.getAllCategoriesInsideThePage
);

categoriesRouter.delete("/:categoryId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "category Id", fieldValue: req.params.categoryId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    categoriesController.deleteCategory
);

categoriesRouter.put("/:categoryId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "category Id", fieldValue: req.params.categoryId, dataType: "ObjectId", isRequiredValue: true },
            { fieldName: "new Category Name", fieldValue: req.body.newCategoryName, dataType: "string", isRequiredValue: true },
        ], res, next);
    },
    categoriesController.putCategory
);

module.exports = categoriesRouter;