/**
 * 
 * A simple test of SwellRT and a demo of how to use collaborative objects.
 * 
 * This app also solves the common problem of when multiple people need to collaborate on 
 * The precise position of a scrollbar.
 * 
 * Note; This is app is a quick and dirty example, not likely representing best practices
 * 
 * @author ThomasWrobel
 */


///Once setup, this global variable will be the collaborative string object that we are updating when the scrollbar moves
var scrollstr;

//We cant use the SwellRT object fully till its ready so we wait till it is.
SwellRT.ready(function() {
	console.log("SwellRT is ready to use");
	login();
});


//When SwellRT is ready, we login
function login()
{
	console.log("attempting to login");

	SwellRT.login(
			{
				//there is a test user by default which we will use for this example
				id : "test",
				password : "test"
			},

			function(response) {

				if (response.error) {
					// ERROR
					console.log("login error");

				} else if (response.data) {
					// OK
					// response.data => user profile data           
					console.log("login success");

					//now we have logged in we can start the session
					startSession(response.data);
				}

			});

}


//Once logged in we add the connection handlers
//and check if our collaborative object already exists
function startSession(userdata){

	console.log("userdata="+userdata.toString());
	
	addConnectionListeners();
	
	testIfTestObjectExists();

}



//This ultra simple example just uses one object
//var defaultObjectID = "local.net/s+D0UmERn7UaA";

/**
 * 
 * @returns
 */
function testIfTestObjectExists(){    

	console.log("testing if test object exists"); 

	//need to use query
	//first get all the objects this user can see
	SwellRT.query("{}",

			function(response) {
		//response.result is the array of data modeles

		//test if this response contained a WaveID we can use
		var WaveID = testForExistingCollabScrollbar(response)

		if (WaveID==""){
			//if empty we create a object						
			console.log("no existing object for shared scrollbar, createing new one"); 
			makeTestObject();
		} else {
			//else we use what was returned
			console.log("found a scrollbar shared with us"); 
			openExistingObject(WaveID)
		}

	},

	function(error) {

		// handle the error

	});

}


function openExistingObject(ObjectWaveID){



	SwellRT.open(
			{
				// specify the ObjectWaveID to open
				id : ObjectWaveID 
			},

			function(co) {

				// Error
				if (co == null) {
					console.log("Error, object is null");
					makeTestObject(); //make it
				} else if (co.error)  {
					console.log("Error, "+co.error);
					makeTestObject();// make it
				}

				// Success
				console.log("Object "+co.id()+" already exists and is ready!");

				//get str
				console.log("getting shared string colab object");
				str = co.root.get(SharedScrollbarKey);

				scrollstr=str;
				addEventHandler(str);

			});



}

function makeTestObject(){      

	console.log("making test  object"); 

	SwellRT.open(
			{
				// Leave this object empty to create a new object
				//id : ""
			},

			function(co) {

				// Error
				if (co == null) {
					console.log("Error, object is null");
				} else if (co.error)  {
					console.log("Error, "+co.error);
				}

				// Success
				console.log("Object "+co.id()+" is ready!");      
				addDataAndUsers(co);

			});

}

function addConnectionListeners(){

	console.log("making connection listeners"); 

	SwellRT.on(SwellRT.events.NETWORK_CONNECTED,
			function(data) {
		console.log("network connected");         
		//Event triggered on network new connection or     	//reconnection. The client app can resume API operations.
	}
	);

	SwellRT.on(SwellRT.events.NETWORK_DISCONNECTED,
			function(data) {
		console.log("network disconnected");         
		//Event triggered on a temporary or total network            	//disconnection. The app should prevent further calls to 	//the API until a NETWORK_CONNECTED event is received.
	}
	);

	SwellRT.on(SwellRT.events.DATA_STATUS_CHANGED,
			function(data) {
		console.log("network DATA_STATUS_CHANGED");         
		//  Event triggered on data changes performed by your app. //It provides three status indicators each time your app makes //changes to a data model:
	}
	);

	SwellRT.on(SwellRT.events.FATAL_EXCEPTION,
			function(data) {
		console.log("network FATAL_EXCEPTION");         
		//Event triggered on fatal exception in the client or //server. You should stop your app. You can check data.cause //for more information. The app should start a new session //(and open a model) before resuming API operations.
	}
	);


}

var SharedScrollbarKey = "_SharedScrollbarKey_";

function testForExistingCollabScrollbar(response)
{



//	Then see if any are a Collaborative scrollbar by looking
//	for a particular key/value
//	MongoDB could be used to query/return this object directly
//	But the writer of this test app does not know MongoDB very
//	well at all.

	console.log("got accessible objects:\n");
	console.log(response); //response contains all accessible objects as a JSON object. Most browsers can now display this neatly in the console log
	console.log("------------------------------------");


	//Now loop looking for our particular scrollbar object
	var AccessibleScrollbars = [];

	results = response["result"];
	for (var p in results) {

		if( results.hasOwnProperty(p) ) {

			//    result += p + " , " + response[p] + "\n";
			data = results[p];

			if ("root" in data){
				root = data["root"];

				if (SharedScrollbarKey in root){	  		
					console.log("keyfound in;");	

					console.log(root);

					//We found a collaborative scrollbar!
					//Add its WaveID to the list of collaborative scrollbars we can access

					AccessibleScrollbars.push(data["wave_id"]);
				}
			}

		} 

	}          

	console.log("result:"+AccessibleScrollbars);
	var WaveIDToUse="";

	if (AccessibleScrollbars.length>0){
		//
		//if we found results	
		//
		//For the purpose of this demo app, we just use the first WaveID on the list
		//In a more real app, youd probably want to give the user a list of objects to choose from - purhapes each one is a document shared with them, for example.
		//
		WaveIDToUse = AccessibleScrollbars[0];
		console.log("Using WaveID:"+WaveIDToUse);
	} else {
		//if we did not find results we return a empty string
		WaveIDToUse="";
	}

	return WaveIDToUse;

}
/**
 * 
 * @param str
 * @returns
 */
function addEventHandler(str){   

	str.registerEventHandler(SwellRT.events.ITEM_CHANGED,

			function(newStr, oldStr) {
		//alert("Stringchanged:"+oldStr+"->"+newStr);

		someElement = document.getElementById("scrollbar");
		var currentVal = someElement.scrollTop;   
		//if different update
		if (newStr!=currentVal){
			console.log("value changed to:"+newStr);
			someElement.scrollTop = newStr;
		}

	});

}

/**
 * 
 * @param co
 * @returns
 */
function addDataAndUsers(co){    

	console.log("Object "+co.id()+" adding users...")  

	users = co.getParticipants();

	console.log("users: "+users);

	//add public
	co.addParticipant("@local.net"); 

	users = co.getParticipants();

	console.log("users: "+users);
	console.log("Object "+co.id()+" adding test data...")

	//we create a string, assigned to our standard key
	//hello world isnt important, just a default value.
	//
	var str = co.root.put(SharedScrollbarKey,"hello world");
	//For more on creation of collaborative fields see;
	//https://github.com/P2Pvalue/swellrt/wiki/Working-with-Collaborative-Objects#the-root-map
	
	scrollstr=str;

	console.log("Object "+co.id()+" adding callbacks...") 
	addEventHandler(str);

	//test change
	str.setValue("test string value");
	console.log("current string value: "+str.getValue());
}


/**
 * Fires when the scrollbar on the htmlpage is moved
 * If this fires before scrollstr is set it naturally wont work
 * @returns
 */
function barScrolled(){

	someElement = document.getElementById("scrollbar");
	var  intElemScrollTop = someElement.scrollTop;   
	console.log("scroll set to : "+intElemScrollTop );

	//update collaborative object
	scrollstr.setValue(""+intElemScrollTop);

}
