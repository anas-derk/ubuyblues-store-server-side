const favoriteProductsRouter = require("express").Router();

const favoriteProductsController = require("../controllers/favorite_products.controller");

const { validateJWT } = require("../middlewares/global.middlewares");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

favoriteProductsRouter.post("/add-new-favorite-product/:productId", validateJWT, favoriteProductsController.postNewFavoriteProducts);

favoriteProductsRouter.post("/favorite-products-by-products-ids-and-user-id",
    validateJWT,
    favoriteProductsController.getFavoriteProductsByProductsIdsAndUserId
);

favoriteProductsRouter.get("/favorite-products-count", validateJWT, favoriteProductsController.getFavoriteProductsCount);

favoriteProductsRouter.get("/all-favorite-products-inside-the-page",
    validateJWT,
    (req, res, next) => {
        const filters = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "page Number", fieldValue: Number(filters.pageNumber), dataType: "number", isRequiredValue: true },
            { fieldName: "page Size", fieldValue: Number(filters.pageSize), dataType: "number", isRequiredValue: true },
        ], res, next);
    },
    favoriteProductsController.getAllFavoriteProductsInsideThePage
);

favoriteProductsRouter.delete("/:productId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    favoriteProductsController.deleteFavoriteProduct
);

module.exports = favoriteProductsRouter;