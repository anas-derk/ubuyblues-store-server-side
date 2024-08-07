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
                amount: result.data.order.orderAmount,
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

async function postNewPaymentOrderByTabby(req, res) {
    try{
        const result = await ordersManagmentFunctions.createNewOrder(req.body);
        if (!result.error) {
            const response = await post(`${process.env.TABBY_PAYMENT_GATEWAY_BASE_API_URL}/api/v2/checkout`, {
                payment: {
                    amount: String((result.data.orderAmount * 0.31).toFixed(3)),
                    currency: "KWD",
                    buyer: {
                        phone: "+96590000001",
                        email: result.data.billingAddress.email,
                        name: result.data.billingAddress.firstName + " " + result.data.billingAddress.lastName,
                    },
                    shipping_address: {
                        city: result.data.shippingAddress.city,
                        address: result.data.shippingAddress.streetAddress,
                        zip: String(result.data.shippingAddress.postalCode)
                    },
                    order: {
                        tax_amount: "0.00",
                        shipping_amount: String(result.data.shippingCost.forLocalProducts + result.data.shippingCost.forInternationalProducts),
                        discount_amount: String(result.data.totalDiscount),
                        reference_id: String(result.data.orderNumber),
                        items: result.data.products.map(product => (
                            {
                                title: product.name,
                                quantity: product.quantity,
                                unit_price: String(product.unitPrice),
                                discount_amount: String(product.discount),
                                // reference_id: product.productId,
                                image_url: `https://api.ubuyblues.com/${product.imagePath}`,
                                product_url: `https://ubuyblues.com/product-details/${product.productId}`,
                                category: "TOYS"
                            }
                        ))
                    },
                    buyer_history: {
                        registered_since: "2019-08-24T14:15:22Z",
                        loyalty_level: 1,
                    },
                    order_history: [
                        {
                            purchased_at: result.data.addedDate,
                            amount: String((result.data.orderAmount * 0.31).toFixed(3)),
                            status: "new",
                            buyer: {
                                phone: "+96590000001",
                                email: result.data.billingAddress.email,
                                name: result.data.billingAddress.firstName + " " + result.data.billingAddress.lastName,
                            },
                            shipping_address: {
                                city: result.data.shippingAddress.city,
                                address: result.data.shippingAddress.streetAddress,
                                zip: String(result.data.shippingAddress.postalCode)
                            },
                            items: result.data.products.map(product => (
                                {
                                    title: product.name,
                                    quantity: product.quantity,
                                    unit_price: String(product.unitPrice),
                                    discount_amount: String(product.discount),
                                    // reference_id: product.productId,
                                    image_url: `https://api.ubuyblues.com/${product.imagePath}`,
                                    product_url: `https://ubuyblues.com/product-details/${product.productId}`,
                                    category: "TOYS"
                                }
                            ))
                        }
                    ],
                    meta: {
                        order_id: result.data._id,
                    }
                },
                lang: "ar",
                merchant_code: "UBUYBLUESkwt",
                merchant_urls: {
                    success: `https://ubuyblues.com/confirmation/${result.data._id}`,
                    cancel: `https://ubuyblues.com/checkout?storeId=${result.data.storeId}`,
                    failure: `https://ubuyblues.com/checkout?storeId=${result.data.storeId}`
                }
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.TAPPY_PUBLIC_API_KEY}`
                }
            });
            res.json(response.data.status === "created" ?
                getResponseObject("Creating New Payment Order By Tabby Process Has Been Successfully !!", false, {
                    checkoutURL: response.data.configuration.available_products.installments[0].web_url
                }) :
                getResponseObject("Sorry, Can't Creating New Payment Order By Tabby Because Exceeding The Payment Limit !!" , true, {})
            );
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
    postNewPaymentOrderByTabby,
    postCheckoutComplete,
    putOrder,
    putOrderProduct,
    deleteOrder,
    deleteProductFromOrder,
}