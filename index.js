var fs = require('fs');
var http = require('http');
var readline = require('readline');
var connect = require('connect')();

var readFile = {
   worldDimension: { N: 0 },
   initPositionZombie: {},
   creaturePositions: [],
   zombieMoveList: []
};

var lineNumber = 0;

var FileLine = {
   AREA_DIMENSIONS: 1,
   ZOMBIE_COORD:    2,
   CREATURE_COORD:  3,
   ZOMBIE_MOVELIST: 4
}

function cord_xy (x, y) {
   this.x = x;
   this.y = y;
}

var rd = readline.createInterface({
    input: fs.createReadStream('./dicks.txt'),
    output: process.stdout,
    terminal: false
});

rd.on('line', function(line) {
   ++lineNumber;
   switch (lineNumber) {
      case FileLine.AREA_DIMENSIONS:
         readFile.worldDimension.N = parseInt(line);
         console.log(readFile.worldDimension.N);
         break;
      case FileLine.ZOMBIE_COORD:
         var xy = line.split(" ");
         readFile.initPositionZombie = new cord_xy(parseInt(xy[0]), parseInt(xy[1]));;
         console.log(readFile.initPositionZombie);
         break;
      case FileLine.CREATURE_COORD:
         var cords = line.split(",");
         cords.forEach(function (cord){
            var xy = cord.split(" ");
            var x = parseInt(xy[0]); var y = parseInt(xy[1]);
            readFile.creaturePositions.push(new cord_xy(x, y));
         });
         console.log(readFile.creaturePositions);
         break;
      case FileLine.ZOMBIE_MOVELIST:
         for (x = 0; x < line.length; ++x) {
            readFile.zombieMoveList.push(line[x]);
         }
         console.log(readFile.zombieMoveList);
         break;
   }
   if (lineNumber >= 4)
      createScenario();
});

function createScenario () {
   var n = readFile.worldDimension.N;
   var xy = readFile.initPositionZombie;
   console.log("ZOMBIE!!!" + xy.x + " " + xy.y);
   var board = { length: n,
                 width:  n
               };
   
   console.log("board is:" + board);
}

connect.use("/", function(req,res) {
    res.end("Fear the reaper!!!");
});

var server = http.createServer(connect);

server.listen(3000, function() {
   console.log("Server listenning on port 3000)");

});

