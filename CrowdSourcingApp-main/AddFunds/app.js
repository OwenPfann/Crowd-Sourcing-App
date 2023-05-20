//Add funds
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
// {  body: '{    \"supporterID\" : \"1\", \"funds\" : \" 100\"}'
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
    
    let GetSupporterFunds = (ID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM supporter WHERE supporterID=?", [ID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows.length == 1)) { //means the name is unique and the password passed in is correct
                    return resolve(rows[0].funds); //resolve promise and return true
                } else {
                    return resolve("supporter ID does not exist " + ID); //reject promise if the row return is not what is expected
                }
            });
        });
    }
    
    let GetSupporter = (ID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM supporter WHERE supporterID=?", [ID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows.length == 1)) { //means the name is unique and the password passed in is correct
                    return resolve(rows[0]); //resolve promise and return true
                } else {
                    return resolve("supporter ID does not exist " + ID); //reject promise if the row return is not what is expected
                }
            });
        });
    }
    
    let ReplaceSupporterFunds = (supID, value) => {
    return new Promise((resolve, reject) => {
      pool.query("UPDATE supporter SET funds=? WHERE supporterID=?", 
                 [value, supID], (error, rows) => {
        if (error) { return reject(error); }
        //console.log("launch function rows:" + rows); 
        else { 
          return resolve(true);   // REJECT if couldn't update WAIT TO CHECK
        }
      });
    })}

    try {
        //***check values in the database
        // 1. Query RDS for the first constant value
        // 2. Query RDS for the second constant value
        // ----> These have to be done asynchronously in series, and you wait for earlier 
        // ----> request to complete before beginning the next one
       let supporterExists = await CheckSupporterExists(info.supporterID); //need the designers ID passed in 
       //let designerOwnership = await CheckProjectOwner(info.name, info.designerID); // pass in designer ID and project name
       
       //console.log(designerExists); 
      
       
    //LOGIC
        //check supporter esists 
        //else
            //get the supporters current funds value 
            //add the funds to the current funds value 
    
        
        //***logic goes here 
        // If either is NaN then there is an error
        if (supporterExists != true) { 
            //error desinger does not exist
            response.statusCode = 400;
            response.error = "supporterID is not valid: " + info.supporterID; //find a way to check what the error says from the function if not an empty error
          return response; 
        }
        
        else { // insert new value and return project
            
            let supporterCurrentFunds = await GetSupporterFunds(info.supporterID); 
            //console.log(supporterCurrentFunds);
            //console.log(info.funds);
            //console.log(parseFloat(supporterCurrentFunds));
            //console.log(parseFloat(info.funds));
            let newSupporterFunds = parseFloat(supporterCurrentFunds) + parseFloat(info.funds);
            //console.log(newSupporterFunds);
            let gotReplaced = await ReplaceSupporterFunds(info.supporterID, newSupporterFunds) ; //set launch value to 1 for input project name
            if (gotReplaced){
                response.statusCode = 200;
                let result = await GetSupporter(info.supporterID); //"supporter funds got updated"; // repalce with what client side wants
                response.result = JSON.stringify(result);
                return response; 
            }
            else {
                response.statusCode = 400;
                response.error = "unable to update supporter funds of ID: " + info.supporterID; 
            }
            
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
