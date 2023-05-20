//ReapProejct
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
    let CheckDesignerExists = (ID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM designer WHERE designerID=?", [ID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows.length == 1)) { //means the name is unique and the password passed in is correct
                    return resolve(true); //resolve promise and return true
                } else {
                    return resolve("designer ID does not exist " + ID); //reject promise if the row return is not what is expected
                }
            });
        });
    }
    
    let ReplaceLaunchValue = (ID, value) => {
    return new Promise((resolve, reject) => {
      pool.query("UPDATE projects SET launch=? WHERE projectID=?", 
                 [value, ID], (error, rows) => {
        if (error) { return reject(error); }
        //console.log("launch function rows:" + rows); 
        else { 
          return resolve(true);   // REJECT if couldn't update WAIT TO CHECK
        }
      });
    })}
    
    let ReplaceSuccessValue = (ID, value) => {
    return new Promise((resolve, reject) => {
      pool.query("UPDATE projects SET success=? WHERE projectID=?", 
                 [value, ID], (error, rows) => {
        if (error) { return reject(error); }
        //console.log("launch function rows:" + rows); 
        else { 
          return resolve(true);   // REJECT if couldn't update WAIT TO CHECK
        }
      });
    })}
    
    let ReplaceCompledtedValue = (ID, value) => {
    return new Promise((resolve, reject) => {
      pool.query("UPDATE projects SET completed=? WHERE projectID=?", 
                 [value, ID], (error, rows) => {
        if (error) { return reject(error); }
        //console.log("launch function rows:" + rows); 
        else { 
          return resolve(true);   // REJECT if couldn't update WAIT TO CHECK
        }
      });
    })}
    
    
    let ReturnCredentialsDesigner = (name, password) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM designer WHERE name=?", [name], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows.length == 1) && rows[0].password == password) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0]); //resolve promise 
                } else {
                    return resolve("designer credentials are not a vaild pair " + name ); //reject promise if the row return is not what is expected
                }
            });
        });
    } 
    
    let CheckProjectSuccess = (projID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE name=?", [projID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length == 1) ) { // check if enough info to do the work. ie number ofrows returned
                    let projFunding = rows[0].funding; 
                    let projGoal = rows[0].goal;
                    console.log("proj funding value" + projFunding); 
                    console.log("proj goal value" + projGoal); 
                    if(projFunding < projGoal){ // failure
                        return resolve(false)
                    }
                    else{
                        return resolve(true); //resolve promise 
                    }
                } 
                else {
                    return resolve("project ID does not exist in Check Success: '" + projID + "'"); //reject promise if the row return is not what is expected
                }
            });
        });
    };
    
    let GetProjects = (date) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM projects WHERE DATE(deadline) < ?" , [date], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length != 0)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows); //resolve promise 
                } 
                else {
                    return resolve(false); //resolve and return false if there are no porjects to reap 
                }
            }); 
        });
    };
    
    let GetDirectSupport = (projID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM directSupport WHERE projectID=?", [projID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                else {
                   return resolve(rows); // all direct support for a give supporter
                }
            });
        });
    };
    
    let GetClaimedPledge = (pledgeID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM claimedPledges WHERE pledgeID=?", [pledgeID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                else {
                   return resolve(rows); // all direct support for a give supporter
                }
            });
        });
    };
    
    let GetPledge = (projID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM pledges WHERE projID=?", [projID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                else {
                   return resolve(rows); // all direct support for a give supporter
                }
            });
        });
    };
    
    
    let GetSupporterFunds = (supID) => { //make a function like this every time you want to check the database for a key and return a specific value
        return new Promise((resolve, reject) => { //promise that you will get info whe nthe fuction returns 
            pool.query("SELECT * FROM supporter WHERE supporterID=?", [supID], (error, rows) => { //query the database for a specific name, the ncall back function for the error or the row 
                if (error) { return reject(error); } //if error reject promise 
                if ((rows) && (rows.length != 0)) { // check if enough info to do the work. ie number ofrows returned
                    return resolve(rows[0].funds); //resolve promise 
                }
                else {
                   return resolve(rows); // all direct support for a give supporter
                }
            });
        });
    };
    
    let UpdateSupporterFunds = (ID, value) => {
    return new Promise((resolve, reject) => {
      pool.query("UPDATE supporter SET funds=? WHERE supporterID=?", 
                 [value, ID], (error, rows) => {
        if (error) { return reject(error); }
        //console.log("launch function rows:" + rows); 
        else { 
          return resolve(true);   // REJECT if couldn't update WAIT TO CHECK
        }
      });
    })} 
    
    let DeleteProject = (projID) => { //completed, success, launched and funding all are 0
    return new Promise((resolve, reject) => {
      pool.query("DELETE FROM projects Where projectID =?",  // why does the inserts seem to be off by one column and the desicription is compied
                 [projID], (error, rows) => {
        if (error) { return reject(error); }
        else {
          return resolve(" project: " + projID + " deleted");   // REJECT if couldn't add  WAIT TO CHECK
        }
      });
    })}
    
    let DeletePledges = (projectID) => { //completed, success, launched and funding all are 0
    return new Promise((resolve, reject) => {
      pool.query("DELETE FROM pledges Where projID =?",  // why does the inserts seem to be off by one column and the desicription is compied
                 [projectID], (error, rows) => {
        if (error) { return reject(error); }
        else {
          return resolve(" pledges with project ID of : " + projectID + " deleted");   // REJECT if couldn't add  WAIT TO CHECK
        }
      });
    })}
    
    let DeleteClaimedPledges = (CPID) => { //completed, success, launched and funding all are 0
    return new Promise((resolve, reject) => {
      pool.query("DELETE FROM claimedPledges Where cpID =?",  // why does the inserts seem to be off by one column and the desicription is compied
                 [CPID], (error, rows) => {
        if (error) { return reject(error); }
        else {
          return resolve(" claimedPledges with cp ID of : " + CPID + " deleted");   // REJECT if couldn't add  WAIT TO CHECK
        }
      });
    })}


    try {
        let ListOfProjects = await GetProjects(info.date); 
       
       
    //LOGIC 
        //passes in current date ****
        //get list of all projects that are past their deadline ****
        //loop though project list 
            //check if successful 
                //if they are change their success value to 1 and launch value to 0 
            //if not sucessful
                //loop though direct support, for each element get the supporter ID and funding (pass into function that will add the funding to the supporter funds column)
                //loop though claimed pledges, store supporter ID and pledge ID, use pledgeID to get the funcding value, pass into same function used to return supporter funds
                //delete project
        //***logic goes here 
        // If either is NaN then there is an error
        if (ListOfProjects == false) { 
            //error desinger does not exist
            response.statusCode = 400;
            response.result = "No projects to reap for date: " + info.date; //find a way to check what the error says from the function if not an empty error
          return response; 
        }
        
        else { // insert new value and return project
            response.statusCode = 200;
            //console.log("list of projects" + ListOfProjects); 
            let i; 
            let j;
            let k;
            let L; 
            for(i = 0; i < ListOfProjects.length ; i++){
                //let currProjStatus = await CheckProjectSuccess(ListOfProjects[i].projectID)
                let currProj = ListOfProjects[i]; 
                let currFunding = currProj.funding; 
                let currID = currProj.projectID; 
                let currGoal = currProj.goal;
                
                //console.log("curr Funding: " + currFunding); 
                //console.log("curr Funding: " + currFunding);
                
                if(currFunding < currGoal){ //failure
                    console.log("made it to false: " + i); 
                    //console.log ()
                    let directSupportList = await GetDirectSupport(currID); //get all direct support for a projectID 
                    console.log("direct support list length for a given projectID" + directSupportList.length); 
                    for(j = 0; j < directSupportList.length ; j++){
                        let currsupID = directSupportList[i].supporterID; 
                        console.log("curr supporterID" + currsupID); 
                        let dsFunding = directSupportList[i].funding;//save supporterID and funding
                        let currsupFunds = GetSupporterFunds(currsupID); //get the current funding for the supporter 
                        let newFunds = dsFunding + currsupFunds; //add the current funding to the funding 
                        await UpdateSupporterFunds(currsupID,newFunds); //update supporter funds value
                        
                    }// end direct support loop
                    
                    //another loop for the current projects returns
                        //loop though claimed pledges, store supporter ID and pledge ID, use pledgeID to get the funcding value, pass into same function used to return supporter funds
                    let ProjectPledgeList = await GetPledge(currID);//get the list of pledges for a project ID 
                    
                    for(k = 0; k < ProjectPledgeList.length ; k++){ //loops though pledges for a project 
                        let pledgeID = ProjectPledgeList[k].pledgeID; 
                        let pledgeFunding = ProjectPledgeList[k].fundingAmount; //funding amount to return
                        let ClaimedPledgesList = await GetClaimedPledge(pledgeID); //get the list of clamied pledges for a pledges ID
                        
                        for(L = 0; L < ClaimedPledgesList.length ; L++){ //get the supporterID, get current funding of that supporter, add to the 
                            let SuppID = ClaimedPledgesList[L].supporterID; 
                            let cpID = ClaimedPledgesList[L].cpID; 
                            let surrSuppFunding = await GetSupporterFunds(SuppID); 
                            let currNewFunding = surrSuppFunding + pledgeFunding; 
                            await UpdateSupporterFunds(SuppID,currNewFunding); 
                            //delete claimed pledge with cpID 
                            await DeleteClaimedPledges(cpID); 
                            
                        }
                         
                        
                    }
                    //delete pledge for project ID 
                    await DeletePledges(currID); 
                    //delete project for a project ID 
                    await DeleteProject(currID); 
                    console.log("projID fail: " + currID)
                }
                else{ //success
                    //console.log("made it to else: " + i); 
                    await ReplaceLaunchValue(currID, 0); //used on front end to update button showing so that an unlaunched project cannot except any more donations
                    await ReplaceSuccessValue(currID, 1); 
                    await ReplaceCompledtedValue(currID, 1);
                    console.log("projID success: " + currID)
                }
                
            } // projects list loop close
            
            //SUCCESS
            
            //FAILURE
            
            response.result = "Projects sucessfully updated for date: " + info.date;
        } // else closing bracket
        
        //***check fro errors
    } catch (error) {
        console.log("ERROR: " + error);
        response.statusCode = 400;
        response.error = error;
    }
    
    //*** full response is the final thing to send back
    return response;
};
