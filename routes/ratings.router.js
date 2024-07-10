const ratingsRouter = require("express").Router();

const ratingsController = require("../controllers/ratings.controller");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

const { validateJWT } = require("../middlewares/global.middlewares");

ratingsRouter.post("/select-product-rating", validateJWT, ratingsController.postSelectProductRating);

ratingsRouter.get("/product-rating-by-user-id/:productId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    ratingsController.getProductRatingByUserId
);

module.exports = ratingsRouter;