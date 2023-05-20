//REGISTER SUPPORTER
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
// {  body: '{    \"name\" : \"billy\", \"password\" : \"pw123\", , \"funds\" : \"pw123\"}'
//
// }
//
// ===>  { "designerID" : "1" } //adds designer to the project list and returns the designerID
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

    // checks if the new designer name is uniqe and retursn the 
    let CheckNameUnique = (value) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM supporter WHERE name=?", [value], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 0)) { // check if enough info to do the work. ie number ofrows returned
                    console.log(rows); 
                    return resolve(true); //ture means that the name was not found
                } else {
                    console.log("made it to else"); 
                    return resolve("Name already used: '" + value + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    }; 
    
    let InsertNewSupporter = (name, password) => {
        return new Promise((resolve, reject) => {
            pool.query("INSERT INTO supporter (name, password, funds) VALUES(?,?,?)", 
               [name, password, 0], (error, rows) => { //creates all new supporters with zero funds
                if (error) { return reject(error); }
                //if (rows.length == 1) {
                 // return resolve(rows[0].designerID);   // return the new designers ID if able to add row
                //}
                else { 
                    //console.log(rows[0]);
                    return resolve(rows[0]); //returns the name, password and type NOT id 
                  //return resolve("not a unique designer Name");   // REJECT if more than 1 row was created
                }
            });
        });
    };
    
    let GetID = (name) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM supporter WHERE name=?", [name], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    console.log(rows); 
                    return resolve(rows[0].supporterID); //resolve promise and return the password
                } else {
                    return resolve("Name already used in ID: '" + name + "'"); //reject promise if the row return is not what is expected
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
        const name_value = await CheckNameUnique(info.name); //perform query to database and when retuned will have the arg1 vlaue if it exists

        
        //***logic goes here 
        // If name is not unique, is null or the password is null 
        if (name_value != true){ //|| info.name == null || info.password == null) { 
            response.statusCode = 400;
            response.error = "Supporter already exists";
            return response;
        } else {
            // otherwise SUCCESS!
            //console.log("made it to adding a new supporter"); 
            response.statusCode = 200;
            let fullresult = await InsertNewSupporter(info.name, info.password); //add designer to the table and return the designerID
            let result = await GetID(info.name); //return supporter ID 
            //console.log("result: " + result); 
            response.result = JSON.stringify(result); 
           // console.log("supporter supposed to be added and result set"); 
           return response;
        }
        //***check fro errors
    } catch (error) {
        console.log("ERROR: " + response.error);
        response.statusCode = 400;
    }
    
    //*** full response is the final thing to send back
    return response;
};
