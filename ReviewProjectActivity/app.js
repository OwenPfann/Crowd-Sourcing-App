//Review Project Activity
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
    let CheckDesignerExists = (designerID) => { //check that the designer ID is valid
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM designer WHERE designerID=?", [designerID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if unique designer ie only one row with that name
                    return resolve(rows[0].designerID); //resolve promise 
                } else {
                    return resolve("unable to locate designerID of: '" + designerID + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    
    }
    
     let CheckProjectOwner = (projID) => { //check that the designer ID is valid
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE projectID=?", [projID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1)) { // check if unique designer ie only one row with that name
                    return resolve(rows[0].designerID); //faLse means the deisnger does not own this project
                } else {
                    return resolve("unable to locate designerID of: '" + projID + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    
    }
    
    
    let CheckProjectExists = (nameVar) => { //check that the project name does not alreayd exist
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE name=?", [nameVar], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if (rows.length == 1) { // check if unique name 
                    return resolve(true); //true means the project exists
                } else {
                    return resolve("project Name: " + nameVar + " does not exist"); 
                }
            });
        });
    }
    
    let GetProjectID = (nameVar) => { //check that the project name does not alreayd exist
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE name=?", [nameVar], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if (rows.length == 1) { // check if unique name 
                    return resolve(rows[0].projectID); //returns projectID
                } else {
                    return resolve("project name in ID: " + nameVar + " does not exist"); 
                }
            });
        });
    }
    
    let GetProject = (nameVar) => { //check that the project name does not alreayd exist
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE projectID=?", [nameVar], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if (rows.length == 1) { // check if unique name 
                    return resolve(rows[0]); //returns projectID
                } else {
                    return resolve("project name: " + nameVar + " does not exist"); 
                }
            });
        });
    }
    
    let GetDirectSupport = (projID) => { //check that the project name does not alreayd exist
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM directSupport WHERE projectID=?", [projID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                else {
                     return resolve(rows); //full project details
                }
            });
        });
    }
    
    let GetPledges = (projID) => { //check that the project name does not alreayd exist
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM pledges WHERE projID=?", [projID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                else {
                     return resolve(rows); //all pledges for a project 
                }
            });
        });
    }
    
    let GetClaimedPledges = (pledgeID) => { //check that the project name does not alreayd exist
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM claimedPledges WHERE pledgeID=?", [pledgeID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                else {
                     return resolve(rows); //full project details
                }
            });
        });
    }
    
    
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
       let designerExists = await CheckDesignerExists(info.designerID); //need the designers ID passed in
       let projectExist = await CheckProjectExists(info.projectName); 
       let projID = await GetProjectID(info.projectName); 
       let designerOwnership = await CheckProjectOwner(projID); // pass in designer ID and project name
       
       //console.log(designerExists); 
      
       
    //LOGIC
        //check designer exists ***
        //check project exists ****
        //check desinger owns project **** 
        //else 
            //get all direct supports for an associated projectID -> save as result. 
            //get the pledges that have the projectID 
            //for loop though those pledgeIDs and get the claimedpledges for that ID 
            
            
    
        
        //***logic goes here 
        // If either is NaN then there is an error
        if(info.designerID != 0){
            if (isNaN(designerExists)) { 
                //error desinger does not exist
                response.statusCode = 400;
                response.error = "designerID is not valid failure: " + info.designerID; //find a way to check what the error says from the function if not an empty error
                return response; 
            }
            if (projectExist != true) { 
                //error desinger does not exist
                response.statusCode = 400;
                response.error = "projectName is not valid: " + info.projectName; //find a way to check what the error says from the function if not an empty error
                return response; 
            }
            if(designerOwnership != info.designerID){
                //error designer does not own the project
                response.statusCode = 400;
                response.error = "designer of ID: " + info.designerID +" does not own the project: "  + info.projectName; //find a way to check what the error says from the function if not an empty error
                return response; 
                }
            else { // insert new value and return project
                response.statusCode = 200;
                let project = await GetProject(projID); // input projectID
                let dsArray = await GetDirectSupport(projID); 
                project.directSupport =  dsArray;//all direct supports
                let Allpledges = await GetPledges(projID); //list of all pledges for a project
                console.log("all pledges lenght: " + Allpledges.length); 
                console.log("dsArray lenght: " + dsArray.length); 
                let claimedPledgesReturn = []; //get the claimed pledge for a given pledge ID
                let i ; 
                let j; 
                let k; 
                let plegeLegendArray = []; 
                let peldgeIDArray = []; 
                let projectLegendArray = []; 
                let projectIDArray = []; 
                let checkCurrentPledgeID; 
                let addArray = []; 
                let prevArray = [];
                let newArray = []; 
                
                console.log("pledges: "+ Allpledges); 
                console.log("pledges length: "+ Allpledges.length); 
                for (i = 0; i < Allpledges.length ; i++) { // issue claimed pledges inside of the array is empty
                    checkCurrentPledgeID = Allpledges[i].pledgeID; 
                    //console.log("Current pledge ID: " + checkCurrentPledgeID);
                    addArray = await GetClaimedPledges(checkCurrentPledgeID);//get the claimed pledges for a pledgeID // will be an array of arrays
                    //console.log("Current Item: " + addArray);
                    //console.log("claimed Pledges: " + claimedPledgesReturn); 
                    newArray = prevArray.concat(addArray); 
                    claimedPledgesReturn = newArray; //.push(addArray); 
                    prevArray = newArray; 
                    //do I need to reset item push
                } 
                
                //console.log("claimed Pledges: " + claimedPledgesReturn); 
                let cpArray = claimedPledgesReturn; 
                //for loop through the claimedPledgesReturn to make the legend 
                 for(j = 0; j < cpArray.length ; j++){
                    //get the pledge ID for the claimedpeldge
                    let currPledgeID = cpArray[j].pledgeID; // does this work??  
                    
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
                
                //for loop through direct support
                for(k = 0; k < dsArray.length ;k++){
                    //get the project ID for the direct support
                    let currProjectID = dsArray[k].projectID; 
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
                
                //save all the arrays in the project to be returned
                project.claimedPledges = claimedPledgesReturn; 
                project.pledgeLegend = plegeLegendArray; 
                project.projectLegend = projectLegendArray;
                //project.claimedPledges = 
                response.result = JSON.stringify(project);
                return response; 
            }
        }
            
        else { // insert new value and return project
            response.statusCode = 200;
            let project = await GetProject(projID); // input projectID
            let dsArray = await GetDirectSupport(projID); 
            project.directSupport =  dsArray;//all direct supports
            let Allpledges = await GetPledges(projID); //list of all pledges for a project
            console.log("all pledges lenght: " + Allpledges.length); 
            console.log("dsArray lenght: " + dsArray.length); 
            let claimedPledgesReturn = []; //get the claimed pledge for a given pledge ID
            let i ; 
            let j; 
            let k; 
            let plegeLegendArray = []; 
            let peldgeIDArray = []; 
            let projectLegendArray = []; 
            let projectIDArray = []; 
            let checkCurrentPledgeID; 
            let addArray = []; 
            let prevArray = [];
            let newArray = []; 
            
            console.log("pledges: "+ Allpledges); 
            console.log("pledges length: "+ Allpledges.length); 
            for (i = 0; i < Allpledges.length ; i++) { // issue claimed pledges inside of the array is empty
                checkCurrentPledgeID = Allpledges[i].pledgeID; 
                //console.log("Current pledge ID: " + checkCurrentPledgeID);
                addArray = await GetClaimedPledges(checkCurrentPledgeID);//get the claimed pledges for a pledgeID // will be an array of arrays
                //console.log("Current Item: " + addArray);
                //console.log("claimed Pledges: " + claimedPledgesReturn); 
                newArray = prevArray.concat(addArray); 
                claimedPledgesReturn = newArray; //.push(addArray); 
                prevArray = newArray; 
                //do I need to reset item push
            } 
            
            //console.log("claimed Pledges: " + claimedPledgesReturn); 
            let cpArray = claimedPledgesReturn; 
            //for loop through the claimedPledgesReturn to make the legend 
             for(j = 0; j < cpArray.length ; j++){
                //get the pledge ID for the claimedpeldge
                let currPledgeID = cpArray[j].pledgeID; // does this work??  
                
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
            
            //for loop through direct support
            for(k = 0; k < dsArray.length ;k++){
                //get the project ID for the direct support
                let currProjectID = dsArray[k].projectID; 
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
            
            //save all the arrays in the project to be returned
            project.claimedPledges = claimedPledgesReturn; 
            project.pledgeLegend = plegeLegendArray; 
            project.projectLegend = projectLegendArray;
            //project.claimedPledges = 
            response.result = JSON.stringify(project);
            return response; 
        }
        
        //***check fro errors
    } catch (error) {
        console.log("ERROR: " + error);
        response.statusCode = 400;
        response.error = error;
    }
    console.log(response); 
    //*** full response is the final thing to send back
    return response;
};
