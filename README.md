small-ide
=========

A small browser based IDE, featuring a canvas element, a console (with [sticky scroll](http://stackoverflow.com/questions/18614301/keep-overflow-div-scrolled-to-bottom-unless-user-scrolls-up/21067431#21067431)) and an editor.

**Developed for**
Firefox 26, Chrome 31 and Internet Explorer 11

I recommend using [Hacker's Keyboard](https://play.google.com/store/apps/details?id=org.pocketworkstation.pckeyboard) on Android.

[DEMO](http://dotnetcarpenter.github.io/small-ide/)
[HISTORY](HISTORY.md)
[UNLICENSE](UNLICENSE.md)

## Supported API

`log` - write variables to the console

`canvas` - the canvas element

`draw` - the 2d context for the canvas

`config` - just write `log(config)` in the editor and run the code (`shift` + `enter`)


## Shortcuts

`shift` + `enter` - run code

`shift` + `backspace` - clear console

**Indentations**:

Without a selection

`tab` - insert two, or as configured, spaces (e.g. `config.indentation = 4`)

`shift` + `tab` - delete two, or as configured, spaces to the left. Aborts if it means deletetion of text

With a selection:

`tab` - indentation of selected line(s)

`shift` + `tab` - reverse indentation of selected line(s)