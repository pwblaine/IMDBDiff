
var FunctionState = Parse.Object.extend("State",{
  // instance methods & properties
/*
createState: function(stateName)
{
  if (!this.states)
    {
      var states = {stateName:stateName};
      this.states = states;
}
  else if (!this["states"][stateName])
  {
  this["states"][stateName] = stateName;
  }


  return this["states"][stateName];
},
storeData:function(data)
{
  var dataKey = this.statePath[this.currentStatePathIndex]["data"];
  if (dataKey && data && (dataKey instanceof Array)) {
    dataKey.push(data);
    } 
    this.statePath[this.currentStatePathIndex]["data"] = dataKey;
},
end:function()
{
   this.endState = this.currentState;
   this.hasEnded = true;
},
setDesiredState:function(stateName)
{
  var state = null;
  
  if (this.hasEnded)
  {
    return state;
  }

  if (!this.states.stateName)
  {
    this.createState(stateName);
  } else {
    state = this.states.stateName;
  }

  this.desiredState = state;

  if (this.currentState === state)
  {
    this.end();
  }

  return state;
},
makeNew:function(theName){
  var newState = null;
if (!((this.get("states"))[theName]))
{
newState = {
  "name":theName,
  "data":
  {},
options:{
  success:function(obj){return Parse.Promise.as(obj);},
  error:function(error){return Parse.Promise.error(JSON.stringify(error));}}
};
  return Parse.Promise.as(newState);
  }
  return Parse.Promise.error("A state already exists with that name");
},
proceedToState:function(stateName)
{
  var makeNew = function(theName){
  var newState = null;
newState = {
  "name":theName,
  "data":
  {},
options:{
  success:function(obj){return Parse.Promise.as(obj);},
  error:function(error){return Parse.Promise.error(JSON.stringify(error));}}
};
  return Parse.Promise.as(newState);
  };
  var state = null;
  
  state =  function(stateNameString){return makeNew(stateNameString)};

  return state(stateName).then(function(promise){return promise},function(error){return error;});
},
failToState:function(stateName,errorMessage)
{
  return Parse.Promise.error(errorMessage);
},
getStatePath:function() {
   var currentStatePath = [];
   for (var i = 0; i < this.get("statePathIndex"); i++)
   {
    currentStatePath.push((this.get("statePath"))[i]);
   }
   return currentStatePath;
 },
 
 previousState:function(){

   if (this.get("statePathIndex") > 0)
    {
      var previous = (this.get("statePath"))[this.get("statePathIndex") - 1];
   
      if (previous)
      {
      return Parse.Promise.as(previous);
      }
    }
    return Parse.Promise.error("No previous state");
 },*/
                                        
                                        className:"State",
 defaults:{
  name:"defaultName",
  blankState:{"name":null,"data":null,"options":null},
  rootState:{"name":"initializing","data":{},options:{success:function(obj){return Parse.Promise.as(obj);},error:function(error){return Parse.Promise.error(JSON.stringify(error));}}},
  state:{},
  desiredState:null,
  endState:null,
  states:{"rootState":null,"desiredState":null,"state":null,"endState":null},
  hasEnded:false,
  success:function(obj){return state.options.success(obj);},
  error:function(error){return state.options.error(error);},
  statePath:[],
  statePathIndex:0
 },
initialize:function(attrs,options){
  // constructor
                                        console.log(this.className);
                                        console.log(JSON.stringify(this.defaults));
  /*if (this.toJSON())
  {
    options.success(Parse.Promise.as(this));
  }
  else{
    options.error(Parse.Promise.error(""+this.toString()))
  }*/
},
logState:function(){
                                        if (this)
                                        {
                                        if (this.toJSON())
                                        {
                                        console.log("Logging state: "+JSON.stringify(this.toJSON()));
                                        return Parse.Promise.as(JSON.stringify(this.toJSON()));
                                        }
                                        }
                                        return Parse.Promise.error("could not parse into JSON");
                                        },
                                        },{
                                          // class methods & properties
                                      });
// @pragma mark testFunctionState

var state = new FunctionState();
state.logState();

// @pragma mark testParseErrorUtils

/*Parse.Cloud.run("getParseErrorUtils").then(function(ParseErrorUtils){
  var errorUtility = new ParseErrorUtils;
var error = new Parse.Error(Parse.Error.VALIDATION_ERROR,"some message"); 
console.log(ParseErrorUtils.typeForCode(error.code));
});*/

