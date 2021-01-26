var pressedKeys = {};
var currentPallette = 0;
var currentColor = 0;
var tileSetState;
var screenState;
var colors = Array(4).fill().map(() => Array(4));
var colorClasses = Array(4).fill().map(() => Array(4));
var selectedRow = 0;
var selectedColumn = 0;
var currentFullScreenTileRow = -1;
var currentFullScreenTileColumn = -1;
var currentTileHoverRow = -1;
var currentTileHoverColumn = -1;

const NUM_TILES_X = 16;
const NUM_TILES_Y = NUM_TILES_X;
const NUM_TILES_SCREEN_X = 32;
const NUM_TILES_SCREEN_Y = 30;
const NUM_PIXELS_PER_TILE_X = 8;
const NUM_PIXELS_PER_TILE_Y = NUM_PIXELS_PER_TILE_X;
const NUM_TILES_IN_SCREEN_X = 32;
const NUM_TILES_IN_SCREEN_Y = 32;
const NUM_TILES_PER_PALLETTE = 2;
const NUM_PIXELS_PER_CANVAS_PIXEL = 4;
const TILE_WIDTH_PIXELS = NUM_PIXELS_PER_TILE_X*NUM_PIXELS_PER_CANVAS_PIXEL;
const TILE_HEIGHT_PIXELS = NUM_PIXELS_PER_TILE_Y*NUM_PIXELS_PER_CANVAS_PIXEL;

function init() {
  console.log("Initializing tool...");
  
  tileSetState = Array(NUM_TILES_Y).fill().map(() => Array(NUM_TILES_X));

  for(var i = 0 ; i < tileSetState.length ; i++) {
    for(var j = 0 ; j < tileSetState[i].length ; j++) {
      var tileData = Array(NUM_PIXELS_PER_TILE_Y).fill().map(() => Array(NUM_PIXELS_PER_TILE_X).fill(0));
      tileSetState[i][j] = {
        row: i, //TODO do we need this
        column: j, //TODO do we need this
        tileData: tileData      
      }
    }
  }

  console.log("tileSetState initialized!");

  screenState = Array(NUM_TILES_IN_SCREEN_Y).fill().map(() => Array(NUM_TILES_IN_SCREEN_X));

  for(var i = 0 ; i < screenState.length ; i++) {
    for(var j = 0 ; j < screenState[i].length ; j++) {
      screenState[i][j] = {
        pallette: 0,
        tileRow: 0,
        tileColumn: 0
      }
    }
  }
  
  console.log("screenState initialized!");
   
  for(var i = 0 ; i < colors.length ; i++) {
    for(var j = 0 ; j < colors[i].length ; j++) { 
      var id = '#p' + i + 'c' + j;
      colors[i][j] = $(id).css('background-color');
      colorClasses[i][j] = getClass($(id)[0].classList, getColorClassRegex());
    }
  }
  
  drawTileEditorTable();
  
  var tilesetCanvas = document.getElementById("tilesetCanvas");
  tilesetCanvas.height = NUM_TILES_Y*NUM_PIXELS_PER_TILE_Y*NUM_PIXELS_PER_CANVAS_PIXEL;
  tilesetCanvas.width = NUM_TILES_X*NUM_PIXELS_PER_TILE_X*NUM_PIXELS_PER_CANVAS_PIXEL;
  
  var tilesetHighlightCanvas = document.getElementById("tilesetHighlightCanvas");
  tilesetHighlightCanvas.height = tilesetCanvas.height;
  tilesetHighlightCanvas.width = tilesetCanvas.width;  
  
  initTilesetCanvas();
  
  var fullScreenCanvas = document.getElementById("fullScreenCanvas");
  fullScreenCanvas.height = NUM_TILES_SCREEN_Y*NUM_PIXELS_PER_TILE_Y*NUM_PIXELS_PER_CANVAS_PIXEL;
  fullScreenCanvas.width = NUM_TILES_SCREEN_X*NUM_PIXELS_PER_TILE_X*NUM_PIXELS_PER_CANVAS_PIXEL;
  
  var fullScreenHighlightCanvas = document.getElementById("fullScreenHighlightCanvas");
  fullScreenHighlightCanvas.height = fullScreenCanvas.height;
  fullScreenHighlightCanvas.width = fullScreenCanvas.width;

  initScreenCanvas();
  
  loadCurrentTileIntoEditor();
  highlightCurrentTile();
  
  for(var i = 0 ; i < 2 ; i++) {
    var animationCanvas = document.getElementById("animationCanvas" + i);
    animationCanvas.height = NUM_PIXELS_PER_TILE_Y*NUM_PIXELS_PER_CANVAS_PIXEL;
    animationCanvas.width = NUM_PIXELS_PER_TILE_X*NUM_PIXELS_PER_CANVAS_PIXEL;
    
    var ctx = animationCanvas.getContext('2d');
  
    //TODO fill this with actual tile info, keep it up to date and consider making it more than 1 tile
    ctx.fillStyle = (i === 1) ? "red" : "blue";
    ctx.fillRect(0, 0, animationCanvas.width, animationCanvas.height);
  }
  
  let animation1Z = 1000;
  let timer = setInterval(function() {
    var animationCanvas = document.getElementById("animationCanvas0");
    animationCanvas.style.zIndex = (animationCanvas.style.zIndex === "0") ? "1" : "0";

  }, 1000);
  
  $('#p0c0').click();
}

function initTilesetCanvas() {  
  for(var i = 0 ; i < tileSetState.length ; i++) {
    for(var j = 0 ; j < tileSetState[i].length ; j++) {
      var tileData = tileSetState[i][j].tileData;
      fillTilesetTile(i, j, tileData, currentPallette);
    }
  }
  
  console.log("Tileset initialized!");
}


function fillTilesetTile(row, column, tileData, pallette) {
  var tilesetCanvas = document.getElementById("tilesetCanvas");
  var ctx = tilesetCanvas.getContext('2d');
  
  var startRow = TILE_WIDTH_PIXELS*row;
  var startColumn = TILE_HEIGHT_PIXELS*column;
          
  for(var i = 0 ; i < tileData.length ; i++) {
    for(var j = 0 ; j < tileData[i].length ; j++) {
        ctx.fillStyle = colors[pallette][tileData[i][j]];
        ctx.fillRect(startColumn + j*NUM_PIXELS_PER_CANVAS_PIXEL, startRow + i*NUM_PIXELS_PER_CANVAS_PIXEL, NUM_PIXELS_PER_CANVAS_PIXEL, NUM_PIXELS_PER_CANVAS_PIXEL);
    }
  }
}

function fillScreenTile(row, column, screenTile){
  var screenCanvas = document.getElementById("fullScreenCanvas");
  var ctx = screenCanvas.getContext('2d');
  
  var startRow = TILE_WIDTH_PIXELS*row;
  var startColumn = TILE_HEIGHT_PIXELS*column;

  if(tileSetState === undefined || screenTile === undefined) {
    console.log("FUDGE");
  }
  
  var tileData = tileSetState[screenTile.tileRow][screenTile.tileColumn].tileData
          
  for(var i = 0 ; i < tileData.length ; i++) {
    for(var j = 0 ; j < tileData[i].length ; j++) {
        ctx.fillStyle = colors[screenTile.pallette][tileData[i][j]];
        ctx.fillRect(startColumn + j*NUM_PIXELS_PER_CANVAS_PIXEL, startRow + i*NUM_PIXELS_PER_CANVAS_PIXEL, NUM_PIXELS_PER_CANVAS_PIXEL, NUM_PIXELS_PER_CANVAS_PIXEL);
    }
  }
}

function loadCurrentTileIntoEditor() {
  console.log("loading current tile into editor...");
  
  var tileData = tileSetState[selectedRow][selectedColumn].tileData;
  var tileEditorTable = document.getElementById('tileEditorTable');
  
  for(var i = 0 ; i < tileData.length ; i++) {
    for(var j = 0 ; j < tileData[i].length ; j++) {
      tileEditorTable.rows[i].cells[j].classList = colorClasses[currentPallette][tileData[i][j]];
    }
  }
}

function initScreenCanvas() {
  for(var i = 0 ; i < screenState.length ; i++) {
    for(var j = 0 ; j < screenState[i].length ; j++) {
      if(i == 1 && j == 22) {
        console.log("HERE");
      }
      var screenTile = screenState[i][j];
      fillScreenTile(i, j, screenTile);
    }
  }

  console.log("Screen Drawn!");
}

window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function(e) {
  pressedKeys[e.keyCode] = true;

  switch(e.keyCode) {
    case 37: switchCurrentPallette((currentPallette + 3) % 4); break; // <-
    case 39: switchCurrentPallette((currentPallette + 5) % 4); break; // ->
    case 49: switchCurrentPalletteColor(0); break; // 1
    case 50: switchCurrentPalletteColor(1); break; // 2
    case 51: switchCurrentPalletteColor(2); break; // 3
    case 52: switchCurrentPalletteColor(3); break; // 4

    case 65: selectTile(selectedRow, getTilesetNumber(selectedColumn - 1)); break; // a - left
    case 87: selectTile(getTilesetNumber(selectedRow - 1), selectedColumn); break; // w - up
    case 68: selectTile(selectedRow, getTilesetNumber(selectedColumn + 1)); break; // d - right
    case 83: selectTile(getTilesetNumber(selectedRow + 1), selectedColumn); break; // s - down
  }
}

// Makes sure the number is between 0 and 127
function getTilesetNumber(number) {
  return (number + NUM_TILES_X) % NUM_TILES_X;
}

function switchCurrentPallette(number) {
  //Refresh Tileset Canvas
  currentPallette = number;
  
  //Update tile editor
  let tileEditorTable = document.getElementById('tileEditorTable');
  
  loadCurrentTileIntoEditor();
  initTilesetCanvas();
  initScreenCanvas();
}

function selectTile(row, column) {
    selectedRow = row;
    selectedColumn = column;
    
    loadCurrentTileIntoEditor();
    highlightCurrentTile();
}

function highlightCurrentTile() {
  var tilesetHighlightCanvas = document.getElementById("tilesetHighlightCanvas");
  var ctx = tilesetHighlightCanvas.getContext("2d");
  ctx.strokeStyle = "black";
  ctx.clearRect(0, 0, tilesetHighlightCanvas.width, tilesetHighlightCanvas.height);
  ctx.beginPath();
  ctx.rect(selectedColumn*TILE_WIDTH_PIXELS, selectedRow*TILE_HEIGHT_PIXELS, TILE_WIDTH_PIXELS, TILE_HEIGHT_PIXELS);
  ctx.stroke();
}

function highlightCurrentTileHover(row, column) {
  //Clear everything but the already clicked tile  
  highlightCurrentTile();
    
  var tilesetHighlightCanvas = document.getElementById("tilesetHighlightCanvas");
  var ctx = tilesetHighlightCanvas.getContext("2d");
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.rect(currentTileHoverColumn*TILE_WIDTH_PIXELS, currentTileHoverRow*TILE_HEIGHT_PIXELS, TILE_WIDTH_PIXELS, TILE_HEIGHT_PIXELS);
  ctx.stroke();
}

function highlightCurrentFullScreenTile() {
  var tilesetHighlightCanvas = document.getElementById("fullScreenHighlightCanvas");
  var ctx = tilesetHighlightCanvas.getContext("2d");
  ctx.clearRect(0, 0, tilesetHighlightCanvas.width, tilesetHighlightCanvas.height);
  ctx.beginPath();
  ctx.rect(currentFullScreenTileColumn*TILE_WIDTH_PIXELS, currentFullScreenTileRow*TILE_HEIGHT_PIXELS, TILE_WIDTH_PIXELS, TILE_HEIGHT_PIXELS);
  ctx.stroke();
}

// For when fetching element using jquery (which accesses class list differently)
function updateJqueryColor(JqueryCell, newColorId) {
  JqueryCell.removeClass (function (index, className) {
    return (className.match ( getColorClassRegex() ) || []).join(' ');
  });
  JqueryCell.addClass(newColorId);
}


// Listeners

function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect()
  const x = Math.floor(event.clientX - rect.left);
  const y = Math.floor(event.clientY - rect.top);
 
  return {
    x: x,
    y: y
  }
}

document.getElementById('tilesetHighlightCanvas').addEventListener('mousedown', function(e) {
    const position = getCursorPosition($(this)[0], e)
    console.log("Clicked on tileset canvas at: " + JSON.stringify(position));
    
    const tileColumn = Math.floor(position.x/TILE_WIDTH_PIXELS);
    const tileRow = Math.floor(position.y/TILE_HEIGHT_PIXELS);
    
    selectedRow = tileRow;
    selectedColumn = tileColumn;
    
    highlightCurrentTile();
    loadCurrentTileIntoEditor();
})

$('#tilesetHighlightCanvas').mousemove('mouseover', function(e) {
  const position = getCursorPosition($(this)[0], e)
  
  const tileColumn = Math.floor(position.x/TILE_WIDTH_PIXELS);
  const tileRow = Math.floor(position.y/TILE_HEIGHT_PIXELS);
  
  if(currentTileHoverRow != tileRow || currentTileHoverColumn != tileColumn) {
    currentTileHoverRow = tileRow;
    currentTileHoverColumn = tileColumn;
    
    highlightCurrentTileHover();
  }
});

document.getElementById('tilesetHighlightCanvas').addEventListener('mouseout', function(e) {
  console.log("No longer mouse on tileset");
  
  currentTileHoverRow = -1;
  currentTileHoverColumn = -1;
  
  highlightCurrentTileHover();
}, false);

document.getElementById('fullScreenHighlightCanvas').addEventListener('mousedown', function(e) {
  const position = getCursorPosition($(this)[0], e)
  console.log("Clicked on fullscreen canvas at: " + JSON.stringify(position));
  
  const tileColumn = Math.floor(position.x/TILE_WIDTH_PIXELS);
  const tileRow = Math.floor(position.y/TILE_HEIGHT_PIXELS);
  
  if(placeTile) {  
    var screenTile = screenState[tileRow][tileColumn];
    screenTile.tileColumn = selectedColumn;
    screenTile.tileRow = selectedRow;
  }
  //This will update the pallette for everything in this section
  if(placePallette) {
    updatePallette(tileRow, tileColumn);
  }
  else {
    updateJustTile(tileRow, tileColumn);
  }
});

$('#fullScreenHighlightCanvas').mousemove('mouseover', function(e) {
  const position = getCursorPosition($(this)[0], e)  
  const tileColumn = Math.floor(position.x/TILE_WIDTH_PIXELS);
  const tileRow = Math.floor(position.y/TILE_HEIGHT_PIXELS);
  
  if(currentFullScreenTileRow != tileRow || currentFullScreenTileColumn != tileColumn) {
    currentFullScreenTileRow = tileRow;
    currentFullScreenTileColumn = tileColumn;
    
    highlightCurrentFullScreenTile();
  }
});

document.getElementById('fullScreenHighlightCanvas').addEventListener('mouseout', function(e) {
  console.log("No longer mouse on fullscreen");
  
  currentFullScreenTileRow = -1;
  currentFullScreenTileColumn = -1;
  
  highlightCurrentFullScreenTile();
}, false);

function updatePallette(row, column) {
  var startRow = getClosestPallette(row);
  var startColumn = getClosestPallette(column);
  
  for(var i = 0 ; i < NUM_TILES_PER_PALLETTE ; i++) {
    for(var j = 0 ; j < NUM_TILES_PER_PALLETTE ; j++) { 
      var screenTile = screenState[startRow + i][startColumn + j];
      screenTile.pallette = currentPallette;
      fillScreenTile(startRow + i, startColumn + j, screenTile);
    }
  }
}

//TODO could probably just update the pallette field above or use a param
function updateJustTile(row, column) {
  var startRow = getClosestPallette(row);
  var startColumn = getClosestPallette(column);
  
  for(var i = 0 ; i < NUM_TILES_PER_PALLETTE ; i++) {
    for(var j = 0 ; j < NUM_TILES_PER_PALLETTE ; j++) { 
      var screenTile = screenState[startRow + i][startColumn + j];
      fillScreenTile(startRow + i, startColumn + j, screenTile);
    }
  }
}

function getClosestPallette(num) {
  return NUM_TILES_PER_PALLETTE*Math.floor(num/NUM_TILES_PER_PALLETTE);
}

// When a cell on the pallette table is clicked
$('.palletteTable td').click(function(){
  $( '.palletteTable td' ).css('border-color', '#e5e5e5');
  $( '.palletteTable td' ).removeClass("clickedColor")
  $(this).css('border-color', '#000000');
  $(this).addClass("clickedColor");

  currentColor = parseInt($(this)[0].id.charAt(3));
  let newPalletteNumber = parseInt($(this)[0].id.charAt(1));

  let colorId = getClass($(this).attr('class').split(/\s+/), getColorClassRegex());
  updateJqueryColor($('#chosen-color'), colorId);

  if(currentPallette != newPalletteNumber) {
    switchCurrentPallette(newPalletteNumber);
  }
});

// When a cell on the color table is clicked
$('.colortable td').click(function(){
  var colorId = $(this).attr('id');
  currentPalletteCell = $('.clickedColor')[0];

  //Update the color class in pallette display
  updateColor(currentPalletteCell.classList, colorId);
  //Update the color class in the current color display
  updateColor($('#chosen-color')[0].classList, colorId);
  
  var pallette = $('.clickedColor')[0].id.charAt(1);
  var color = $('.clickedColor')[0].id.charAt(3);
  
  colors[pallette][color] = $('#chosen-color').css('background-color');
  colorClasses[pallette][color] = colorId;
  
  //Make sure everything reflects this new color
  loadCurrentTileIntoEditor();
  initTilesetCanvas();
  initScreenCanvas();
});

// TODO don't think need this. should have max one class
function updateColor(classList, newColorId) {
  removeClasses(classList, getColorClassRegex());
  classList.add(newColorId);
}

function switchCurrentPalletteColor(number) {
  console.log("switching to pallette color: " + number);

  $('#p' + currentPallette + 'c' + number).click();
}














//TODO everything below was from prev version

//Expect only multiples of 4
function drawTable(height, width, table) {
  for (let rowNum = 0 ; rowNum < (height/8) ; rowNum++) {
    addRowSized(table, width);
    addRowSized(table, width);
    addRowSized(table, width);
    addRowSized(table, width);
    addRowSized(table, width);
    addRowSized(table, width);
    addRowSized(table, width);
    addRowSized(table, width, 'tile-end-bottom');
  }
}

function addRowSized(table, width, classToAdd) {
  let row = table.insertRow();

  for (let colNum = 0 ; colNum < width ; colNum++) {
    let th = document.createElement("td");

    if(classToAdd !== undefined) {
      th.classList.add(classToAdd);
    }

    if(colNum % 4 == 3) {
      th.classList.add('tile-end-right')
    }

    row.appendChild(th);
  }
}

function drawTileEditorTable() {
  let tileEditorTable = document.getElementById('tileEditorTable');
  drawTable(8, 8, tileEditorTable);
  
  console.log("Done drawing drawTileEditorTable");

  //Set default color
  $('#tileEditorTable td').each(function() {
    updateJqueryColor($(this), 'color-p'); // might want to load this from the pallette instead of hardcoding
  });

  $('#tileEditorTable td').click(function() {
    var row = $(this).closest("tr").index();
    var column = $(this).closest("td").index();
    
    //Save the state
    var tileData = tileSetState[selectedRow][selectedColumn].tileData;
    tileData[row][column] = currentColor;
    
    //Color it
    updateJqueryColor($(this), colorClasses[currentPallette][currentColor]);
    
    //Update Tileset Image
    //TODO only really have to update the pixel changed
    fillTilesetTile(selectedRow, selectedColumn, tileData, currentPallette);
    
    //TODO more efficient ways to redraw the screen
    initScreenCanvas();
  });

}


//These aren't stateless so get a fresh one every time (might be a way to reset it and avoid creating it)
function getPalletteClassRegex() {
  return new RegExp('p[0-9]c[0-9]');
}

function getColorClassRegex() {
  return new RegExp("\\bcolor-\\S+", "g");
}

document.getElementById('input-file').addEventListener('change', getFile)

function getFile(event) {
	const input = event.target
  if ('files' in input && input.files.length > 0) {
	  placeFileContent(input.files[0]);
  }
}

function placeFileContent(file) {
	readFileContent(file).then(content => {
    let vals = content.split(""); // convert to char array
    var i = 0;

    var palletteTable = document.getElementById("palletteTable");
    for (let row of palletteTable.rows) {
      for(let cell of row.cells) {
        if(!cell.classList.contains("palletteBuffer")) {
          updateColor(cell.classList, 'color-' + vals[i]);
          i++;
        }
      }
    }
    
    const numValsInTileData = NUM_PIXELS_PER_TILE_X*NUM_PIXELS_PER_TILE_Y;
    
    for (var k = 0; k <  tileSetState.length ; k++) {
      for(var j = 0 ; j < tileSetState[k].length ; j++) {
        var tileDataAsArray = vals.slice(i, i + numValsInTileData);
        tileSetState[k][j].tileData = stringToTileData(tileDataAsArray);
        
        i = i + numValsInTileData;
      }
    }


    for (var k = 0; k <  screenState.length ; k++) {
      for(var j = 0 ; j < screenState[k].length ; j++) {  
        screenState[k][j].pallette = vals[i];
        i++;
        screenState[k][j].tileRow = (vals[i].charCodeAt(0) - 35);
        i++;
        screenState[k][j].tileColumn = (vals[i].charCodeAt(0) - 35);
        i++;
        
        if(screenState[k][j].pallette > 3) {
         console.log("ILLEGAL PALLETTE2: " + k + "," + j);
       }
      }
    }

    initTilesetCanvas();
    initScreenCanvas();
    
    loadCurrentTileIntoEditor();
    highlightCurrentTile();
  }).catch(error => console.log(error))
}

function readFileContent(file) {
	const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = event => resolve(event.target.result)
    reader.onerror = error => reject(error)
    reader.readAsText(file)
  })
}

$("#save").click(function() {
  var content = getStateAsString();
  downloadToFile(content, "NesDrawingToolState.txt", "text/plain")
});

function stringToTileData(tileAsArray) {
  var tileData = Array(NUM_PIXELS_PER_TILE_Y).fill().map(() => Array(NUM_PIXELS_PER_TILE_X).fill(0));
  
  var k = 0;
  for (var i = 0; i <  tileData.length ; i++) {
    for(var j = 0 ; j < tileData[i].length ; j++) {
      tileData[i][j] = parseInt(tileAsArray[k]);
      k++;
    }
  }
  
  return tileData;
}

function tileDataToString(tileData) {
  //TODO this is SUPER wasteful in terms of space
  var result = "";
  
  for (var i = 0; i <  tileData.length ; i++) {
    for(var j = 0 ; j < tileData[i].length ; j++) {
      result += tileData[i][j];
    }
  }
  
  return result;
}

function getStateAsString() {
  var result = "";
  var palletteTable = document.getElementById("palletteTable");
  var i = 0;
  for (let row of palletteTable.rows) {
    for(let cell of row.cells) {
      if(!cell.classList.contains("palletteBuffer")) {
        var cellClass = getClass(cell.classList, getColorClassRegex());
        result += cellClass.slice(-1); //TODO shouldn't be using just class names
      }
    }
  }

  console.log("Saved pallette. Current Result size: " + result.length);
  for (var i = 0; i <  tileSetState.length ; i++) {
    for(var j = 0 ; j < tileSetState[i].length ; j++) {
      result += tileDataToString(tileSetState[i][j].tileData);
    }
  }

  console.log("Saved tilesetState. Current Result size: " + result.length);
  //TODO could probably save a little space by doing pallette seperately
  for (var i = 0; i <  screenState.length ; i++) {
    for(var j = 0 ; j < screenState[i].length ; j++) {       
       //TODO definitely don't need 3 whole characters for this
       if(screenState[i][j].pallette > 3) {
         console.log("ILLEGAL PALLETTE: " + i + "," + j);
       }
       result += screenState[i][j].pallette;
       result += String.fromCharCode(screenState[i][j].tileRow + 35);//TODO move this to a helper... might also not need offset
       result += String.fromCharCode(screenState[i][j].tileColumn + 35);
    }
  }
4
  console.log("Saved screenState. Final Result size: " + result.length);
  return result;
}

function getClass(classList, regex) {
  for (var i=0; i < classList.length ; ++i) {
    if(regex.exec(classList[i])) {
        return classList[i];
    }
  }

  //TODO probably throw an exception
}

//TODO do we 
function removeClasses(classList, regex) {
  for (var i=0, l=classList.length; i<l;) {
    if(regex.exec(classList[i])) {
        classList.remove(classList[i]);
    }
    else {
      i++
    }
  }

  //TODO probably throw an exception
}

function downloadToFile(content, filename, contentType) {
  const a = document.createElement('a');
  const file = new Blob([content], {type: contentType});

  a.href= URL.createObjectURL(file);
  a.download = filename;
  a.click();

	URL.revokeObjectURL(a.href);
}

//TODO these aren't used yet but keeping incase i do

$("#canvasZoomIn").click(function() {
  let width = document.getElementById('tilesetTable').rows[0].width;
  $( '#tilesetTable td' ).each(function(){
    let newSize = $(this).width()*1.1;
  });
});


//TODO this mechanism is REALLY unintuitive but just want functionality working before getting feedback
var placePallette = false;
var placeTile = true;

$('#placeTileOnScreenMode').change(function(){
  placeTile = $(this).is(':checked');
});

$('#placePalletteOnScreenMode').change(function(){
  placePallette = $(this).is(':checked');
});
