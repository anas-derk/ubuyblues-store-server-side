const ordersRouter = require("express").Router();

const ordersController = require("../controllers/orders.controller");

const { validateJWT, validateNumberIsPositive, validateNumberIsNotFloat, validateCountry, validateName, validateEmail } = require("../middlewares/global.middlewares");

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
            { fieldName: "First Name In Billing Address", fieldValue: orderDetails?.billingAddress?.firstName, dataType: "string", isRequiredValue: true },
            { fieldName: "Last Name In Billing Address", fieldValue: orderDetails?.billingAddress?.lastName, dataType: "string", isRequiredValue: true },
            { fieldName: "Company Name In Billing Address", fieldValue: orderDetails?.billingAddress?.companyName, dataType: "string", isRequiredValue: false },
            { fieldName: "Country In Billing Address", fieldValue: orderDetails?.billingAddress?.country, dataType: "string", isRequiredValue: true },
            { fieldName: "Street Address In Billing Address", fieldValue: orderDetails?.billingAddress?.streetAddress, dataType: "string", isRequiredValue: true },
            { fieldName: "Apartment Number In Billing Address", fieldValue: orderDetails?.billingAddress?.apartmentNumber, dataType: "number", isRequiredValue: false },
            { fieldName: "City In Billing Address", fieldValue: orderDetails?.billingAddress?.city, dataType: "string", isRequiredValue: true },
            { fieldName: "Postal Code In Billing Address", fieldValue: orderDetails?.billingAddress?.postalCode, dataType: "number", isRequiredValue: true },
            { fieldName: "Phone In Billing Address", fieldValue: orderDetails?.billingAddress?.phone, dataType: "number", isRequiredValue: true },
            { fieldName: "Email In Billing Address", fieldValue: orderDetails?.billingAddress?.email, dataType: "string", isRequiredValue: true },
            { fieldName: "First Name In Shipping Address", fieldValue: orderDetails?.shippingAddress?.firstName, dataType: "string", isRequiredValue: true },
            { fieldName: "Last Name In Shipping Address", fieldValue: orderDetails?.shippingAddress?.lastName, dataType: "string", isRequiredValue: true },
            { fieldName: "Company Name In Shipping Address", fieldValue: orderDetails?.shippingAddress?.companyName, dataType: "string", isRequiredValue: false },
            { fieldName: "Country In Shipping Address", fieldValue: orderDetails?.shippingAddress?.country, dataType: "string", isRequiredValue: true },
            { fieldName: "Street Address In Shipping Address", fieldValue: orderDetails?.shippingAddress?.streetAddress, dataType: "string", isRequiredValue: true },
            { fieldName: "Apartment Number In Shipping Address", fieldValue: orderDetails?.shippingAddress?.apartmentNumber, dataType: "number", isRequiredValue: false },
            { fieldName: "City In Shipping Address", fieldValue: orderDetails?.shippingAddress?.city, dataType: "string", isRequiredValue: true },
            { fieldName: "Postal Code In Shipping Address", fieldValue: orderDetails?.shippingAddress?.postalCode, dataType: "number", isRequiredValue: true },
            { fieldName: "Phone In Shipping Address", fieldValue: orderDetails?.shippingAddress?.phone, dataType: "number", isRequiredValue: true },
            { fieldName: "Email In Shipping Address", fieldValue: orderDetails?.shippingAddress?.email, dataType: "string", isRequiredValue: true },
            { fieldName: "Request Notes", fieldValue: orderDetails?.requestNotes, dataType: "string", isRequiredValue: false },
            { fieldName: "Order Products", fieldValue: orderDetails?.products, dataType: "array", isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => {
        const { products } = req.body;
        validateIsExistValueForFieldsAndDataTypes(
            ...products.map((product) => (
                { fieldName: "Product Id", fieldValue: product?.productId, dataType: "ObjectId", isRequiredValue: true },
                { fieldName: "Quantity", fieldValue: product?.quantity, dataType: "number", isRequiredValue: true }
            ))
        , res, next);
    },
    (req, res, next) => validateCountry(req.query.country, res, next),
    (req, res, next) => validateName(req.query.country, res, next, "Sorry, Please Send Valid Country Name !!"),
    (req, res, next) => validateName(req.body.billingAddress.firstName, res, next, "Sorry, Please Send Valid First Name In Billing Address !!"),
    (req, res, next) => validateName(req.body.billingAddress.lastName, res, next, "Sorry, Please Send Valid Last Name In Billing Address !!"),
    (req, res, next) => validateName(req.body.billingAddress.country, res, next, "Sorry, Please Send Valid Country Name In Billing Address !!"),
    (req, res, next) => {
        const { billingAddress } = req.body;
        if (billingAddress?.apartmentNumber) {
            validateNumberIsPositive(req.body.billingAddress.apartmentNumber, res, next, "Sorry, Please Send Valid Apartment Number In Billing Address ( Number Must Be Greater Than Zero ) !!");
            return;
        }
        next();
    },
    (req, res, next) => {
        const { billingAddress } = req.body;
        if (billingAddress?.apartmentNumber) {
            validateNumberIsNotFloat(req.body.billingAddress.apartmentNumber, res, next, "Sorry, Please Send Valid Apartment Number In Billing Address ( Number Must Be Not Float ) !!");
            return;
        }
        next();
    },
    (req, res, next) => validateEmail(req.body.billingAddress.email, res, next, "Sorry, Please Send Valid Email In Billing Address !!"),
    (req, res, next) => validateName(req.body.shippingAddress.firstName, res, next, "Sorry, Please Send Valid First Name In Billing Address !!"),
    (req, res, next) => validateName(req.body.shippingAddress.lastName, res, next, "Sorry, Please Send Valid Last Name In Billing Address !!"),
    (req, res, next) => validateName(req.body.shippingAddress.country, res, next, "Sorry, Please Send Valid Country Name In Billing Address !!"),
    (req, res, next) => {
        const { billingAddress } = req.body;
        if (billingAddress?.apartmentNumber) {
            validateNumberIsPositive(req.body.billingAddress.apartmentNumber, res, next, "Sorry, Please Send Valid Apartment Number In Shipping Address ( Number Must Be Greater Than Zero ) !!");
            return;
        }
        next();
    },
    (req, res, next) => {
        const { billingAddress } = req.body;
        if (billingAddress?.apartmentNumber) {
            validateNumberIsNotFloat(req.body.billingAddress.apartmentNumber, res, next, "Sorry, Please Send Valid Apartment Number In Shipping Address ( Number Must Be Not Float ) !!");
            return;
        }
        next();
    },
    (req, res, next) => validateEmail(req.body.shippingAddress.email, res, next, "Sorry, Please Send Valid Email In Billing Address !!"),
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