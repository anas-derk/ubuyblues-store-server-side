// Import Product Model Object

const { productModel, categoryModel, adminModel, mongoose } = require("../models/all.models");

async function addNewProduct(authorizationId, productInfo) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin){
            if (!admin.isBlocked && admin.storeId === productInfo.storeId) {
                const product = await productModel.findOne({ name: productInfo.name, category: productInfo.category });
                if (!product) {
                    const category = await categoryModel.findOne({ name: productInfo.category });
                    if (category) {
                        const newProductInfo = new productModel(productInfo);
                        await newProductInfo.save();
                        return {
                            msg: "Adding New Product Process Has Been Successfuly !!",
                            error: false,
                            data: {},
                        }
                    }
                    return {
                        msg: "Sorry, This Category Is Not Exist !!",
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: "Sorry, This Product Is Already Exist !!",
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
    catch (err) {
        throw Error(err);
    }
}

async function addNewImagesToProductGallery(authorizationId, productId, newGalleryImagePaths) {
    try{
        const admin = await adminModel.findById(authorizationId);
        if (admin){
            if (!admin.isBlocked) {
                const product = await productModel.findById(productId);
                if (product) {
                    if (product.storeId === admin.storeId) {
                        const galleryImagePathsAfterAddNewPaths = product.galleryImagesPaths.concat(newGalleryImagePaths);
                        await productModel.updateOne({ _id: productId },
                        {
                            galleryImagesPaths: galleryImagePathsAfterAddNewPaths,
                        });
                        return {
                            msg: "Add New Images To Product Gallery Process Has Been Successfuly !!",
                            error: false,
                            data: {
                                galleryImagePathsAfterAddNewPaths,
                            },
                        }
                    }
                    return {
                        msg: "Sorry, Permission Denied !!",
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: "Sorry, This Product Is Not Found !!",
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
            msg: "Sorry, This Admin Is Not Exist !!",
            error: true,
            data: {},
        }
    }
    catch(err) {
        throw Error(err);
    }
}

async function getProductsByIds(productsIds) {
    try{
        const products = await productModel.find({ _id: { $in: productsIds }, quantity: { $gte: 1 } });
        if (products.length === 0) {
            return {
                msg: "Get Products By Ids Process Has Been Successfully !!",
                error: false,
                data: {
                    productByIds: [],
                },
            }
        } else {
            let groupedProducts = {};
            products.forEach((product) => {
                const storeId = product.storeId;
                if (!groupedProducts[storeId]) {
                    groupedProducts[storeId] = [];
                }
                groupedProducts[storeId].push(product);
            });
            return {
                msg: "Get Products By Ids Process Has Been Successfully !!",
                error: false,
                data: {
                    productByIds: Object.keys(groupedProducts).map((storeId) => ({ storeId, products: groupedProducts[storeId] })),
                    currentDate: new Date(),
                },
            }
        }
    }
    catch(err) {
        throw Error(err);
    }
}

async function getProductsByIdsAndStoreId(storeId, productsIds) {
    try{
        return {
            msg: "Get Products By Store Id And Ids Process Has Been Successfully !!",
            error: false,
            data: {
                products: await productModel.find({ _id: { $in: productsIds }, storeId, quantity: { $gte: 1 } }),
                currentDate: new Date()
            },
        }
    }
    catch(err) {
        throw Error(err);
    }
}

async function getProductInfo(productId) {
    try {
        const productInfo = await productModel.findById(productId);
        if (productInfo) {
            return {
                msg: "Get Product Info Process Has Been Successfuly !!",
                error: false,
                data: {
                    productDetails: productInfo,
                    currentDate: new Date(),
                },
            }
        }
        return {
            msg: "Sorry, This Product It Not Exist !!",
            error: true,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getProductsCount(filters) {
    try {
        return {
            msg: "Get Products Count Process Has Been Successfully !!",
            error: false,
            data: await productModel.countDocuments(filters),
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getFlashProductsCount(filters) {
    try {
        const currentDate = new Date();
        return {
            msg: "Get Flash Products Count Process Has Been Successfully !!",
            error: false,
            data: await productModel.countDocuments({ ...filters, startDiscountPeriod: { $lte: currentDate }, endDiscountPeriod: { $gte: currentDate } }),
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getAllFlashProductsInsideThePage(pageNumber, pageSize, filters, sortDetailsObject) {
    try {
        const currentDate = new Date();
        return {
            msg: `Get Flash Products Inside The Page: ${pageNumber} Process Has Been Successfully !!`,
            error: false,
            data: {
                products: await productModel
                .find({...filters, startDiscountPeriod: { $lte: currentDate }, endDiscountPeriod: { $gte: currentDate }})
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize).sort(sortDetailsObject),
                currentDate: new Date(),
            },
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getAllProductsInsideThePage(pageNumber, pageSize, filters, sortDetailsObject) {
    try {
        return {
            msg: `Get Products Inside The Page: ${pageNumber} Process Has Been Successfully !!`,
            error: false,
            data: {
                products: await productModel.find(filters).skip((pageNumber - 1) * pageSize).limit(pageSize).sort(sortDetailsObject),
                currentDate: new Date()
            },
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getRelatedProductsInTheProduct(productId) {
    try {
        const productInfo = await productModel.findById(productId);
        if (productInfo) {
            return {
                msg: "Get Sample From Related Products In This Product Process Has Been Successfuly !!",
                error: false,
                data: await productModel.aggregate([
                    { $match: { category: productInfo.category, _id: { $ne: new mongoose.Types.ObjectId(productId) } } },
                    { $sample: { size: 10 } }
                ]),
            }
        }
        return {
            msg: "Sorry, This Product It Not Exist !!",
            error: true,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getAllGalleryImages(authorizationId, productId) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin){
            if (!admin.isBlocked) {
                const product = await productModel.findOne({ _id: productId });
                if (product) {
                    if (product.storeId === admin.storeId) {
                        return {
                            msg: "Get All Gallery Images Process Has Been Successfully !!",
                            error: false,
                            data: product.galleryImagesPaths,
                        }
                    }
                    return {
                        msg: "Sorry, Permission Denied !!",
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: "Sorry, This Product Is Not Exist !!",
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
    catch (err) {
        throw Error(err);
    }
}

async function deleteProduct(authorizationId, productId) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin){
            if (!admin.isBlocked) {
                const productInfo = await productModel.findOne({
                    _id: productId,
                });
                if (productInfo) {
                    if (productInfo.storeId === admin.storeId) {
                        await productModel.deleteOne({
                            _id: productId,
                        });
                        return {
                            msg: "Deleting Product Process Has Been Successfuly !!",
                            error: false,
                            data: {
                                deletedProductImagePath: productInfo.imagePath,
                                galleryImagePathsForDeletedProduct: productInfo.galleryImagesPaths,
                            },
                        }
                    }
                    return {
                        msg: "Sorry, Permission Denied !!",
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: "Sorry, This Product Is Not Exist !!",
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
    catch (err) {
        throw Error(err);
    }
}

async function deleteImageFromProductGallery(authorizationId, productId, galleryImagePath) {
    try{
        const admin = await adminModel.findById(authorizationId);
        if (admin){
            if (!admin.isBlocked) {
                const product = await productModel.findById(productId);
                if (product) {
                    if (product.storeId === admin.storeId) {
                        await productModel.updateOne({ _id: productId }, {
                            galleryImagesPaths: product.galleryImagesPaths.filter((path) => galleryImagePath !== path)
                        });
                        return {
                            msg: "Deleting Image From Product Gallery Process Has Been Successfully !!",
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
                    msg: "Sorry, This Product Is Not Exist !!",
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
    catch(err) {
        throw Error(err);
    }
}

async function updateProduct(authorizationId, productId, newData) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin){
            if (!admin.isBlocked) {
                const product = await productModel.findOne({ _id: productId });
                if (product) {
                    if (product.storeId === admin.storeId) {
                        await productModel.updateOne({ _id: productId }, { ...newData });
                        return {
                            msg: "Updating Product Process Has Been Successfully !!",
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
                    msg: "Sorry, This Product Is Not Exist !!",
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
    catch (err) {
        throw Error(err);
    }
}

async function updateProductGalleryImage(authorizationId, productId, oldGalleryImagePath, newGalleryImagePath) {
    try{
        const admin = await adminModel.findById(authorizationId);
        if (admin){
            if (!admin.isBlocked) {
                const product = await productModel.findById(productId);
                if (product) {
                    if (product.storeId === admin.storeId) {
                        const galleryImagePathIndex = product.galleryImagesPaths.findIndex((galleryImagePath) => galleryImagePath === oldGalleryImagePath);
                        if (galleryImagePathIndex >= 0) {
                            product.galleryImagesPaths[galleryImagePathIndex] = newGalleryImagePath;
                            await productModel.updateOne({ _id: productId }, {
                                galleryImagesPaths: product.galleryImagesPaths
                            });
                            return {
                                msg: "Updating Product Galley Image Process Has Been Successfully !!",
                                error: false,
                                data: newGalleryImagePath,
                            }
                        }
                        return {
                            msg: "Sorry, This Path Is Not Found !!",
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
                    msg: "Sorry, This Product Is Not Exist !!",
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
    catch(err) {
        throw Error(err);
    }
}

async function updateProductImage(authorizationId, productId, newProductImagePath) {
    try{
        const admin = await adminModel.findById(authorizationId);
        if (admin){
            if (!admin.isBlocked) {
                const product = await productModel.findById(productId);
                if (product) {
                    if (product.storeId === admin.storeId) {
                        await productModel.updateOne({ _id: productId }, {
                            imagePath: newProductImagePath,
                        });
                        return {
                            msg: "Change Product Image Process Has Been Successfully !!",
                            error: false,
                            data: {
                                deletedProductImagePath: product.imagePath,
                            },
                        }
                    }
                    return {
                        msg: "Sorry, Permission Denied !!",
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: "Sorry, This Product Is Not Exist !!",
                    error: true,
                    data: product.imagePath,
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
    catch(err) {
        throw Error(err);
    }
}

module.exports = {
    addNewProduct,
    addNewImagesToProductGallery,
    getProductsByIds,
    getProductsByIdsAndStoreId,
    getProductInfo,
    getProductsCount,
    getFlashProductsCount,
    getAllFlashProductsInsideThePage,
    getAllProductsInsideThePage,
    getRelatedProductsInTheProduct,
    getAllGalleryImages,
    deleteProduct,
    deleteImageFromProductGallery,
    updateProduct,
    updateProductGalleryImage,
    updateProductImage,
}