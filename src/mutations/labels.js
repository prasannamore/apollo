/*************************************************************************  
* @Execution : default node : cmd> server.js
* 
* 
* @Purpose : To perform label mutations
* 
* @description : Add, remove and update labels
* 
* @overview : fundoo application
* @author : Prasanna More <prasannamore.494@gmail.com>
* @version : 1.0
* @since : 27-april-2019
*
******************************************************************************/

//UserType = require("../../Types/types").message;
const jwt = require("jsonwebtoken");
const labelModel = require("../../model/labelModel");
const authentication = require("../../services/authenticationService").authentication;
const logger = require("../../services/logger").logger;

/**
   * @description       :  add labels
   * @purpose           :  add labels
   * @param {*} root    :  result of previous resolve function
   * @param {*} args    :  arguments for resolver funtions
   * @param {*} context    :  context 
   */
exports.addLabel = async (root, args, context, info) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    try {
        // check if token is provided
        if (context.token) {
            var payload = await authentication(context.token)
            if (payload) {
                if (args.labelName.length < 3) {
                    throw new Error("label name should be have length of atleast 3")
                }
                // find if label name already exists for user
                var presentlabel = await labelModel.find({ labelName: args.labelName, UserID: payload.user_ID })
                if (presentlabel.length > 0) {
                    throw new Error("label already exits")
                }
                // save label
                var newlabel = new labelModel({ labelName: args.labelName, UserID: payload.user_ID })
                var savelabel = await newlabel.save()
                if (savelabel) {
                    // clear redis cache
                    client.del("labels" + payload.user_ID)
                    //retrn label added success
                    return {
                        "message": "label added",
                        "success": true
                    }
                }
                else {
                    // return label connot add
                    throw new Error("label cannot be added")
                }
            }
            else {
                // return label not added
                throw new Error("label cannot be added")
            }
        }
        else {
            // return token not provided
            throw new Error("token not provided")
        }
    }
    // catch if error occures
    catch (err) {
        logger.error(err.message)
        if (err instanceof ReferenceError
            || err instanceof SyntaxError
            || err instanceof TypeError
            || err instanceof RangeError) {
            return result;
        }
        else {
            result.message = err.message;
            return result
        }
    }
}


// exports.addLabel = (root, args, context, info) => {
//         return new Promise((resolve, reject) => {
//             // check if token is provided
//             if (context.token) {
//                 jwt.verify(context.token, process.env.APP_SECRET, function (jwterr, payload) {
//                     if (payload) {
//                         // find if label name already exists for user
//                         labelModel.find({ labelName: args.labelName, UserID: payload.user_ID }, function (labelerr, presentlabel) {
//                             if (presentlabel.length > 0) {
//                                 return reject({
//                                     "message": "label already exists",
//                                     "success": false
//                                 })
//                             }
//                             // save label
//                             var newlabel = new labelModel({ labelName: args.labelName, UserID: payload.user_ID })
//                             newlabel.save(function (err, savelabel) {
//                                 if (savelabel) {
//                                     // clear redis cache
//                                     client.del("labels" + payload.user_ID)
//                                     //retrn label added success
//                                     return resolve({
//                                         "message": "label added",
//                                         "success": true
//                                     })
//                                 }
//                                 else {
//                                     // return label connot add
//                                     return reject({
//                                         "message": "label cannot be added",
//                                         "success": false
//                                     })
//                                 }
//                             })
//                         })
//                     }
//                     else {
//                         // return label not added
//                         return reject({
//                             "message": "un Auth",
//                             "success": false
//                         })
//                     }
//                 })
//             }
//             else {
//                 // return token not provided
//                 return reject({
//                     "message": "token not provided",
//                     "success": false
//                 })
//             }

//         })
// }


/**
  * @description       : remove label
  * @purpose           : remove label
  * @param {*} root    : result of previous resolve function
  * @param {*} args    : arguments for resolver funtions
  * @param {*} context    : context 
   */
exports.removeLabel = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    try {
        // check if token is provided
        if (context.token) {
            var payload = await jwt.verify(context.token, process.env.APP_SECRET)
            if (payload) {
                console.log(payload)
                // find label and delete
                var removedlabel = await labelModel.findOneAndDelete({ "UserID": payload.user_ID, "_id": args.labelID });
                if (removedlabel) {
                    // clear redis cache
                    client.del("labels" + payload.user_ID)
                    // return label remove success
                    return {
                        "message": "Label Removed",
                        "success": true
                    }
                }
                else {
                    // return label remove unsuccess
                    // return {
                    //     "message": "Unable to remove label",
                    //     "success": false
                    // }
                    throw new Error("Unable to remove label")
                }
            }
            else {
                // retun un authorised
                // return {
                //     "message": "Un Auth",
                //     "success": false
                // }
                throw new Error("Un Auth")
            }
        }
        else {
            // return token not provided
            // return {
            //     "message": "token not provided",
            //     "success": false
            // }
            throw new Error("token not provideds")
        }
    } catch (err) {
        logger.error(err.message)
        // return error
        if (err instanceof ReferenceError
            || err instanceof SyntaxError
            || err instanceof TypeError
            || err instanceof RangeError) {
            return result;
        }
        else {
            result.message = err.message;
            return result
        }
    }

}

/**
  * @description       : update label
  * @purpose           : update label
  * @param {*} root    : result of previous resolve function
  * @param {*} args    : arguments for resolver funtions
  * @param {*} context    : context 
   */

exports.updateLabel = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    try {
        if (context.token) {
            // check if labelName is given
            if (args.labelName == 0 || args.newlabelName == 0) {
                // return {
                //     "message": "label name require",
                //     "success": false
                // }
                throw new Error("label name require")
            }
            var payload = await jwt.verify(context.token, process.env.APP_SECRET)
            if (payload) {
                //find label of user and update
                var updateLabel = await labelModel.findOneAndUpdate({ UserID: payload.user_ID, _id: args.labelID }, { $set: { labelName: args.newlabelName } })
                console.log(updateLabel)
                if (updateLabel) {
                    // clear redis cache
                    client.del("labels" + payload.user_ID)
                    // return label update success
                    return {
                        "message": "label update success",
                        "success": true
                    }
                }
                else {
                    // return label connot update
                    // return {
                    //     "message": "label connot update",
                    //     "success": false
                    // }
                    throw new Error("label connot update")
                }

            }
        }
        else {
            // return token not provided
            // return {
            //     "message": "token not provided",
            //     "success": false
            // }
            throw new Error("token not provided")
        }
    }
    catch (err) {
        logger.error(err.message)
        // return error
        if (err instanceof ReferenceError
            || err instanceof SyntaxError
            || err instanceof TypeError
            || err instanceof RangeError) {
            return result;
        }
        else {
            result.message = err.message;
            return result
        }
    }
}

