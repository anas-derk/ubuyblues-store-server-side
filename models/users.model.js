// Import User, Account Verification Codes And Product Model Object

const { userModel, accountVerificationCodesModel, adminModel } = require("../models/all.models");

// require bcryptjs module for password encrypting

const { hash, compare } = require("bcryptjs");

// Define Create New User Function

async function createNewUser(email, password, language) {
    try {
        // Check If Email Is Exist
        const user = await userModel.findOne({ email });
        if (user) {
            return {
                msg: "Sorry, Can't Create User Because it is Exist !!",
                error: true,
                data: {},
            }
        }
        // Create New Document From User Schema
        const newUser = new userModel({
            email,
            password: await hash(password, 10),
            language
        });
        // Save The New User As Document In User Collection
        await newUser.save();
        return {
            msg: "Ok !!, Create New User Process Has Been Successfuly !!",
            error: false,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function login(email, password) {
    try {
        // Check If Email Is Exist
        const user = await userModel.findOne({ email });
        if (user) {
            // Check From Password
            const isTruePassword = await compare(password, user.password);
            if (isTruePassword) {
                return {
                    msg: "Logining Process Has Been Successfully !!",
                    error: false,
                    data: {
                        _id: user._id,
                        isVerified: user.isVerified,
                    },
                };
            }
            return {
                msg: "Sorry, Email Or Password Incorrect !!",
                error: true,
                data: {},
            };
        }
        return {
            msg: "Sorry, Email Or Password Incorrect !!",
            error: true,
            data: {},
        };
    }
    catch (err) {
        throw Error(err);
    }
}

async function loginWithGoogle(userInfo) {
    try{
        const user = await userModel.findOne({ email: userInfo.email });
        if (user) {
            return {
                msg: "Logining Process Has Been Successfully !!",
                error: false,
                data: {
                    _id: user._id,
                    isVerified: user.isVerified,
                },
            };
        }
        const newUser = new userModel({
            email: userInfo.email,
            first_name: userInfo.first_name,
            last_name: userInfo.last_name,
            preview_name: userInfo.preview_name,
            password: await hash("anasDerk1999", 10),
            isVerified: true,
            provider: "google",
        });
        const { _id, isVerified } = await newUser.save();
        return {
            msg: "Logining Process Has Been Successfully !!",
            error: false,
            data: {
                _id,
                isVerified,
            },
        }
    }
    catch(err){
        throw Error(err);
    }
}

async function getUserInfo(userId) {
    try {
        // Check If User Is Exist
        const user = await userModel.findById(userId);
        if (user) {
            return {
                msg: "Get User Info Process Has Been Successfully !!",
                error: false,
                data: user,
            }
        }
        return {
            msg: "Sorry, The User Is Not Exist !!, Please Enter Another User Id ..",
            error: true,
            data: {},
        }
    } catch (err) {
        throw Error(err);
    }
}

async function isExistUserAndVerificationEmail(email) {
    try {
        // Check If User Is Exist
        const user = await userModel.findOne({ email });
        if (user) {
            if (!user.isVerified) {
                return {
                    msg: "This User Is Exist !!",
                    error: false,
                    data: user,
                };
            }
            return {
                msg: "Sorry, The Email For This User Has Been Verified !!",
                error: true,
                data: {},
            };
        };
        return {
            msg: "Sorry, The User Is Not Exist !!, Please Enter Another User Email ..",
            error: true,
            data: {},
        };
    } catch (err) {
        throw Error(err);
    }
}

async function getAllUsers() {
    try {
        return {
            msg: "Get All Users Process Has Been Successfully !!",
            error: false,
            data: await userModel.find({}),
        };
    } catch (err) {
        throw Error(err);
    }
}

async function isExistUserAccount(email, userType) {
    try {
        if (userType === "user") {
            const user = await userModel.findOne({ email });
            if (user) {
                return {
                    msg: "User Is Exist !!",
                    error: false,
                    data: {
                        _id: user._id,
                        isVerified: user.isVerified,
                    },
                }
            }
            return {
                msg: "Sorry, This User Is Not Found !!",
                error: true,
                data: {},
            }
        }
        const admin = await adminModel.findOne({ email });
        if (admin) {
            return {
                msg: "Admin Is Exist !!",
                error: false,
                data: {
                    _id: admin._id,
                },
            }
        }
        return {
            msg: "Sorry, This Admin Is Not Found !!",
            error: true,
            data: {},
        }
    } catch (err) {
        throw Error(err);
    }
}

async function updateUserInfo(userId, newUserData) {
    try {
        const userInfo = await userModel.findById(userId);
        if (userInfo) {
            let newUserInfo = newUserData;
            if (newUserData.password && newUserData.newPassword) {
                if (!await compare(newUserData.password, userInfo.password)) {
                    return {
                        msg: "Sorry, This Password Is Uncorrect !!",
                        error: true,
                        data: {},
                    }
                }
                newUserInfo = {
                    ...newUserData,
                    password: await hash(newUserData.newPassword, 10),
                }
            }
            if (newUserData.email && newUserData.email !== userInfo.email) {
                const user = await userModel.findOne({ email: newUserData.email });
                if (user) {
                    return {
                        msg: "Sorry, This Email Are Already Exist !!",
                        error: true,
                        data: {},
                    }
                }
            }
            await userModel.updateOne({ _id: userId }, newUserInfo);
            return {
                msg: "Updating User Info Process Has Been Successfuly !!",
                error: false,
                data: {},
            }
        }
        return {
            msg: "Sorry, This User Is Not Found !!",
            error: true,
            data: {},
        }
    } catch (err) {
        console.log(err)
        throw Error(err);
    }
}

async function updateVerificationStatus(email) {
    try{
        const userInfo = await userModel.findOneAndUpdate({ email }, { isVerified: true });
        if(userInfo) {
            await accountVerificationCodesModel.deleteOne({ email, typeOfUse: "to activate account" });
            return {
                msg: "Updating Verification Status Process Has Been Successfully !!",
                error: false ,
                data: {
                    _id: userInfo._id,
                    isVerified: userInfo.isVerified,
                },
            };
        }
        return {
            msg: "Sorry, This User Is Not Found !!",
            error: true,
            data: {},
        };
    }
    catch(err) {
        throw Error(err);
    }
}

async function resetUserPassword(email, userType, newPassword) {
    try {
        if (userType === "user") {
            const user = await userModel.findOneAndUpdate({ email }, { password: await hash(newPassword, 10) });
            if (user) {
                return {
                    msg: "Reseting Password Process Has Been Successfully !!",
                    error: false,
                    data: {},
                };
            }
            return {
                msg: "Sorry, This User Is Not Found !!",
                error: true,
                data: {},
            }
        }
        const admin = await adminModel.findOneAndUpdate({ email }, { password: await hash(newPassword, 10) });
        if (admin) {
            return {
                msg: "Reseting Password Process Has Been Successfully !!",
                error: false,
                data: {},
            };
        }
        return {
            msg: "Sorry, This Admin Is Not Found !!",
            error: true,
            data: {},
        }
    } catch (err) {
        throw Error(err);
    }
}

module.exports = {
    createNewUser,
    login,
    loginWithGoogle,
    getUserInfo,
    isExistUserAccount,
    isExistUserAndVerificationEmail,
    getAllUsers,
    updateUserInfo,
    updateVerificationStatus,
    resetUserPassword,
}