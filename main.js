var $ = function(selector) { return document.querySelectorAll(selector); };
var fst = function(list) { return list[0]; }
var canvas = fst($("canvas"));
var draw = canvas.getContext("2d");
var ta = fst($("textarea"));
var out = fst($("code"));
var writer = format(out);
var events = {
  shift13:run, // shift + enter
  selection9:indentSelection, // select text + tab
  shiftselection9:function(selection, bounds){ indentSelection(selection, bounds, true); },
  shift8:out.clear // shift + backspace KLUDGE: format(out) has to be called before this
};

window.addEventListener("error", log);

//a.addEventListener("mouseup", inputWatch(ta)); // mouse selection
ta.addEventListener("keydown", inputWatch(ta)); // detect tab
//ta.addEventListener("keypress", inputWatch(ta)); // detect tab

function indentSelection(text, bounds, invert) {
  // from http://jsbin.com/ijedi
  var indentation, newText;
  var start = bounds[0];
  var end = bounds[1];
  var removeSpace = /^(\s{1,2})/mg;
  var addSpace = /^(?=.+)/mg;
  var affectedLines = 0;
  // extend the selection start until the previous new line
  start = text.lastIndexOf("\n", start);
  // if there isn't a new line before,
  // then extend the selection until the beginning of the text
  if(start === -1)
    start = 0;
  // if the selection starts with a new line,
  // remove it from the selection
  if (text.charAt(start) == "\n")
    start += 1;
  // if the selection ends with a new line,
  // remove it from the selection
  if (text.charAt(end - 1) == "\n")
    end -= 1;
  // extend the selection end until the next new line
  end = text.indexOf("\n", end);
  // if there isn't a new line after,
  // then extend the selection end until the end of the text
  if (end === -1)
    end = text.length;
  // get text to indent
  indentation = text.substring(start, end);
  // count number of affected lines
  affectedLines = invert ? indentation.match(removeSpace).length : indentation.match(addSpace).length;
  // add two spaces/backspaces before new lines
  indentation = invert ? indentation.replace(removeSpace, "") : indentation.replace(addSpace, "  ");
  // rebuild the textarea content
  newText = text.substring(0, start);
  newText += indentation;
  newText += text.substring(end);
  ta.value = newText;
  // add/substract end after indentation
  invert ? (end -= affectedLines*2) : (end += affectedLines*2);
  // reselect text
  selectText(start, end);
}
function selectText(start, end) {
  ta.setSelectionRange(start, end);
}

function KeyEvent(shift, ctrl, alt, selection, charcode, value, extras) {
  this.shift = shift;
  this.ctrl = ctrl;
  this.alt = alt;  
  this.selection = selection;
  this.charCode = charcode;
  this.value = value;
  this.extras = extras;
}
KeyEvent.prototype.toString = function() {
  var self = this;
  return Object.keys(this).map(function(key) {
    var not = ["toString", "value", "extras"];
    var ret = (self[key] === true && key) || self[key];
    return !~not.indexOf(key) && ret || "";
  }).join("");
}

function inputWatch(field) {
  var notifyId;
  var inputs = [];
  return function(e) {
    e = e || window.event;
    var charCode = (e.which instanceof Number) ? e.which : e.keyCode;
    var value = field.value, isSelection = false, extras;
    if(field.selectionStart < field.selectionEnd) {
      isSelection = true;
      extras = [field.selectionStart, field.selectionEnd];
    }
    var ke = new KeyEvent(e.shiftKey, e.ctrlKey, e.altKey, isSelection, charCode, value, extras);    
//log(e.keyCode, charCode, ke.toString());
    inputs.push(ke);
    if(events[ke.toString()])
      e.preventDefault();
    if(notifyId)
      window.clearTimeout(notifyId);
    notifyId = window.setTimeout(runFunction, 180, inputs); // let me type :)
  }
}

function runFunction(inputs) {
  var shortcutFunction;
  inputs.forEach(function(keyevent) {
    shortcutFunction = events[ keyevent.toString() ];
    shortcutFunction && shortcutFunction(keyevent.value, keyevent.extras);
  });
  emptyArray(inputs);
}

function emptyArray(list) {
  list.forEach(function(item) { item = null; });
  list.length = 0;
}

function run(code) {
  out.clear();
  try {
    eval(code);
  } catch(e) {
    log(e);
  }
}

function log() {
  var args = Array.prototype.slice.call(arguments, 0).concat([null]);
  args.forEach(writer);
}

function singleForEach(obj, fnname) {
  return function(item, i, all) {
    obj[fnname](item);
  }
}

function createElement(name, value) {
  var html = document.createElement(name);
  html.innerHTML = value;
  return html;
}

function format(o) {
  o.clear = function() { out.innerHTML = ""; }
  return function(msg) {
    var f, html;
    if(msg === null) {
      html = createElement("br", msg);
    } else {
      f = classify(msg);
      html = createElement("span", f.value);        
      window.setTimeout(function(){ setClasses(html, f.cls); }, 1000);
    }
    o.appendChild(html);
  }
  function setClasses(html, cls) {
    if(cls.length)
      cls.forEach(singleForEach(html.classList, "add"));
  }
  function classify(msg) {
    var ret = { cls: [], value: "" };
    switch(typeof msg) {
      case "object":
        ret.value = JSON.stringify(msg, stringifyHostObject);
        ret.cls.push("obj");
        break;
      case "number":
        ret.value = msg;
        ret.cls.push("num");
        break;
      default:
        ret.value = msg;
    }
    return ret;
  }
  function stringifyHostObject(key, value) {
    if (value instanceof Event) {
      return { type: value.type, name: value.name, message: value.message };
    }
    if(value instanceof Error) {
      return { name: value.toString(), category: value.category, filename: value.filename, line: value.lineNumber, stack: value.stack };
    }
    return value;
  }
}