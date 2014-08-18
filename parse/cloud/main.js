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
                   
                   response.success(request);
                   
                   } else {
                   
                   response.error('unable to access the request data');
                   
                   }
                   
                   });

Parse.Cloud.job("runSearch", function(request, status) {
                
                status.success(Parse.Cloud.searchForMoviesWithTitle("title"));
                
                });

Parse.Cloud.job("userMigration", function(request, status) {
                
                // Set up to modify user data
                
                Parse.Cloud.useMasterKey();
                
                var counter = 0;
                
                // Query for all users
                
                var query = new Parse.Query(Parse.User);
                
                query.each(function(user) {
                
                           // Update to plan value passed in
                           
                           user.set("plan", request.params.plan);
                           
                           if (counter % 100 === 0) {
                           
                           // Set the  job's progress status
                           
                           status.message(counter + " users processed.");
                           
                           }
                           
                           counter += 1;
                           
                           return user.save();
                           
                           }).then(function() {
                           
                                   // Set the job's success status
                                   
                                   status.success("Migration completed successfully.");
                                   
                                   }, function(error) {
                                   
                                   // Set the job's error status
                                   
                                   status.error("Uh oh, something went wrong.");
                                   
                                   });
                
                });