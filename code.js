var pressedKeys = {};
var currentPallette = 0;
var currentColor = 0;
var selectedRow = 0;
var selectedColumn = 0;

window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function(e) {
  pressedKeys[e.keyCode] = true;

  switch(e.keyCode) {
    case 37: switchCurrentPallette((currentPallette + 3) % 4); break; // <-
    case 39: switchCurrentPallette((currentPallette + 1) % 4); break; // ->
    case 49: switchCurrentPalletteColor(0); break; // 1
    case 50: switchCurrentPalletteColor(1); break; // 2
    case 51: switchCurrentPalletteColor(2); break; // 3
    case 52: switchCurrentPalletteColor(3); break; // 4
  }
}

function switchCurrentPallette(number) {
  console.log("switching to pallette to: " + number);

  $('#p' + number + 'c' + currentColor).click();
}

function switchCurrentPalletteColor(number) {
  console.log("switching to pallette color: " + number);

  $('#p' + currentPallette + 'c' + number).click();
}

//Expect only multiples of 4
function drawTable(height, width) {
  let table = document.getElementById('artboard');
  for (let rowNum = 0 ; rowNum < (height/4) ; rowNum++) {
    addRowSized(width);
    addRowSized(width);
    addRowSized(width);
    addRowSized(width);
  }

  resetColoring();
  document.getElementById("p0c0").click();
}

// If new td's were created, need to make sure they have listeniners
function resetColoring() {
  for(var j = 0 ; j < 4 ; j++) {
    for(var i = 0 ; i < 4 ; i++) {
      theColor = $('#p' + j + 'c' + i).css('background-color');
      $('.p' + j + 'c' + i).css('background-color', theColor);
    }
  }

  reselectTile();

  $( '#artboard td' ).click(function() {
    $(this).removeClass();
    $(this).addClass('p' + currentPallette + 'c' + currentColor);

    theColor = $('#chosen-color').css('background-color');
    $(this).css('background-color', theColor);

    var row = $(this).closest("tr").index();
    var column = $(this).closest("td").index();
    selectTile(findTopLeftCorner(row), findTopLeftCorner(column));
  });
}

function findTopLeftCorner(number) {
  return 4*Math.floor(number/4);
}

// Set chosen color and call cell color function
function setChosenColor(color){
  $('#chosen-color').css('background-color', color);

  resetColoring();
};

// When a cell on the color table is clicked
$('.colortable td').click(function(){
  theColor = $(this).css('background-color');
  currentPalletteCell = $('.clickedColor')[0];
  currentPalletteCell.style.backgroundColor = theColor;
  $('#chosen-color')[0].style.backgroundColor = theColor;
  $('.'+ currentPalletteCell.id).css('background-color', theColor);

  resetColoring();
});

// When a cell on the pallette table is clicked
$('.palletteTable td').click(function(){
  $( '.palletteTable td' ).css('border-color', '#e5e5e5');
  $( '.palletteTable td' ).removeClass("clickedColor")
  $(this).css('border-color', '#000000');
  $(this).addClass("clickedColor");
  theColor = $(this).css('background-color');
  currentColor = $(this)[0].id.slice(-1);
  let newPalletteNumber = parseInt($(this)[0].id.charAt(1));

  if(currentPallette != parseInt($(this)[0].id.charAt(1))) {
    for(var i = 0 ; i < 4 ; i++) {
      colorToSet = $('#p' + newPalletteNumber + 'c' + i).css('background-color');
      $('.p' + currentPallette + 'c' + i).each(function(){
        $(this).css("background-color", colorToSet);
        $(this).removeClass();
        $(this).addClass('p' + newPalletteNumber + 'c' + i);
      });
    }

    currentPallette = newPalletteNumber;
  }

  setChosenColor(theColor);
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
    let vals = content.split(delimiter);

    let i = 0;
    var palletteTable = document.getElementById("palletteTable");
    for (let row of palletteTable.rows) {
      for(let cell of row.cells) {
         cell.style.backgroundColor = vals[i];
         i++;
      }
    }

    var artboardTable = document.getElementById("artboard");
    for (let row of artboardTable.rows) {
      for(let cell of row.cells) {
        cell.classList.remove(...cell.classList);
        cell.classList.add(vals[i]);
        i++;
      }
    }

    document.getElementById("p0c0").click();
    resetColoring();
  }).catch(error => console.log(error))
}

let delimiter = ";"
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
  for (let row of palletteTable.rows) {
    for(let cell of row.cells) {
       result += cell.style.backgroundColor + delimiter; // your code below
    }
  }

  var artboardTable = document.getElementById("artboard");
  for (let row of artboardTable.rows) {
    for(let cell of row.cells) {
       result += cell.classList[0] + delimiter; // your code below
    }
  }

  return result;
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
  $('#artboard td').css('background-color', 'transparent');
  $('#artboard td').removeClass();
});

$("#addColumn").click(function() {
  let table = document.getElementById('artboard');

  for (var r = 0; r < table.rows.length; r++){
    for (var i = 0 ; i < 4 ; i++) {
      let th = document.createElement("td");
      table.rows[r].appendChild(th);
    }
  };

  resetColoring();
});

$("#removeColumn").click(function() {
  let table = document.getElementById('artboard');

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
  let table = document.getElementById('artboard');

  addRowSized(table.rows[0].cells.length);
}

function addRowSized(width) {
  let table = document.getElementById('artboard');
  let row = table.insertRow();

  for (let colNum = 0 ; colNum < width ; colNum++) {
    let th = document.createElement("td");
    th.classList.add("p0c3");
    row.appendChild(th);
  }
}

function reselectTile() {
  selectTile(selectedRow, selectedColumn);
}

let highlightColor = "blue";
let highlightStyle = "1px solid blue";
function selectTile(row, column) {
  let table = document.getElementById('artboard');

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
  let table = document.getElementById('artboard');

  if(table.rows.length > 4) {
    table.deleteRow(-1);
    table.deleteRow(-1);
    table.deleteRow(-1);
    table.deleteRow(-1);

    resetColoring();
  }
});

$("#canvasZoomIn").click(function() {
  let width = document.getElementById('artboard').rows[0].width;
  $( '#artboard td' ).each(function(){
    let newSize = $(this).width()*1.1;
  });
});
