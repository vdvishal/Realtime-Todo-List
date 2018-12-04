const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const passwordLib = require('./../libs/generatePasswordLib');
const token = require('../libs/tokenLib')
const mail = require('../libs/emailLib')
const redis = require("./../libs/redis.js")
var events = require('events')
const User = require('./../models/User')
const ResetToken = require('./../models/ResetToken')
const Req = require('./../models/FriendReq')

/* Models */
const UserModel = mongoose.model('User')
const ResetTokenModel = mongoose.model('ResetToken')
const ReqModel = mongoose.model('Req')


var eventEmitter = new events.EventEmitter();

eventEmitter.on('welcomeEmail', function (data) { mail.mail(data) });
eventEmitter.on('verificationMail', function (data) { mail.verifyMail(data) });


let signUpFunction = (req, res) => {
    let checkEmail = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email Does not meet the requirement', 400, null)
                    reject(apiResponse)
                }
                else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, 'Password field empty', 400, null)
                    reject(apiResponse)
                }
                else {
                    resolve(req)
                }
            }
            else {
                logger.error('Field Missing During User Creation', 'userController: createUser()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }

    let createUser = (req, res) => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: req.body.email })
                .exec((err, result) => {
                    if (err) {
                        logger.error(err.message, 'userController: createUser', 10)
                        let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                        reject(apiResponse)
                    }
                    else if (check.isEmpty(result)) {
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email.toLowerCase(),
                            mobileNumber: req.body.mobileNumber,
                            countryCode:req.body.code,
                            password: passwordLib.hashpassword(req.body.password),
                            createdOn: time.now()
                        })
                        newUser.save((err, result) => {
                            if (err) {
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                reject(apiResponse)
                            }
                            else {
                                let newUserObj = result.toObject();
                                resolve(newUserObj)
                            }
                        })
                    }
                    else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        reject(apiResponse)
                    }

                })
        })

    }

    checkEmail(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password
            let apiResponse = response.generate(false, 'User created', 200, resolve)
            res.send(apiResponse);
            setTimeout(function () {
                eventEmitter.emit('welcomeEmail', resolve)
            }, 1000)
        })
        .catch((err) => {
            res.send(err);
        })
}

let loginFunction = (req, res) => {
    let findUser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email Does not meet the requirement', 400, null)
                    reject(apiResponse)
                }
                else {
                    UserModel.findOne({ email: req.body.email })
                        .exec((err, result) => {
                            if (err) {
                                logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                                logger.info('Sign Up for a account')
                                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                                reject(apiResponse)
                            }
                            else if (check.isEmpty(result)) {
                                logger.error('No User Found', 'userController: findUser()', 7)
                                let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                                reject(apiResponse)
                            }
                            else {
                                logger.info('User Found', 'userController: findUser()', 10)
                                resolve(result)
                            }
                        })
                }
            }
            else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }

    let checkPassword = (userDetails) => {
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, userDetails.password, (err, isMatch) => {
                if (err) {

                    logger.error(err.message, 'userController: checkePassword()', 10)
                    let apiResponse = response.generate(true, 'Login Failed', 500, null)
                    reject(apiResponse)
                }
                else if (isMatch) {
                    let allDetails = userDetails.toObject();

                    delete allDetails.password;
                    delete allDetails._id
                    delete allDetails.__v
                    delete allDetails.createdOn
                    delete allDetails.modifiedOn
                    resolve(allDetails)
                }
                else {
                    logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null)
                    reject(apiResponse)
                }
            })
        })
    }

    let generateToken = (userDetails) => {
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }

    let removeToken = (userDetails) => {
        return new Promise((resolve, reject) => {
            if (check.isEmpty(userDetails)) {
                let apiResponse = response.generate(true, 'no details', 500, null)
                reject(apiResponse)
            }
            else {
                delete userDetails.tokenSecret
                resolve(userDetails)
            }
        })
    }

    findUser(req, res)
        .then(checkPassword)
        .then(generateToken)
        .then(removeToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        }
        ).catch((err) => {
            res.status(err.status)
            res.send(err)
        })

}

let forgotPassword = (req, res) => {
    let email = req.body.email;
    let findEmail = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email })
                .exec((err, result) => {
                    if (err) {
                        logger.error(err.message, 'user Controller: forgotPassword', 10)
                        let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
                        reject(apiResponse)
                    }
                    else if (check.isEmpty(result)) {
                        logger.info("Create account,No user found")
                        let apiResponse = response.generate(true, `create account,No user found`, null, null)
                        reject(apiResponse)
                    }
                    else {
                        resolve(result)
                    }
                })
        })
    }

    let generateToken = (result) => {
        return new Promise((resolve, reject) => {
            token.generateToken(result, (err, tokenDetails) => {
                if (err) {
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = result.userId
                    tokenDetails.email = result.email
                    eventEmitter.emit('verificationMail', tokenDetails)
                    resolve(tokenDetails)
                }
            })
        })
    }

    let saveResetToken = (tokenDetails) => {
        return new Promise((resolve, reject) => {
            ResetTokenModel.findOne({ email: tokenDetails.email })
                .exec((err, result) => {
                    if (err) {
                        let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                        reject(apiResponse)
                    }
                    else if (check.isEmpty(result)) {
                        let newToken = new ResetTokenModel(
                            {
                                email: tokenDetails.email,
                                authToken: tokenDetails.token,
                                tokenSecret: tokenDetails.tokenSecret,
                                tokenGenerationTime: time.now()
                            }
                        )
                        newToken.save((err, result) => {
                            if (err) {
                                logger.error(err.message, 'userController: saveToken', 10)
                                let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                                reject(apiResponse)
                            }
                            else {
                                resolve(result)
                            }
                        })
                    }

                    else {

                        result.email = tokenDetails.email
                        result.authToken = tokenDetails.token
                        result.tokenSecret = tokenDetails.tokenSecret
                        result.tokenGenerationTime = tokenDetails.tokenGenerationTime

                        result.save((err, newAuthtoken) => {
                            if (err) {

                                logger.error(err.message, 'userController: saveToken', 10)
                                let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                                reject(apiResponse)
                            } else {

                                resolve(newAuthtoken)

                            }
                        })
                    }
                })
        })
    }



    findEmail(req.res)
        .then(generateToken)
        .then(saveResetToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Enter token to change the password', 200, null)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            res.status(err.status)
            res.send(err)
        })

}

let changePassword = (req, res) => {

    let newPassword = () => {
        let userToken = req.params.token
        let email = req.body.email
        let newPassword = req.body.password

        return new Promise((resolve, reject) => {
            ResetTokenModel.findOne({ email }).exec((err, result) => {
                if (err) {
                    logger.error(err.message, 'user Controller: forgotPassword', 10)
                    let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
                    reject(apiResponse)
                }
                else if (check.isEmpty(result)) {
                    let apiResponse = response.generate(true, 'not found', 404, null)
                    reject(apiResponse)
                }
                else if (userToken === result.authToken) {
                    UserModel.findOne({ email })
                        .exec((err, result) => {
                            if (err) {
                                logger.error(err.message, 'user Controller: changePassword check else if', 10)
                                let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
                                reject(apiResponse)
                            }
                            else {
                                result.password = passwordLib.hashpassword(newPassword),
                                    result.save(function (err, result) {
                                        if (err) {
                                            logger.error(`${err}`, 'userController: newPassword', 10)
                                            let apiResponse = response.generate(true, 'Failed', 500, null)
                                            reject(apiResponse)
                                        }
                                        else {
                                            let finalresult = result.toObject()
                                            delete finalresult.password
                                            delete finalresult._id
                                            delete finalresult.__v
                                            delete finalresult.createdOn
                                            resolve(finalresult)
                                        }
                                    })
                            }
                        })
                }
                else {
                    logger.error(`${err}`, 'userController: UpdatePassword', 10)
                    let apiResponse = response.generate(true, 'token didnot match', 500, null)
                    reject(apiResponse)
                }
            })
        })

    }

    newPassword(req, res)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Password updated', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            res.status(err.status)
            res.send(err)
        })
}

let allUsers = (req, res) => {
    UserModel.find()
        .select('-__v -_id -password')
        .lean()
        .exec((err, result) => {
            if (err) {
                logger.error(`${err}`, 'userController: allUsers', 10)
                let apiResponse = response.generate(true, 'Failed To Find Users', 500, null)
                res.send(apiResponse)
            }
            else if (check.isEmpty(result)) {
                logger.info('No Users Found', 'userController: allUsers')
                let apiResponse = response.generate(true, 'No users Found ', 404, null)
                res.send(apiResponse)
            }
            else {
                let apiResponse = response.generate(false, 'All Users', 200, result)
                res.send(apiResponse)
            }
        })
}

let friendReq = (req, res) => {
    ReqModel.find({ recieverId: req.params.userId })
        .exec(
            (err, result) => {
                if (err) {
                    logger.error(`${err}`, 'userController: friendReq', 10)
                    let apiResponse = response.generate(true, 'Failed to find any req', 500, null)
                    res.send(apiResponse)
                }
                else if (check.isEmpty(result)) {
                    logger.info('No req', 'userController: friendReq', 7)
                    let apiResponse = response.generate(true, 'No friend request', 404, null)
                    res.send(apiResponse)
                }
                else {
                    logger.info('req Found', 'userController: friendReq', 10)
                    let apiResponse = response.generate(false, 'Request Found', 200, result)
                    res.send(apiResponse)
                }
            }
        )
}

let acceptReq = (req, res) => {
    let fullName = `${req.body.firstName} ${req.body.lastName}`
    let fullNameS = `${req.body.localuser.firstName} ${req.body.localuser.lastName}`
    // return new Promise((reject,resolve) => {
    if (req.body) {
        redis.addFriends(req.body.recieverId, req.body.senderId, fullName)
        redis.addFriends(req.body.senderId, req.body.localuser.userId, fullNameS)
        senderId = req.body.senderId
        recieverId = req.body.recieverId
        ReqModel.remove({ senderId: senderId, recieverId: recieverId }).exec(
            (err, result) => {
                if (err) {
                    logger.error(`${err}`, 'userController: acceptReq', 10)
                    let apiResponse = response.generate(true, 'Failed to find any req', 500, null)
                    res.send(apiResponse)
                }
                else {
                    logger.info('success', 'userController: acceptReq', 10)
                }
            })
        let apiResponse = response.generate(false, 'Request accepted', 200, null)
        res.send(apiResponse)
    }
    else {
        let apiResponse = response.generate(true, 'Usercontroller:acceptReq', 400, null)
        res.send(apiResponse)
        // reject(apiResponse);

    }
    // })
}



let rejectReq = (req, res) => {
    ReqModel.remove({ senderId: req.params.senderId, recieverId: req.body.recieverId })
        .exec(
            (err, result) => {
                if (err) {
                    logger.error(`${err}`, 'userController: rejectReq', 10)
                    let apiResponse = response.generate(true, 'Failed to find any request', 500, null)
                    res.send(apiResponse)
                }
                else if (check.isEmpty(result)) {
                    logger.error('No req', 'userController: rejectReq', 7)
                    let apiResponse = response.generate(true, 'No friend request', 404, null)
                    res.send(apiResponse)
                }
                else {
                    logger.info('User removed', 'userController: rejectReq', 10)
                    let apiResponse = response.generate(true, 'Request rejected', 200, result)
                    res.send(apiResponse)
                }
            }
        )
}

let getUserFriends = (req, res) => {
    // return new Promise((reject,resolve)=>{
    if (req.params.userId) {
        redis.userFriends(req.params.userId, (err, result) => {
            if (err) {
                let apiResponse = response.generate(true, 'Error occured', 500, null)
                res.send(apiResponse);
            }
            else if (check.isEmpty(result)) {
                logger.info('No friends', 'userController: friendReq', 7)
                let apiResponse = response.generate(true, 'No friends', 404, null)
                res.send(apiResponse);
            }
            else {
                let apiResponse = response.generate(false, 'Friend list', 200, result)
                res.send(apiResponse)
            }
        })
    }
    else {
        let apiResponse = response.generate(true, 'Usercontroller:getUserFriends', 500, null)
        res.send(apiResponse);
    }
    // })
}




module.exports = {
    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    forgotPassword: forgotPassword,
    changePassword: changePassword,
    allUsers: allUsers,
    friendReq: friendReq,
    rejectReq: rejectReq,
    acceptReq: acceptReq,
    getUserFriends: getUserFriends,

}