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

   count = 0;
   console.log("xxxxxxxxxxxxxxxxxxx");
   console.log(count);
   console.log(this.zombies.length);
   while (count != this.zombies.length) {
      count = 0;
      for (var x = 0; x < this.zombies.length; ++x) {
         console.log(this.zombies);
         console.log("CAN MOVE?");
         console.log(this.zombies[x].canMove);
         if (!this.zombies[x].canMove) {
            count++;
         }
      }
      console.log("COUNTER:" + count);
      for (var i = 0; i < this.zombies.length && count != this.zombies.length; ++i) {
         this.stepZombie(i);
         if ( this.zombieBite(i) ) {
            this.zombies.push( new zmove(this.zombies[i].x, this.zombies[i].y) );
            console.log("vbitepost");
         }
         else {
            console.log("whitebite");
         }
         this.drawBoard();
         console.log("after draw board");
         this.displayBoard();
      }
   }
   console.log(this.zombies);
}

WorldMap.prototype.drawBoard = function () {
   this.board = new Array(this.dimension);
   for (var x = 0; x < this.dimension; ++x)
      this.board[x] = new Array();
   var board = this.board;
   var zombies = this.zombies;
   var creatures = this.creatures;
   //fill board
   for(row = 0; row < this.dimension; ++row)
      for(col = 0; col < this.dimension; ++col)
         board[col][row] = "-";

   drawZombies();
   drawCreatures();

   function drawZombies() {
      for (var i = 0; i < zombies.length; ++i)
         board[zombies[i].y][zombies[i].x] = "z";
   }

   function drawCreatures() {
      for (var i = 0; i < creatures.length; ++i)
         board[creatures[i].y][creatures[i].x] = "c";
   }
}

WorldMap.prototype.displayBoard = function() {

   for(row = 0; row < this.dimension; ++row) { //row
      for(col = 0; col < this.dimension; ++col) { //column
        process.stdout.write(this.board[row][col]); 
      }
      process.stdout.write("\n")
   }
}

WorldMap.prototype.stepZombie = function(i) {
   if (this.zombies[i].moveSequence == this.movement.length) {
      this.zombies[i].canMove = false;
      return;
   }

   var ms = this.zombies[i].moveSequence;
   var m = this.movement[ms]
   switch (m) {
      case "U"://up
         if ((this.zombies[i].y - 1) > -1) {
            this.zombies[i].y -= 1;
            console.log("up");
            console.log(this.zombies);
         }
         break;
      case "R"://right
         if ((this.zombies[i].x + 1) < this.dimension) {
            this.zombies[i].x += 1;
            console.log("right");
            console.log(this.zombies);
         }
         break;
      case "D"://down
            this.zombies[i].y += 1;
            console.log("down");
            console.log(this.zombies);
         break;
      case "L"://left
      if ((this.zombies[i].x - 1) > -1) {
         this.zombies[i].x -= 1;
         console.log("left");
         console.log(this.zombies);
      }
      else {
         console.log("Zombies can't go through walls!");
      }
      break;
   }
   this.zombies[i].moveSequence += 1;
   //console.log(this.zombies[i]);
   //console.log(this.zombies[i].moveSequence);
   //console.log(this.movement.length);
   //console.log(this.zombies[i].canMove);
   //this.zombieBite(i);
   //var x = new cord_xy(4,4)
   //this.zombies.push(x);
}

WorldMap.prototype.zombieBite = function(i) {
   zx = this.zombies[i].x;
   zy = this.zombies[i].y;
   for (var x = 0; x < this.creatures.length; ++x) {
      if (zx == this.creatures[x].x &&
          zy == this.creatures[x].y) {
         console.log("Zombie has bitten a poor creature!");
         var creatureDeathIndex = -1;
         this.creatures.forEach(function(creature, i) {
            if (creature.x == zx && creature.y == zy) {
               creatureDeathIndex = i;
            }
         });
         console.log("A critter has been slain!");
         console.log(this.creatures[creatureDeathIndex]);
         this.creatures.splice(creatureDeathIndex, 1);
         //this.spawnZombie(zx, zy);
         return true;
      }
   }
   return false;
}

WorldMap.prototype.spawnZombie = function(zx, zy) {
   console.log("new zombie has spawned!");
   this.zombies.push(new zmove(zx, zy));
   console.log(this.zombies);
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
   var worldMap = new WorldMap(readFile)
}

connect.use("/", function(req,res) {
   res.setHeader("Content-type", "application/json");
   res.write(JSON.stringify({score:3,
            babes:4
            }));
});

var server = http.createServer(connect);

server.listen(3000, function() {
   console.log("Server listenning on port 3000)");

});

