//LOGIN
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


    let actual_event = event.body;
    console.log(actual_event);
    let info = JSON.parse(actual_event);
    console.log("info:" + JSON.stringify(info)); //  info.arg1 and info.arg2

    // get raw value or, if a string, then get from database if exists.
    let CheckCredentialsDesigner = (name, password) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM designer WHERE name=?", [name], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows.length == 1) && rows[0].password == password) { //means the name is unique and the password passed in is correct
                    return resolve(rows[0].designerID); //resolve promise 
                } else {
                    return resolve("designer credentials are not a vaild pair '" + name + password +"'"); //reject promise if the row return is not what is expected
                }
            });
        });
    } 
    
    let CheckCredentialsSupporter = (name, password) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM supporter WHERE name=?", [name], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows.length == 1) && rows[0].password == password) { 
                    return resolve(rows[0].supporterID); //resolve promise 
                } else {
                    return resolve("supporter credentials are not a vaild pair '" + name + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    }
    
    let ReturnCredentialsDesigner = (name, password) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM designer WHERE name=?", [name], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows.length == 1) && rows[0].password == password) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0]); //resolve promise 
                } else {
                    return resolve("designer credentials are not a vaild pair '" + name + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    } 
    
    let ReturnCredentialsSupporter = (name, password) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM supporter WHERE name=?", [name], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows.length == 1) && rows[0].password == password) { 
                    return resolve(rows[0]); //resolve promise 
                } else {
                    return resolve("supporter credentials are not a vaild pair '" + name + "'"); //reject promise if the row return is not what is expected
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
        const AdminName = "AdamTheAdmin"; //constansts for the one Admin we have 
        const AdminPassword = "123IloveAWS";
        
       
        
        //***logic goes here 
        // If either is NaN then there is an error
        if (info.type === "Admin") { 
            if(info.name == AdminName && info.password == AdminPassword){
                response.statusCode = 200;
                let result = "{\"name\" : \"AdamTheAdmin\", \"ID\" : \"\", \"type\" : \"Admin\"}" ; //list of all projects, get lambda function from hailey
                response.result = result;
                return response; 
            }
            else{
                response.statusCode = 400;
                response.error = "Incorrect Admin Credentials"; 
                return response;
            }
        }
        
        if(info.type == "Designer"){
            const DesignerCheck = await CheckCredentialsDesigner(info.name, info.password); 
            const DesignerCredentials = await ReturnCredentialsDesigner(info.name, info.password);
            
            if(isNaN(DesignerCheck)){
                response.statusCode = 400;
                response.error = "Designer does not exist" + DesignerCheck; //find a way to check what the error says from the function if not an empty error*****
                return response;
            }
            else{
                response.statusCode = 200;
                let result =  DesignerCredentials; //return the designer credentials to store on client side
                response.result = JSON.stringify(result);
                return response;
            }
        }
        
        if(info.type === "Supporter"){
            const SupporterCredentials = await ReturnCredentialsSupporter(info.name, info.password); 
            const SupporterCheck = await CheckCredentialsSupporter(info.name, info.password);
            
             if(isNaN(SupporterCheck)){
                response.statusCode = 400;
                response.error = "Supporter name does not exist"; //find a way to check what the error says from the function if not an empty error*********
                return response;
            }
            else{
                response.statusCode = 200;
                let result = SupporterCredentials ; //return the supporter credentials to store on client side
                response.result = JSON.stringify(result);
                return response;
            }
        }
        
        else {
            response.statusCode = 400;
            response.error = "type is not valid " + info.type; //find a way to check what the error says from the function if not an empty error
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
