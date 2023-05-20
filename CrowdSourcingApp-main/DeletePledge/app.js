//Delete Pledge
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
// {  body: '{ \"name\" : \"pledge 1\", \"desingerID\" : \"1\"}'
//
// }
//
// ===>  //deletes pledge from the input name ifthe designer owns it
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

    
    //parse the body from the input payload
    let actual_event = event.body;
    console.log(actual_event);
    let info = JSON.parse(actual_event); //info is body 
    console.log("info:" + JSON.stringify(info)); //  info. => name, description, designerID, type, deadline, goal (funding and launch are not passed in they are auto set to zero)

    // how to check database for a value 
    let CheckDesignerExists = (designerID) => { //check that the designer ID is valid
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM designer WHERE designerID=?", [designerID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if unique designer ie only one row with that name
                    return resolve(rows[0].designerID); //resolve promise 
                } else {
                    return resolve("unable to locate designerID of: '" + designerID + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    
    }
    
    
    let CheckPledgeExists = (nameVar) => { //check that the project name does not alreayd exist
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM pledges WHERE name=?", [nameVar], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if (rows.length == 1) { // check if unique name 
                    return resolve(rows[0].projID); //resolve promise and return the project ID
                } else {
                    return resolve("pledge name: " + nameVar + " does not exist"); //false is good, meaning the project does not exist so then that name can be used 
                }
            });
        });
    } 
    
    let GetProjectLaunched = (nameVar) => { //check that the project name does not alreayd exist
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE projectID=?", [nameVar], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if (rows.length == 1) { // check if unique name 
                    //console.log("launched vlaue inside of function: " + rows[0].launch);
                    return resolve(rows[0].launch); //if 1 then the project is launched if zero then not launched
                } else {
                    return resolve("project of ID: " + nameVar + " does not exist"); 
                }
            });
        });
    }
    
    let InsertProject = (name, description,designerID, type, deadline,goal,funding,launch, completed, success) => { //completed, success, launched and funding all are 0
    return new Promise((resolve, reject) => {
      pool.query("INSERT INTO projects (name,description,designerID, type, deadline,goal,funding,launch, completed, success) VALUES(?,?,?,?,?,?,?,?,?,?)",  // why does the inserts seem to be off by one column and the desicription is compied
                 [name, name,description,designerID, type, deadline,goal,funding,launch,completed, success], (error, rows) => {
        if (error) { return reject(error); }
        if ((rows) && (rows.length == 1)) {
          return resolve(rows[0].projectID);   // TRUE if was able to add
        } else {
          return resolve("not a unique project '" + name + "'");   // REJECT if couldn't add  WAIT TO CHECK
        }
      });
    })}
    
    let CheckProjectOwner = (projectID) => { //check that the designer ID is valid
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE projectID=?", [projectID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if unique designer ie only one row with that name
                    //console.log(rows); 
                    //console.log(rows[0].designerID)
                    return resolve(rows[0].designerID); // returns the desinger ID 
                    //return resolve(false); //faLse means the deisnger does not own this project
                } else {
                    return resolve("unable to locate projectID of: '" + projectID + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    }
    
    let DeletePledges = (name) => { //completed, success, launched and funding all are 0
    return new Promise((resolve, reject) => {
      pool.query("DELETE FROM pledges Where name =?",  // why does the inserts seem to be off by one column and the desicription is compied
                 [name], (error, rows) => {
        if (error) { return reject(error); }
        else {
          return resolve(" pledges with name : " + name + " deleted sucessfull");   // REJECT if couldn't add  WAIT TO CHECK
        }
      });
    })}


    
    try {
        //***check values in the database
        // 1. Query RDS for the first constant value
        // 2. Query RDS for the second constant value
        // ----> These have to be done asynchronously in series, and you wait for earlier 
        // ----> request to complete before beginning the next one
       
        
        //***logic goes here 
        //check pledge exists with pledge name (name field for input)* **
        //get the projectID from the pledges * **
        //check project has NOT been launched (from pledges table get the project ID) * 
        //check deisgner owns the project of the associated pledge (check projects table with projectID and get the designer ID for the project -> check this matehces the passed in desingerID)
        //if all true
            //remove from the pledges table (delete functions sent by hailey)
        let desingerIDexists = await CheckDesignerExists(info.designerID); //returns a number if the desinger ID exists
        let projectIDfromPledge = await CheckPledgeExists(info.name); //if not a number then error pledge does not exist, number is the projectID
        let projLaunched = await GetProjectLaunched(projectIDfromPledge); //if 1 then error that project is alreayd launched 
        let projectOwnerID = await CheckProjectOwner(projectIDfromPledge); //if not true then error deisnger does not own project
        //console.log("passed in DesignerID: " + info.designerID); 
        //console.log("gotten desingerID from project: " + projectOwnerID); 
        //***********************update if statemetns below*******************************************************
        
        if (isNaN(desingerIDexists)==true) { //check the designer ID exists
            response.statusCode = 400;
            response.error = "DesignerID does not exist";
            return response;
        } 
        if (isNaN(projectIDfromPledge) == true) { //check if pledge name is exists 
            response.statusCode = 400;
            response.error = "Pledge Name does not exist: " + info.name ;
            return response;
        }
        //console.log("current launced value: " + projLaunched); 
        if (projLaunched == 1) { //check project is not launched
            response.statusCode = 400;
            response.error = "Project is already launched";
            return response;
        } 
        if (projectOwnerID != info.designerID) { //check designer owns project
            response.statusCode = 400;
            response.error = "Designer of ID: " + info.designerID + " does not own the pledge of name: " + info.name + "shown as a projectID: " + projectIDfromPledge;
            return response;
        }
        else { // if all of these are not true then the project can be registered
            // otherwise SUCCESS!
            response.statusCode = 200;
            let isPledgedeleted = await DeletePledges(info.name); //name, descirption,designerID, type, deadline,goal,funding,launch, completed, success (last 4 are auto set to zero for a new project) 
            //let result = await CheckProjectExists(info.name); //returns the project ID number // check to make sure project was successfully added
            response.result = JSON.stringify(isPledgedeleted); //return string that project was created via Owen request!*****************************
            return response;
        }
        //***check for errors
    } catch (error) {
        console.log("ERROR: " + error);
        response.statusCode = 400;
        response.error = error;
    }
    
    //*** full response is the final thing to send back
    return response;
}
