/*************************************************************************  
* @Execution : default node : cmd> server.js
* 
* 
* @Purpose : To perform git mutations
* 
* @description : Create and delete branch, Watch and Unwatch git repository, Star and Unstar git
                 repository, get all git users and create an issue.             
*                 
* @overview : fundoo application
* @author : Prasanna More <prasannamore.494@gmail.com>
* @version : 1.0
* @since : 27-april-2019
*
******************************************************************************/


const jwt = require("jsonwebtoken");
const userModel = require("../../model/userModel");
const issueModel = require("../../model/issuseModel")
const { createApolloFetch } = require('apollo-fetch');
const axios = require("axios");
const axiosService = require("../../services/axiosService").axiosService
/**
  * @description       : create branch on repositories
  * @purpose           : To create branch on repositories
  * @param {*} root    : result of previous resolve function
  * @param {*} args    : arguments for resolver funtions
  * @param {*} context    : context 
  */

exports.createBranch = async (root, args, context) => {
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
                // check if user is git user
                var gitUser = await userModel.find({ _id: payload.user_ID })
                if (gitUser.length > 0 && gitUser[0].gitVerify == true) {
                    var access_token = gitUser[0].gittoken;
                }
                else {
                    throw new Error("not git user")
                }
                // get sha of repository
                const shaurl = `https://api.github.com/repos/${args.gitUserName}/${args.repoName}/git/refs`
              
                const shaRes = await axiosService('GET', shaurl, access_token)
                console.log("sha response==================>", shaRes.data[0].object.sha)   
                let branchurl = `https://api.github.com/repos/${args.gitUserName}/${args.repoName}/git/refs`
                const  data = {

                    "ref": `refs/heads/${args.branchName}`,
                    "sha": shaRes.data[0].object.sha
                }
                const branches = await axiosService('POST', branchurl, access_token, data)

                // return branch created
                console.log("branch res==============================>", branches)
                return {
                    "message": "branch add successfully",
                    "success":true
                }
            }
            else {
                throw new Error("token not valid")
            }
        }

        else {
            throw new Error("token not provided")
        }


    }
    catch (err) {
        console.log("Error====================>\n", err)
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
  * @description       : deleteBranch branch on repositories
  * @purpose           : To deleteBranch branch on repositories
  * @param {*} root    : result of previous resolve function
  * @param {*} args    : arguments for resolver funtions
  * @param {*} context    : context 
  */

exports.deleteBranch = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    try {
        // check if token is provided
        if (context.token) {
            // verify token
            var paylaod = await jwt.verify(context.token, process.env.APP_SECRET)
            if (paylaod) {
                // check if user is git user
                var gitUser = await userModel.find({ _id: paylaod.user_ID })
                if (gitUser.length > 0 && gitUser[0].gitVerify == true) {
                    var access_token = gitUser[0].gittoken;
                }
                else {
                    throw new Error("not git user")
                }

                // delete  branch 
                const deleteurl = `https://api.github.com/repos/${args.gitUserName}/${args.repoName}/git/refs/heads/${args.branchName}`
                const deletebrach = await axiosService('DELETE', deleteurl, access_token)
                console.log("branch res==============================>", deletebrach)
                return {
                    "message": "branch delete successfully",
                    "success":true
                }

            }
            else {
                throw new Error("Un Authorized")
            }
        }
        else {
            throw new Error("token not provided")
        }
    }
    catch (err) {
        console.log(err)
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
  * @description       : star  repository
  * @purpose           : To star repository
  * @param {*} root    : result of previous resolve function
  * @param {*} args    : arguments for resolver funtions
  * @param {*} context    : context 
  */


exports.star = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    // check if token provided
    try{
    if (context.token) {
        // verify token
        var payload = jwt.verify(context.token, process.env.APP_SECRET)
        if (payload) {
            console.log(payload.user_ID)
            // check if git user
            var gitUser = await userModel.find({ _id: payload.user_ID });
            if (gitUser.length > 0 && gitUser[0].gitVerify) {
                var access_token = gitUser[0].gittoken
                const fetch = createApolloFetch({
                    uri: `${process.env.GITGRAPHQL}${access_token}`
                });
                // star repository
                await fetch({
                    query: '{ mutation { addStar(input: {starrableId: "MDEwOlJlcG9zaXRvcnkxMTgzMzUwODM=", clientMutationId: "MDQ6VXNlcjM1NjU3NTQ5"}) { clientMutationId   } } }',
                })
                return {
                    "message": "git repository star successfully",
                    "success": true
                }
            }
            else {
                throw new Error("not git user")
            }

        }
        else {
            throw new Error("Un Authorized")
        }
    }
    else {
        throw new Error("token not provided")
    }
}
catch(err){
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
  * @description       : unUtar  repository
  * @purpose           : To unStar repository
  * @param {*} root    : result of previous resolve function
  * @param {*} args    : arguments for resolver funtions
  * @param {*} context    : context 
  */

exports.unstar = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    // check if token provided
    try{
    if (context.token) {
        // verify token
        var payload = await jwt.verify(context.token, process.env.APP_SECRET)
        if (payload) {
            console.log(payload.user_ID)
            // check if git user
            var gitUser = await userModel.find({ _id: payload.user_ID });
            if (gitUser.length > 0 && gitUser[0].gitVerify) {
                var access_token = gitUser[0].gittoken
                const fetch = createApolloFetch({
                    uri: `${process.env.GITGRAPHQL}${access_token}`
                });
                // remove star repository
                await fetch({
                    query: '{ mutation { removeStar(input: {starrableId: "MDEwOlJlcG9zaXRvcnkxMTgzMzUwODM=", clientMutationId: "MDQ6VXNlcjM1NjU3NTQ5"}) { clientMutationId   } } }',
                })
                return {
                    "message": "git repository star removed successfully",
                    "success": true
                }
            }
            else {
                throw new Error("not git user")
            }

        }
        else {
            throw new Error("Un auth")
        }
    }
    else {
        throw new Error("token not provided")
    }
}
catch(err){
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
  * @description       : watch  repositore
  * @purpose           : To watch repositories
  * @param {*} root    : result of previous resolve function
  * @param {*} args    : arguments for resolver funtions
  * @param {*} context    : context 
  */
exports.watchrepository = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    try {
        if (context.token) {
            var payload = await jwt.verify(context.token, process.env.APP_SECRET);
            if (payload) {
                console.log(payload.user_ID)
                // check if git user
                var gitUser = await userModel.find({ _id: payload.user_ID });
                if (gitUser.length > 0 && gitUser[0].gitVerify) {
                    var access_token = gitUser[0].gittoken
                    var url = `https://api.github.com/user/subscriptions/${args.owner}/${args.watchrepository}`
                    await axiosService('PUT', url, access_token)
                    return {
                        "message": "git repository watch successfully",
                        "success": true
                    }
                }
                else {
                    throw new Error("not git user")
                }
            }
            else {
                throw new Error("Un Auth")
            }
        }
        else {
            throw new Error("token not provided")
        }
    }
    catch (err) {
        console.log(err)
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
  * @description       : unWatch  repositore
  * @purpose           : To unWatch repositories
  * @param {*} root    : result of previous resolve function
  * @param {*} args    : arguments for resolver funtions
  * @param {*} context    : context 
  */
exports.unWatchRepository = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    try {
        if (context.token) {
            var payload = await jwt.verify(context.token, process.env.APP_SECRET);
            if (payload) {
                // check if git user
                var gitUser = await userModel.find({ _id: payload.user_ID });
                if (gitUser.length > 0 && gitUser[0].gitVerify) {
                    var access_token = gitUser[0].gittoken
                    var url = `https://api.github.com/user/subscriptions/${args.owner}/${args.unwatchrepository}`
                    await axiosService('DELETE', url, access_token)
                    return {
                        "message": "git repository unwatch successfully",
                        "success": true
                    }
                }
                else {
                    throw new Error("not git user")
                }
            }
            else {
                throw new Error("Un Auth")
            }
        }
        else {
            throw new Error("token not provided")
        }
    }
    catch (err) {
        console.log(err)
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
  * @description       : get all commits of repositories in github
  * @purpose           : To get all commits of repositories in github
  * @param {*} root    : result of previous resolve function
  * @param {*} args    : arguments for resolver funtions
  * @param {*} context    : context 
  */

exports.AllUserCommits = async (root, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    try {
        if (context.token) {
            var payload = jwt.verify(context.token, process.env.APP_SECRET)
            //var user = await userModel.find({ _id: "5ce7b1e60f0b884066e06013" })
            var user = await userModel.find({ _id: payload.user_ID })
            var gitToken = user[0].gittoken;
            const fetch = createApolloFetch({
                uri: `${process.env.GITGRAPHQL}${gitToken}`
            });
            // remove star repository
            var res = await fetch({
                query: ' query{search(first:10 query:"stars:>0" type: REPOSITORY) {   repositoryCount   edges{     node{    ... on Repository{    name        commitComments(first:10){      totalCount      nodes{        commit{         commitUrl      }     }   }             }         }        } }} ',
            })
            console.log(res)
            return res.data.search
        }
        else {
            throw new Error("token not provided")
        }
    }

    catch (err) {
        console.log(err)
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
  * @description       : create an issue in github repository
  * @purpose           : To create an issue in github repository
  * @param {*} root    : result of previous resolve function
  * @param {*} args    : arguments for resolver funtions
  * @param {*} context    : context 
  */

exports.createIssue = async (parent, args, context) => {
    let result = {
        "message": "Something bad happened",
        "success": false
    }
    try {
        if (context.token) {
            var payload = jwt.verify(context.token, process.env.APP_SECRET)
            var user = await userModel.find({ _id: payload.user_ID })
            var gitToken = user[0].gittoken;
            console.log(gitToken)
            const fetch = await createApolloFetch({
                uri: `${process.env.GITGRAPHQL}${gitToken}`
            })

            const res = await fetch({
                query: `mutation {createIssue(input: { repositoryId: "${args.repositoryId}", title: "${args.title}", assigneeIds: [${args.assigneesIds}]} ) {issue {id createdAt assignees(first: 10) {totalCount edges{node{id login}}}}}}`
            })
            console.log("response =>", res);
            var assigneeArray = [];
            var data = res.data.createIssue.issue.assignees.edges;
            data.forEach(element => {
                assigneeArray.push(element.node.id)
            })

            console.log(assigneeArray);
            var issue = new issueModel({
                issueGitId: res.data.createIssue.issue.id,
                assigneeId: assigneeArray
            })
            var save = await issue.save();
            if (save) {
                return { message: "issue created successfully" }
            }
            else {
                throw new Error("error while creating issue")
            }
        }
        else {
            throw new Error("token not provided")
        }

    }
    catch (err) {
        console.log(err);
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
