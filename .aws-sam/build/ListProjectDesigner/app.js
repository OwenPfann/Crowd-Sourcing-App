//ListProjectDesigner
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
    console.log("info:" + JSON.stringify(info));

  // if designer name exists than return designer id else false
  let DesignerExistence = (desID) => {
    return new Promise((resolve, reject) => {
      pool.query("SELECT * FROM designer WHERE designerID=?", [desID], (error, rows) =>  {
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
    
  let GetProjects = (designerID) => {
    return new Promise((resolve, reject) => {
      pool.query("SELECT * FROM projects WHERE designerID=?", [designerID], (error, rows) => {
        if (error) { return reject(error); } //if error reject
        if((rows) && (rows.length == 1)){
          return resolve(false);
        }
        else {return resolve(rows);}
        
           });
        });
      };
  
    

  try {
    let exists = await DesignerExistence(info.designerID); //get designerID or get false
    let projectStuff = await GetProjects(exists);
    if (exists === false) {
      response.statusCode = 400;
      response.error = "designer ID: " + info.designerID + " does not exist";
      } 
    if (projectStuff === false) {
      response.statusCode = 400;
      response.error = "Couldn't get projects for " + info.designerID;
    } 
    else {
      let result = projectStuff;
      response.statusCode = 200;
      response.result = JSON.stringify(result);
      return response;
    }
    
  } catch (error) {
    response.statusCode = 400;
    response.error = error;
  }
  return response; };  // return to client


