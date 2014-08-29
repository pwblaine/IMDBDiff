var _ = require("underscore.js");
var Buffer = require('buffer').Buffer; // required for httpRequest
var querystring = require('querystring'); // stringifys json

/*
*  @name Parse.Cloud.run('testAllCloudCodeAPIMethods')
*  parameters will not be used, don't bother defining!
*
*  @description 'testAllCloudCodeAPIMethods' uses predefined parameters from the paramsForMethods object to execute a series of methods
*/

Parse.Cloud.job('testAllCloudCodeAPIMethods', function(request, status) {
// call the cloud function getActorByImdbId passing on the request data

var methodsToRun = request.params.methodToRun;

var paramsForMethods = request.params.paramsForMethods;

var methodResults = {};
var failedMethods = [];
var methodTestingPromises = [];

_.each(methodsToRun, function(methodToRun)
{

methodTestingPromises.push(Parse.Cloud.run(methodToRun,
paramsForMethods[methodToRun]).then(
// if the result is success...
function(response){
// the response must be turned to a string as the success method returns the object passed as the argument
status.message(methodToRun + " succeeded for request with params "+JSON.stringify(paramsForMethods[methodToRun]));
},
// if the cloud function fails...
function(error){
methodResults[methodToRun] = error; // store the error in methodResults
failedMethods.push(methodToRun); // add the method to the failedMethods array

// the response is wrapped in an Parse.Error so the string for the console log must be extracted using the message property
var message = " | code: " + error.code + " | message: " + error.message + " |";

if (error.code == Parse.Error.VALIDATION_ERROR)
{
message += " == Parse.Error.VALIDATION_ERROR";
}
else if (error.code == Parse.Error.SCRIPT_FAILED)
{
message += " == Parse.Error.SCRIPT_FAILED";
//
}

status.message(methodToRun + " failed with error: " + message);

})
)

}
);

var executeWhenPromisesAreDone = function (promiseArray) {
return Parse.Promise.when(promiseArray);
}

executeWhenPromisesAreDone(methodTestingPromises).then(function() {
var theMessage = "all were successful";
status.success(theMessage + " " + methodTestingPromises.toString());
},
function() {
status.error("check the logs, some methods failed");
}
);

});

/*
*  @name Parse.Cloud.run('request',data,options)
*  data will be logged back to the user if a success
*  options must be of type Parse.Cloud.HTTPOptions
*  HTTPOptions -> https://parse.com/docs/js/symbols/Parse.Cloud.HTTPOptions.html
*
*  @description 'request' is just a simple test method to see if interacting with Cloud Code works
*/

Parse.Cloud.define('request', function(request, response) {

if (request) {

response.success(request);

} else {

response.error('unable to access the request data');

}

});

Parse.Cloud.define('StateTrackingTest', function(request, response) {
//Execute an http request (get, post [for creating and updating], delete)
var state = "requestMaking";
var successOrFailureTemplate = function(outcome,output) {if (outcome == successOutcome) {return "succeeded with output: " + output} else if (outcome == errorOutcome) {return "failed with error: | code: "+output.code+" | message: "+output.message}};
var logTemplateWithOutcomeAndOutput = function(outcome,output) {return "searchForMoviesWithTitle " + successOrFailureTemplate(outcome,output) + " | in state: " + state + " | for request: " + request.body;}

const successOutcome = "success";
const errorOutcome = "error";


var movieTitle = "The Matrix"; // = request.params.movieTitle;

Parse.Cloud.httpRequest({
method: 'GET',
url: "http://www.omdbapi.com/?s="+movieTitle+"&y=",
headers: {
'Accept': 'application/json',
'User-Agent': 'Parse.com Cloud Code',
'Content-Type': 'application/json'},
success: function(movieAPIRequest) {

var movies = [];
movies = movieAPIRequest.body;

var index = 0;

state = "requestParsing";
for (var aMovie in movies)
{
var Movie = Parse.Object.extend("Movie"); // class declaration
aMovie = new Movie(aMovie);
movies.push(aMovie);
}

if (movies) //If the array was created successfully
{
response.success(logTemplateWithOutcomeAndOutput(successOutcome,movies.toString()));
}
},

error: function(arrayFindError) {
response.error(logTemplateWithOutcomeAndOutput(errorOutcome,arrayFindError));

}});
});

/*
*  @Parse.Cloud.Functions
*/

Parse.Cloud.define('getMovieByImdbId', function(request, response)
{
// imdbId to get
var imdbId = request.params.i; // = tt1285016 (The Social Network) for testing purposes

var imdbIdQuery = new Parse.Query(Parse.Object.extend("Movie"));
imdbIdQuery.equalTo("imdbID",imdbId);
imdbIdQuery.count({
success:function(count){
if (count > 0){
imdbIdQuery.first({success:function(theDBObject){response.success(theDBObject.toJSON());},
error:function(error){response.error("getMovieByImdbId failed with error: | code: "+error.code+" | message: "+error.message+"| for request: " + request.body);}});
} else {

Parse.Cloud.httpRequest({
method: 'GET',
url: "http://www.omdbapi.com/",
headers: {
'User-Agent': 'Parse.com Cloud Code'
},
params: request.params
}).then(function(httpResponse) {
var Movie = Parse.Object.extend("Movie");
var parseObjectForMovie = new Movie();
var parsedResponse = JSON.parse(httpResponse.text); // convert text/html retrieved from OMDb to application/json and store in an object

for (var key in parsedResponse)
{
if (key == "Writer" | key == "Actors" | key == "Genre" | key == "Language" | key == "Country")
{
var value = parsedResponse[key];
var splitValue = value.split(", ");
console.log("found multiple parts in "+key+", splitting into "+key+" : "+splitValue);
parsedResponse[key] = JSON.parse(JSON.stringify(splitValue));
}
}

var stringified = JSON.stringify(parsedResponse);
parsedResponse = JSON.parse(stringified);

parseObjectForMovie.set(parsedResponse,
{error: function(parseObjectForMovie, error){
console.log("failed to set parsedResponse as attributes for object object "+JSON.stringify(parseObjectForMovie.toJSON())+" with error: | code: "+error.code+" | message: "+error.message+" |");}
}); // save all attributes of parsedResponse on parseObjectForMovie
parseObjectForMovie.unset("Type",{error: function(parseObjectForMovie, error){
console.log("failed to remove a key from object "+JSON.stringify(parseObjectForMovie.toJSON())+" with error: | code: "+error.code+" | message: "+error.message+" |");}
}); // drop the Type key from the model so not to confuse with Parse class
parseObjectForMovie.unset("Response",{error: function(parseObjectForMovie, error){
console.log("failed to remove a key from object "+JSON.stringify(parseObjectForMovie.toJSON())+" with error: | code: "+error.code+" | message: "+error.message+" |");}
}); // drop the Response key from the model so that now only applicable data is stored
parseObjectForMovie.save().then(function(parseObjectForMovie) {
response.success(parseObjectForMovie.toJSON());
},
function(error){
response.error("failed to save object "+parseObjectForMovie.id+" with error: | code: "+error.code+" | message: "+error.message+" |");
});
},
function (error) {
response.error("getMovieByImdbId failed with error: | code: "+error.code+" | message: "+error.message+" | for request: " + request.body);
}
);

}
},
error:function(error){
response.error("count query for Movie failed, error: "+error.code+" | "+error.message);
}
});



});

Parse.Cloud.define('compareMovies', function(request, response) {
//Parse.Cloud.define('compareMovies', function(request, response) {

Parse.Promise.when(Parse.Cloud.run('getMovieByTitle',{"t":request.params.movies[0]}),Parse.Cloud.run('getMovieByTitle',{"t":request.params.movies[1]})).then(function(movie1,movie2){

var compareMoviesResultQuery = new Parse.Query(Parse.Object.extend("CompareMoviesResult"));

var MovieModel = Parse.Object.extend("Movie");
var movieQuery = new Parse.Query(MovieModel);
aMovie = new MovieModel();
aMovie.id = movie1["objectId"];
anotherMovie = new MovieModel();
anotherMovie.id = movie2["objectId"];

compareMoviesResultQuery.containedIn("movie1",[aMovie,anotherMovie]);
compareMoviesResultQuery.containedIn("movie2",[aMovie,anotherMovie]);

return Parse.Promise.when(compareMoviesResultQuery.first(),movieQuery.get(aMovie.id),movieQuery.get(anotherMovie.id));
}).then(function(compareMoviesResult,movie1,movie2){

var SameModel = Parse.Object.extend("CompareMoviesResult");
var sameObject = new SameModel();

if (compareMoviesResult)
{
  if (compareMoviesResult.id)
  {
   console.log(JSON.stringify(compareMoviesResult.toJSON()));
   sameObject.id = compareMoviesResult.id;
   return sameObject.fetch();
 }
}

var sameKeys = [];

for (var key in movie1.toJSON())
{

  var innerArray = (movie1.toJSON())[key];
  var otherInnerArray = (movie2.toJSON())[key];
if (innerArray === otherInnerArray)
{
sameKeys.push(key);
} else if (innerArray instanceof Array)
{
  console.log("array key found for "+JSON.stringify(innerArray));
  for (var i=0; i < innerArray.length; i++)
  {
    for (var otherInnerArrayKey in otherInnerArray)
    {
      console.log("comparing "+innerArray[i]+" to "+otherInnerArray[otherInnerArrayKey]);
    if (innerArray[i] === otherInnerArray[otherInnerArrayKey])
    {
      console.log(innerArray[i]+" === "+otherInnerArray[otherInnerArrayKey]);
      if (sameKeys.indexOf(key) < 0)
      {
      sameKeys.push(key);
    }
    }
  }
  }
}
}

var MovieModel = Parse.Object.extend("Movie");
aMovie = new MovieModel();
aMovie.id = movie1.id;
anotherMovie = new MovieModel();
anotherMovie.id = movie2.id;

return sameObject.save({"movie1":aMovie,"movie2":anotherMovie,"sameKeys":sameKeys});

}).then(function(sameObject){
console.log(JSON.stringify(sameObject));
response.success(sameObject.toJSON());
},function(error) {
response.error(JSON.stringify(error));
});

});

Parse.Cloud.job('runCompareMovies', function(request, status) {
//Parse.Cloud.define('compareMovies', function(request, response) {
Parse.Cloud.run('compareMovies',request.params).then(
// if the result is success...
function(response){
// the response must be turned to a string as the success method returns the object passed as the argument
status.success("compareMovies succeeded for request with params "+JSON.stringify(request.params) + " with output: " + JSON.stringify(response));

},
// if the cloud function fails...
function(error){

// the response is wrapped in an Parse.Error so the string for the console log must be extracted using the message property
var message = error.code + " : " + error.message;

if (error.code == Parse.Error.VALIDATION_ERROR)
{
message += " == Parse.Error.VALIDATION_ERROR";
}
else if (error.code == Parse.Error.SCRIPT_FAILED)
{
message += " == Parse.Error.SCRIPT_FAILED";
//
}

status.error(message);

});

});


Parse.Cloud.define('getMovieByTitle', function(request, response)
{
// imdbId to get
var title = request.params.t; // = tt1285016 (The Social Network) for testing purposes

var titleQuery = new Parse.Query(Parse.Object.extend("Movie"));
titleQuery.equalTo("Title",title);
titleQuery.count({
success:function(count){
if (count > 0){
titleQuery.first({success:function(theDBObject){response.success(theDBObject.toJSON());},
error:function(error){response.error("getMovieByTitle failed with error: | code: "+error.code+" | message: "+error.message+"| for request: " + request.body);}});
} else {

Parse.Cloud.httpRequest({
method: 'GET',
url: "http://www.omdbapi.com/",
headers: {
'User-Agent': 'Parse.com Cloud Code'
},
params: request.params
}).then(function(httpResponse) {
var Movie = Parse.Object.extend("Movie");
var parseObjectForMovie = new Movie();
var parsedResponse = JSON.parse(httpResponse.text); // convert text/html retrieved from OMDb to application/json and store in an object

for (var key in parsedResponse)
{
if (key == "Writer" | key == "Actors" | key == "Genre" | key == "Language" | key == "Country")
{
var value = parsedResponse[key];
var splitValue = value.split(", ");
console.log("found multiple parts in "+key+", splitting into "+key+" : "+splitValue);
parsedResponse[key] = JSON.parse(JSON.stringify(splitValue));
}
}

var stringified = JSON.stringify(parsedResponse);
parsedResponse = JSON.parse(stringified);


parseObjectForMovie.set(parsedResponse,
{error: function(parseObjectForMovie, error){
console.log("failed to set parsedResponse as attributes for object object "+JSON.stringify(parseObjectForMovie.toJSON())+" with error: | code: "+error.code+" | message: "+error.message+" |");}
}); // save all attributes of parsedResponse on parseObjectForMovie
parseObjectForMovie.unset("Type",{error: function(parseObjectForMovie, error){
console.log("failed to remove a key from object "+JSON.stringify(parseObjectForMovie.toJSON())+" with error: | code: "+error.code+" | message: "+error.message+" |");}
}); // drop the Type key from the model so not to confuse with Parse class
parseObjectForMovie.unset("Response",{error: function(parseObjectForMovie, error){
console.log("failed to remove a key from object "+JSON.stringify(parseObjectForMovie.toJSON())+" with error: | code: "+error.code+" | message: "+error.message+" |");}
}); // drop the Response key from the model so that now only applicable data is stored

parseObjectForMovie.save().then(function(theDBObject) {
response.success(theDBObject.toJSON());
},
function(parseObjectForMovie, error){
response.error("failed to save object "+parseObjectForMovie.id+" with error: | code: "+error.code+" | message: "+error.message+" |");
});
},
function (error) {
response.error("getMovieByTitle failed with error: | code: "+error.code+" | message: "+error.message+" | for request: " + request.body);
}
);

}
},
error:function(error){
response.error("count query for Movie failed, error: "+error.code+" | "+error.message);
}
});



});

Parse.Cloud.define('getActorByImdbId', function(request, response)
{
// ex url : "http://www.myapifilms.com/imdb?idName="+imdId+"&format=JSON&filmography=1&lang=en-us&bornDied=1&starSign=1&uniqueName=1&actorActress=1&actorTrivia=1"
// imdbId to get
var imdbId = request.params.idName; // = nm0000148 (Harrison Ford) for testing purposes, request.params.imdbId for production

var imdbIdQuery = new Parse.Query(Parse.Object.extend("Staff"));
imdbIdQuery.equalTo("idIMDB",imdbId);
imdbIdQuery.count({
success:function(count){
if (count > 0){
imdbIdQuery.first({success:function(theDBObject){response.success(theDBObject.toJSON());},
error:function(error){response.error("getActorByImdbId failed with error: | code: "+error.code+" | message: "+error.message+"| for request: " + request.body);}});
} else {

Parse.Cloud.httpRequest({
method: 'GET',
url: "http://www.myapifilms.com/imdb",
headers: {
'User-Agent': 'Parse.com Cloud Code'
},
params: request.params
}).then(function(httpResponse) {
var Staff = Parse.Object.extend("Staff");
var parseObjectForStaff = new Staff();
var parsedResponse = JSON.parse(httpResponse.text); // convert text/html retrieved from OMDb to application/json and store in an object
parseObjectForStaff.set(parsedResponse,
{error: function(parseObjectForStaff, error) {
console.log("failed to set parsedResponse as attributes for object "+JSON.stringify(parseObjectForStaff.toJSON())+" with error: | code: "+error.code+" | message: "+error.message+" |");
}
}); // save all attributes of parsedResponse on parseObjectForStaff
parseObjectForStaff.save().then(function(parseObjectForStaff) {
parseObjectForStaff.unset("filmographies", {error: function(parseObjectForStaff, error){
console.log("failed to remove a key from object "+JSON.stringify(parseObjectForStaff.toJSON())+" with error: | code: "+error.code+" | message: "+error.message+" |");}}); // short object for status reporting by removing fimographies
parseObjectForStaff.unset("trivia", {error: function(parseObjectForStaff, error){
console.log("failed to remove a key from object "+JSON.stringify(parseObjectForStaff.toJSON())+" with error: | code: "+error.code+" | message: "+error.message+" |");}}); // short object for status reporting by removing trivia
response.success(parseObjectForStaff.toJSON());
},
function(error){
response.error("failed to save object "+parseObjectForStaff.id+" with error: | code: "+error.code+" | message: "+error.message+" |");
});
},
function (error) {
response.error("getActorByImdbId failed with error: | code: "+error.code+" | message: "+error.message+"| for request: " + request.body);
});

}
},
error:function(error){
response.error("count query for Staff failed, error: "+error.code+" | "+error.message);
}
});

});

Parse.Cloud.define('searchMoviesByTitle', function(request, response)
{
// api always returns an array of movies in an object under a key of {"Search" : [movies]}
// imdbId to get
var title = request.params.s; // = The Matrix for testing purposes
var year = request.params.y;

var imdbIdQuery = new Parse.Query("Movie");
imdbIdQuery.contains("Title",title);
imdbIdQuery.contains("Year",year);
imdbIdQuery.count({
success:function(count){
if (count > 0){
imdbIdQuery.find({success:function(theDBObjects){
// if movies exist in db containing the same title and year, stop and report their object ids
var idString = "";
_.each(theDBObjects,function(aMovie){idString += " " + aMovie.id + " |";});
response.success(count+" movies with Title '" +title+ "' and Year '"+year+"' already in db, objects:"+idString);},
error:function(error){
response.error("searchMoviesByTitle failed with error: | code: "+error.code+" | message: "+error.message+"| for request: " + request.body);}
});
} else {
console.log("no movies matching title and year, querying");
Parse.Cloud.httpRequest({
method: 'GET',
url: "http://www.omdbapi.com/",
headers: {
'User-Agent': 'Parse.com Cloud Code'
},
params: request.params
}).then(function(httpResponse) {
var Search = Parse.Object.extend("Search");
var parseObjectForSearch = new Search();
var parsedResponse = JSON.parse(httpResponse.text); // convert text/html retrieved from OMDb to application/json and store in an object
parseObjectForSearch.set(parsedResponse,
{error: function(parseObjectForSearch, error){
console.log("failed to set parsedResponse as attributes for object object "+JSON.stringify(parseObjectForSearch.toJSON())+" with error: | code: "+error.code+" | message: "+error.message+" |");}
}); // save all attributes of parsedResponse on parseObjectForSearch
var Movie = Parse.Object.extend("Movie");
_.each(parseObjectForSearch.get("Search"),function(movie) {
// for every movie in the search save to the Movie table
var parseObjectForMovie = new Movie();
parseObjectForMovie.set(movie);
parseObjectForMovie.unset("Type");
parseObjectForMovie.save().then(function(savedMovie){
console.log("movie saved with id: "+savedMovie.id)},function(error){"failed to save movie "+savedMovie.id+" with error: | code: "+error.code+" | message: "+error.message+" |"});
});
response.success(parseObjectForSearch.toJSON());

},
function (error) {
// httpRequest error
response.error("getSearchByImdbId failed with error: | code: "+error.code+" | message: "+error.message+" | for request: " + request.body);
}
);

}
},
error:function(error){
response.error("count query for Search failed, error: "+error.code+" | "+error.message);
}
});



});

/*
*  @Parse.Cloud.Jobs
*/


Parse.Cloud.job('runGetMovieByImdbId', function(request, status) {
// call the cloud function getMovieByImdbId passing on the request data
Parse.Cloud.run('getMovieByImdbId',request.params).then(
// if the result is success...
function(response){
// the response must be turned to a string as the success method returns the object passed as the argument
status.success("runGetMovieByImdbId succeeded for request with params "+JSON.stringify(request.params) + " with output: " + JSON.stringify(response));

},
// if the cloud function fails...
function(error){

// the response is wrapped in an Parse.Error so the string for the console log must be extracted using the message property
var message = error.code + " : " + error.message;

if (error.code == Parse.Error.VALIDATION_ERROR)
{
message += " == Parse.Error.VALIDATION_ERROR";
}
else if (error.code == Parse.Error.SCRIPT_FAILED)
{
message += " == Parse.Error.SCRIPT_FAILED";
//
}

status.error(message);

});

});

Parse.Cloud.job('runGetActorByImdbId', function(request, status) {
// call the cloud function getActorByImdbId passing on the request data
Parse.Cloud.run('getActorByImdbId',request.params).then(
// if the result is success...
function(response){
// the response must be turned to a string as the success method returns the object passed as the argument
status.success("getActorByImdbId succeeded for request with params "+JSON.stringify(request.params) + "with output: " + JSON.stringify(response.text));

},
// if the cloud function fails...
function(error){

// the response is wrapped in an Parse.Error so the string for the console log must be extracted using the message property
var message = error.code + " : " + error.message;

if (error.code == Parse.Error.VALIDATION_ERROR)
{
message += " == Parse.Error.VALIDATION_ERROR";
}
else if (error.code == Parse.Error.SCRIPT_FAILED)
{
message += " == Parse.Error.SCRIPT_FAILED";
//
}

status.error(message);

});

});

Parse.Cloud.job('runSearchMoviesByTitle', function(request, status) {
// call the cloud function getActorByImdbId passing on the request data
Parse.Cloud.run('searchMoviesByTitle',request.params).then(
// if the result is success...
function(response){
// the response must be turned to a string as the success method returns the object passed as the argument
status.success("runsearchMoviesByTitle succeeded for request with params "+JSON.stringify(request.params) + " with output: " + JSON.stringify(response));
},
// if the cloud function fails...
function(error){

// the response is wrapped in an Parse.Error so the string for the console log must be extracted using the message property
var message = error.code + " : " + error.message;

if (error.code == Parse.Error.VALIDATION_ERROR)
{
message += " == Parse.Error.VALIDATION_ERROR";
}
else if (error.code == Parse.Error.SCRIPT_FAILED)
{
message += " == Parse.Error.SCRIPT_FAILED";
//
}

status.error(message);

});

});
