var $ = function(selector) { return document.querySelectorAll(selector); };
var fst = function(list) { return list[0]; }
var canvas = fst($("canvas"));
var draw = canvas.getContext("2d");
var ta = fst($("textarea"));
var out = fst($("code"));
var writer = format(out);
var events = {
  Öshift13:run, // shift + enter
  Ö9:indentSelection, // tab
  Öshift9:function(text, bounds){ indentSelection(text, bounds, true); }, // shift + tab
  Öselection9:indentSelection, // select text + tab
  Öshiftselection9:function(text, bounds){ indentSelection(text, bounds, true); }, // shift + select text + tab
  Öshift8:out.clear // shift + backspace KLUDGE: format(out) has to be called before this
};
var config = {
  indentation: 2
}

window.addEventListener("error", log);

polyfills();

//a.addEventListener("mouseup", inputWatch(ta)); // mouse selection
ta.addEventListener("keydown", inputWatch(ta)); // detect tab
//ta.addEventListener("keypress", inputWatch(ta)); // detect tab

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
  return "Ö" + Object.keys(this).map(function(key) {
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
    var value = field.value, isSelection = false, extras, ke;
    if(field.selectionStart < field.selectionEnd) {
      isSelection = true;
    }
    extras = [field.selectionStart, field.selectionEnd];
    ke = new KeyEvent(e.shiftKey, e.ctrlKey, e.altKey, isSelection, charCode, value, extras);    
// log(ke.toString());
    inputs.push(ke);
    if(events[ke.toString()])
      e.preventDefault();
    if(notifyId)
      window.clearTimeout(notifyId);
    notifyId = window.setTimeout(runFunction, 60, inputs); // let me type :)
  }
}

function runFunction(inputs) {
  var shortcutFunction;
  inputs.forEach(function(keyevent) {
    shortcutFunction = events[ keyevent.toString() ];
    shortcutFunction && window.setTimeout(shortcutFunction, 0, keyevent.value, keyevent.extras);
  });
  emptyArray(inputs);
}

function emptyArray(list) {
  list.forEach(function(item) { return item = null; });
  list.length = 0;
}

function indentSelection(text, bounds, invert) {
/* fixed issues:
1. shift+tab at end of line deletes text - should indent if possible or return
2. shift at end of all text indent line - should insert spaces
3. shift+tab at end of all text throws an error
4. shift+tab somewhere in a line throws when reverse indentation is not possible
test text:
fff
 fff
fff
*/
  // from http://jsbin.com/ijedi
  var indentation, newText;
  var spaces = " ".repeat(config.indentation || 2);
  var numberOfIndents = spaces.length;
  var start = bounds[0];
  var end = bounds[1];
  var singleSelection = start === end;
  var removeSpace = new RegExp("^(\\s{1," + numberOfIndents + "})","mg");
  var addSpace = /^(?=.+)/mg;///^(?=[^\S\n]|.+)/mg;///^(?=.+)/mg;///^(?=.+|\s)/mg;///^.?/mg;
  var empty = /^\s*$/g;
  var affectedLines = 0;
  // extend the selection start until the previous new line
  start = text.lastIndexOf("\n", (singleSelection && invert) ? start-1 : start );
  // if there isn't a new line before,
  // then extend the selection until the beginning of the text
  if(start === -1)
    start = 0;
  // if the selection starts with a new line,
  // remove it from the selection
  if (text.charAt(start) === "\n")
    start += 1;

  // if the selection ends with a new line,
  // remove it from the selection
  if (text.charAt(end - 1) === "\n")
    end -= 1;
  // extend the selection end until the next new line
  end = text.indexOf("\n", end);
  // if there isn't a new line after,
  // then extend the selection end until the end of the text
  if (end === -1)
    end = text.length;
  // get text to indent
  indentation = text.substring(start, end);

  // test if the indendation selection is empty
  // note: or singleSelection could be used here to implement normal tab behavior
  if(empty.test(indentation) || singleSelection) {
    affectedLines = 1;
    // fix for 1. shift+tab at end of line deletes text - should indent if possible or return
    // note this is also runs for shift+tab in the middle of the last line
    if( invert && !empty.test(text.substring(Math.min(start, end)-numberOfIndents, end)) ) {
      var line = text.substring(Math.min(start, end), end);
      // test if reverse identation is possible (abort if it means deletetion of text) and return if not
      if(line.length === 0 || !empty.test(text.substring(bounds[0]-numberOfIndents, bounds[0])) )
        return;
    }

    if(invert) {
      indentation = ""; // nothing to indent
      start = bounds[0] - numberOfIndents; // "loose" n chars
      end = bounds[0]
    } else {
      indentation = spaces;
      start = end = bounds[0];
    }
  } else {
    // test if reverse identation is possible and return if not
    if(invert && !removeSpace.test(indentation))
      return;
    // count number of affected lines
    affectedLines = invert ? indentation.match(removeSpace).length : indentation.match(addSpace).length;
    // add two spaces/backspaces before new lines
    indentation = invert ? indentation.replace(removeSpace, "") : indentation.replace(addSpace, spaces);
  }
  // rebuild the textarea content
//log("start length:", text.length);
  newText = text.substring(0, start);
  newText += indentation;
  newText += text.substring(end);
//log("end length:", newText.length);
  ta.value = newText;
  if(singleSelection) {
    start = end = bounds[0] + (invert ? -numberOfIndents : numberOfIndents);
  } else {
    // add/substract end after indentation
    invert ? (end -= affectedLines*numberOfIndents) : (end += affectedLines*numberOfIndents);
  }
  // reselect text
  selectText(start, end);
}

function selectText(start, end) {
  ta.setSelectionRange(start, end);
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
  var isScrolledToBottom = out.scrollHeight - out.clientHeight < out.scrollTop + 2; // allow 1px inaccuracy 
  args.forEach(writer);
  // scroll to bottom if isScrolledToBottom
  if(isScrolledToBottom)
    out.scrollTop = out.scrollHeight - out.clientHeight;
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
      window.setTimeout(function(){ setClasses(html, f.cls); }, 600);
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
      case "boolean":
        ret.value = msg;
        ret.cls.push(msg.toString());
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

function polyfills() {
  // from https://github.com/paulmillr/es6-shim/blob/master/es6-shim.js
  if(!String.prototype.repeat) {
    String.prototype.repeat = function(times) {
      return repeat(this, times);
    };
    function repeat(s, times) {
      if (times < 1) return '';
      if (times % 2) return repeat(s, times - 1) + s;
      var half = repeat(s, times / 2);
      return half + half;
    };
  }
}