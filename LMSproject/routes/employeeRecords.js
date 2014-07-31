
var mongo = require('mongodb');
var dateFormat = require('dateformat');
var Db = mongo.Db,
	BSON = mongo.BSONPure,
	server = new mongo.Server('localhost', 27017, {auto_reconnect: true},{safe:true}),
	db = new Db('leaveApplication', server);
 
db.open(function(err, db) {
		if(!err) {
		console.log("Connected to 'leaveApplication' database");
		db.collection('employeeRecords', {strict:true}, function(err, collection) {
		if (err) {
		console.log("The 'employeeRecords' collection doesn't exist. Creating it with sample data...");
		}
		});
		}
	});
exports.addEmployee = function(req, callback) {
	var employee = {
			empId : req.employeeId,
			empEmail: req.emailId,
			empName: req.employeeName,
			tatalLeavesApplicable: req.tla,
			employeeDesignation: req.designation,
			leaveApproverEmail: [req.managerEmailId,"srilatha.vellanki@atmecs.com"]
			
			};
			var info= {};
			db.collection('employeeRecords', function(err, collection) {
				collection.insert(employee,function() {
			          callback(null, employee);
				});
				
			});
			
	
	};
exports.submitLeave = function(req, callback) {
			var insertData=JSON.stringify(req[1]);
			var userEmailId=req[0];// get from session.. Vinay integaration.
		    db.collection('employeeRecords', function(err, collection) {
		        collection.findOne({empEmail: userEmailId},function(err, empRecords) {
		        	if (err) {
		        		callback(err);
		    		} 
		        	else{
		    			empObjectId=empRecords._id;
		    			var employeeInsert = JSON.parse(insertData);
		    			employeeInsert.empId=empObjectId.toString();
		    	    	if(empObjectId!=null){
		    		        db.collection('employeeLeaveRequest', function(err, collection) {
		    		    		collection.insert(employeeInsert, {safe:true}, function(err, result) {
		    		    			if (err) {
		    		    				callback(err);
		    		    			} else {
		    		    				empObjectId= JSON.stringify(result[0]);
		    		    				callback(null, result);
		    		    			}
		    		    		});
		    		    	});
		    	    	}
		    		}	
		         });
				       
		        
		    });
	};
exports.holidayList = function(req, callback) {
			db.collection('holidayCalendar', function(err, collection) {
				collection.find().toArray(function(err, items) {
				if(err) { 
					callback(err);
					}
					else {
					callback(null,items);
					}	
				});
			});
	};

exports.cancelLeave = function(req, callback) {
			var insertData=JSON.stringify(req[1]);
			var userEmailId=req[0];// get from session.. Vinay integaration.
		    db.collection('employeeRecords', function(err, collection) {
		        collection.findOne({empEmail: userEmailId},function(err, empRecords) {
		        	if (err) {
		        		callback(err);
		    		} 
		        	else{
		    			empObjectId=empRecords._id;
		    			var employeeInsert = JSON.parse(insertData);
		    			employeeInsert.empId=empObjectId.toString();
		    	    	if(empObjectId!=null){
		    		        db.collection('employeeLeaveRequest', function(err, collection) {
		    		    		collection.insert(employeeInsert, {safe:true}, function(err, result) {
		    		    			if (err) {
		    		    				callback(err);
		    		    			} else {
		    		    				empObjectId= JSON.stringify(result[0]);
		    		    				callback(null, result);
		    		    			}
		    		    		});
		    		    	});
		    	    	}
		    		}	
		         });
		    });
	};

exports.getLeaveDetails = function(req,callback) {
	
			var email= req;
			console.log("in sdafa"+email);
			db.collection('employeeRecords', function(err, collection) {
			collection.find({"empEmail":email}).toArray(function(err, leaveStatus) {
				if(err) { callback(err);}
				else {
					var empId=leaveStatus[0]._id.toString();
					var leaveDetails={};
					leaveDetails.tatalLeavesApplicable=leaveStatus[0].tatalLeavesApplicable;
					//empId=empId.toString();
					console.log(empId);
					db.collection("employeeLeaveRequest", function(err, collection) {
						collection.find({empId:empId}).toArray(function(err, result) {
							 if (err) {
						          throw err;
						        } else {
						        	var leavesApplied=0,
						        	leavesCancelled=0,
						        	leavesBalance=0;
						        	for(index in result)
						        		{
						        			if(result[index].leaveActionStatus == "approved" )
						        				{
						        				leavesApplied += result[index].totalLeavesApplied;
						        				}
						        			if(result[index].leaveActionStatus == "cancelled")
						        				{
						        				leavesCancelled += result[index].totalLeavesApplied;
						        				}
						        		console.log(result[index]);
						        		}
						        	leavesBalance = leaveDetails.tatalLeavesApplicable - leavesApplied;
						        	
						        	leaveDetails.tatalLeavesApplied = leavesApplied;
						        	leaveDetails.tatalLeavesCancelled = leavesCancelled;
						        	leaveDetails.tatalLeavesBalance = leavesBalance;
						        	console.log("applied"+leaveDetails.tatalLeavesApplied);
						        	console.log("canceled"+leaveDetails.tatalLeavesCancelled);
						        	console.log("balance"+leaveDetails.tatalLeavesBalance);
						        	console.log("total"+leaveDetails.tatalLeavesApplicable);
						        	
									callback(null,leaveDetails);
						        }
						});
				
					});
					
				}	
				
			}); 
			});

	};
exports.findEmployeesLeave = function(req, callback) {

		    db.collection("employeeLeaveRequest", function(err, collection) {
		      collection.find({leaveActionStatus : "pending"}).sort({order_num: 1}).toArray(function(err, result) {
		        if (err) {
		          throw err;
		        } else {
		        	if(result.length !=0)
		        		{
			              var j=0;
			              for (var i=0; i<result.length; i++) {
			                  db.collection("employeeRecords", function(err, collection) {
			                    collection.find({_id : new BSON.ObjectID(result[i].empId)}).sort({order_num: 1}).toArray(function(err, data) {
			                        if (err) {
			                            throw err;
			                        } else {
			                            result[j]['empName']= data[0].empName;
			                            j++;
			                        }
			                        if(j==result.length){
			                            callback(null,result);
			                        }
			                    });
			                  });
			              }
		        }
		        	else
		        		{
		        		callback(null,"No leave Requests");
		        		}
		        }
		      });
		    });
	};

	
exports.leaveAction=function(req, callback) {
		    var id=req.id;
		    var action=req.action;
		    var noOfLeaves= req.leavesApplied;
		    var today= dateFormat(new Date(),'dd/mm/yyyy');
		    if(action==="approve"){
		        db.collection('employeeLeaveRequest', function(err, collection) {
		            collection.update({'_id' : new BSON.ObjectID(id)}, {$set:{leaveActionStatus : "approved", leaveActionDate : today,totalLeavesApplied :noOfLeaves}}, {safe:true},               function(err, result) {
		                if(!err)
		                callback(null,"approved");
		            });
		        });
		    }
		    else if(action==="cancel"){
		        db.collection('employeeLeaveRequest', function(err, collection) {
		            collection.update({'_id' : new BSON.ObjectID(id)}, {$set:{leaveActionStatus : "cancelled", leaveActionDate : today,totalLeavesApplied :noOfLeaves}}, {safe:true},             function(err, result) {
		                if(!err)
		                callback(null,"cancelled");
		            });
		        });
		    }
		    else{
		        console.log(err);
		    }
	};
	
	