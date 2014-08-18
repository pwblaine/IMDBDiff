Parse.Cloud.define('request', function(request, response) {
  if (request) {
    response.success(request);
  } else {
    response.error('failed without error');
  }
});