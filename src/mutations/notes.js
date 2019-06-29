/*************************************************************************  
* @Execution : default node : cmd> server.js
* 
* 
* @Purpose : To perform notes mutations
* 
* @description : Add, delete and update notes.Add labels to notes and remove labels from notes,
*                trash and untrash, archieve and unarchive, pull git repositories and add to notes,
*                add remainder.
* 
* @overview : fundoo application
* @author : Prasanna More <prasannamore.494@gmail.com>
* @version : 1.0
* @since : 27-april-2019
*
******************************************************************************/

const jwt = require("jsonwebtoken");
const notesModel = require("../../model/notesModel");
const userModel = require("../../model/userModel")
const { createApolloFetch } = require('apollo-fetch');
const logger = require("../../services/logger").logger;

/**
   * @description       : add notes
   * @purpose           : add notes
   * @param {*} root    : result of previous resolve function
   * @param {*} args    : arguments for resolver funtions
   * @param {*} context    : context 
   */
exports.addNotes = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    try {
        if (context.token) {
            var payload = await jwt.verify(context.token, process.env.APP_SECRET)
            if (payload) {
                // find if label name already exists for user
                var presentNote = await notesModel.find({ title: args.title, UserID: payload.user_ID })
                console.log(presentNote)
                if (presentNote.length > 0) {
                    return {
                        "message": "title already exits",
                        "success": false
                    }
                }
                // save Note
                console.log(payload.user_ID)
                var newNotes = new notesModel({ title: args.title, UserID: payload.user_ID, discription: args.discription })
                var saveNote = await newNotes.save()
                if (saveNote) {
                    return {
                        "message": "Note added",
                        "success": true
                    }
                }
                else {
                    return {
                        "message": "Note cannot be added",
                        "success": false
                    }
                }
            }
            else {
                return {
                    "message": "Note cannot be added",
                    "success": false
                }
            }
        }
        else {
            return {
                "message": "token not provided",
                "success": false
            }
        }
    }
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
/**
   * @description       : remove notes
   * @purpose           : remove notes
   * @param {*} root    : result of previous resolve function
   * @param {*} args    : arguments for resolver funtions
   * @param {*} context    : context 
   */
exports.removeNote = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    try {
        // check if token is provided
        if (context.token) {
            // verify token
            var payload = await jwt.verify(context.token, process.env.APP_SECRET)
            if (payload) {
                var removedNote = await notesModel.findOneAndDelete({ "_id": args.NoteID });
                if (removedNote) {
                    // return note removed
                    return {
                        "message": "Note Removed",
                        "success": true
                    }
                }
                else {
                    // return unable to remove note
                    return {
                        "message": "Unable to remove Note",
                        "success": false
                    }
                }
            }
            else {
                // return un authorized
                return {
                    "message": "Un Auth",
                    "success": false
                }
            }
        }
        else {
            // return token not provided
            return {
                "message": "token not provided",
                "success": false
            }
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
   * @description       : edit notes
   * @purpose           : edit notes
   * @param {*} root    : result of previous resolve function
   * @param {*} args    : arguments for resolver funtions
   * @param {*} context    : context 
   */
exports.editNote = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    try {
        // check if token is provided
        if (context.token) {
            // check if labelName is given
            if (args.title == 0 || args.discription == 0) {
                return {
                    "message": "title and discription are required",
                    "success": false
                }
            }
            // verify token
            var payload = await jwt.verify(context.token, process.env.APP_SECRET)
            if (payload) {
                //find label of user and update
                var updateNote = await notesModel.findOneAndUpdate({ _id: args.NoteID }, { title: args.title, discription: args.discription })
                console.log(updateNote)
                if (updateNote) {
                    // return note update success
                    return {
                        "message": "Note update success",
                        "success": true
                    }
                }
                else {
                    // return note connot update
                    return {
                        "message": "Note connot update",
                        "success": false
                    }
                }

            }
        }
        else {
            // return token not provided
            return {
                "message": "token not provided",
                "success": false
            }
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
/**
   * @description       : add label to note
   * @purpose           : add label to note
   * @param {*} root    : result of previous resolve function
   * @param {*} args    : arguments for resolver funtions
   * @param {*} context    : context 
   */
exports.addLabelToNote = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    try {
        // check if labelName is given
        if (context.token) {
            var payload = await jwt.verify(context.token, process.env.APP_SECRET)
            if (payload) {
                //find label of user and update

                var exist = await notesModel.find({ labelID: args.labelID, _id: args.NoteID })
                console.log(exist)
                // check if label exists
                if (exist.length > 0) {
                    return {
                        "message": "label already exists",
                        "success": false
                    }
                }
                // add label to note
                var addlabel = await notesModel.findOneAndUpdate({ _id: args.NoteID }, { $push: { labelID: args.labelID } })
                if (addlabel) {
                    // return label added to note success
                    return {
                        "message": "label added to note",
                        "success": true
                    }
                }
                else {
                    // return label cannot be added to note
                    return {
                        "message": " connot add label to note",
                        "success": false
                    }
                }
            }
        }
        else {
            // toekn not provided
            return {
                "message": "token not provided",
                "success": false
            }
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
/**
   * @description       : remove label from note
   * @purpose           : remove label from note
   * @param {*} root    : result of previous resolve function
   * @param {*} args    :  arguments for resolver funtions
   * @param {*} context    : context 
   */
exports.removeLabelfromNote = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    try {
        // check if token is provided
        if (context.token) {
            // check if labelName is given
            if (args.title == 0 || args.discription == 0) {
                return {
                    "message": "title and discription are required",
                    "success": false
                }
            }
            var payload = await jwt.verify(context.token, process.env.APP_SECRET)
            if (payload) {
                //find label of user and update
                var exists = await notesModel.find({ labelID: args.labelID })
                // check if label is added to note
                if (exists.length > 0) {
                    await notesModel.findOneAndUpdate({ _id: args.NoteID }, { $pull: { labelID: args.labelID } })
                    // return label remove success
                    return {
                        "message": "label removed from note",
                        "success": true
                    }
                }
                else {
                    // return label not added to note
                    return {
                        "message": "label not exists",
                        "success": false
                    }
                }
            }
            else {
                // return un authorized
                return {
                    "message": "Un auth",
                    "success": false
                }
            }
        }
        else {
            // return token not provided
            return {
                "message": "token not provided",
                "success": false
            }
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
/**
   * @description       : archieve note
   * @purpose           : archive note
   * @param {*} root    : result of previous resolve function
   * @param {*} args    : arguments for resolver funtions
   * @param {*} context    : context 
   */
exports.archive = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    try{
    // check of token provided
    if (context.token) {
        // verify token
        var payload = await jwt.verify(context.token, process.env.APP_SECRET)
        if (payload) {
            // find note
            var checkArchive = await notesModel.find({ _id: args.NoteID });
            // check if note is archieve
            if (checkArchive[0].archive == true) {
                return {
                    "message": "Already Archive",
                    "success": false
                }
            }
            // archive note
            var archiveNote = await notesModel.findOneAndUpdate({ _id: args.NoteID }, { $set: { archive: true } })
            if (archiveNote) {
                // return archive success
                return {
                    "message": "archieve successfully",
                    "success": true
                }
            }
            else {
                // return archieve not success
                return {
                    "message": "archieve not successfull",
                    "success": false
                }
            }
        }
        else {
            // return un authorized
            return {
                "message": "Un Auth",
                "success": false
            }
        }

    }
    else {
        // return error
        return {
            "message": "token not provided",
            "success": false
        }
    }
}
catch(err){
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
/**
   * @description       : trash notes
   * @purpose           : trash note
   * @param {*} root    : result of previous resolve function
   * @param {*} args    : arguments for resolver funtions
   * @param {*} context    : context 
   */
exports.trash = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    try{
    // check if token provided
    if (context.token) {
        // verify token
        var payload = await jwt.verify(context.token, process.env.APP_SECRET)
        if (payload) {
            // find notes
            var checktrash = await notesModel.find({ _id: args.NoteID });
            // check if note is trash
            if (checktrash[0].trash == true) {
                // return already trash
                return {
                    "message": "Already trash",
                    "success": false
                }
            }
            var trashNote = await notesModel.findOneAndUpdate({ _id: args.NoteID }, { $set: { trash: true } })
            // return trash success
            if (trashNote) {
                return {
                    "message": "trash successfully",
                    "success": true
                }
            }
            else {
                // return trash not success
                return {
                    "message": "trash not successfull",
                    "success": false
                }
            }
        }
        else {
            // return un authorized
            return {
                "message": "Un Auth",
                "success": false
            }
        }

    }
    else {
        // return token not provided
        return {
            "message": "token not provided",
            "success": false
        }
    }
}
catch(err){
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
/**
  * @description       : untrash notes
  * @purpose           : untrash note
  * @param {*} root    : result of previous resolve function
  * @param {*} args    : arguments for resolver funtions
  * @param {*} context    : context 
  */
exports.untrash = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    try{
    // check if token provided
    if (context.token) {
        // verify token
        var payload = await jwt.verify(context.token, process.env.APP_SECRET)
        if (payload) {
            // find note
            var checktrash = await notesModel.find({ _id: args.NoteID });
            // check if note is trash
            if (checktrash[0].trash == false) {
                // return not trashed
                return {
                    "message": " Not trashed",
                    "success": false
                }
            }
            // un trash note
            var trashNote = await notesModel.findOneAndUpdate({ _id: args.NoteID }, { $set: { trash: false } })
            if (trashNote) {
                // return untrash success
                return {
                    "message": "Untrash successfully",
                    "success": true
                }
            }
            else {
                // return untrash success
                return {
                    "message": "Untrash not successfull",
                    "success": false
                }
            }
        }
        else {
            // return un authorized
            return {
                "message": "Un Auth",
                "success": false
            }
        }

    }
    else {
        // return token not provided
        return {
            "message": "token not provided",
            "success": false
        }
    }
}
catch(err){
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
/**
  * @description       : unarchive notes
  * @purpose           : unarchive note
  * @param {*} root    : result of previous resolve function
  * @param {*} args    : arguments for resolver funtions
  * @param {*} context    : context 
  */
exports.unarchive = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    // check if token provided
    try {
        if (context.token) {
            // verify token
            var payload = await jwt.verify(context.token, process.env.APP_SECRET)
            if (payload) {
                var checkArchive = await notesModel.find({ _id: args.NoteID });
                if (checkArchive[0].archive == false) {
                    // return not archieved
                    return {
                        "message": "Not  Archive",
                        "success": false
                    }
                }
                var archiveNote = await notesModel.findOneAndUpdate({ _id: args.NoteID }, { $set: { archive: false } })
                if (archiveNote) {
                    // return unarchieve success
                    return {
                        "message": "Unarchieve successfully",
                        "success": true
                    }
                }
                else {
                    // return unarchieve not success
                    return {
                        "message": "Unarchieve not successfull",
                        "success": false
                    }
                }
            }
            else {
                // return unauthorized
                return {
                    "message": "Un Auth",
                    "success": false
                }
            }

        }
        else {
            // return token not provided
            return {
                "message": "token not provided",
                "success": false
            }
        }
    } catch (err) {
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
/**
  * @description       : save git repositories name as tittle of notes
  * @purpose           : To save git repositories name as tittle of notes
  * @param {*} root    : result of previous resolve function
  * @param {*} args    : arguments for resolver funtions
  * @param {*} context    : context 
  */
exports.pullGitRepo = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    try{
    // check if token provided
    if (context.token) {
        // verify token
        var payload = await jwt.verify(context.token, process.env.APP_SECRET)
        if (payload) {
            var user = await userModel.find({ _id: payload.user_ID });
            // check if user is logged in using git 
            if (user.length == 0) {
                return {
                    "message": "not git user",
                    "success": false
                }
            }
            if (user[0].gitVerify == false) {
                // return not git user
                return {
                    "message": "git user not verified",
                    "success": false
                }
            }
            else {
                // get git access_token of user
                var access_token = user[0].gittoken;
                // get git repositories of user
                const fetch = createApolloFetch({
                    uri: `https://api.github.com/graphql?access_token=${access_token}`
                });

                const res = await fetch({
                    query: '{ repositoryOwner(login: prasannamore) {  id  login avatarUrl  repositories(first:5){  nodes{   isPrivate    name   }   }  } }',
                })

                var notes = await notesModel.find({ UserID: payload.user_ID })
                // console.log(notes)
                for (let i = 0; i < res.data.repositoryOwner.repositories.nodes.length; i++) {
                    let check = false;
                    // check if notes tittle already exists
                    for (let j = 0; j < notes.length; j++) {
                        if (notes[j].title == res.data.repositoryOwner.repositories.nodes[i].name) {
                            check = true
                        }
                    }
                    // if note title not present save note
                    if (check == false) {
                        var newNote = new notesModel({
                            title: res.data.repositoryOwner.repositories.nodes[i].name,
                            //discription: res.data.repositoryOwner.repositories.nodes[i].discription,
                            UserID: payload.user_ID
                        })
                        await newNote.save();
                    }
                }
                return {
                    "repo": res.data.repositoryOwner.repositories.nodes
                }

            }
        }
        else {
            // return un authorized
            return {
                "message": "Un Auth",
                "success": false
            }
        }
    }
    else {
        // return token not provided
        return {
            "message": "token not provided",
            "success": false
        }
    }
}
    catch(err){
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
/**
  * @description       : add reminder to  notes
  * @param {*} root    : result of previous resolve function
  * @param {*} args    : arguments for resolver funtions
  * @param {*} context    : context 
  */
exports.addReminder = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    // check if token provided
    try {
        if (context.token) {
            // verify token
            var payload = await jwt.verify(context.token, process.env.APP_SECRET)
            // date formate
            var date = new Date(args.date)
            console.log(date)
            if (date) {
                var note = await notesModel.find({ _id: args.NoteID });
                if (note.length != 0) {
                    // set reminder
                    var setReminder = await notesModel.findOneAndUpdate({ _id: args.NoteID, UserID: payload.user_ID }, { $set: { remainder: date } })
                    if (setReminder) {
                        console.log(setReminder)
                        // return reminder added successfully
                        return {
                            "message": "reminder added successfully",
                            "success": true
                        }
                    }
                    else {
                        // return reminder not added successfully
                        // return {
                        //     "message": "reminder not added successfully",
                        //     "success": false
                        // }
                        throw new Error("reminder not added successfully")
                    }
                }
                else{
                    throw new Error("note not exists")
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
    } catch (err) {
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