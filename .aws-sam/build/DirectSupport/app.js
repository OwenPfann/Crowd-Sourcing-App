//Direct support
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
// {  body: '{    \"name\" : \"project 1\", \"supporetID\" : \" 1\", \"funding\" : \"2000\"}'
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


    let actual_event = event.body;
    console.log(actual_event);
    let info = JSON.parse(actual_event);
    console.log("info:" + JSON.stringify(info)); //  info.arg1 and info.arg2

    // get raw value or, if a string, then get from database if exists.
   let CheckSupporterExists = (ID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM supporter WHERE supporterID=?", [ID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows.length == 1)) { //means the name is unique and the password passed in is correct
                    return resolve(true); //resolve promise and return true
                } else {
                    return resolve("supporter ID does not exist " + ID); //reject promise if the row return is not what is expected
                }
            });
        });
    }
    
    let CheckProjectExists = (name) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE projectID=?", [name], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows.length == 1)) { //means the name is unique and the password passed in is correct
                    return resolve(true); //resolve promise and return true
                } else {
                    return resolve("prpject does not exist ID: " + name); //reject promise if the row return is not what is expected
                }
            });
        });
    }
    
    let GetProject = (projName) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE name=?", [projName], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    console.log(rows); 
                    return resolve(rows[0]); //resolve promise 
                } else {
                    return reject("project name does not exist'" + projName + "'"); //reject promise if the row return is not what is expected
                }
            }); 
        });
    };
    
    let GetSupporterFund = (supporterID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM supporter WHERE supporterID=?", [supporterID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0].funds);//send back the funds avalible for the supporter
                } else {
                    return reject("supporter ID does not exist '" + supporterID + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let GetSupporter = (supporterID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM supporter WHERE supporterID=?", [supporterID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0]);//send back the funds avalible for the supporter
                } else {
                    return reject("supporter ID does not exist '" + supporterID + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let GetProjectFund = (name) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE projectID=?", [name], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0].funding);//send back the funds avalible for the supporter
                } else {
                    return reject("project ID does not exist FUND: '" + name + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let GetProjectID = (name) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE name=?", [name], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0].projectID);//send back the funds avalible for the supporter
                } else {
                    return reject("project name does not exist '" + name + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let GetProjectLaunch = (name) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE projectID=?", [name], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0].launch);//send back the funds avalible for the supporter
                } else {
                    return reject("project of ID does not exist LAUNCH: '" + name + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let UpdateProjectFunding = (projID, value) => {
    return new Promise((resolve, reject) => {
      pool.query("UPDATE projects SET funding=? WHERE projectID=?", 
                 [value, projID], (error, rows) => {
        if (error) { return reject(error); }
        //console.log("launch function rows:" + rows); 
        else { 
          return resolve(true);   // REJECT if couldn't update WAIT TO CHECK
        }
      });
    })}
    
    let UpdateSupporterFunds = (supID, funds) => {
    return new Promise((resolve, reject) => {
      pool.query("UPDATE supporter SET funds=? WHERE supporterID=?", 
                 [funds, supID], (error, rows) => {
        if (error) { return reject(error); }
        //console.log("launch function rows:" + rows); 
        else { 
          return resolve(true);   // REJECT if couldn't update WAIT TO CHECK
        }
      });
    })}
    
    let InsertNewDirectSupport = (projectID, supporterID, funding) => {
        return new Promise((resolve, reject) => {
            pool.query("INSERT INTO directSupport (projectID, supporterID, funding) VALUES(?,?,?)", 
               [projectID, supporterID, funding], (error, rows) => {
                if (error) { return reject(error); }
                //if (rows.length == 1) {
                 // return resolve(rows[0].designerID);   // return the new designers ID if able to add row
                //} 
                else {
                    console.log(rows[0]);
                    return resolve("direct supportlogged for by supporter ID: " + supporterID + "for project ID: " + projectID); //returns the cpID, pledgeID and SupporterID
                  //return resolve("not a unique designer Name");   // REJECT if more than 1 row was created
                }
            });
        });
    };
    


    try {
        //***check values in the database
        // 1. Query RDS for the first constant value
        // 2. Query RDS for the second constant value
        // ----> These have to be done asynchronously in series, and you wait for earlier 
        // ----> request to complete before beginning the next one
       let supporterExists = await CheckSupporterExists(info.supporterID); //need the designers ID passed in 
       let projectExist = await CheckProjectExists(info.projectID); //*****
       let supporterCurrentFunds = await GetSupporterFund(info.supporterID); 
       let projectCurrentFunding = await GetProjectFund(info.projectID); 
       let projectID = info.projectID; 
       let isLaunched = await GetProjectLaunch(info.projectID) 
       //let designerOwnership = await CheckProjectOwner(info.name, info.designerID); // pass in designer ID and project name
       
       //console.log(designerExists); 
      
        //columns in the direct support table dsID, projectID,supporterID,  funding
        
    //Logic
       //check the supporter exists DONE
       //check project exists DONE
       //check the supporter has enough funding DONE
       //get the project funding 
       //else 
            //add line to directSupport table (projectID, supporterID, funding)
            //add direct support to the project funding 
            //subtract direct support from the supporters funds column
    
        
        //***logic goes here 
        // If either is NaN then there is an error
        if (supporterExists != true) { 
            //error desinger does not exist
            response.statusCode = 400;
            response.error = "supporterID is not valid: " + info.supporterID; 
          return response; 
        }
        if(projectExist != true){
            //error designer does not own the project
            response.statusCode = 400;
            response.error = "project does not exist of ID: " + info.projectID; 
            return response;   
        }
        if(isLaunched != 1){
            response.statusCode = 400;
            response.error = "project is not launched: "; 
            return response; 
        }
        if(supporterCurrentFunds < info.funding ){
            //error designer does not own the project
            response.statusCode = 400;
            response.error = "supporter does not have enough funding "; 
            return response;   
        }
        else { // insert new value and update project and supporter funds 
            response.statusCode = 200;
            let newSupporterFunds = parseFloat(supporterCurrentFunds) - parseFloat(info.funding); //use parseFloat()
            let newProjectFunding = parseFloat(projectCurrentFunding) + parseFloat(info.funding);
            await InsertNewDirectSupport(projectID, info.supporterID, info.funding); //insert 
            await UpdateSupporterFunds(info.supporterID, newSupporterFunds)//update supporter 
            await UpdateProjectFunding(projectID, newProjectFunding) //update project
            let result = await GetSupporter(info.supporterID);//"direct support done, project and supporter updated" //get the supporter with the updated value to send to front end
            response.result = JSON.stringify(result);
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
