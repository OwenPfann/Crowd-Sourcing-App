//Review Supporter Activity
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
// {  body: '{    \"supporterID\" : \"1\"}'
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
    
    let ReplaceLaunchValue = (name, value) => {
    return new Promise((resolve, reject) => {
      pool.query("UPDATE projects SET launch=? WHERE name=?", 
                 [value, name], (error, rows) => {
        if (error) { return reject(error); }
        //console.log("launch function rows:" + rows); 
        else { 
          return resolve(true);   // REJECT if couldn't update WAIT TO CHECK
        }
      });
    })}
    
    
    let GetSupporter = (supID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM supporter WHERE supporterID=?", [supID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    console.log(rows); 
                    return resolve(rows[0]); //resolve promise 
                } else {
                    return reject("supporter name does not exist: '" + supID + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let GetClaimedPledges = (supID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM claimedPledges WHERE supporterID=?", [supID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                else {
                    return resolve(rows);  //return all rows for supporter in claimed pledges              
                }
            });
        });
    };
    
    let GetDirectSupport = (supID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM directSupport WHERE supporterID=?", [supID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                else {
                   return resolve(rows); // all direct support for a give supporter
                }
            });
        });
    };
    
    let GetPledgeName = (pledgeID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM pledges WHERE pledgeID=?", [pledgeID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    console.log(rows); 
                    return resolve(rows[0].name); //resolve promise 
                } else {
                    return reject("pledge ID does not exist: '" + pledgeID + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let GetProjectName = (projID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE projectID=?", [projID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if enough info to do the work. ie number ofrows returned
                    console.log(rows); 
                    return resolve(rows[0].name); //resolve promise 
                } else {
                    return reject("projectID ID does not exist: '" + projID + "'"); //reject promise if the row return is not what is expected
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
       let supporterExists = await CheckSupporterExists(info.supporterID); //need the supporter ID passed in 
       
       //console.log(designerExists); 
      
       
    //LOGIC
        //check supporter exists
        //else 
            //get all rows from claimedpledges that have that supporterID 
            //get all rows from direct support that have the passed in supporter ID
            //package up like the view project and return result with a claimed pledges ID and a directSupport ID. 
                //EXAMPLE LINES TO USE: 
                //let supporter = info.supporterID; 
                //supporter.claimedPledges = await GetClaimedPledges(ProjectID); //function to get claimed pledges based on supporter ID
                //supporter.directSupport = await GetDirectSupport(ProjectID);  //function to get direct support based on supporter ID
                //response.result = JSON.stringify(project); //still get result -> parse -> get back project and pledges array within the project 
    
        
        //***logic goes here 
        // If either is NaN then there is an error
        if (supporterExists != true) { 
            //error desinger does not exist
            response.statusCode = 400;
            response.error = "supporterID is not valid: " + info.supporterID; //find a way to check what the error says from the function if not an empty error
          return response; 
        }
        else { // insert new value and return project
            //changes to get display correctly
                //get the name for all projects from direct support 
                //get the name for all pledges from clamied pledges 
            response.statusCode = 200;
            let supporter = await GetSupporter(info.supporterID) ; //set launch value to 1 for input project name
            let cpArray = await GetClaimedPledges(info.supporterID);
            supporter.claimedPledges = cpArray; //await GetClaimedPledges(info.supporterID);//supporterID
            //console.log("cpArray supporter ID: "+ cpArray[0].supporterID); //works 
            let dsArray = await GetDirectSupport(info.supporterID);
            supporter.directSupport = dsArray;//await GetDirectSupport(info.supporterID); //supporterID
            
            let i; 
            let j; 
            let plegeLegendArray = []; 
            let peldgeIDArray = []; 
            let projectLegendArray = []; 
            let projectIDArray = []; 
            let dsIDtest; 
            let dsNametest; 
            
            //console.log("cp array length: " + cpArray.length); 
            for(i = 0; i < cpArray.length ; i++){
                //get the pledge ID for the claimedpeldge
                let currPledgeID = cpArray[i].pledgeID; // does this work??  
                
                //console.log ("current pledgeID: " + currPledgeID); 
                //console.log("includes pledgeArray: " + peldgeIDArray.includes(currPledgeID)); 
                
                //check if already in array .includes()
                if(peldgeIDArray.includes(currPledgeID) == false){
                    peldgeIDArray.push(currPledgeID); // add new pledge ID to list array 
                    //let currentPledge = i; 
                    let CPpledgeID = currPledgeID; 
                    let CPpledgeName = await GetPledgeName(currPledgeID); 
                    //let result = JSON.stringify(currentPledge); 
                    //store in an arry to return
                    plegeLegendArray.push({"pledgeID" : CPpledgeID},{"pledgeName" : CPpledgeName}); //add the current object to the return array
                }
            }
            
            //console.log("inbetween loops"); 
            //console.log("pledge legend array: " + plegeLegendArray);
            
            console.log("ds array length: " + dsArray.length);
            
            for(j = 0; j < dsArray.length ;j++){
                //get the project ID for the direct support
                let currProjectID = dsArray[j].projectID; 
                //check if already in array
                if(projectIDArray.includes(currProjectID) == false){
                    projectIDArray.push(currProjectID); 
                    //get the name for the project
                    //add to an object the project  ID and the name 
                    //store in an arry to return
                    //let currentProject; 
                    let CPprojectID = currProjectID; 
                    let CPprojectName = await GetProjectName(currProjectID); 
                    projectLegendArray.push({"projectID" : CPprojectID},{"projectName" : CPprojectName}); 
                }
                
            }
            //console.log("test values are set ID: " + dsIDtest); 
            //console.log("test values are set Name: " + dsNametest); 
            console.log("projectID array : " + projectIDArray); 
            console.log("project legend array lenght" + projectLegendArray.length); 
            //add project name array and pledge name array to supporter
            supporter.pledgeLegend = plegeLegendArray; 
            supporter.projectLegend = projectLegendArray; 
            //let result = await GetProject(info.name); //get the project with the updated value to send to front end
            response.result = JSON.stringify(supporter); 
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
