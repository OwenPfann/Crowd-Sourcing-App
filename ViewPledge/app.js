//View Pledge

// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
const mysql = require('mysql'); //access mysql database 

var config = require('./config.json'); //file that has the constanst  for the datbase we want
var pool = mysql.createPool({ //creates connecteions from the config file to the get access to the database
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

// https://www.freecodecamp.org/news/javascript-promise-tutorial-how-to-resolve-or-reject-promises-in-js/#:~:text=Here%20is%20an%20example%20of,message%20Something%20is%20not%20right!%20.
function query(conx, sql, params) {
    return new Promise((resolve, reject) => {
        conx.query(sql, params, function(err, rows) {
            if (err) {
                // reject because there was an error
                reject(err);
            } else {
                // resolve because we have result(s) from the query. it may be an empty rowset or contain multiple values
                resolve(rows);
            }
        });
    });
}


// Take in as input a payload.
//
// {  body: '{    \"projectName\" : \"project 1\",  \"pledgeName\" : \"project 1\"}'
//
// }
//
// ===>  returns the pledge info as well as the number of clamied pledges 
//
exports.lambdaHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

   // ready to go for CORS. To make this a completed HTTP response, you only need to add a statusCode and a body.
    let response = {
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*", // Allow from anywhere //Access-Control-Allow-Origin error thrown for webpage
            "Access-Control-Allow-Methods": "POST" // Allow POST request
        }
    }; // response


    let actual_event = event.body;
    console.log(actual_event);
    let info = JSON.parse(actual_event);
    console.log("info:" + JSON.stringify(info)); //  info.arg1 and info.arg2

    // get raw value or, if a string, then get from database if exists.
    let CheckPledgeProject = (pledgeName) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM pledges WHERE name=?", [pledgeName], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0].projID); //get project ID for the pledge if it exists and compare to the passed in project ID, must match.  
                } else {
                    return resolve("pledge name does not exist '" + pledgeName + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let ProjectExists = (projectName) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE name=?", [projectName], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0].projectID); //get project ID for the pledge if it exists and compare to the passed in project ID, must match.  
                } else {
                    return resolve("project name does not exist '" + projectName + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let GetPledgeID = (pledgeName) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM pledges WHERE name=?", [pledgeName], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0].pledgeID); //get project ID for the pledge if it exists and compare to the passed in project ID, must match.  
                } else {
                    return resolve("project name does not exist '" + projName + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    
    let GetProject = (projName) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE name=?", [projName], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0]); //resolve promise 
                } else {
                    return resolve("project name does not exist '" + projName + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let GetPledge = (pledgeName) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM pledges WHERE name=?", [pledgeName], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0]); //resolve promise 
                } else {
                    return resolve("No pledges with ID: '" + projID + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let GetClaimedPledges = (pledgeID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM claimedPledges WHERE pledgeID=?", [pledgeID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows.length); //resolve promise and return number of claimed pledges for that pledge ID
                } else {
                    return resolve("No Clamined pledges with ID: '" + pledgeID + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    
    try {
        //***check values in the database
        // 1. Query RDS for the first constant value
        // 2. Query RDS for the second constant value
        // ----> These have to be done asynchronously in series, and you wait for earlier 
        // ----> request to complete before beginning the next o
        
        //***logic goes here 
        //check project ID exists DONE
        //check if pledge name exists => returns the project ID for the assiciated project
        //check returned projectID matched passed in projectID
        //if all true
            //get project
            //get pledge 
            //get claimed pledges number -> need pledge ID for this
        
        let projectExistance = await ProjectExists(info.projectName); //project ID for a name if it exists
        let pledgeProject = await CheckPledgeProject(info.pledgeName); //project ID for a pledge name if it esists
        
        if(isNaN(projectExistance)){
            response.statusCode = 400;
            response.error = "Invalid project name";
            return response;
        }
        if(isNaN(pledgeProject)){
            response.statusCode = 400;
            response.error = "Invalid pledge Name";
            return response;
        }
        if(pledgeProject === projectExistance){
            // otherwise SUCCESS!
            response.statusCode = 200;
            let project = await GetProject(info.projectName); //why getting an unknown token error
            project.pledges = await GetPledge(info.pledgeName); 
            let validPledgeID = await GetPledgeID(info.pledgeName); //get pledgeID to get the clamied pledges
            project.claimedPledges = await GetClaimedPledges(validPledgeID); //get number of clamined pledge by that name
            response.result = JSON.stringify(project);
            
            return response;
        }
        else {
            response.statusCode = 400;
            response.error = "Pledge: " + info.pledgeName + " does not belong to the project: " + info.projectName; // mismatch project and pledge
            return response;
        }
    //***check fro errors
    } catch (error) {
        console.log("ERROR: " + error);
        response.statusCode = 400;
        response.error = error;
    }
    
    //*** full response is the final thing to send back
    return response;
};
