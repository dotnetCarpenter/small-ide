describe('small-ide', function() {
  it("should have a config object", function() {
    expect(config).toBeDefined(undefined);
    expect(config.indentation).toBeDefined(undefined);
    expect(config.indentation).toEqual(jasmine.any(Number));
  })

  describe('Canvas', function() {
    it("canvas and draw should be defined", function() {
      expect(canvas).toBeDefined(undefined);
      expect(draw).toBeDefined(undefined);
    });
  });

  describe("Console", function() {
    var formatDelay = 600; // check source if this is altered

    it("log should be defined", function() {
      expect(log).toBeDefined(undefined);
      expect(out).toBeDefined(undefined);
      expect(out.clear).toBeDefined(undefined);
    })

    // beforeEach(function() {
    //   timerCallback = jasmine.createSpy('timerCallback');
    //   jasmine.Clock.useMock();
    // });

    afterEach(function() {
      out.clear();
    });

    it("should display string(s)", function() {
      var string = "string", expected = "<span>" + string + "</span><br>";
      log(string);
      expect(out.innerHTML).toEqual(expected);
      expected += "<span>" + string + "</span><span>" + string + "</span><br>";
      log(string, string);
      expect(out.innerHTML).toEqual(expected);
    });

    it("should display number", function(done) {
      var number = 123, expected = '<span class="num">' + number + "</span><br>"
      log(number);
      setTimeout(function() {
        expect(out.innerHTML).toEqual(expected);
        done();
      }, formatDelay);
    });

    it("should display object", function(done) {
      var obj = { foo: "bar", num:123, list: [1,2,3] },
        expected = '<span class="obj">' + JSON.stringify(obj) + "</span><br>"
      log(obj);
      setTimeout(function() {
        expect(out.innerHTML).toEqual(expected);
        done();
      }, formatDelay);
    });

    it("should display arrays", function(done) {
      var arr = [1,2,3], expected = '<span class="obj">' + JSON.stringify(arr) + "</span><br>"
      log(arr);
      setTimeout(function() {
        expect(out.innerHTML).toEqual(expected);
        done();
      }, formatDelay);
    });

    it("should scroll to the bottom if there is more elements logged that it can display", function(done) {
      var expected = '<span class="num">0</span><br><span class="num">1</span><br><span class="num">2</span><br><span class="num">3</span><br><span class="num">4</span><br><span class="num">5</span><br><span class="num">6</span><br><span class="num">7</span><br><span class="num">8</span><br><span class="num">9</span><br><span class="num">10</span><br>';
      for(var i = 0; log(i), i < 10; ++i);
      var scrollTop = out.scrollHeight - out.clientHeight;
      expect(out.scrollTop).toBe(scrollTop);
      // assert than the console contains what we expect
      setTimeout(function() {
        expect(out.innerHTML).toBe(expected);
        done();
      }, formatDelay);      
    })

    it("unless the user scrolls the console content", function(){
      var expected = '<span class="num">0</span><br><span class="num">1</span><br><span class="num">2</span><br><span class="num">3</span><br><span class="num">4</span><br><span class="num">5</span><br><span class="num">6</span><br><span class="num">7</span><br><span class="num">8</span><br><span class="num">9</span><br><span class="num">10</span><br><span>extra line</span><br>';
      var scrollTop = 20;
      for(var i = 0; log(i), i < 10; ++i);
      out.scrollTop = scrollTop;
      log("extra line");
      expect(out.scrollTop).toBe(scrollTop);
      // assert than the console contains what we expect
      setTimeout(function() {
        expect(out.innerHTML).toBe(expected);
        done();
      }, formatDelay);  
    });

  });

  describe("Editor", function() {
    it("canvas and draw should be defined", function() {
      expect(ta).toBeDefined(undefined);
    })
  });

});