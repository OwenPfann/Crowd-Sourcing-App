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


//  TEMPLATE: { body: '{ \"name\" : \"abc\", \"value\" : \"8\"}' ==> { "result" : "SUCCESS"}
//{body: ''{projID, name, reward, fundingAmount, totalPledges} ==> { "result" : "FAIL"} or { "result" : "projectID"}
exports.lambdaHandler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  // ready to go for CORS. Need to add a statusCode and a body.
  let response = { headers: {
      "Access‐Control‐Allow‐Headers": "Content‐Type",
      "Access‐Control‐Allow‐Origin": "*", // Allow from anywhere
      "Access‐Control‐Allow‐Methods": "POST" // Allow POST request
    }
  };
  let actual_event = event.body;          // pull out payload
  let info = JSON.parse(actual_event); //make attributes

  // get raw value or, if a string, then get from database if exists.
  let CheckIfPledgeExists = (name) => {
    return new Promise((resolve, reject) => {
      pool.query("SELECT * FROM pledges WHERE name=?", [name], (error, rows) => {
        if (error) { return reject(error); }
        if ((rows) && (rows.length == 1)) {
          return resolve(true);    // return true if already exisits
        } else {
          return resolve(false);  // return false if does not exist
        }
      });
   });};

  let InsertPledge = (projID, name, reward, fundingAmount, totalPledges) => {
    return new Promise((resolve, reject) => {
      pool.query("INSERT INTO pledges (projID, name, reward, fundingAmount, totalPledges) VALUES(?,?,?,?,?)",
                 [projID, name, reward, fundingAmount, totalPledges], (error, rows) => {
        if (error) { return reject(error); }
        // if ((rows) && (rows.length == 1)) {
        //   return resolve(rows[0].projectID);   // bring projectID if was able to add pledge //might beed to be info instead of row
        // }
         else {
          return resolve(rows[0]);  
        }

      });
    });};
    
    let GetPledge = (name) => {
    return new Promise((resolve, reject) => {
      pool.query("SELECT * FROM pledges WHERE name=?", [name], (error, rows) => {
        if (error) { return reject(error); }
        if ((rows) && (rows.length == 1)) {
          return resolve(rows);    // return true if already exisits
        } else {
          return resolve(false);  // return false if does not exist
        }
      });
   });};

  //   let GetID = (name) => { //make a function like this every time you want to check the database for a key and return a specific value
  //     return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
  //         pool.query("SELECT * FROM designer WHERE name=?", [name], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
  //             if (error) { return reject(error); } //if error reject promise 
  //             if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
  //                 console.log(rows); 
  //                 return resolve(rows[0].designerID); //resolve promise and return the password
  //             } else {
  //                 return resolve("Name already used in ID: '" + name + "'"); //reject promise if the row return is not what is expected
  //             }
  //         });
  //     });
  // };

  try {

    const exists = await CheckIfPledgeExists(info.name); //make sure pledgename is unique
    if (exists == true) {
      response.statusCode = 400; ///error
      response.error = "pledge name already exists" + info.name;
      } else {
        //create since it does not exist
          if(info.totalPledges == 0){
            const inserted = await InsertPledge(info.projID, info.name, info.reward, info.fundingAmount, 100000000000); // essentailly add an unlimited number of clamied pledges
            if (inserted == false) {
              response.statusCode = 400;
              response.error = "Couldn't insert pledge: " + info.name;
            } else {
              //succsfully added to table
              let result = await GetPledge(info.name); ///get projectID
              response.result = JSON.stringify(result); ///return proj id in JSON
              response.statusCode = 200;
            }
          }
          else {
            const inserted = await InsertPledge(info.projID, info.name, info.reward, info.fundingAmount, info.totalPledges);
            if (inserted == false) {
              response.statusCode = 400;
              response.error = "Couldn't insert pledge: " + info.name;
            } else {
              //succsfully added to table
              let result = await GetPledge(info.name); ///get projectID
              response.result = JSON.stringify(result); ///return proj id in JSON
              response.statusCode = 200;
            }
          }
          
      }

  } catch (error) {
    response.statusCode = 400;
    response.error = error;
  }
  return response; }; //return the string that project was created via Ownes requets***********************