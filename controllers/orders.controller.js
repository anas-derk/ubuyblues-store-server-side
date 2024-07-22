const { getResponseObject, sendReceiveOrderEmail } = require("../global/functions");

const ordersManagmentFunctions = require("../models/orders.model");

const { post } = require("axios");

function getFiltersObject(filters) {
    let filtersObject = {};
    for (let objectKey in filters) {
        if (objectKey === "storeId") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "orderNumber") filtersObject[objectKey] = Number(filters[objectKey]);
        if (objectKey === "_id") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "status") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "customerName") filtersObject[`billing_address.given_name`] = filters[objectKey];
        if (objectKey === "email") filtersObject[`billing_address.email`] = filters[objectKey];
        if (objectKey === "customerId") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "isDeleted") {
            if (filters[objectKey] === "yes") {
                filtersObject[objectKey] = true;
            }
            else filtersObject[objectKey] = false;
        }
    }
    return filtersObject;
}

async function getOrdersCount(req, res) {
    try{
        res.json(await ordersManagmentFunctions.getOrdersCount(getFiltersObject(req.query)));
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getAllOrdersInsideThePage(req, res) {
    try{
        const filters = req.query;
        res.json(await ordersManagmentFunctions.getAllOrdersInsideThePage(filters.pageNumber, filters.pageSize, getFiltersObject(filters)));
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function getOrderDetails(req, res) {
    try{
        res.json(await ordersManagmentFunctions.getOrderDetails(req.params.orderId));
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function postNewOrder(req, res) {
    try{
        const result = await ordersManagmentFunctions.createNewOrder(req.body);
        if (!result.error) {
            if (req.body.checkoutStatus === "Checkout Successfull") {
                await sendReceiveOrderEmail(result.data.billingAddress.email, result.data, "ar");
            }
            res.json({
                ...result,
                data: {
                    orderId: result.data.orderId,
                    orderNumber: result.data.orderNumber
                }
            });
            return;
        }
        res.json(result);
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function postNewPaymentOrderByTap(req, res) {
    try{
        const orderData = req.body;
        const result = await ordersManagmentFunctions.createNewOrder(orderData);
        if (!result.error) {
            const response = await post(`${process.env.TAP_PAYMENT_GATEWAY_BASE_API_URL}/charges`, {
                amount: result.data.totalPriceAfterDiscount,
                currency: "USD",
                receipt: {
                    email: true,
                    sms: false
                },
                customer: {
                    first_name: orderData.billingAddress.firstName,
                    last_name: orderData.billingAddress.lastName,
                    email: orderData.billingAddress.email
                },
                source: {
                    id: "src_all"
                },
                reference: {
                    transaction: result.data.orderId,
                    order: result.data.orderNumber,
                },
                redirect: {
                    url: `${process.env.NODE_ENV === "test" ? "http://localhost:3000" : "https://ubuyblues.com"}/confirmation/${result.data.orderId}?country=${req.query.country}`
                },
                post: {
                    url: `https://api.ubuyblues.com/orders/handle-checkout-complete/${result.data.orderId}`
                }
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.TAP_PAYMENT_GATEWAY_SECRET_KEY}`
                }
            });
            res.json(getResponseObject("Creating New Payment Order By Tap Process Has Been Successfully !!", false, response.data));
            return;
        }
        res.json(result);
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function postCheckoutComplete(req, res) {
    try{
        const result = await ordersManagmentFunctions.changeCheckoutStatusToSuccessfull(req.params.orderId);
        res.json(result);
        if (!result.error) {
            await sendReceiveOrderEmail(result.data.billingAddress.email, result.data, "ar");
        }
    }
    catch(err) {
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function putOrder(req, res) {
    try{
        const result = await ordersManagmentFunctions.updateOrder(req.data._id, req.params.orderId, req.body);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
                return;
            }
        }
        res.json(result);
    }
    catch(err){
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function putOrderProduct(req, res) {
    try{
        const result = await ordersManagmentFunctions.updateOrderProduct(req.data._id, req.params.orderId, req.params.productId, req.body);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
                return;
            }
        }
        res.json(result);
    }
    catch(err){
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function deleteOrder(req, res) {
    try{
        const result = await ordersManagmentFunctions.deleteOrder(req.data._id, req.params.orderId);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
                return;
            }
        }
        res.json(result);
    }
    catch(err){
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

async function deleteProductFromOrder(req, res) {
    try{
        const { orderId, productId } = req.params;
        const result = await ordersManagmentFunctions.deleteProductFromOrder(req.data._id, orderId, productId);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
                return;
            }
        }
        res.json(result);
    }
    catch(err){
        console.log(err);
        res.status(500).json(getResponseObject("Internal Server Error !!", true, {}));
    }
}

module.exports = {
    getAllOrdersInsideThePage,
    getFiltersObject,
    getOrdersCount,
    getOrderDetails,
    postNewOrder,
    postNewPaymentOrderByTap,
    postCheckoutComplete,
    putOrder,
    putOrderProduct,
    deleteOrder,
    deleteProductFromOrder,
}