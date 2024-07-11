const ordersRouter = require("express").Router();

const ordersController = require("../controllers/orders.controller");

const { validateJWT, validateNumberIsPositive, validateNumberIsNotFloat, validateCountry } = require("../middlewares/global.middlewares");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

ordersRouter.get("/orders-count",
    (req, res, next) => {
        const { pageNumber, pageSize } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "page Number", fieldValue: Number(pageNumber), dataType: "number", isRequiredValue: false },
            { fieldName: "page Size", fieldValue: Number(pageSize), dataType: "number", isRequiredValue: false },
        ], res, next);
    },
    (req, res, next) => {
        const { pageNumber } = req.query;
        if (pageNumber) {
            return validateNumberIsPositive(req.query.pageNumber, res, next);
        }
        next();
    },
    (req, res, next) => {
        const { pageNumber } = req.query;
        if (pageNumber) {
            return validateNumberIsPositive(req.query.pageSize, res, next);
        }
        next();
    },
    (req, res, next) => {
        const { pageNumber } = req.query;
        if (pageNumber) {
            return validateNumberIsNotFloat(req.query.pageNumber, res, next);
        }
        next();
    },
    (req, res, next) => {
        const { pageNumber } = req.query;
        if (pageNumber) {
            return validateNumberIsNotFloat(req.query.pageSize, res, next);
        }
        next();
    },
    ordersController.getOrdersCount
);

ordersRouter.get("/all-orders-inside-the-page",
    (req, res, next) => {
        const filters = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "page Number", fieldValue: Number(filters.pageNumber), dataType: "number", isRequiredValue: true },
            { fieldName: "page Size", fieldValue: Number(filters.pageSize), dataType: "number", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateNumberIsPositive(req.query.pageNumber, res, next),
    (req, res, next) => validateNumberIsPositive(req.query.pageSize, res, next),
    (req, res, next) => validateNumberIsNotFloat(req.query.pageNumber, res, next),
    (req, res, next) => validateNumberIsNotFloat(req.query.pageSize, res, next),
    ordersController.getAllOrdersInsideThePage
);

ordersRouter.get("/order-details/:orderId",
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Order Id", fieldValue: req.params.orderId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    ordersController.getOrderDetails
);

ordersRouter.post("/create-new-order",
    (req, res, next) => {
        const orderDetails = req.body;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Customer Id", fieldValue: orderDetails?.customerId, dataType: "ObjectId", isRequiredValue: false },
            { fieldName: "Country", fieldValue: req.query.country, dataType: "string", isRequiredValue: true },
            { fieldName: "First Name In Billing Address", fieldValue: orderDetails?.billing_address?.firstName, dataType: "string", isRequiredValue: true },
            { fieldName: "Last Name In Billing Address", fieldValue: orderDetails?.billing_address?.lastName, dataType: "string", isRequiredValue: true },
            { fieldName: "Company Name In Billing Address", fieldValue: orderDetails?.billing_address?.company_name, dataType: "string", isRequiredValue: false },
            { fieldName: "Country In Billing Address", fieldValue: orderDetails?.billing_address?.country, dataType: "string", isRequiredValue: true },
            { fieldName: "Street Address In Billing Address", fieldValue: orderDetails?.billing_address?.street_address, dataType: "string", isRequiredValue: true },
            { fieldName: "Apartment Number In Billing Address", fieldValue: orderDetails?.billing_address?.apartment_number, dataType: "number", isRequiredValue: false },
            { fieldName: "City In Billing Address", fieldValue: orderDetails?.billing_address?.city, dataType: "string", isRequiredValue: true },
            { fieldName: "Postal Code In Billing Address", fieldValue: orderDetails?.billing_address?.postal_code, dataType: "number", isRequiredValue: true },
            { fieldName: "Phone In Billing Address", fieldValue: orderDetails?.billing_address?.phone, dataType: "number", isRequiredValue: true },
            { fieldName: "Email In Billing Address", fieldValue: orderDetails?.billing_address?.email, dataType: "string", isRequiredValue: true },
            { fieldName: "First Name In Shipping Address", fieldValue: orderDetails?.shipping_address?.firstName, dataType: "string", isRequiredValue: true },
            { fieldName: "Last Name In Shipping Address", fieldValue: orderDetails?.shipping_address?.lastName, dataType: "string", isRequiredValue: true },
            { fieldName: "Company Name In Shipping Address", fieldValue: orderDetails?.shipping_address?.company_name, dataType: "string", isRequiredValue: false },
            { fieldName: "Country In Shipping Address", fieldValue: orderDetails?.shipping_address?.country, dataType: "string", isRequiredValue: true },
            { fieldName: "Street Address In Shipping Address", fieldValue: orderDetails?.shipping_address?.street_address, dataType: "string", isRequiredValue: true },
            { fieldName: "Apartment Number In Shipping Address", fieldValue: orderDetails?.shipping_address?.apartment_number, dataType: "number", isRequiredValue: false },
            { fieldName: "City In Shipping Address", fieldValue: orderDetails?.shipping_address?.city, dataType: "string", isRequiredValue: true },
            { fieldName: "Postal Code In Shipping Address", fieldValue: orderDetails?.shipping_address?.postal_code, dataType: "number", isRequiredValue: true },
            { fieldName: "Phone In Shipping Address", fieldValue: orderDetails?.shipping_address?.phone, dataType: "number", isRequiredValue: true },
            { fieldName: "Email In Shipping Address", fieldValue: orderDetails?.shipping_address?.email, dataType: "string", isRequiredValue: true },
            { fieldName: "Request Notes", fieldValue: orderDetails?.requestNotes, dataType: "string", isRequiredValue: false },
            { fieldName: "Order Products", fieldValue: orderDetails?.products, dataType: "array", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => {
        const { products } = req.body;
        validateIsExistValueForFieldsAndDataTypes(
            ...products.map((product) => (
                { fieldName: "Product Id", fieldValue: product?.productId, dataType: "ObjectId", isRequiredValue: true }
            ))
        , res, next);
    },
    (req, res, next) => validateCountry(req.query.country, res, next),
    ordersController.postNewOrder
);

ordersRouter.post("/create-payment-order-by-tap", ordersController.postNewPaymentOrderByTap);

ordersRouter.post("/update-order/:orderId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Order Id", fieldValue: req.params.orderId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    ordersController.putOrder
);

ordersRouter.put("/products/update-product/:orderId/:productId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Order Id", fieldValue: req.params.orderId, dataType: "ObjectId", isRequiredValue: true },
            { fieldName: "Product Id", fieldValue: req.params.productId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    ordersController.putOrderProduct
);

ordersRouter.delete("/delete-order/:orderId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Order Id", fieldValue: req.params.orderId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    ordersController.deleteOrder
);

ordersRouter.delete("/products/delete-product/:orderId/:productId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Order Id", fieldValue: req.params.orderId, dataType: "ObjectId", isRequiredValue: true },
            { fieldName: "Product Id", fieldValue: req.params.productId, dataType: "ObjectId", isRequiredValue: true },
        ], res, next);
    },
    ordersController.deleteProductFromOrder
);

module.exports = ordersRouter;