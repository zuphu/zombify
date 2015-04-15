var fs = require('fs');
var http = require('http');
var readline = require('readline');
var connect = require('connect')();

var readFile = {
   worldDimension: { N: 0 },
   initPositionZombie: [],
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

function WorldMap (readFile) {
   this.dimension = readFile.worldDimension.N;
   this.zombies   = readFile.initPositionZombie;
   console.log("ALL THE ZOMBIES!!!");
   console.log(this.zombies);
   this.creatures = readFile.creaturePositions;
   this.movement  = readFile.zombieMoveList;
   this.initBoard();
}

WorldMap.prototype.initBoard = function() {
   this.drawBoard();
   this.displayBoard();

   while (counter != this.zombies.length) {
      var counter = 0;
      for (var x = 0; x < this.zombies.length; ++x) {
         if (this.zombies[x].canMove == false)
           counter++;
      }
      for (var i = 0; i < this.zombies.length; ++i)
         this.stepZombie(i);

      this.drawBoard();
      this.displayBoard();
   }
   console.log(this.zombies);
}

WorldMap.prototype.drawBoard = function () {
   this.board = new Array(this.dimension);
   for (var x = 0; x < this.dimension; ++x)
      this.board[x] = new Array();
   var board = this.board;

   //fill board
   for(row = 0; row < this.dimension; ++row) { //row
      for(col = 0; col < this.dimension; ++col) { //column
         for (var i = 0; i < this.zombies.length; ++i) {
            if (this.zombies[i].x == row && this.zombies[i].y == col) {
               board[col][row] = "z";
             }
            else {
               for (var i = 0; i < this.creatures.length; ++i) {
                  if (this.creatures[i].x == row && this.creatures[i].y == col){
                     board[col][row] = "c";
                     break;
                  }
                  else {
                     board[col][row] = "-";
                  }
               }
            }
         }
      }
   }
}

WorldMap.prototype.displayBoard = function() {
   console.log("display board");

   for(row = 0; row < this.dimension; ++row) { //row
      for(col = 0; col < this.dimension; ++col) { //column
        process.stdout.write(this.board[row][col]); 
      }
      process.stdout.write("\n")
   }
}

WorldMap.prototype.stepZombie = function(i) {
   if (this.zombies[i].moveSequence >= this.movement.length) {
      console.log("LEEEEEEEEEEEEEEEEEEEROY");
      this.zombies[i].canMove = "false";
      return;
   }

   var ms = this.zombies[i].movementSequence;
   var m = this.movement[ms]
   switch (m) {
      case "U"://up
         this.zombies[0].y -= 1;
         console.log("up");
         console.log(this.zombies);
         break;
      case "R"://right
         this.zombies[0].x += 1;
         console.log("right");
         console.log(this.zombies);
         break;
      case "D"://down
         this.zombies[0].y += 1;
         console.log("down");
         console.log(this.zombies);
         break;
      case "L"://left
         this.zombies[0].x -= 1;
         console.log("left");
         console.log(this.zombies);
         break;
   }
   this.zombies[i].moveSequence += 1;
   console.log(this.zombies[i].moveSequence);
   console.log(this.movement.length);
   console.log(this.zombies.canMove);
   this.zombieBite();
   //var x = new cord_xy(4,4)
   //this.zombies.push(x);
}

WorldMap.prototype.zombieBite = function() {

}

function cord_xy (x, y) {
   this.x = x;
   this.y = y;
}

function zmove (x, y) { 
   cord_xy.call(this, x, y);
   this.moveSequence = 0;
   this.canMove = true;
}
zmove.prototype = new cord_xy();
zmove.prototype.constructor = zmove;

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
         var cords = new zmove( parseInt(xy[0]), parseInt(xy[1]) );
         readFile.initPositionZombie.push(cords);;
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
   console.log(xy);
   var worldMap = new WorldMap(readFile)

   console.log("board is:" + worldMap);
}

connect.use("/", function(req,res) {
    res.end("Fear the reaper!!!");
});

var server = http.createServer(connect);

server.listen(3000, function() {
   console.log("Server listenning on port 3000)");

});

