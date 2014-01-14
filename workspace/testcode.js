draw.fillStyle="#FF0000";
draw.fillRect(0,0,150,75)
function P(x,y){this.x=x;this.y=y;}
//var move1 = [new P(20,20),new P(20,20)];
var move2 = [new P(20,20),new P(100,100)];
var move3 = [new P(90,85),new P(10,105)];
var b1 = new P(8,8), m1 = new P(20,20);
var b2 = new P(80,80), m2 = new P(90,85);
//var b3 = new P(0,100), m3 = new P(10, 105);
function translate(origin) {
    //origin.n();
    return function(box, mouse) {
        //box.n();mouse.n();
        return function(point) {
log("X", origin.x, mouse.x, box.x, point.x);
log("Y", origin.y, mouse.y, box.y, point.y);
            return new P(
                (origin.x+mouse.x+box.x)*-1 + point.x,
                (origin.y+mouse.y+box.y)*-1 + point.y
            );
        }
    }
}
var t = translate(new P(8,8));
//var t1 = t(b1);
var t2 = t(b1,m1);
var t3 = t(b2,m2);
log( move2.map(t2));
log( move3.map(t3) );