// Import  Order Model Object

const { orderModel, userModel, adminModel, productsWalletModel } = require("../models/all.models");

async function getOrdersCount(filters) {
    try {
        return {
            msg: "Get Orders Count Process Has Been Successfully !!",
            error: false,
            data: await orderModel.countDocuments(filters),
        }
    } catch (err) {
        throw Error(err);
    }
}

async function getAllOrdersInsideThePage(pageNumber, pageSize, filters) {
    try {
        return {
            msg: `Get All Orders Inside The Page: ${pageNumber} Process Has Been Successfully !!`,
            error: false,
            data: await orderModel.find(filters).skip((pageNumber - 1) * pageSize).limit(pageSize).sort({ orderNumber: -1 }),
        }
    } catch (err) {
        throw Error(err);
    }
}

async function getOrderDetails(orderId) {
    try {
        const order = await orderModel.findById(orderId);
        if (order) {
            return {
                msg: `Get Details For Order: ${orderId} Process Has Been Successfully !!`,
                error: false,
                data: order,
            }
        }
        return {
            msg: "Sorry, This Order Is Not Found !!",
            error: true,
            data: {},
        }
    } catch (err) {
        throw Error(err);
    }
}

async function createNewOrder(orderDetails) {
    try {
        const ordersCount = await orderModel.countDocuments();
        const newOrder = new orderModel({ ...orderDetails, orderNumber: ordersCount + 1 });
        const { _id, orderNumber } = await newOrder.save();
        if (orderDetails.customerId) {
            const user = await userModel.findOne({ _id: orderDetails.customerId });
            if (user) {
                let newProductsForUserInsideTheWallet = [];
                const orderProducts = await productsWalletModel.find({ productId: { $in: orderDetails.order_products.map((product) => product.productId) }, userId: orderDetails.customerId });
                for (let i = 0; i < orderDetails.order_products.length; i++) {
                    const wallet_productIndex = orderProducts.findIndex((wallet_product) => wallet_product.productId == orderDetails.order_products[i].productId);
                    if (wallet_productIndex == -1) {
                        newProductsForUserInsideTheWallet.push({
                            name: orderDetails.order_products[i].name,
                            price: orderDetails.order_products[i].unit_price,
                            imagePath: orderDetails.order_products[i].image_path,
                            productId: orderDetails.order_products[i].productId,
                            userId: orderDetails.customerId
                        });
                    }
                }
                if (newProductsForUserInsideTheWallet.length > 0) {
                    await productsWalletModel.insertMany(newProductsForUserInsideTheWallet);
                }
            }
            else {
                await orderModel.deleteOne({ orderNumber });
                return {
                    msg: "Sorry, This User Is Not Exist !!",
                    error: true,
                    data: {},
                }
            }
        }
        return {
            msg: "Creating New Order Has Been Successfuly !!",
            error: false,
            data: {
                orderId: _id,
                orderNumber: orderNumber
            },
        }
    } catch (err) {
        throw Error(err);
    }
}

async function updateOrder(authorizationId, orderId, newOrderDetails) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin){
            if (!admin.isBlocked) {
                const order = await orderModel.findById(orderId);
                if (order) {
                    if (order.storeId === admin.storeId) {
                        await orderModel.updateOne({ _id: orderId }, { ...newOrderDetails });
                        return {
                            msg: `Update Details For Order That : ( Id: ${ orderId }) Process Has Been Successfully !!`,
                            error: false,
                            data: {},
                        };
                    }
                    return {
                        msg: "Sorry, Permission Denied !!",
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: "Sorry, This Order Is Not Found !!",
                    error: true,
                    data: {},
                };
            }
            return {
                msg: "Sorry, Permission Denied !!",
                error: true,
                data: {},
            }
        }
        return {
            msg: "Sorry, This Admin Is Not Exist !!",
            error: true,
            data: {},
        }
    } catch (err) {
        throw Error(err);
    }
}

async function updateOrderProduct(authorizationId, orderId, productId, newOrderProductDetails) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin){
            if (!admin.isBlocked) {
                const order = await orderModel.findOne({ _id: orderId });
                if (order) {
                    if (order.storeId === admin.storeId) {
                        const productIndex = order.order_products.findIndex((order_product) => order_product.productId == productId);
                        if (productIndex >= 0) {
                            order.order_products[productIndex].quantity = newOrderProductDetails.quantity;
                            order.order_products[productIndex].name = newOrderProductDetails.name;
                            order.order_products[productIndex].unit_price = newOrderProductDetails.unit_price;
                            order.order_products[productIndex].total_amount = newOrderProductDetails.total_amount;
                            const { calcOrderAmount } = require("../global/functions");
                            await orderModel.updateOne({ _id: orderId }, { order_products: order.order_products, order_amount: calcOrderAmount(order.order_products) });
                            return {
                                msg: "Updating Order Details Process Has Been Successfuly !!",
                                error: false,
                                data: {},
                            }
                        }
                        return {
                            msg: `Sorry, This Product For Order Id: ${orderId} Is Not Found !!`,
                            error: true,
                            data: {},
                        }
                    }
                    return {
                        msg: "Sorry, Permission Denied !!",
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: "Sorry, This Order Is Not Found !!",
                    error: true,
                    data: {},
                }
            }
            return {
                msg: "Sorry, Permission Denied !!",
                error: true,
                data: {},
            }
        }
        return {
            msg: "Sorry, This Admin Is Not Exist !!",
            error: true,
            data: {},
        }
    } catch (err) {
        throw Error(err);
    }
}

async function deleteOrder(authorizationId, orderId){
    try{
        const admin = await adminModel.findById(authorizationId);
        if (admin){
            if (!admin.isBlocked) {
                const order = await orderModel.findOne({ _id: orderId });
                if (order) {
                    if (order.storeId === admin.storeId) {
                        await orderModel.updateOne({ _id: orderId }, { isDeleted: true });
                        return {
                            msg: "Deleting This Order Has Been Successfuly !!",
                            error: false,
                            data: {},
                        }
                    }
                    return {
                        msg: "Sorry, Permission Denied !!",
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: "Sorry, This Order Is Not Found !!",
                    error: true,
                    data: {},
                }
            }
            return {
                msg: "Sorry, Permission Denied !!",
                error: true,
                data: {},
            }
        }
        return {
            msg: "Sorry, This Admin Is Not Exist !!",
            error: true,
            data: {},
        }
    }
    catch(err){
        throw Error(err);
    }
}

async function deleteProductFromOrder(authorizationId, orderId, productId) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin){
            if (!admin.isBlocked) {
                const order = await orderModel.findOne({ _id: orderId });
                if (order) {
                    if (order.storeId === admin.storeId) {
                        const newOrderProducts = order.order_products.filter((order_product) => order_product.productId !== productId);
                        if (newOrderProducts.length < order.order_products.length) {
                            await orderModel.updateOne({ _id: orderId }, { order_products: newOrderProducts });
                            return {
                                msg: "Deleting Product From Order Has Been Successfuly !!",
                                error: false,
                                data: {
                                    newOrderProducts,
                                },
                            }
                        }
                        return {
                            msg: `Sorry, This Product For Order Id: ${orderId} Is Not Found !!`,
                            error: true,
                            data: {},
                        }
                    }
                    return {
                        msg: "Sorry, Permission Denied !!",
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: "Sorry, This Order Is Not Found !!",
                    error: true,
                    data: {},
                }
            }
            return {
                msg: "Sorry, Permission Denied !!",
                error: true,
                data: {},
            }
        }
        return {
            msg: "Sorry, This Admin Is Not Exist !!",
            error: true,
            data: {},
        }
    } catch (err) {
        throw Error(err);
    }
}

module.exports = {
    getAllOrdersInsideThePage,
    getOrdersCount,
    getOrderDetails,
    createNewOrder,
    updateOrder,
    updateOrderProduct,
    deleteOrder,
    deleteProductFromOrder,
}