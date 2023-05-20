//Delete Project
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
// {  body: '{    \"name\" : \"project 1\", \"desigerID\" : \"1\" }'
//
// }
//
// ===>  removed the project adn returns a string that it has been removed
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
    
     let CheckProjectOwner = (desID, projectName) => { //check that the designer ID is valid
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE name=?", [projectName], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if unique designer ie only one row with that name
                    console.log("rows designer: " + rows[0].designerID);
                    console.log("input designer: " + desID);
                    if(rows[0].designerID == desID){
                        return resolve(true); // true means that the designer does own the project
                    }
                    return resolve(false); //faLse means the deisnger does not own this project
                } else {
                    return resolve("unable to locate designerID of: '" + desID + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    
    }
    
    
    let CheckProjectExists = (nameVar) => { //check that the project name does not alreayd exist
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE name=?", [nameVar], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if (rows.length == 1) { // check if unique name 
                    return resolve(true); //true means the project exists
                } else {
                    return resolve("project name: " + nameVar + " does not exist"); 
                }
            });
        });
    }
    
    let GetProjectID = (nameVar) => { //check that the project name does not alreayd exist
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE name=?", [nameVar], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if (rows.length == 1) { // check if unique name 
                    return resolve(rows[0].projectID); //returns projectID
                } else {
                    return resolve("project name: " + nameVar + " does not exist"); 
                }
            });
        });
    }
    
    let GetProjectLaunched = (nameVar) => { //check that the project name does not alreayd exist
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE name=?", [nameVar], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if (rows.length == 1) { // check if unique name 
                    return resolve(rows[0].launch); //if 1 then the project is launched if zero then not launched
                } else {
                    return resolve("project name: " + nameVar + " does not exist"); 
                }
            });
        });
    }
    
    let DeleteProject = (name) => { //completed, success, launched and funding all are 0
    return new Promise((resolve, reject) => {
      pool.query("DELETE FROM projects Where name =?",  // why does the inserts seem to be off by one column and the desicription is compied
                 [name], (error, rows) => {
        if (error) { return reject(error); }
        else {
          return resolve(" project: " + name + " deleted");   // REJECT if couldn't add  WAIT TO CHECK
        }
      });
    })}
    
    let DeletePledges = (projectID) => { //completed, success, launched and funding all are 0
    return new Promise((resolve, reject) => {
      pool.query("DELETE FROM pledges Where projID =?",  // why does the inserts seem to be off by one column and the desicription is compied
                 [projectID], (error, rows) => {
        if (error) { return reject(error); }
        else {
          return resolve(" pledges with project ID of : " + projectID + " deleted");   // REJECT if couldn't add  WAIT TO CHECK
        }
      });
    })}
    


    
    try {
        //***check values in the database
        // 1. Query RDS for the first constant value
        // 2. Query RDS for the second constant value
        // ----> These have to be done asynchronously in series, and you wait for earlier 
        // ----> request to complete before beginning the next one
        //const desingerIDexists = await CheckDesignerExists(info.designerID); //returns a number if the desinger ID exists
        //const projectExist = await GetProjectID(info.name); //if false then the name can be used
    
        
        //***logic goes here 
        //check that the project exists (with passed in project Name)* 
        //check deisgner exists* 
        //check if it is owned by the designer (check project table with project ID that the designerID for that project matches the input deisgnerID) * 
        //check that the project is NOT launched (use project ID from earlier and return the launch column value, if 1 then error) * 
        //if all true (delete functions sent by hailey)
            //delete the project
            //delete all pledges with the assiciated project 
            //check that there are no pledges for this project in the clamied pledges table
        let projExist = await CheckProjectExists(info.name); //name is the project name, ID is the designerID //if NOT true then error name does not exist 
        let projectID = await GetProjectID(info.name); //if not a number then error
        let designerExist = await CheckDesignerExists(info.designerID); //if not a number then erorr desinger does not exist 
        let projOwner = await CheckProjectOwner(info.designerID, info.name); //if not true then error that deisgner does not own the project
        let projLaunched = await GetProjectLaunched(info.name); //if 1 then error for project is already lanuched
        console.log("project launch value: "+ projLaunched); 
        
        console.log("give ndesigner ID: " + info.designerID); 
        if(info.designerID == 0 ){
            response.statusCode = 200;
            await DeleteProject(info.name); 
            await DeletePledges(projectID); 
            response.result = JSON.stringify("project and associated pledges were sucessfully deleted for the Admin"); //return string that project was created via Owen request!*****************************
            return response;
        }
        else{
             if (projExist != true) { //check project exists
            response.statusCode = 400;
            response.error = "Project name does not exist";
            return response;
        }
        if (isNaN(projectID) == true) { //check if project has an ID 
            response.statusCode = 400;
            response.error = "Project name has no associated ID: " + info.name ;
            return response;
        }
        if (isNaN(designerExist) == true) { //check designer exists
            response.statusCode = 400;
            response.error = "Designer does not exist";
            return response;
        } 
        if (projOwner != true) { //check designer owns project
            response.statusCode = 400;
            response.error = "Designer of ID: " + info.designerID + " does not own project of name: " + info.name; 
            return response;
        } 
        if (projLaunched == 1 && info.designerID != 0){ // check project is NOT launched only if not the admin (admin desingerID is always 0 )
            response.statusCode = 400;
            response.error = "Project of name : " + info.name + " is already launched"; 
            return response;
        }
        else { // if all of these are not true then the project can be registered
            // otherwise SUCCESS!
            response.statusCode = 200;
            await DeleteProject(info.name); 
            await DeletePledges(projectID); 
            response.result = JSON.stringify("project and associated pledges were sucessfully deleted"); //return string that project was created via Owen request!*****************************
            return response;
        }
       
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
