var _ = require("underscore.js");
var Buffer = require('buffer').Buffer; // required for httpRequest
var querystring = require('querystring'); // stringifys json

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

/*
 *  @name Parse.Cloud.run('search',data,options)
 *
 *  @params data must be a string and is a movie title to search for
 *
 *  @description 'search' contacts the The OMDb API ( http://www.omdbapi.com ) and requests movies with the title
 *
 *  @result on a success a under the key 'Search' : JSON array of movie objects is returned, otherwise an error
 */

Parse.Cloud.define('getMovieByImdbId', function(request, response) {
                   // IMDb ID to Search
                   var imdbId = "tt1285016";
                   
                   /* Send Request
                   var http = new ActiveXObject("Microsoft.XMLHTTP");
                   http.open("GET", "http://www.omdbapi.com/?i=" + imdbId, false);
                   http.send(null);
                   
                   // Response to JSON
                   var omdbData = http.responseText;
                   var omdbJSON = eval("(" + omdbData + ")");
                   
                   // Returns Movie Title
                   alert(omdbJSON.Title);
                   
                    */
                   Parse.Cloud.httpRequest({
                                           method: 'GET',
                                           url: "http://www.omdbapi.com/?i="+imdbId+"&t=",
                                           success: function(movieAPIRequest) {
                   
                   if (movieAPIRequest) {
                                                                                                 var Movie = Parse.Object.extend("Movie");
                                                                                                 pObj = new Movie(eval('('+movieAPIRequest.text+')'));
                   response.success("searchForMoviesWithTitle succeeded with output : |" + pObj.get("Title") + "| for request: "+request.body);
                   
                   } else {
                   
                   response.error("searchForMoviesWithTitle failed for request: "+request.body);
                   
                                           }}})
                   
                   });

Parse.Cloud.job('runGetMovieByImdbId', function(request, status) {
                // call the cloud function searchForMoviesWithTitle passing on the request data
                Parse.Cloud.run('runGetMovieByImdbId',request).then(
                                              // if the result is success...
                                              function(response){
                                              // the response must be turned to a string as the success method returns the object passed as the argument
                                              status.success(response.toString());
                                              
                                              },
                                                                         // if the cloud function fails...
                                                                         function(error){
                                                                         
                                                                         // the response is wrapped in an Parse.Error so the string for the console log must be extracted using the message property
                                                                         var message = error.code.toString() + " : " + error.message;
                                                                         
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