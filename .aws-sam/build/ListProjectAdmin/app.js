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
  let isAdmin = () => {
    return new Promise((resolve, reject) => {
      pool.query("SELECT * FROM projects", (error, rows) => {  ///get all projects
        if (error) { return reject(error); }
        else{
          return resolve(rows); 
        }
          // return 0*many rows of project
        // }
      });
   })};
   
  try {
    const AdminName = "AdamTheAdmin"; //constansts for the one Admin we have 
    const AdminPassword = "123IloveAWS";
    console.log(info); 
    console.log(info.name); 
    
    //const exists = await isAdmin(info.name); //checks for rows and if succesful than returns all lists
    if(info.name == AdminName){
      response.statusCode = 200;
      let result = await isAdmin() ; //get all the projects 
      //multiple

      response.result = JSON.stringify(result);
      //response.result = [];
      //for (let project of result){
        
      
      //response.result.push(JSON.stringify(project));
      //}
    }
    else{
      response.statusCode = 400;
      response.error = "access denied, not the admin" + info.name;
    }

    }catch (error) {
    response.statusCode = 400;
    response.error = error;
  }
  
  
  return response;
  
};
