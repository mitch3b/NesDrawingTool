var pressedKeys = {};
const SHIFT_KEYCODE = 16;
var currentPallette = 0;
var currentColor = 0;
var currentSelectedPalletteId;
var selectedRow = 0;
var selectedColumn = 0;


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

    case 65: selectTile(selectedRow, getTilesetNumber(selectedColumn - 4)); break; // a - left
    case 87: selectTile(getTilesetNumber(selectedRow - 4), selectedColumn); break; // w - up
    case 68: selectTile(selectedRow, getTilesetNumber(selectedColumn + 4)); break; // d - right
    case 83: selectTile(getTilesetNumber(selectedRow + 4), selectedColumn); break; // s - down
  }
}

// Makes sure the number is between 0 and 31
function getTilesetNumber(number) {
  return (number + 32) % 32;
}

function switchCurrentPallette(number) {
  $('#p' + number + 'c' + currentColor).click();
}

function switchCurrentPalletteColor(number) {
  console.log("switching to pallette color: " + number);

  $('#p' + currentPallette + 'c' + number).click();
}

//Expect only multiples of 4
function drawTable(height, width, table) {
  for (let rowNum = 0 ; rowNum < (height/4) ; rowNum++) {
    addRowSized(table, width);
    addRowSized(table, width);
    addRowSized(table, width);
    addRowSized(table, width, 'tile-end-bottom');
  }
}

function drawTilesetTable() {
  let tilesetTable = document.getElementById('tilesetTable');
  drawTable(32, 32, tilesetTable);

  //Set default color
  $('#tilesetTable td').each(function() {
    updateJqueryTileClass($(this), "p0c3");
    updateJqueryColor($(this), 'color-p'); // might want to load this from the pallette instead of hardcoding
  });

}

function drawScreenTable() {
  let fullScreenTable = document.getElementById('fullScreenTable');
  drawTable(60, 64, fullScreenTable);
}

// Better ways to do this but good enough for now til load/save is better
function setDefaultScreen() {
  let fullScreenTable = document.getElementById('fullScreenTable');

  for(var i = 0 ; i < 16 ; i++) {
    for(var j = 0 ; j < 15 ; j++) {
      fullScreenTable.rows[4*j].cells[4*i].click();
    }
  }
  //TODO this isn't getting colored in...
}

//These aren't stateless so get a fresh one every time (might be a way to reset it and avoid creating it)
function getTileClassRegex() {
  return new RegExp('tile-r');
}

function getPalletteClassRegex() {
  return new RegExp('p[0-9]c[0-9]');
}

function getColorClassRegex() {
  return new RegExp("\\bcolor-\\S+", "g");
}
// If new td's were created, need to make sure they have listeniners
function resetColoring() {
  for(var j = 0 ; j < 4 ; j++) {
    for(var i = 0 ; i < 4 ; i++) {
      $('#p' + j + 'c' + i).each(function() {
        theColor = getClass($(this)[0].classList, getColorClassRegex());
        //TODO still need to remove th current class (although this whole set of logic might not to anything anymore)
        $(this).addClass(theColor);
      });
    }
  }

  reselectTile();

  $('#fullScreenTable td').click(function() {
    var row = $(this).closest("tr").index();
    var column = $(this).closest("td").index();
    row = findTopLeftCorner(row);
    column = findTopLeftCorner(column);

    loadTile(row, column, selectedRow, selectedColumn);
  });

  $('#tilesetTable td').click(function() {
    var row = $(this).closest("tr").index();
    var column = $(this).closest("td").index();
    selectTile(findTopLeftCorner(row), findTopLeftCorner(column));

    if(document.getElementById("tilesetTableLock").checked || pressedKeys[SHIFT_KEYCODE]) {
        console.log("tileset locked. Not coloring pixel...");
        return;
    }

    updateJqueryTileClass($(this), currentSelectedPalletteId);

    var currentColorClass = getCurrentChosenColorClass();
    updateJqueryColor($(this), currentColorClass);

    $('.' + getTileClassName(row, column)).each(function() {
      updateJqueryTileClass($(this), currentSelectedPalletteId);
      updateJqueryColor($(this), currentColorClass);
    });
  });
}

function updateJqueryTileClass(tile, pXcY) {
  tile.removeClass(function (index, css) {
     return (getPalletteClassRegex().exec(css) || []).join(' ');
  });

  tile.addClass(pXcY);
}

function updateTilePallette(tile, pXcY) {
  removeClasses(tile.classList, getPalletteClassRegex());
  tile.classList.add(pXcY);

  updateColor(tile.classList, getClass($('#' + pXcY)[0].classList, getColorClassRegex()));
}

function loadTile(tileRow, tileColumn, tilesetRow, tilesetColumn) {
  let tilesetTable = document.getElementById('tilesetTable');
  let fullScreenTable = document.getElementById('fullScreenTable');

  for(var i = 0 ; i < 4 ; i++) {
    for(var j = 0 ; j < 4 ; j++) {
      let currentFullScreenCell = fullScreenTable.rows[tileRow + i].cells[tileColumn + j];
      let currentTileCell = tilesetTable.rows[tilesetRow + i].cells[tilesetColumn + j];

      updateTilePallette(currentFullScreenCell, getClass(currentTileCell.classList, getPalletteClassRegex()));

      //TODO only have to do really pull this and store this once (maybe top left corner)
      removeClasses(currentFullScreenCell.classList, getTileClassRegex());
      currentFullScreenCell.classList.add(getTileClassName(tilesetRow + i, tilesetColumn + j));
    }
  }
}

function getTileClassName(row, column) {
  return 'tile-r' + row + 'c' + column;
}

function findTopLeftCorner(number) {
  return 4*Math.floor(number/4);
}

// When a cell on the color table is clicked
$('.colortable td').click(function(){
  var colorId = $(this).attr('id');
  currentPalletteCell = $('.clickedColor')[0];

  //Update everything with this pallette color
  $('.'+ currentPalletteCell.id).each(function(){
    updateJqueryColor($(this), colorId);
  });

  //Update the color class in pallette display
  updateColor(currentPalletteCell.classList, colorId);
  //Update the color class in the current color display
  updateColor($('#chosen-color')[0].classList, colorId);

  resetColoring();
});

// For when fetching element using reg javascript
function updateColor(classList, newColorId) {
  removeClasses(classList, getColorClassRegex());
  classList.add(newColorId);
}

// For when fetching element using jquery (which accesses class list differently)
function updateJqueryColor(JqueryCell, newColorId) {
  JqueryCell.removeClass (function (index, className) {
    return (className.match ( getColorClassRegex() ) || []).join(' ');
  });
  JqueryCell.addClass(newColorId);
}

// When a cell on the pallette table is clicked
$('.palletteTable td').click(function(){
  $( '.palletteTable td' ).css('border-color', '#e5e5e5');
  $( '.palletteTable td' ).removeClass("clickedColor")
  $(this).css('border-color', '#000000');
  $(this).addClass("clickedColor");

  crrentColor = parseInt($(this)[0].id.charAt(3))
  let newPalletteNumber = parseInt($(this)[0].id.charAt(1));

  let colorId = getClass($(this).attr('class').split(/\s+/), getColorClassRegex());
  updateJqueryColor($('#chosen-color'), colorId);

  if(currentPallette != newPalletteNumber) {
    //Update tilesetTable
    for(var i = 0 ; i < 4 ; i++) {
      var newColorColor = getClass(document.getElementById('p' + newPalletteNumber + 'c' + i).classList, getColorClassRegex());
      var prevColor = getClass(document.getElementById('p' + currentPallette + 'c' + i).classList, getColorClassRegex());

      $('.p' + currentPallette + 'c' + i).each(function(){
        $(this).removeClass('p' + currentPallette + 'c' + i);
        $(this).addClass('p' + newPalletteNumber + 'c' + i);
        $(this).removeClass(prevColor);
        $(this).addClass(newColorColor);
      });
    }

    currentPallette = newPalletteNumber;
  }

  currentSelectedPalletteId = $(this)[0].id;
});

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

    var tilesetTableTable = document.getElementById("tilesetTable");
    for (let row of tilesetTableTable.rows) {
      for(let cell of row.cells) {

        if(i == 1041)
                console.log(i);
        updateTilePallette(cell, 'p0c' + vals[i]);
        i++;
      }
    }

    resetColoring();

    var fullScreenTable = document.getElementById("fullScreenTable");
    for (var k = 0; k <  fullScreenTable.rows.length ; k += 4) {
      for(var j = 0 ; j < fullScreenTable.rows[k].cells.length ; j += 4) {
         // Probably need to get the class
         var tmp = vals[i];
         i++;

         var charNum = tmp.charCodeAt(0);

         if(charNum > 58) {
           charNum--;
         }

         charNum = charNum - 33;
         var row = 4*Math.floor(charNum/8);
         var column = 4*(charNum % 8);

         loadTile(k, j, row, column)
      }
    }

    document.getElementById("p0c0").click();
    resetColoring();
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

function getStateAsString() {
  var result = "";
  var palletteTable = document.getElementById("palletteTable");
  var i = 0;
  for (let row of palletteTable.rows) {
    for(let cell of row.cells) {
      if(!cell.classList.contains("palletteBuffer")) {
        var cellClass = getClass(cell.classList, getColorClassRegex());
        result += cellClass.slice(-1);
      }
    }
  }

  var tilesetTableTable = document.getElementById("tilesetTable");
  for (let row of tilesetTableTable.rows) {
    for(let cell of row.cells) {
      console.log(i);
      //This class comes back as pXcY. We only care about Y bc tileset same pallette for everything
      result += (getClass(cell.classList, getPalletteClassRegex())).slice(-1);
    }
  }

  var fullScreenTable = document.getElementById("fullScreenTable");
  for (var i = 0; i <  fullScreenTable.rows.length ; i += 4) {
    for(var j = 0 ; j < fullScreenTable.rows[i].cells.length ; j += 4) {
       // Probably need to get the class
       var tmp = getClass(fullScreenTable.rows[i].cells[j].classList, getTileClassRegex());
       tmp = tmp.substring(6);
       var tmp2 = tmp.split('c');
       var row = parseInt(tmp2[0]);
       var column = parseInt(tmp2[1]);
       var charNum = 33 + 8*(row/4) + (column/4); //Add 33 bc chars before that are blank
       var tileChar = String.fromCharCode(charNum);
       result += tileChar;
    }
  }

  return result;
}

function getCurrentChosenColorClass() {
  return getClass($('#chosen-color')[0].classList, getColorClassRegex());
}

function getClass(classList, regex) {
  for (var i=0; i < classList.length ; ++i) {
    if(regex.exec(classList[i])) {
        return classList[i];
    }
  }

  //TODO probably throw an exception
}

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

// Clear all cells
$("#clear").click(function() {
  $('#tilesetTable td').css('background-color', 'transparent');
  $('#tilesetTable td').removeClass();
});

$("#addColumn").click(function() {
  let table = document.getElementById('tilesetTable');

  for (var r = 0; r < table.rows.length; r++){
    for (var i = 0 ; i < 4 ; i++) {
      let th = document.createElement("td");
      table.rows[r].appendChild(th);
    }
  };

  resetColoring();
});

$("#removeColumn").click(function() {
  let table = document.getElementById('tilesetTable');

  if(table.rows.length > 1 && table.rows[0].cells.length > 4 ) {
    for (var r = 0; r < table.rows.length; r++){
      table.rows[r].deleteCell(-1);
      table.rows[r].deleteCell(-1);
      table.rows[r].deleteCell(-1);
      table.rows[r].deleteCell(-1);
    };

    resetColoring();
  }
});

$("#addRow").click(function() {
  addRow();
  addRow();
  addRow();
  addRow();

  resetColoring();
});

function addRow() {
  let table = document.getElementById('tilesetTable');

  addRowSized(table, table.rows[0].cells.length);
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

function reselectTile() {
  selectTile(selectedRow, selectedColumn);
}

let highlightColor = "blue";
let highlightStyle = "1px solid blue";
function selectTile(row, column) {
  let table = document.getElementById('tilesetTable');

  for(var i = 0 ; i < 4 ; i++) {
    table.rows[selectedRow].cells[selectedColumn + i].classList.remove('highlight-border-top');
    table.rows[selectedRow + 3].cells[selectedColumn + i].classList.remove('highlight-border-bottom');

    table.rows[selectedRow + i].cells[selectedColumn].classList.remove('highlight-border-left');
    table.rows[selectedRow + i].cells[selectedColumn + 3].classList.remove('highlight-border-right');
  }

  selectedRow = row;
  selectedColumn = column;

  for(var i = 0 ; i < 4 ; i++) {
    table.rows[selectedRow].cells[selectedColumn + i].classList.add('highlight-border-top');
    table.rows[selectedRow + 3].cells[selectedColumn + i].classList.add('highlight-border-bottom');

    table.rows[selectedRow + i].cells[selectedColumn].classList.add('highlight-border-left');
    table.rows[selectedRow + i].cells[selectedColumn + 3].classList.add('highlight-border-right');
  }
}

$("#removeRow").click(function() {
  let table = document.getElementById('tilesetTable');

  if(table.rows.length > 4) {
    table.deleteRow(-1);
    table.deleteRow(-1);
    table.deleteRow(-1);
    table.deleteRow(-1);

    resetColoring();
  }
});

$("#canvasZoomIn").click(function() {
  let width = document.getElementById('tilesetTable').rows[0].width;
  $( '#tilesetTable td' ).each(function(){
    let newSize = $(this).width()*1.1;
  });
});

$('#tilesetTableShowGridLines').change(function(){
  if ($(this).is(':checked')) {
    $('#tilesetTable td').css('border-width', 1);
  }
  else {
    $('#tilesetTable td').css('border-width', 0);
  }
});

//TODO the select is correct but the property isn't working. Once it works, need same with vertical line
$('#fullScreenShowGridLines').change(function(){
  if ($(this).is(':checked')) {
    $('#fullScreenTable').find('.tile-end-right-hidden').removeClass('tile-end-right-hidden').addClass('tile-end-right');
    $('#fullScreenTable').find('.tile-end-bottom-hidden').removeClass('tile-end-bottom-hidden').addClass('tile-end-bottom');
  }
  else {
    $('#fullScreenTable').find('.tile-end-right').removeClass('tile-end-right').addClass('tile-end-right-hidden');
    $('#fullScreenTable').find('.tile-end-bottom').removeClass('tile-end-bottom').addClass('tile-end-bottom-hidden');
  }
});
