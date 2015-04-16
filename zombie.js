/* author:  Anthony Guevara
   date:    16 April 2015
   info:    Zombie Apocalypse
   pre-req: Nodejs
   version: 3
   usage:   node zombie filename
   info:    Zombie Apocalypse V3. An input file is supplied through command line 
            argument (see usage above). Zombies(z) and creatures(c) are placed
            based on co-ordinates read from file. The zombie moves based on a chain
            of input sequences read from the input file. If a zombie touches a
            creature, the creature becomes a zombie and will inherit the zombies
            movement sequence.
*/
var http = require('http');
var readline = require('readline');
var fs = require('fs');
var lineNumber = 0;
var fileName = "";

//Argument position from command line
var Arguments = {
   NODE:     0,
   PATH:     1,
   FILENAME: 2
}

//What to read on specific file number
var FileLine = {
   AREA_DIMENSIONS: 1,
   ZOMBIE_COORD:    2,
   CREATURE_COORD:  3,
   ZOMBIE_MOVELIST: 4
}

//Maxiumum number of lines to read from an input file
var LINES_LIMIT = 4;

//Items read from an input file
var readFile = {
   worldDimension     : { N: 0 },
   initPositionZombie : [],
   creaturePositions  : [],
   zombieMoveList     : [],
   loaded             : false
};

//Store co-ordinates
function cord_xy (x, y) {
   this.x = x;
   this.y = y;
}

//Store co-ordinates in addition to zombie attributes
function zmove (x, y) { 
   cord_xy.call(this, x, y);
   this.moveSequence = 0;
   this.canMove = true;
}
zmove.prototype = new cord_xy();
zmove.prototype.constructor = zmove;

//Read command line arguments
var args = function processArguments() {
   fileName = process.argv[Arguments.FILENAME];
   if (!fileName) {
      console.log("Error: A filename must be passed as a parameter.");
      console.log("Usage: node index filename");
      process.exit();
   }
}();

//Attributes for reading an input file
var rd = readline.createInterface({
    input: fs.createReadStream('./' + fileName),
    output: process.stdout,
    terminal: false
});

//Read line by line of input file
rd.on('line', function(line) {
   ++lineNumber;
   switch (lineNumber) {
      case FileLine.AREA_DIMENSIONS:
         readFile.worldDimension.N = parseInt(line);
         break;
      case FileLine.ZOMBIE_COORD:
         var xy = line.split(" ");
         var cords = new zmove( parseInt(xy[0]), parseInt(xy[1]) );
         readFile.initPositionZombie.push(cords);;
         break;
      case FileLine.CREATURE_COORD:
         var cords = line.split(",");
         cords.forEach(function (cord){
            var xy = cord.split(" ");
            var x = parseInt(xy[0]); var y = parseInt(xy[1]);
            readFile.creaturePositions.push(new cord_xy(x, y));
         });
         break;
      case FileLine.ZOMBIE_MOVELIST:
         for (x = 0; x < line.length; ++x) {
            readFile.zombieMoveList.push(line[x]);
         }
         break;
   }
   if (lineNumber >= LINES_LIMIT) { //all lines have been read
      readFile.loaded = true;
      createScenario(); //Begin execution
   }
});


//Start the scenario
function createScenario () {
   worldMap = new WorldMap(readFile);
}

/* author:  Anthony Guevara
   date:    16 April 2015
   info:    WorldMap initialzes variables read from file
*/
function WorldMap (readFile) {
   this.dimension = readFile.worldDimension.N;
   this.zombies   = readFile.initPositionZombie;
   this.creatures = readFile.creaturePositions;
   this.movement  = readFile.zombieMoveList;
   this.score     = 0;
   this.startScenario();//begin zombie apocalypse
}

/* author:  Anthony Guevara
   date:    16 April 2015
   info:    Begin the scenario by displaying the starting position of zombies
            and creatures. Zombies move until movement sequence runs out.
*/
WorldMap.prototype.startScenario = function() {
   console.log("[Begin Scenario]");
   this.drawAndDisplayBoard();
   var count = 0;
   while (count != this.zombies.length) {
      count = 0;
      for (var x = 0; x < this.zombies.length; ++x) {
         if (!this.zombies[x].canMove) {
            count++;
         }
      }
      for (var i = 0; i < this.zombies.length && count != this.zombies.length; ++i) {
         this.stepZombie(i);
      }
   }
   this.endScenario();
}

/* author:  Anthony Guevara
   date:    16 April 2015
   info:    Draw board and display board with most current updates
*/
WorldMap.prototype.drawAndDisplayBoard = function () {
   this.drawBoard();
   this.displayBoard();
}

/* author:  Anthony Guevara
   date:    16 April 2015
   info:    Begin the scenario by displaying the starting position of zombies
            and creatures. Zombies move until movement sequence runs out.
*/
WorldMap.prototype.drawBoard = function () {
   this.board = new Array(this.dimension);
   for (var x = 0; x < this.dimension; ++x)
      this.board[x] = new Array();
   var board = this.board;
   var zombies = this.zombies;
   var creatures = this.creatures;
   //fill board with '-'
   for(row = 0; row < this.dimension; ++row)
      for(col = 0; col < this.dimension; ++col)
         board[col][row] = "-";

   //add the zombies and creatures to the board
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

/* author:  Anthony Guevara
   date:    16 April 2015
   info:    Display the board using ascii characters
*/
WorldMap.prototype.displayBoard = function() {
   for(row = 0; row < this.dimension; ++row) { //row
      for(col = 0; col < this.dimension; ++col) { //column
        process.stdout.write(this.board[row][col]); 
      }
      process.stdout.write("\n")
   }
}

/* author:  Anthony Guevara
   date:    16 April 2015
   info:    Move the zombie based on movement list read from input file
   param:   i - the index of the zombie to move
*/
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
         }
         break;
      case "R"://right
         if ((this.zombies[i].x + 1) < this.dimension) {
            this.zombies[i].x += 1;
         }
         break;
      case "D"://down
         if ((this.zombies[i].y + 1) < this.dimension) {
            this.zombies[i].y += 1;
         }
         break;
      case "L"://left
      if ((this.zombies[i].x - 1) > -1) {
         this.zombies[i].x -= 1;
      }
      break;
   }
   this.zombies[i].moveSequence += 1;
   this.checkBite(i);
}

/* author:  Anthony Guevara
   date:    16 April 2015
   info:    Check to see if zombie lands on same co-ordinate as a creature.
   params:  i  -  index of the zombie to check for bite
   return:  true  - zombie bite
            false - no bite
*/
WorldMap.prototype.checkBite = function(i) {
   zx = this.zombies[i].x;
   zy = this.zombies[i].y;
   for (var x = 0; x < this.creatures.length; ++x) {
      if (zx == this.creatures[x].x &&
          zy == this.creatures[x].y) {
         this.score++;
         var creatureDeathIndex = -1;
         this.creatures.forEach(function(creature, i) {
            if (creature.x == zx && creature.y == zy) {
               creatureDeathIndex = i;
            }
         });
         this.creatures.splice(creatureDeathIndex, 1);
         this.spawnZombie(zx, zy);
         return true;
      }
   }
   return false;
}

/* author:  Anthony Guevara
   date:    16 April 2015
   info:    Create a new zombie if a creature receives a bite
   params:  zx  -  the x co-ordinate of a zombie
            zy  -  the y co-ordinate of a zombie
*/
WorldMap.prototype.spawnZombie = function(zx, zy) {
   this.zombies.push(new zmove(zx, zy));
}

/* author:  Anthony Guevara
   date:    16 April 2015
   info:    Print results of scenario and exit
*/
WorldMap.prototype.endScenario = function () {
   console.log("[End Scenario]");
   this.drawAndDisplayBoard();
   console.log("[NOTICE:Zombies weren't allowed to go through walls in this scenario.]");
   console.log("zombies score: " + this.score);
   process.stdout.write("zombies positions: ");
   for (var i = 0; i < this.zombies.length; ++i) {
      process.stdout.write(this.zombies[i].x + "," + this.zombies[i].y + " ");
   }
   process.stdout.write('\n');
   process.exit();
}
