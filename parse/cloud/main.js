var _ = require("underscore.js");
var Buffer = require("buffer").Buffer; // required for httpRequest
var querystring = require("querystring"); // stringifys json to escaped html

Parse.Cloud.define("getParseErrorUtils",function (request,response) {
/*
var ParseErrorUtilsInstanceModel = {
initialize:function(attrs,options){
  this.className = "ParseErrorUtils";
  if (ParseErrorUtils.fulfillsInterface(options))
  {
  this.errorModel = options.errorModel;
  this.codePairings = options.codePairings;
  } else {
    this.errorModel = ParseErrorUtils.defaultErrorModel;
    this.codeParings = ParseErrorUtils.defaultCodePairings;
  }
  this.setDefaultModelAndCodePairing = function(errorModel,codePairings) {ParseErrorUtils.defaultModel = errorModel;ParseErrorUtils.defaultCodePairings;};
  
this.setAndSaveModel=function()
{
  this.set("errorModel",this.errorModel);
  this.set("codePairings",this.codePairings);
  this.save().then(function(obj){console.log("object saved! "+obj.id); return obj;},function(error){return error;}); // TODO Figure out why it gives error "saving pointer to new unsaved obj"
},
codePairedTypeToString:function() {
var codePairings = this.defaultCodePairings;
var codes = _.values(codePairings);
var codeKeys = _.keys(codePairings);
return "[object "+codeKeys[_.indexOf(codes,this.code,true)]+"]";
}
};

var ParseErrorUtilsClassModel = {
defaultErrorModel: Parse.Error,
defaultCodePairings:Parse.Error,
knownModels:[Parse.Error],
knownCodePairings:[Parse.Error],
addToErrorLibrary:function(errorModel,codePairings) {
  if ((_.indexOf(ParseErrorUtils.knownModels,errorModel) === -1) && (_.indexOf(ParseErrorUtils.knownCodePairings,codePairings) === -1))
  {
  ParseErrorUtils.knownModels.push(errorModel);
  ParseErrorUtils.knownCodePairings.push(codePairings);
  }
  },
typeForCode:function(code,options) {
var codePairings = _.has(options,"codePairings") ? options.codePairings : ParseErrorUtils.defaultCodePairings;
var codes = _.values(codePairings);
var codeKeys = _.keys(codePairings);
return codeKeys[_.indexOf(codes,code,true)];
},
fulfillsCodePairingsInterface: function(codePairings)
{
  var codePairSample = (_.pairs(codePairings))[0];
  var codePairingsInterface = ((codePairSample[0] instanceof String) && (codePairSample[1] instanceof Number));
  return codePairingsInterface;
},
fulfillsErrorModelInterface: function(errorModel)
{
  var neededParams = ["code"];
  var errorModelInterface = (_.intersection(neededParams,_.keys(new errorModel())) === neededParams);
  return errorModelInterface;
},
fulfillsInterface:function(options){
  var codePairingsInterface = false;
  var errorModelInterface = false;
  var ParseErrorUtilsInterface = false;
if ((options) && (_.has(options,"codePairings")))
{
  codePairingsInterface = ParseErrorUtils.fulfillsCodePairingsInterface(options.codePairings);
}
if ((options) && (_.has(options,"errorModel")))
{
  errorModelInterface = ParseErrorUtils.fulfillsErrorModelInterface(options.errorModel);
}
if (codePairingsInterface && errorModelInterface)
{
ParseErrorUtilsInterface = true;
}
return ParseErrorUtilsInterface;
}
};

var ParseErrorUtils = Parse.Object.extend("ParseErrorUtils",ParseErrorUtilsInstanceModel,ParseErrorUtilsClassModel);

ParseErrorUtils.prototype.toString = function(){return "[object ParseErrorUtils]";};

var errorUtility = new ParseErrorUtils;

console.log((new ParseErrorUtils).toString());

errorUtility.save().then(function(obj){response.success(ParseErrorUtils);},function(error){response.error(error);});
*/
});
/*
*  @name Parse.Cloud.run("testAllCloudCodeAPIMethods")
*  parameters will not be used, don"t bother defining!
*
*  @description "testAllCloudCodeAPIMethods" uses predefined parameters from the paramsForMethods object to execute a series of methods
*/


Parse.Cloud.job("testAllCloudCodeAPIMethods", function(request, status) {
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
*  @name Parse.Cloud.run("request",data,options)
*  data will be logged back to the user if a success
*  options must be of type Parse.Cloud.HTTPOptions
*  HTTPOptions -> https://parse.com/docs/js/symbols/Parse.Cloud.HTTPOptions.html
*
*  @description "request" is just a simple test method to see if interacting with Cloud Code works
*/

Parse.Cloud.define("request", function(request, response) {

if (request) {

response.success(request);

} else {

response.error("unable to access the request data");

}

});

Parse.Cloud.define("StateTrackingTest", function(request, response) {
//Execute an http request (get, post [for creating and updating], delete)
var state = "requestMaking";
var successOrFailureTemplate = function(outcome,output) {if (outcome == successOutcome) {return "succeeded with output: " + output} else if (outcome == errorOutcome) {return "failed with error: | code: "+output.code+" | message: "+output.message}};
var logTemplateWithOutcomeAndOutput = function(outcome,output) {return "searchForMoviesWithTitle " + successOrFailureTemplate(outcome,output) + " | in state: " + state + " | for request: " + request.body;}

const successOutcome = "success";
const errorOutcome = "error";


var movieTitle = "The Matrix"; // = request.params.movieTitle;

Parse.Cloud.httpRequest({
method: "GET",
url: "http://www.omdbapi.com/?s="+movieTitle+"&y=",
headers: {
"Accept": "application/json",
"User-Agent": "Parse.com Cloud Code",
"Content-Type": "application/json"},
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

Parse.Cloud.define("compareMovies", function(request, response) {
// every compare movies request comes in with either a title or an imdbID for the movie
// TODO allow passing of imdbID as well as or instead of title, perhaps change params form to {"movies":[{"t":title,"i":imdbID}]}
// @pragma mark compareMovies

// we initialize in the compare movies request received state
// in it we use the appropriate cloud functions (getMovieBy...) to get a JSON form of the movie from Parse or an httpRequest and move to the next state
Parse.Promise.when(Parse.Cloud.run("getMovieByTitle",{"t":request.params.movies[0]}),Parse.Cloud.run("getMovieByTitle",{"t":request.params.movies[1]})).then(function(movie1,movie2){
// state.proceedToState("cacheChecking");
// in the cache checking state, we convert the JSON responses from the cloud methods to Parse.Objects and query Parse for a prior comparison if it exists

// set up the query to see if we"ve compared the movies before
var compareMoviesResultModel = Parse.Object.extend("CompareMoviesResult");
var compareMoviesResultQuery = new Parse.Query(compareMoviesResultModel);

// and convert the JSON movie objects to their Parse.Object model counterparts
var MovieModel = Parse.Object.extend("Movie");
var movieQuery = new Parse.Query(MovieModel);
aMovie = new MovieModel();
aMovie.id = movie1["objectId"];
anotherMovie = new MovieModel();
anotherMovie.id = movie2["objectId"];

// restrict the query to look for the movies in question in either parameter
compareMoviesResultQuery.containedIn("movie1",[aMovie,anotherMovie]);
compareMoviesResultQuery.containedIn("movie2",[aMovie,anotherMovie]);

// move to the next state passing promises that all models are now fetched: the query"s count and results; and Parse.Object models for movie1 and movie2
return Parse.Promise.when(compareMoviesResultQuery.count(),compareMoviesResultQuery.find(),aMovie.fetch(),anotherMovie.fetch());
}).then(function(compareMoviesResultCount,compareMoviesResults,movie1,movie2){
// in the query performed state, we should have all fetched models so we check count to see if the query turned up any results from Parse
if (compareMoviesResultCount > 0)
{
  // if the comparison has already been done, the query will have a count greater than 0, just return the result and move to comparison completed state
   console.log("comparison done previously: "+JSON.stringify((compareMoviesResults[0]).toJSON()));
   // our target object is always first in the array of results, make sure to fetch the full model for consistenc as queries don"t resolve pointers
   // this can also be accomplished by calling "(instanceof Parse.Query(ObjectModel)).include("pointerKey") or "pointerKey.keyOfFieldOnPointer""
   return ((compareMoviesResults[0]).fetch());
}
else {
  console.log("comparison not done previously, creating new...");
}

// create an array to hold any keys that turn out to be similar
var sameKeys = [];

for (var key in movie1.toJSON())
{
   // iterate over all the attributes by their keys
  var innerArray = (movie1.toJSON())[key];
  var otherInnerArray = (movie2.toJSON())[key];
if (innerArray === otherInnerArray)
{
  // if the value is identical at a key push the key to the sameKeys array
sameKeys.push(key);
} else if (innerArray instanceof Array)
{
  // if the value isn"t identical, check to see if it"s an array value
  console.log("array key found for "+JSON.stringify(innerArray));
  for (var i=0; i < innerArray.length; i++)
  {
    // for every value in both arrays...
    for (var otherInnerArrayKey in otherInnerArray)
    {
      // console.log("comparing "+innerArray[i]+" to "+otherInnerArray[otherInnerArrayKey]);
    // check if the values are identical
    if (innerArray[i] === otherInnerArray[otherInnerArrayKey])
    {
      // if they are push the key that the array is stored at
      console.log(innerArray[i]+" === "+otherInnerArray[otherInnerArrayKey]);
      if (sameKeys.indexOf(key) < 0)
      {
        /// but only if the key isn"t already in the array
      sameKeys.push(key);
    }
    }
  }
  }
}
}

// save the results of the comparison to Parse as a CompareMoviesResult object containing pointers to the movies compared and an array of same keys

var SameModel = Parse.Object.extend("CompareMoviesResult");
var sameObject = new SameModel();

return sameObject.save({"movie1":movie1,"movie2":movie2,"sameKeys":sameKeys});

}).then(
// in the comparison completed state, we return the filled out CompareMoviesResult object to the user or let the user know the process failed
function(sameObject){
// return the results in JSON form for portability
response.success(sameObject.toJSON());
},function(error) {
  // or return the error if one occured
response.error(JSON.stringify(error));
});

});

Parse.Cloud.define("getMovieByImdbId", function(request, response)
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
method: "GET",
url: "http://www.omdbapi.com/",
headers: {
"User-Agent": "Parse.com Cloud Code"
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
for (var i = 0; i < splitValue.length; i++)
{
  var innerSplit = (splitValue[i]).split(" (");
if (innerSplit.length > 1)
{
  console.log("found role attached to person, parsing out "+innerSplit[0]+" from "+splitValue[i]);
  splitValue[i] = innerSplit[0];
}
}
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
parseObjectForMovie.set("Title_LOWERCASE",parsedResponse.Title.toLowerCase());
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



Parse.Cloud.define("getMovieByTitle", function(request, response)
{
// imdbId to get
var title = request.params.t; // = tt1285016 (The Social Network) for testing purposes

var titleQuery = new Parse.Query(Parse.Object.extend("Movie"));
titleQuery.equalTo("Title_LOWERCASE",title.toLowerCase());
titleQuery.count({
success:function(count){
if (count > 0){
titleQuery.first({success:function(theDBObject){response.success(theDBObject.toJSON());},
error:function(error){response.error("getMovieByTitle failed with error: | code: "+error.code+" | message: "+error.message+"| for request: " + request.body);}});
} else {

Parse.Cloud.httpRequest({
method: "GET",
url: "http://www.omdbapi.com/",
headers: {
"User-Agent": "Parse.com Cloud Code"
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
for (var i = 0; i < splitValue.length; i++)
{
var innerSplit = (splitValue[i]).split(" (");
if (innerSplit.length > 1)
{
  console.log("found role attached to person, parsing out "+innerSplit[0]+" from "+splitValue[i]);
  splitValue[i] = innerSplit[0];
}
}
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
parseObjectForMovie.set("Title_LOWERCASE",parsedResponse.Title.toLowerCase());
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

Parse.Cloud.define("getActorByImdbId", function(request, response)
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
method: "GET",
url: "http://www.myapifilms.com/imdb",
headers: {
"User-Agent": "Parse.com Cloud Code"
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

Parse.Cloud.define("searchMoviesByTitle", function(request, response)
{
// api always returns an array of movies in an object under a key of {"Search" : [movies]}
// imdbId to get
var title = request.params.s; // = The Matrix for testing purposes
var year = request.params.y;

var imdbIdQuery = new Parse.Query("Movie");
imdbIdQuery.contains("Title_LOWERCASE",title.toLowerCase());
imdbIdQuery.contains("Year",year);
imdbIdQuery.count({success:function(count){
if ((count > 0) && !request.params.skipDB) {
imdbIdQuery.find({success:function(theDBObjects){
// if movies exist in db containing the same title and year, stop and report their object ids
var idString = "";
_.each(theDBObjects,function(aMovie){idString += " " + aMovie.id + " |";});
console.log(count+" movies with Title \"" +title+ "\" and Year \""+year+"\" already in db, objects:"+idString);
response.success(theDBObjects);},
error:function(error){
response.error("searchMoviesByTitle failed with error: | code: "+error.code+" | message: "+error.message+"| for request: " + request.body);}
});
} else {
  if (request.params.skipDB)
  {
    console.log("skipDB flagged");
  } else
  {
console.log("no movies matching title and year, querying");
}
Parse.Cloud.httpRequest({
method: "GET",
url: "http://www.omdbapi.com/",
headers: {
"User-Agent": "Parse.com Cloud Code"
},
params: request.params
}).then(function(httpResponse) {
var parsedResponse = JSON.parse(httpResponse.text); // convert text/html retrieved from OMDb to application/json and store in an object

var Movie = Parse.Object.extend("Movie");
var promises = new Parse.Promise.as();
var results = [];
_.each(parsedResponse["Search"],function(movie) {
// for every movie in the search save to the Movie table
    promises = promises.then(function(){
      return Parse.Cloud.run("getMovieByImdbId",{"i":movie["imdbID"]}).then(function(movieObj){results.push(movieObj);return results;})
  });
});

Parse.Promise.when(promises).then(function () {
  var movies = [];
  var imdbIDs = [];
  for (var args in arguments[0])
  {
    movies.push(arguments[0][args]);
  }

  for (var index in movies)
  {
    imdbIDs.push(movies[index]["imdbID"]);
  }

var Movie = Parse.Object.extend("Movie");
  var movieQuery = new Parse.Query(Movie);
  movieQuery.containedIn("imdbID",imdbIDs);
  movieQuery.select("Title","Year","Director");
  movieQuery.find().then(function(results){
    console.log("movieQuery results: "+JSON.stringify(results));
var Search = Parse.Object.extend("Search");
var parseObjectForSearch = new Search();
  parseObjectForSearch.set(results);
  response.success(parseObjectForSearch.toJSON());
}, function(error){response.error();});
});

}, function(error){response.error();});

} // end api request code
},
error:function(error){
response.error("count query for Search failed, error: "+error.code+" | "+error.message);
}});

});

/*
*  @Parse.Cloud.Jobs
*/

Parse.Cloud.job("runCompareMovies", function(request, status) {
//Parse.Cloud.define("compareMovies", function(request, response) {
Parse.Cloud.run("compareMovies",request.params).then(
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

Parse.Cloud.job("runGetMovieByImdbId", function(request, status) {
// call the cloud function getMovieByImdbId passing on the request data
Parse.Cloud.run("getMovieByImdbId",request.params).then(
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

Parse.Cloud.job("runGetActorByImdbId", function(request, status) {
// call the cloud function getActorByImdbId passing on the request data
Parse.Cloud.run("getActorByImdbId",request.params).then(
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

Parse.Cloud.job("runSearchMoviesByTitle", function(request, status) {
// call the cloud function getActorByImdbId passing on the request data
Parse.Cloud.run("searchMoviesByTitle",request.params).then(
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

Parse.Cloud.job("runSearchMoviesByTitleAndSkipDB", function(request, status) {
// call the cloud function getActorByImdbId passing on the request data
Parse.Cloud.run("searchMoviesByTitle",{"s":request.params.s,"y":request.params.y,"skipDB":true}).then(
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
