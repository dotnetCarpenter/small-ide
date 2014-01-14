var formatDelay = 100;
var testObj = { innerHTML: "", foo: function(){ return "bar"; }, bar: function(a,b,c){ return a+b+c; } };
setTimeout(function() { testObj.innerHTML = "foobar"; }, 99);
/*
function add(a,b) {
  return a+b;
}
var add5 = partial(add,5);
log(add5(5));
*/

var result1 = late(prop(testObj), "innerHTML");
var result2 = late(func(testObj), "foo");
var f = partial(func(testObj), "bar", "j","o","n");
var result3 = partial(late(f, "bar"));

//log(f("j","o","n"));
//var getter3 = partial(func(testObj), "bar", "j","o","n");
//var result3 = partial(getter3, late(getter3, "bar"));
result1("foobar");
result2("bar");
result3("jon")

function late(getter, name) {
  return function(expected) {
    setTimeout(function() {
      log(getter(name) === expected);
    }, formatDelay);
  }
}
function prop(obj) {
  return function (name) {
    return obj[name];
  }
}
function func(obj) {
  return function(name) {
  var args = Array.prototype.slice.call(arguments, 1);
//log("name:", name, "args:",args)
    return obj[name].apply(undefined, args);
  }
}
function partial(fn) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    return fn.apply(undefined, args.concat(Array.prototype.slice.call(arguments, 0)));
  }
}