small-ide
=========

A small browser based IDE, featuring a canvas element, a console and a text area.


## Supported API

`log` - write variables to the console

`canvas` - the canvas element

`draw` - the 2d context for the canvas

`config` - just write `log(config)` in the editor and run the code (`shift` + `enter`)


## Shortcuts

`shift` + `enter` - run code

`shift` + `backspace` - clear console

**Indentations**:

Without selection

`tab` - insert two, or as configured, spaces (e.g. `config.indentation = 4`)

`shift` + `tab` - delete two, or as configured, spaces to the left. Aborts if it means deletetion of text

With a selection:

`tab` - indentate selected line(s)

`shift` + `tab` - reverse indent code


**Tested in**
Firefox 26, Chrome 31 and Internet Explorer 11