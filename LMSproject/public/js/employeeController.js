var leaveApp = angular.module('leaveApp', []);


leaveApp.controller('MainCtrl', function($scope) {
	  $scope.var1 = '12-07-2013';
	});

angular.element(document).ready(function () {
	var leaveStatusScope = angular.element($("#leaveDetails")).scope();
	leaveStatusScope.getLeaveDetails();
	//alert("hello");
});
leaveApp.directive('datetimez', function() {
	    return {
	        restrict: 'A',
	        require : 'ngModel',
	        link: function(scope, element, attrs, ngModelCtrl) {
	          element.datetimepicker({
	            dateFormat:'dd-MM-yyyy',
	           language: 'en',
	           pickTime: false,
	           startDate: '01-11-2013',      // set a minimum date
	           endDate: '01-11-2030'          // set a maximum date
	          }).on('changeDate', function(e) {
	            ngModelCtrl.$setViewValue(e.date);
	            scope.$apply();
	          });
	        }
	    };
	});

leaveApp.controller('navController',function($scope) {
//	angular.element(document).ready(function () {
		        $('.nav li').click(function(e) {
		
		            $('.nav li').removeClass('active').addClass('libgclr');
		            var $this = $(this);
		            if (!$this.hasClass('active')) {
		                $this.removeClass('libgclr').addClass('active');
		                if($this.hasClass('ne'))
		                	{
			                	$('.leaveDetails').hide();
			                	$('.cancelLeave').hide();
			                	$('.applayLeave').hide();
			                	$('.approveLeave').hide();
			                	$('.newEmployee').show();
		                	}
		                else if($this.hasClass('al'))
		                	{
			                	$('.leaveDetails').hide();
			                	$('.newEmployee').hide();
			                	$('.cancelLeave').hide();
			                	$('.approveLeave').hide();
			                	$('.applayLeave').show();
		                	}
		                else if($this.hasClass('ld'))
		                	{
		                	var leaveStatusScope = angular.element($("#leaveDetails")).scope();
		                	leaveStatusScope.getLeaveDetails();
			                	$('.applayLeave').hide();
			                	$('.newEmployee').hide();
			                	$('.cancelLeave').hide();
			                	$('.approveLeave').hide();
			                	//$('.leaveDetails').show();
		                	}
		                else if($this.hasClass('cl'))
		                	{
			                	$('.applayLeave').hide();
			                	$('.newEmployee').hide();
			                	$('.leaveDetails').hide();
			                	$('.approveLeave').hide();
			                	$('.cancelLeave').show();
		                	}
		                else
		                	{
		                	var approveLeaveScope = angular.element($("#approveLeave")).scope();
		                	approveLeaveScope.approveLeave();
			                	$('.applayLeave').hide();
			                	$('.newEmployee').hide();
			                	$('.leaveDetails').hide();
			                	$('.approveLeave').show();
			                	$('.cancelLeave').hide();
		                	}
		            };
		        });
		   // });
		});
leaveApp.controller('leaveDetailsController',function($scope,$http) {
	$scope.getLeaveDetails = function() {
		var userinfo={
				userId:userEmail
		};
		$http.post('/getLeaveDetails',userinfo).success(function (data) {
			$scope.leaveDetails= data;
			$('.leaveDetails').show();
		});
		
		//alert("in get fun"+userEmail);
	};
	
});
leaveApp.controller('ApproveLeaveController', function($scope,$http) {
	var employeeLeaves=[];
	
		
				$scope.approveLeave = function() {
						$http.get('/emp-leaves').success(function (data) {
							
							if(typeof(data) != "string")
				 			{
								console.log("data"+data[0].toString());
				 				$http.get('/holidayList').success(function (holidays) {
								
										for(var i = 0; i < data.length; i++){
				                            var count=0;
				                            var fromDate=data[i].leaveFromAppliedDate;
				                            var toDate=data[i].leaveToAppliedDate;
				                            var d1 = fromDate.split("/");
				                            console.log(d1);
				                            var d2 = toDate.split("/");
				                            fromDate = new Date(d1[2], d1[0]-1, d1[1]);
				                            //console.log("frmdate"+fromDate);// -1 because months are from 0 to 11
				                            toDate   = new Date(d2[2], d2[0]-1, d2[1]);
				                            var datediff=(toDate.getTime()-fromDate.getTime())/(1000*3600*24)+1;
				                            console.log("length of holiday : "+holidays.length);
				                            for(var j = 0; j < holidays.length; j++){
				                                var toCheckDate=holidays[j].date;
				                                var d3=toCheckDate.split("/");
				                                //console.log(d3);
				                                toCheckDate=new Date(d3[2], d3[1]-1, d3[0]);
				                                //console.log("tocheckdate"+toCheckDate);
				                                if(toCheckDate >= fromDate && toCheckDate <= toDate && (toCheckDate.getDay()!=0 && toCheckDate.getDay()!=6)){
				                                    count++;
				                                }
				                            }
				                            console.log("count : "+count);
				                            var dayMilliseconds = 1000 * 60 * 60 * 24;
				                            var weekendDays = 0;
		
				                            while (fromDate <= toDate) {
				                                var day = fromDate.getDay()
				                                if (day == 0 || day == 6) {
				                                    weekendDays++;
				                                }
				                                fromDate = new Date(+fromDate + dayMilliseconds);
				                                //console.log("weekend fromDate: "+fromDate);
				                            }
				                            //console.log("weekendDays : "+weekendDays);
				                            //console.log("datediff   : "+datediff);
				                            data[i].totalLeavesApplied=datediff-(count+weekendDays);
				                            //console.log("datediff-count   : "+(datediff-count));
				                            //console.log("datediff-count-weekendDays   : "+(datediff-count-weekendDays));
				                        }
				                        //console.log("holidays : "+holidayList);
				                    });
				 				employeeLeaves=$scope.leaves=data;
				 				$scope.noLeaveRequests=false;
				 				$scope.leaveRequests=true;
					 			}
					 		else
					 			{
						 			$scope.leaveRequests=false;
						 			$scope.noLeaveRequests=true;
					 			}
					 	}).error(function(err){
					 		console.log("failure");
					 	});
					};
			$scope.takeAction=function(request, id,totalLeavesApplied){
				
					if(confirm("Want to "+request+"?")){
						 var employeesLeaveDetails={};
			             employeesLeaveDetails['id']=id;
			             employeesLeaveDetails['action'] = request;
			             employeesLeaveDetails['leavesApplied'] = totalLeavesApplied;
			             $http.post('/emp-leaves/approve', employeesLeaveDetails).success(function (data) {
			            	 $scope.approveLeave();
						  });
						}
					};
		});
leaveApp.controller('newEmpController', function($scope,$http) {
			$scope.addEmployee = function() {
						if ($scope.myForm.$valid) {
							$scope.newempinfo = { employeeId: $scope.employeeId ,
									  employeeName: $scope.employeeName,
									  emailId:$scope.emailId,
									  designation:$scope.designation,
									  tla:$scope.totalLeavesApplicable,
									  managerEmailId:$scope.managerEmailId
								};
								
								var data= $scope.newempinfo;
								console.log(data.employeeId+"f"+data.employeeName+""+data.emailId);
								$http.post('/addemployee', data).success(function (data) {
								      if(data != null)
								 		 {
									        $("#voice-box").fadeIn();
											setTimeout($scope.hideStatusMessage(), 6000);
								 		 };
								  });	
								$scope.employeeId = "";
								$scope.employeeName= "";
								$scope.emailId="";
								$scope.designation="";
								$scope.totalLeavesApplicable="";
								$scope.managerEmailId="";
								$scope.myForm.$setPristine();
							
						};
		
		
				};
			$scope.hideStatusMessage=function(){
					$("#voice-box").fadeOut(5000);
			};
		});


leaveApp.controller('applyLeaveController', function($scope,$http) {
			$scope.submitLeave = function(request) {
					$scope.showSubmitleave=false;  
					var checkdate=new Date();
					var date = checkdate.getDate();
					var month =  checkdate.getMonth();
					month += 1;
					var year = checkdate.getFullYear();
					var submitdate=month+"/"+date+"/"+year;
					var fromDate=document.getElementById("datepickerFrom").value;
					var toDate=document.getElementById("datepickerTo").value;
						var showFlag=true;
					 	if(fromDate.length==0){
					 		alert("Enter From date");
					 		showFlag=false;
						}
						if(toDate.length==0){
							alert("Enter To date");
							showFlag=false;
						}
						var ONE_DAY = 1000 * 60 * 60 * 24;
					    var fromDateTime = new Date(fromDate).getTime();
					    var todateTime = new Date(toDate).getTime();
					    var dateDifference = Math.round(todateTime - fromDateTime);
					    if (dateDifference<0) {
				            alert("to date must be greater than From date");
				            showFlag=false;
				        }
					     
						/*if(fromDate.length!=0 && toDate.length!=0){
						    dateDifference= (Math.round(dateDifference/ONE_DAY))+1;
						}*/
						var emailId=$scope.leaveApproverEmail;
						if(emailId == undefined || emailId.length==0 ){
							alert("enter email");
							 showFlag=false;
						}
						else if(!emailId.match(/^\"?[\w-_\.]*\"?@atmecs\.com$/))
				        {             
				            alert('Please Enter Valid EmailId:(example@atmecs.com)');
				            showFlag=false;
				        }
						if(showFlag==true){
							 var info =
			    			   {      
			    					   leaveFromAppliedDate  : fromDate,
			    					   leaveToAppliedDate    : toDate,
			    					   reasonForApplyleave   : $scope.reasonForApplyleave,
			    					   leaveApproverEmail    : $scope.leaveApproverEmail ,
			    					   totalLeavesApplied    : 0,
			    					   leaveActionStatus     : "pending",
			    					   leaveRequestType      : $scope.leaveType,
			    					    leaveActionDate      : submitdate,
						
			    			   };
							 var leaveInfo=[];
							 leaveInfo[0]=request;
							 leaveInfo[1]=info;
							 $http.post('/submitLeave', leaveInfo).success(function (data) {
				            		console.log("success");
				            		
			        			$scope.showSubmitleave=true;
				            		$scope.leaveFromAppliedDate="";
				            		$scope.leaveToAppliedDate="";
				            		$scope.leaveType="";
				            		$scope.reasonForApplyleave="";
				            		$scope.leaveApproverEmail="";
			 				}).error(function(err){
			 					console.log("failure");
			 				});
						};
					
					
				};
		
			$scope.getHolidays = function() {
					
							if($scope.holidayList == undefined)
								{
									$http.get('/holidayList').success(function (data) {
								 		
								 		  $scope.holidayList = data;
								 		 $scope.status = true;
								 	}).error(function(err){
								 		console.log("failure");
								 	});
								}
							else
								{
								 $scope.status = true;
								}
					};
			$scope.closed = function() {
					$scope.status=false;
				};

		});
leaveApp.controller('cancelLeaveController', function($scope,$http) {
	
	$scope.cancelLeave= function(request) {
		  
			$scope.showCancelLeave=false;  
			var checkdate=new Date();
			var date = checkdate.getDate();
			var month =  checkdate.getMonth();
			month += 1;
			var year = checkdate.getFullYear();
			var submitdate=month+"/"+date+"/"+year;
			var fromDate=document.getElementById("datepickerFrom1").value;
			var toDate=document.getElementById("datepickerTo1").value;
				var showFlag=true;
			 	if(fromDate.length==0){
			 		alert("Enter From date");
			 		showFlag=false;
				}
				if(toDate.length==0){
					alert("Enter To date");
					showFlag=false;
				}
				var ONE_DAY = 1000 * 60 * 60 * 24;
			    var fromDateTime = new Date(fromDate).getTime();
			    var todateTime = new Date(toDate).getTime();
			    var dateDifference = Math.round(todateTime - fromDateTime);
			    if (dateDifference<0) {
		            alert("to date must be greater than From date");
		            showFlag=false;
		        }
			     
				if(fromDate.length!=0 && toDate.length!=0){
				    dateDifference= (Math.round(dateDifference/ONE_DAY))+1;
				}
				var emailId=$scope.leaveApproverEmail;
				if(emailId == undefined ||emailId.length==0){
					alert("enter email");
					 showFlag=false;
				}
				else if(!emailId.match(/^\"?[\w-_\.]*\"?@atmecs\.com$/))
		        {             
		            alert('Please Enter Valid EmailId:(example@atmecs.com)');
		            showFlag=false;
		        }
				if(showFlag==true){
					 var info =
	    			   {      
	    					   leaveFromAppliedDate  : fromDate,
	    					   leaveToAppliedDate	 : toDate,
	    					   reasonForCancelleave  : $scope.reasonForCancelleave,
	    					   leaveApproverEmail  	 : $scope.leaveApproverEmail ,
	    					   totalLeavesApplied	 :0,
	    					   leaveActionStatus	 : "pending",
	    					   leaveRequestType		 : $scope.leaveType,
	    					   leaveActionDate		 : submitdate,
				
	    			   };
					 var leaveInfo=[];
					 leaveInfo[0]=request;
					 leaveInfo[1]=info;
					 $http.post('/cancelLeave', leaveInfo).success(function (data) {
	            		console.log("success");
            			$scope.showCancelLeave=true;
            			$scope.leaveFromAppliedDate="";
	            		$scope.leaveToAppliedDate="";
	            		$scope.leaveType="";
	            		$scope.reasonForCancelleave="";
	            		$scope.leaveApproverEmail="";
	            		
    				}).error(function(err){
    					console.log("failure");
    				});
				}

		};
		
});
