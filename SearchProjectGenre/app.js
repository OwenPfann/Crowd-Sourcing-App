//SEARCH BY GENRE
// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
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
// {  body: '{    \"type\" : \"other\"}'
//
// }
//
// ===>  list of projects that are are of that type
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
    console.log("info:" + JSON.stringify(info));

  // if designer name exists than return designer id else false
  let DesignerExistence = (name) => {
    return new Promise((resolve, reject) => {
      pool.query("SELECT * FROM designer WHERE name=?", [name], (error, rows) =>  {
        if (error) { return reject(error); }
        if ((rows) && (rows.length == 1)) {
          return resolve(rows[0].designerID);    // return designer id
        } else {
          return resolve(false);   // return false if does not exist
        }
      });
    });

  };

  //       }
  //     });
  // })}
    
  let GetProjectsType = (inputType) => {
    return new Promise((resolve, reject) => {
      pool.query("SELECT * FROM projects WHERE type=? AND launch=?", [inputType, 1], (error, rows) => {
        console.log("number of projects " + rows.length); //check for the tests
        if (error) { return reject(error); } //if error reject
        else {
          console.log(rows); 
          return resolve(rows)
        }
           });
        });
      };
  
  
  //LOGIC HERE 
  //make a if statement for each type of filter that can be passed in 
  //make a function that takes in the type and only returns projects with that type that was input 
  //return the projects list
    

  try {
    //const exists = await DesignerExistence(info.name); //get designerID or get false
    if (info.type === "art"){
      response.statusCode = 200;
      let result =  await GetProjectsType(info.type); //return the designer credentials to store on client side
      response.result = JSON.stringify(result);
      return response;
    }
    if (info.type === "business"){
      response.statusCode = 200;
      let result =  await GetProjectsType(info.type); //return the designer credentials to store on client side
      response.result = JSON.stringify(result);
      return response;
    }
    if (info.type === "games"){
      response.statusCode = 200;
      let result =  await GetProjectsType(info.type); //return the designer credentials to store on client side
      response.result = JSON.stringify(result);
      return response;
    }
    if (info.type === "health"){
      response.statusCode = 200;
      let result =  await GetProjectsType(info.type); //return the designer credentials to store on client side
      response.result = JSON.stringify(result);
      return response;
    }
    if (info.type === "sports"){
      response.statusCode = 200;
      let result =  await GetProjectsType(info.type); //return the designer credentials to store on client side
      response.result = JSON.stringify(result);
      return response;
    }
    if (info.type === "tech"){
      response.statusCode = 200;
      let result =  await GetProjectsType(info.type); //return the designer credentials to store on client side
      response.result = JSON.stringify(result);
      return response;
    }
    if (info.type === "other"){
      response.statusCode = 200;
      let result =  await GetProjectsType(info.type); //return the designer credentials to store on client side
      response.result = JSON.stringify(result);
      return response;
    }
    else{
      response.statusCode = 400;
      response.error = "type: " + info.type + " does not exist";
    }

  } catch (error) {
    response.statusCode = 400;
    response.error = error;
  }
  return response; };  // return to client


