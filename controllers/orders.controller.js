const { getResponseObject, sendReceiveOrderEmail, sendUpdateOrderEmail, getSuitableTranslations } = require("../global/functions");

const ordersManagmentFunctions = require("../models/orders.model");

const { post } = require("axios");

const { createHmac } = require("crypto");

function getFiltersObject(filters) {
    let filtersObject = {};
    for (let objectKey in filters) {
        if (objectKey === "destination") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "orderNumber") filtersObject[objectKey] = Number(filters[objectKey]);
        if (objectKey === "checkoutStatus") {
            if (filters["destination"] === "admin") {
                filtersObject[objectKey] = filters[objectKey];
            }
        }
        if (objectKey === "_id") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "status") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "customerName") filtersObject[`billingAddress.given_name`] = filters[objectKey];
        if (objectKey === "email") filtersObject[`billingAddress.email`] = filters[objectKey];
        if (objectKey === "customerId") {
            if (filters["destination"] === "admin") {
                filtersObject[objectKey] = filters[objectKey];
            }
        }
        if (objectKey === "isDeleted") {
            if (filters[objectKey] === "yes") {
                filtersObject[objectKey] = true;
            }
            else filtersObject[objectKey] = false;
        }
    }
    return filtersObject;
}

function getFiltersObjectForUpdateOrder(acceptableData) {
    let filterdData = {};
    if (acceptableData.status) filterdData.status = acceptableData.status;
    if (acceptableData.orderAmount) filterdData.orderAmount = acceptableData.orderAmount;
    return filterdData;

}

async function getOrdersCount(req, res) {
    try {
        res.json(await ordersManagmentFunctions.getOrdersCount(req.data._id, getFiltersObject(req.query), req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getAllOrdersInsideThePage(req, res) {
    try {
        const filters = req.query;
        res.json(await ordersManagmentFunctions.getAllOrdersInsideThePage(req.data._id, filters.pageNumber, filters.pageSize, getFiltersObject(filters), filters.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getOrderDetails(req, res) {
    try {
        res.json(await ordersManagmentFunctions.getOrderDetails(req.params.orderId, req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function createPaypalToken() {
    try {
        return (await post(`${process.env.PAYPAL_BASE_API_URL}/v1/oauth2/token`, {
            "grant_type": "client_credentials"
        }, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${Buffer.from(`${process.env.PAYPAL_API_USER_NAME}:${process.env.PAYPAL_API_PASSWORD}`).toString("base64")}`
            }
        })).data;
    }
    catch (err) {
        throw err;
    }
}

async function postNewPaymentOrder(req, res) {
    try {
        const orderData = req.body;
        if (req?.data?._id) {
            orderData.userId = req.data._id;
        }
        const { language } = req.query;
        let result = await ordersManagmentFunctions.createNewOrder(orderData, language);
        if (result.error) {
            if (result.msg === "Sorry, This User Is Not Exist !!") {
                return res.status(401).json(result);
            }
            return res.json(result);
        }
        else {
            const success_url = `${process.env.NODE_ENV === "test" ? `http://localhost:3000/confirmation/${result.data._id}?country=${req.query.country}` : process.env.WEBSITE_URL}/confirmation/${result.data._id}?country=${req.query.country}`,
                cancel_url = `${process.env.NODE_ENV === "test" ? `http://localhost:3000/checkout/${result.data._id}?country=${req.query.country}` : process.env.WEBSITE_URL}/checkout/${result.data._id}?country=${req.query.country}`;
            if (orderData.paymentGateway === "tap") {
                result = (await post(`${process.env.TAP_PAYMENT_GATEWAY_BASE_API_URL}/charges`, {
                    amount: result.data.orderAmount,
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
                        url: success_url
                    },
                    post: {
                        url: `${process.env.BASE_API_URL}/orders/handle-checkout-complete/${result.data._id}`
                    }
                }, {
                    headers: {
                        Authorization: `Bearer ${process.env.TAP_PAYMENT_GATEWAY_SECRET_KEY}`
                    }
                })).data;
                return res.json(getResponseObject(getSuitableTranslations("Creating New Payment Order By Tap Process Has Been Successfully !!", language), false, {
                    paymentURL: result.transaction.url
                }));
            } else if (orderData.paymentGateway === "tabby") {
                result = (await post(`${process.env.TABBY_PAYMENT_GATEWAY_BASE_API_URL}/api/v2/checkout`, {
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
                                    image_url: `${process.env.BASE_API_URL}/${product.imagePath}`,
                                    product_url: `${process.env.WEBSITE_URL}/product-details/${product.productId}`,
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
                                        image_url: `${process.env.BASE_API_URL}/${product.imagePath}`,
                                        product_url: `${process.env.WEBSITE_URL}/product-details/${product.productId}`,
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
                        success: `${process.env.WEBSITE_URL}/confirmation/${result.data._id}`,
                        cancel: `${process.env.WEBSITE_URL}/checkout?storeId=${result.data.storeId}`,
                        failure: `${process.env.WEBSITE_URL}/checkout?storeId=${result.data.storeId}`
                    }
                }, {
                    headers: {
                        Authorization: `Bearer ${process.env.TAPPY_PUBLIC_API_KEY}`
                    }
                })).data;
                return res.json(result.status === "created" ?
                    getResponseObject(getSuitableTranslations("Creating New Payment Order By Tabby Process Has Been Successfully !!", language), false, {
                        paymentURL: result.configuration.available_products.installments[0].web_url
                    }) :
                    getResponseObject(getSuitableTranslations("Sorry, Can't Creating New Payment Order By Tabby Because Exceeding The Payment Limit !!", language), true, {})
                );
            } else if (orderData.paymentGateway === "paypal") {
                let result1 = await createPaypalToken();
                result1 = (await post(`${process.env.PAYPAL_BASE_API_URL}/v2/checkout/orders`, {
                    "intent": "CAPTURE",
                    "purchase_units": [
                        {
                            "amount": {
                                "currency_code": "EUR",
                                "value": result.data.orderAmount
                            },
                            "custom_id": result.data._id
                        }
                    ],
                    "application_context": {
                        "return_url": success_url,
                        "cancel_url": cancel_url
                    }
                }, {
                    headers: {
                        Authorization: `Bearer ${result1.access_token}`
                    }
                })).data;
                return res.json(getResponseObject(getSuitableTranslations("Creating New Payment Order By Paypal Process Has Been Successfully !!", language), false, {
                    paymentURL: result1.links[1].href
                }));
            } else {
                const timestamp = Date.now();
                const nonce = "VeTfR5mdAKjbeErxBXTl20JayTiCz4sb";
                const data = {
                    env: {
                        terminalType: "WEB"
                    },
                    merchantTradeNo: result.data._id,
                    currency: "USDT",
                    orderAmount: result.data.orderAmount,
                    description: "Pay In Ubuyblues",
                    goodsDetails: result.data.products.map((product => ({
                        goodsType: "01",
                        goodsCategory: "D000",
                        referenceGoodsId: product.productId,
                        goodsName: product.name,
                    }))),
                    returnUrl: `${process.env.WEBSITE_URL}/confirmation/${result.data._id}`,
                    cancelUrl: `${process.env.WEBSITE_URL}/checkout?storeId=${result.data.storeId}`,
                    webhookUrl: `${process.env.BASE_API_URL}/orders/handle-change-binance-payment-status/${result.data._id}`
                }
                const signaturePayload = `${timestamp}\n${nonce}\n${JSON.stringify(data)}\n`;
                const signature = createHmac("sha512", process.env.BINANCE_API_SECRET_KEY, {
                    encoding: "utf8"
                }).update(signaturePayload).digest("hex").toUpperCase();
                result = (await post(`${process.env.BINANCE_BASE_API_URL}/binancepay/openapi/v3/order`, data, {
                    headers: {
                        "Content-Type": "application/json",
                        "BinancePay-Timestamp": timestamp,
                        "BinancePay-Nonce": nonce,
                        "BinancePay-Certificate-SN": process.env.BINANCE_API_KEY,
                        "BinancePay-Signature": signature
                    }
                })).data;
                res.json(getResponseObject(getSuitableTranslations("Creating New Payment Order By Binance Process Has Been Successfully !!", language), false, {
                    paymentURL: result.data.checkoutUrl
                }));
            }
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function postCheckoutComplete(req, res) {
    try {
        const result = await ordersManagmentFunctions.changeCheckoutStatusToSuccessfull(req.params.orderId, req.query.language);
        res.json(result);
        if (!result.error) {
            await sendReceiveOrderEmail(result.data.billingAddress.email, result.data, "ar");
        }
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function postPaypalCheckoutComplete(req, res) {
    try {
        const result = req.body;
        if (result?.event_type === "CHECKOUT.ORDER.APPROVED") {
            let result1 = await createPaypalToken();
            result1 = (await post(`${process.env.PAYPAL_BASE_API_URL}/v2/checkout/orders/${result.resource.id}/capture`, {}, {
                headers: {
                    Authorization: `Bearer ${result1.access_token}`
                }
            })).data;
            if (result1.status === "COMPLETED") {
                result1 = await ordersManagmentFunctions.changeCheckoutStatusToSuccessfull(result.resource.purchase_units[0].custom_id, "en");
                res.json(result1);
                if (!result1.error) {
                    try {
                        await sendReceiveOrderEmail(result1.data.billingAddress.email, result1.data, "ar");
                        return;
                    }
                    catch (err) {
                        console.log(err);
                        return;
                    }
                }
            }
        }
        res.json({
            msg: "Sorry, This Event Type Is Not Valid !!",
            error: true,
            data: {}
        });
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function postChangeBinancePaymentStatus(req, res) {
    try {
        if (req.body.bizStatus === "PAY_SUCCESS") {
            res.json({
                returnCode: "SUCCESS",
                returnMessage: null
            });
            const result = await ordersManagmentFunctions.changeCheckoutStatusToSuccessfull(req.params.orderId, req.query.language);
            if (!result.error) {
                await sendReceiveOrderEmail(result.data.billingAddress.email, result.data, "ar");
            }
            return;
        }
        res.json({
            returnCode: "SUCCESS",
            returnMessage: null
        });
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function putOrder(req, res) {
    try {
        const { status } = req.body;
        const result = await ordersManagmentFunctions.updateOrder(req.data._id, req.params.orderId, getFiltersObjectForUpdateOrder({ status }), req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, This Order Is Not Found !!") {
                return res.status(401).json(result);
            }
        }
        if (req.query.isSendEmailToTheCustomer) {
            if (status === "shipping" || status === "completed") {
                result.data.status = status;
                await sendUpdateOrderEmail(result.data.billingAddress.email, result.data, result.data.language);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function putOrderProduct(req, res) {
    try {
        const result = await ordersManagmentFunctions.updateOrderProduct(req.data._id, req.params.orderId, req.params.productId, { quantity, name, unitPrice } = req.body, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, This Order Is Not Found !!" || result.msg !== "Sorry, This Product For This Order Is Not Found !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        console.log(err)
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function deleteOrder(req, res) {
    try {
        const result = await ordersManagmentFunctions.deleteOrder(req.data._id, req.params.orderId, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, This Order Is Not Found !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function deleteProductFromOrder(req, res) {
    try {
        const { orderId, productId } = req.params;
        const result = await ordersManagmentFunctions.deleteProductFromOrder(req.data._id, orderId, productId, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, This Order Is Not Found !!" || result.msg !== "Sorry, This Product For This Order Is Not Found !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

module.exports = {
    getAllOrdersInsideThePage,
    getFiltersObject,
    getOrdersCount,
    getOrderDetails,
    postNewPaymentOrder,
    postCheckoutComplete,
    postPaypalCheckoutComplete,
    postChangeBinancePaymentStatus,
    putOrder,
    putOrderProduct,
    deleteOrder,
    deleteProductFromOrder,
}