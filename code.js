var pressedKeys = {};
var currentPallette = 0;
var currentColor = 0;

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
}

// If new td's were created, need to make sure they have listeniners
function resetColoring() {
  for(var i = 0 ; i < 4 ; i++) {
    theColor = $('#p' + currentPallette + 'c' + i).css('background-color');
    $('.p' + currentPallette + 'c' + i).css('background-color', theColor);
  }

  $( '#artboard td' ).click(function() {
    $(this).removeClass();
    $(this).addClass('p' + currentPallette + 'c' + currentColor);

    theColor = $('#chosen-color').css('background-color');
    $(this).css('background-color', theColor);
  });
}

// Set chosen color and call cell color function
function setColor(color){
  $('#chosen-color').css('background-color', color);

  resetColoring();
};

// Set cell color
function colorCell(cell, color){
  console.log("colorCell...");
  cell.css("background-color", color);
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

  console.log("current color: " + currentColor);
  console.log("current pallette: " + currentPallette);
  setColor(theColor);
});

$("#save").click(function() {
  alert("not implemented yet");
});

$("#load").click(function() {
  alert("not implemented yet");
});

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
    //$(this).css("width", newSize);
    //$(this).css("height", newSize);
  });
});
