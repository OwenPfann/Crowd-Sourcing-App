// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
const mysql = require('mysql');

var config = require('./config.json');
var pool = mysql.createPool({
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
// {  body: '{    "arg1" : "4",   "arg2" : "8"}'
//
// }
//
// ===>  { "result" : "12" }
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
    let ComputeArgumentValue = (value) => {
        let numeric_value = parseFloat(value);
        if (isNaN(numeric_value)) {
            return new Promise((resolve, reject) => {
                pool.query("SELECT * FROM Constants WHERE name=?", [value], (error, rows) => {
                    if (error) { return reject(error); }
                    if ((rows) && (rows.length == 1)) {
                        return resolve(rows[0].value);
                    } else {
                        return reject("unable to locate constant '" + value + "'");
                    }
                });
            });
        } else {
            // this is just the constant
            return new Promise((resolve) => { return resolve(numeric_value); });
        }
    }
    
    try {
        
        // 1. Query RDS for the first constant value
        // 2. Query RDS for the second constant value
        // ----> These have to be done asynchronously in series, and you wait for earlier 
        // ----> request to complete before beginning the next one
        const arg1_value = await ComputeArgumentValue(info.arg1);
        const arg2_value = await ComputeArgumentValue(info.arg2);
        console.log(arg1_value); 
        console.log(arg2_value); 
        
        // If either is NaN then there is an error
        if (isNaN(arg1_value) || isNaN(arg2_value)) {
            console.log("failed because of not a number")
            response.statusCode = 400;
            response.error = "Invalid Constant";
        } else {
            // otherwise SUCCESS!
            console.log("success inside else"); 
            response.statusCode = 200;
            let result = (arg1_value + arg2_value);
            response.result = result.toString();
        }
    } catch (error) {
        console.log("ERROR: " + error);
        response.statusCode = 400;
        response.error = error;
    }
    
    // full response is the final thing to send back
    return response;
}
