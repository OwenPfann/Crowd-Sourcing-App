//CREATE PROJECT
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
// {  body: '{    \"name\" : \"project 1\", \"description\" : \"first project\", \"designerID\" : \"1\", \"type\" : \"other\", \"deadline\" : \"2022-12-15\", \"goal\" : \"1000\",}'
//
// }
//
// ===>  { "projectID" : "1" } //adds project to the project list and returns the projectID
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
    
    
    let CheckProjectExists = (nameVar) => { //check that the project name does not alreayd exist
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE name=?", [nameVar], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if (rows.length == 1) { // check if unique name 
                    return resolve("project name already exists function'" + nameVar + "'"); //resolve promise and return the project ID
                } else {
                    return resolve(false); //false is good, meaning the project does not exist so then that name can be used 
                }
            });
        });
    } 
    
    let InsertProject = (name, description,designerID, type, deadline,goal,funding,launch, completed, success) => { //completed, success, launched and funding all are 0
    return new Promise((resolve, reject) => {
      pool.query("INSERT INTO projects (name,description,designerID, type, deadline,goal,funding,launch, completed, success) VALUES(?,?,?,?,?,?,?,?,?,?)",  // why does the inserts seem to be off by one column and the desicription is compied
                 [name,description,designerID, type, deadline,goal,funding,launch,completed, success], (error, rows) => {
        if (error) { return reject(error); }
         else {
          return resolve("project created '" + name + "'");   // REJECT if couldn't add  WAIT TO CHECK
        }
      });
    })}
    
    
    let GetProject = (nameVar) => { //check that the project name does not alreayd exist
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE name=?", [nameVar], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if (rows.length == 1) { // check if unique name 
                    return resolve(rows[0]); //return the rows for the project
                } else {
                    return resolve(false); //false is good, meaning the project does not exist so then that name can be used 
                }
            });
        });
    }

    
    try {
        //***check values in the database
        // 1. Query RDS for the first constant value
        // 2. Query RDS for the second constant value
        // ----> These have to be done asynchronously in series, and you wait for earlier 
        // ----> request to complete before beginning the next one
        const desingerIDexists = await CheckDesignerExists(info.designerID); //returns a number if the desinger ID exists
        const projectExist = await CheckProjectExists(info.name); //if false then the name can be used
    
        
        //***logic goes here 
        // If either is NaN then there is an error
        if (desingerIDexists != info.designerID) { //check the designer ID 
            response.statusCode = 400;
            response.error = "DesignerID does not exist";
            return response;
        } 
        if (projectExist != false) { //check if project name is unique 
            response.statusCode = 400;
            response.error = "Project Name already used: " + info.name ;
            return response;
        } 
        if (info.goal <= 0) { //check funding goal is non negative and zero
            response.statusCode = 400;
            response.error = "Goal cannot be negative or zero";
            return response;
        } 
        else { // if all of these are not true then the project can be registered
            // otherwise SUCCESS!
            response.statusCode = 200;
            await InsertProject(info.name, info.description, info.designerID, info.type, info.deadline, info.goal, 0,0,0,0); //name, descirption,designerID, type, deadline,goal,funding,launch, completed, success (last 4 are auto set to zero for a new project) 
            let createdProject = await GetProject(info.name); 
            //let result = await CheckProjectExists(info.name); //returns the project ID number // check to make sure project was successfully added
            response.result = JSON.stringify(createdProject); //return string that project was created via Owen request!*****************************
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
