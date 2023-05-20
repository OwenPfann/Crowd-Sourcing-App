//Claim Pledge SUpporter

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
// {  body: '{    \"name\" : \"pledge 1\", \"SupporterID\" : \"1\"}'
//
// }
//
// ===> return project with pledges with number claimed 
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
    let GetProjectIDfromPledge = (pledgeName) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM pledges WHERE name=?", [pledgeName], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0].projID); //return project ID for a pledge name
                } else {
                    return reject("pledge name does not exist '" + pledgeName + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    
    let GetPledge = (pledgeName) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM pledges WHERE name=?", [pledgeName], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0]); //resolve promise 
                } else {
                    return reject("project name does not exist '" + pledgeName + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let GetPledgeID = (pledgeName) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM pledges WHERE name=?", [pledgeName], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0].pledgeID); //resolve promise 
                } else {
                    return reject("project name does not exist '" + pledgeName + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let GetPledgeFund = (pledgeName) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM pledges WHERE name=?", [pledgeName], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0].fundingAmount); //resolve promise 
                } else {
                    return reject("pledge name does not exist '" + pledgeName + "'"); //reject promise if the row return is not what is expected
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
    
    let GetSupporterID = (supporterID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM supporter WHERE supporterID=?", [supporterID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0].supporterID);//send back the funds avalible for the supporter
                } else {
                    return reject("supporter ID does not exist '" + supporterID + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let GetPledgesAvalible = (pledgeName) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM pledges WHERE name=?", [pledgeName], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0].totalPledges); //resolve promise 
                } else {
                    return reject("project name does not exist '" + pledgeName + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let CheckPledgeExists = (pledgeName) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM pledges WHERE name=?", [pledgeName], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(true); //resolve promise 
                } else {
                    return reject("project name does not exist '" + pledgeName + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let GetPledges = (pledgeID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM pledges WHERE pledgeID=?", [pledgeID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows); //resolve promise 
                } else {
                    return reject("No pledges with ID: '" + pledgeID + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let isLaunched = (projID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE projectID=?", [projID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0].launch); //if 1 then project is launched
                } else {
                    return reject("No project with ID: '" + projID + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let NumClaimedPledgesCurrent = (pledgeID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM claimedPledges WHERE pledgeID=?", [pledgeID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows.length); //resolve promise 
                } else {
                    return reject("No pledges with ID: '" + pledgeID + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let InsertNewClaimPledge = (supporterID, pledgeID) => {
        return new Promise((resolve, reject) => {
            pool.query("INSERT INTO claimedPledges (supporterID, pledgeID) VALUES(?,?)", 
               [supporterID, pledgeID], (error, rows) => {
                if (error) { return reject(error); }
                //if (rows.length == 1) {
                 // return resolve(rows[0].designerID);   // return the new designers ID if able to add row
                //} 
                else { 
                    console.log(rows[0]);
                    return resolve("project Claimed by supporter ID: " + supporterID); //returns the cpID, pledgeID and SupporterID
                  //return resolve("not a unique designer Name");   // REJECT if more than 1 row was created
                }
            });
        });
    };
    
     let GetProjectFunding = (projectID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE projectID=?", [projectID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0].funding); //resolve promise 
                } else {
                    return reject("project ID does not exist for ID: '" + projectID + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    
    //update project funding amount 
    let UpdateFundingValue = (projID, value) => {
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
    
    //update supporter funds amount
    let UpdateSupporterFunds = (supID, value) => {
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
        // ----> request to complete before beginning the next on
        let ProjectID = await  GetProjectIDfromPledge(info.name); //if not a number then error pledge does not exist
        let launchedVlaue = await isLaunched(ProjectID); //if 0 then error that project is not launched
        let pledgeExists = await CheckPledgeExists(info.name); //if not true then error then error pldege does not exist
        let pledgeID = await GetPledgeID(info.name); //get the pledge ID to search through claimed pledges
        let numClaimedPledges = await NumClaimedPledgesCurrent(pledgeID) //number of climaed pledges currently 
        let totalPledgesAvalible = await GetPledgesAvalible(info.name); //number of clamied pledges avalible
        let pledgeFundingAmount = await GetPledgeFund(info.name); //amount of pledge costs
        let supportFundingAvalible = await GetSupporterFund(info.supporterID); //amount of funds avalible for given supporter
        let projectFunding = await GetProjectFunding(ProjectID); //get project funding to update the value if the claim pledge is sucessful
        //let numClaimedPledgesAfter = ; //
        
        //***logic goes here 
        //check project exists => get project ID from pledge table* **
        //check the project is not already launched* **
        //check pledge exists => input pledge name* **
        //check the pledge clamied is not over the set limit* => if statement for numClaimed pledges and Total pledges avalible
        //check the supporter has enough funds to claim the pledge * =>  if statment for pledgeFundingAmount and supporterFundingAvalible
        //if all true 
            //add column to the Claimed Pledge table
        if (isNaN(ProjectID)){
            response.statusCode = 400;
            response.error = "Invalid pledge name";
            return response;
        }
        if (launchedVlaue  == 0){
            response.statusCode = 400;
            response.error = "Project is not launched";
            return response;
        }
        if(pledgeExists != true){
            response.statusCode = 400;
            response.error = "Pledge is not valid";
            return response;
        }
        if(numClaimedPledges >= totalPledgesAvalible){ //if number of claimed pledges must be less than or
            response.statusCode = 400;
            response.error = "Clamined Pledges Allowed Exceeded";
            return response;
        }
        if(pledgeFundingAmount > supportFundingAvalible){ //supporter does not have enough money 
            response.statusCode = 400;
            response.error = "Supporter has insufficient funds";
            return response;
        }
        else {
            response.statusCode = 200;
            await InsertNewClaimPledge(info.supporterID, pledgeID); //insert new claimed pledge
            //update the project funding goal 
            let NewFundingValue = projectFunding + pledgeFundingAmount;//adds the projects current funding amount to the pledge amount
            await UpdateFundingValue(ProjectID ,NewFundingValue);// need pledge amount and need 
            //update supporter funding avalible
            let newSupporterFunds = supportFundingAvalible - pledgeFundingAmount; //subtracts the pledge cost from the current supporter funds avalible 
            await UpdateSupporterFunds(info.supporterID,newSupporterFunds); //updates supporter funds 
            let result = await NumClaimedPledgesCurrent(pledgeID); //should be incremented as 1
            response.result = JSON.stringify(result); 
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
