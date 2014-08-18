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

Parse.Cloud.define('searchForMoviesWithTitle', function(request, response) {
                   
                   if (request) {
                   
                   response.success(request.params);
                   
                   } else {
                   
                   response.error('unable to access the request data');
                   
                   }
                   
                   });

Parse.Cloud.job("runSearch", function(request, status) {
                
                status.success(Parse.Cloud.run('searchForMoviesWithTitle',request.params));
                
                });