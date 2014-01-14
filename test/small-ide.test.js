describe('small-ide', function() {
  it("should have a config object", function() {
    expect(config).toBeDefined();
    expect(config.indentation).toBeDefined();
    expect(config.indentation).toEqual(jasmine.any(Number));
  })

  describe('Canvas', function() {
    it("canvas and draw should be defined", function() {
      expect(canvas).toBeDefined();
      expect(draw).toBeDefined();
    });
  });

  describe("Console", function() {
    var formatDelay = 600; // check source if this is altered

    function wait() {
      jasmine.clock().tick(formatDelay);
    }

    it("log and out should be defined", function() {
      expect(log).toBeDefined();
      expect(out).toBeDefined();
      expect(out.clear).toBeDefined();
    })

    beforeEach(function() {
      jasmine.clock().install();
    });

    afterEach(function() {
      out.clear();
      jasmine.clock().uninstall();
    });

    it("should display string(s)", function() {
      var string = "string", expected = "<span>" + string + "</span><br>";
      log(string);
      expect(out.innerHTML).toEqual(expected);
      expected += "<span>" + string + "</span><span>" + string + "</span><br>";
      log(string, string);
      expect(out.innerHTML).toEqual(expected);
    });

    it("should display number(s)", function() {
      var number = 123, expected = '<span class="num">' + number + "</span><br>";
      
      log(number);
      wait();
      expect(out.innerHTML).toEqual(expected);

      expected += '<span class="num">' + number + '</span><span class="num">' + number + '</span><br>';
      log(number, number)
      wait();
      expect(out.innerHTML).toEqual(expected);
    });

    it("should display object(s)", function() {
      var obj = { foo: "bar", num:123, list: [1,2,3] },
        expected = '<span class="obj">' + JSON.stringify(obj) + "</span><br>"
      log(obj);
      wait();
      expect(out.innerHTML).toEqual(expected);

      expected += '<span class="obj">' + JSON.stringify(obj) + '</span>' + '<span class="obj">' + JSON.stringify(obj) + '</span><br>';
      log(obj, obj);
      wait();
      expect(out.innerHTML).toEqual(expected);
    });

    it("should display arrays(s)", function() {
      var arr = [1,2,3], expected = '<span class="obj">' + JSON.stringify(arr) + "</span><br>"
      log(arr);
      wait();
      expect(out.innerHTML).toEqual(expected);

      expected += '<span class="obj">' + JSON.stringify(arr) + '</span>' + '<span class="obj">' + JSON.stringify(arr) + '</span><br>';
      log(arr, arr);
      wait();
      expect(out.innerHTML).toEqual(expected);
    });

    it("should scroll to the bottom if there is more elements logged that it can display", function() {
      var expected = '<span class="num">0</span><br><span class="num">1</span><br><span class="num">2</span><br><span class="num">3</span><br><span class="num">4</span><br><span class="num">5</span><br><span class="num">6</span><br><span class="num">7</span><br><span class="num">8</span><br><span class="num">9</span><br><span class="num">10</span><br>';
      for(var i = 0; log(i), i < 10; ++i);
      var scrollTop = out.scrollHeight - out.clientHeight;
      expect(out.scrollTop).toBe(scrollTop);
      // assert than the console contains what we expect
      wait();
      expect(out.innerHTML).toBe(expected);
    })

    it("unless the user scrolls the console content", function(){
      var expected = '<span class="num">0</span><br><span class="num">1</span><br><span class="num">2</span><br><span class="num">3</span><br><span class="num">4</span><br><span class="num">5</span><br><span class="num">6</span><br><span class="num">7</span><br><span class="num">8</span><br><span class="num">9</span><br><span class="num">10</span><br><span>extra line</span><br>';
      var scrollTop = 20;
      for(var i = 0; log(i), i < 10; ++i);
      out.scrollTop = scrollTop;
      log("extra line");
      expect(out.scrollTop).toBe(scrollTop);
      // assert than the console contains what we expect
      wait();
      expect(out.innerHTML).toBe(expected);
    });

  });

  describe("Editor", function() {
    var statusQuo = "fff\n fff\nfff";
    function wait() {
      // the editor response time is 10ms and happen.js takes some time too
      jasmine.clock().tick(200);
    }

    it("ta should be defined", function() {
      expect(ta).toBeDefined();
      expect(selectText).toBeDefined();
    });

    describe("indentation", function() {
      beforeEach(function() {
        ta.value = statusQuo;
        jasmine.clock().install();
      });

      afterEach(function() {
        out.clear();
        jasmine.clock().uninstall();
        config.indentation = 2;
      });

      it("should make indentation of a selection if tab", function() {
        var expected = "fff\n   fff\n  fff";
        selectText(5, 12);
        happen.once(ta, {
          type: "keydown",
          keyCode: 9
        });
        wait()
        expect(ta.value).toEqual(expected);
      });

      it("should make unindentation of a selection if shift+tab", function() {
        var expected = "fff\nfff\nfff";
        selectText(5, 12);
        happen.once(ta, {
          type: "keydown",
          keyCode: 9,
          shiftKey: true
        });
        wait()
        expect(ta.value).toEqual(expected);
      });

      it("should make a 4 space indentation of a selection if config.indentation = 4 (tab)", function() {
        var expected = "fff\n     fff\n    fff";
        config.indentation = 4;
        selectText(5, 12);
        happen.once(ta, {
          type: "keydown",
          keyCode: 9
        });
        wait()
        expect(ta.value).toEqual(expected);
      });

      it("should make a 4 space unindentation of a selection if config.indentation = 4 (tab+shift)", function() {
        var expected = statusQuo;
        ta.value = "fff\n     fff\n    fff";
        config.indentation = 4;
        selectText(5, 21);
        happen.once(ta, {
          type: "keydown",
          keyCode: 9,
          shiftKey: true
        });
        wait()
        expect(ta.value).toEqual(expected);
      });

      it("should make indentation of a line if tab and no selection (tab)", function() {
        var expected = "  fff\n fff\nfff";
        selectText(0, 0);
        happen.once(ta, {
          type: "keydown",
          keyCode: 9
        });
        wait()
        expect(ta.value).toEqual(expected);
      });

      xit("should make unindentation of a line if tab just before text with space before (shift+tab)", function() {
        // current behavior is to remove \n also - this should probably change in the future
        var expected = "fff\nfff\nfff";
        selectText(5, 5);
        happen.once(ta, {
          type: "keydown",
          keyCode: 9,
          shiftKey: true
        });
        wait()
        expect(ta.value).toEqual(expected);
      });

      it("should make unindentation of a line if tab just before text with space before (shift+tab)", function() {
        ta.value = "fff\n  fff\nfff"
        var expected = "fff\nfff\nfff";
        selectText(6);
        happen.once(ta, {
          type: "keydown",
          keyCode: 9,
          shiftKey: true
        });
        wait()
        expect(ta.value).toEqual(expected);
      });

      it("should not delete text at end of a line but indent if possible or return (shift+tab)", function() {
        var expected = statusQuo;
        selectText(13);
        happen.once(ta, {
          type: "keydown",
          keyCode: 9,
          shiftKey: true
        });
        wait()
        expect(ta.value).toEqual(expected);
      });

      it("shift at end of all text indent line - should insert spaces (shift)", function() {
        var expected = "fff\n fff  \nfff";
        selectText(8);
        happen.once(ta, {
          type: "keydown",
          keyCode: 9
        });
        wait()
        expect(ta.value).toEqual(expected);
      });

      it("shift+tab at end of all text should not throw an error (shift+tab)", function() {
        var expected = "fff\n fff\nfff  ";
        selectText(12);
        happen.once(ta, {
          type: "keydown",
          keyCode: 9
        });
       // expect(window).not.toThrow(); actual has to be a function so this doesn't work
        wait()
        expect(ta.value).toEqual(expected);
      });

      it("shift+tab somewhere in a line should do nothing when reverse indentation is not possible (shift+tab)", function() {
        var expected = statusQuo;
        selectText(2);
        happen.once(ta, {
          type: "keydown",
          keyCode: 9,
          shiftKey: true
        });
       // expect(window).not.toThrow(); actual has to be a function so this doesn't work
        wait()
        expect(ta.value).toEqual(expected);
      });
    });

  });

});