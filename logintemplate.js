var casper = require('casper').create();
var loading = false;

casper.start();
//Set useragent
casper.userAgent("Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0");

//Download resource if you know the URL
casper.on('resource.received', function (resource) {
    if (resource.url == "https://downloadfilelink.com") {
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

//List of actions to be performed
var actions = [
  function () {
      console.log("Opening login page");
      casper.open("https://loginpage.com");
  },
  //Enter login info
  function () {
      console.log("Entering Credentials");
      casper.evaluate(function () {

          var arr = document.getElementsByClassName("formname");
          arr[0].elements["username"].value = "yourusername";
          arr[0].elements["password"].value = "yourpassword";

      });
  },
  //Click login button
  function () {
      //Login
      console.log("Clicking login button");
      casper.evaluate(function () {
          var arr = document.getElementsByClassName("formname");
          arr[0].elements["submitbuttonname"].click();
      });
  },
  function () {
      //Download from a form that has no link by parsing form parameters
      console.log("Downloading CSV");
      var res = casper.evaluate(function () {
          var res = {};
          f = document.forms["form"];
          //Click sbmit, get params then cancel submit action
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

      //console.log(JSON.stringify(res.post));
	   var filename = "filename";	
      //Use parameters to make post
      casper.download(res.action, filename, "POST", res.post);
  }
];

var index = 0

interval = setInterval(function () {
    //Move to the next step depending on load state
    if (!loading && typeof actions[index] == "function") {
        console.log("action " + (index + 1));
        actions[index]();
        index++;
    }

    if (index == actions[index].length) {
        console.log("Finished at " + index);
        casper.run();
    }
}, 50);