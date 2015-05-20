var casper = require('casper').create({
	//Turn logging on
	//verbose: true,
    //logLevel: "debug"
});


var config = require("config.json").configName;
var loading = false;

//Set useragent
casper.userAgent(config.userAgent);

//Open start page
casper.start(config.loginPage);
console.log("Opening login page");

PageReady();

//Enter login info
casper.then(function step1() {    
	console.log("Entering Credentials");
    casper.evaluate(function(username, password) {			
		var arr = document.getElementsByClassName("form");		
		arr[0].elements["username"].value = username;
		arr[0].elements["password"].value = password;
		
    },config.username, config.password);
});
 
//Click login button
casper.then(function () {  
    console.log("Clicking login button");
    casper.evaluate(function () {
        var arr = document.getElementsByClassName("formname");
        arr[0].elements["submitbuttonname"].click();
      });
});

PageReady();

casper.then(function () {
    //Download from a form that has no link by parsing form parameters
    console.log("Downloading CSV");
    var response = casper.evaluate(function () {
        var res = {};
        f = document.forms["form"];
          //Click submit, get params then cancel submit action
        f.onsubmit = function () {
            var post = {};
            console.log("element size " + f.elements.length);
            for (i = 0; i < f.elements.length; i++) {
                post[f.elements[i].name] = f.elements[i].value;
            }
            res.action = f.action;
            res.post = post;
			return false;
        }

        var button = document.getElementById("download_csv");
        button.click();
        return res;
    });

      console.log(JSON.stringify(response.post));
	   var filename = "filename";	
      //Use parameters to make post
      casper.download(response.action, filename, "POST", response.post);
});

//Download resource if you know the URL
casper.on('resource.received', function (resource) {
    if (resource.url == config.sourceUrl) {
        var filename = "filename";
		casper.download(resource.url, filename);
        //Display resource in json
        console.log(JSON.stringify(resource));
    }
});

//Page loading check
casper.on('load.started', function () {
    loading = true;
    //console.log("load started");
});

//Page loading finished check. Used to decide page is safe to load
casper.on('load.finished', function () {
    loading = false;
    //console.log("load started");
});

//Handle error and specify status code
casper.on('error', function(msg, trace) {
	console.log("error");
	console.log(msg);
	console.log(JSON.stringify(trace));
	casper.exit(1); 
});

//Finish and return status code
casper.run(function() {    
    casper.exit(0); 
});

//Wait till page has loaded before moving to next step
function PageReady()
{
	while(loading == true)
	{
		casper.wait(3000);
	}	
}