
var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,?.'@#\u201c\u201d"
var idx = 0

var canvas  = document.getElementById("Canvas");
canvas.width = window.innerWidth -2
canvas.height = window.innerHeight / 2 -2
var canvasBound = canvas.getBoundingClientRect();
var context = canvas.getContext('2d');

var mouseDown;
var mode;
var purpose;
var ll = [];
var l;

var scroller  = document.getElementById("TableRows");
var scrollStartX;
var scrollLeft;
var scrollerBound = scroller.getBoundingClientRect();
var mouseDown = true

var data = {}
var done = 0;

var output = document.getElementById("Output");
document.getElementById("SaveButton").onclick = save;
document.getElementById("ResetButton").onclick = clear;
document.getElementById("CopyButton").onclick = copy;

function copy() {
  navigator.clipboard.writeText(JSON.stringify(data))
}

var currentChar = document.getElementById("CurrentChar");
var buttonWidth;

function setIdx(newIdx) {
  clear()
  idx = newIdx;
  currentChar.innerText = letters[idx]
}

window.onload = function() {
  var tableRows = document.getElementById("TableRows");
  for (var i = 0; i < letters.length; i++) {
    const button = document.createElement("button");
    button.id = "button" + i
    button.style.display = "block"
    button.style.width = "100%"
    button.style.height = "20%"
    button.style["font-size"] = "4vh"
    button.style.background = "#ff9999"
    button.innerText = letters[i]
    button.INDEX = i
    button.onclick = () => {setIdx(button.INDEX)}

    div = document.createElement("div");
    div.classList.add("PreviewItem")

    td = document.createElement("td");
    td.classList.add("PreviewItem")
    td.align = "left"

    div.appendChild(button)
    td.appendChild(div)
    tableRows.appendChild(td)
  }
  output.innerHTML = "Complete:<br>"+done+" / " + letters.length;

  mouseDown = 0;
}

function inBound(Bound, x,y) {
  return x < Bound.right && x >= Bound.left && y >= Bound.top && y < Bound.bottom
}

document.onmousedown = function(e) { 
  var [posX, posY] = eToPos(e)
  mouseDown=1;
  mode = "d"
  if (inBound(canvasBound, posX, posY)) {
    purpose = "draw"
    l = []
  }
  else if (inBound(scrollerBound, posX, posY)) {
    purpose = "scroll"
    scrollStartX = posX - scroller.offsetLeft;
    scrollLeft = scroller.scrollLeft;
  }
}

var onts = function(e) { 
  var posX = e.touches[0].clientX
  var posY = e.touches[0].clientY
  mouseDown=1;
  mode= "m"
  if (inBound(canvasBound, posX, posY)) {
    purpose = "draw"
    l = []
    e.preventDefault()
  }
  else if (inBound(scrollerBound, posX, posY)) {
    purpose = "scroll"
    return
  }
}
window.addEventListener('touchstart',onts, {passive:false});

function saveL() {
  l2 = []
  for (var j = 0; j < l.length; j++) {
    l2.push(l[j].slice())
  }
  ll.push(l2)
}

document.onmouseup = function() {
  mouseDown=0;
  if (purpose == "draw" && l.length > 0)
    saveL()
  purpose = "";
}
document.ontouchend = function() {
  mouseDown=0;
  if (purpose == "draw" && l.length > 0)
    saveL()
  purpose = "";
}

function clear() {
  if (mouseDown == 0) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    console.log("cleared")
    ll = []
  }
};

function getNextIncomplete() {
  var NEXT = idx + 1
  while (NEXT < letters.length) {
    if (data[letters[NEXT]] === undefined) {
      return NEXT;
    }
    NEXT ++;
  }
  NEXT = 0;
  while (NEXT < idx) {
    if (data[letters[NEXT]] === undefined) {
      return NEXT;
    }
    NEXT ++;
  }
  return NEXT;

}

function save() {
  if (mouseDown == 0) {
    var saved = []
    for (var o of ll) {
      var saved1 = []
      for (var oo of o) {
	saved1.push(oo.slice());
      }
      saved.push(saved1)
    }
    let button = document.getElementById("button"+idx)
    if (saved.length > 0) {
      data[letters[idx]] = saved
      button.style.background = "#99ff99"
      setIdx(getNextIncomplete());
      scroller.scrollLeft = (scroller.scrollWidth/letters.length) * (idx - 0.6)
      done++;
    }
    else {
      delete data[letters[idx]]
      button.style.background = "#ff9999"
      done--;

    }
    output.innerHTML = "Complete:<br>"+done+" / " + letters.length;
  }
};



function eToPos(e) {
  var posX = e.clientX;
  var posY = e.clientY;
  if (mode == "m" && purpose != "") {
    posX = (e.targetTouches[0] ? e.targetTouches[0].pageX : e.changedTouches[e.changedTouches.length-1].pageX)
    posY = (e.targetTouches[0] ? e.targetTouches[0].pageY : e.changedTouches[e.changedTouches.length-1].pageY)
  }
  return [posX, posY]
}

document.onmousemove = handleMouseMove;
function handleMouseMove(e) {

  var [posX, posY] = eToPos(e);

  if (purpose == "draw" && inBound(canvasBound, posX, posY)) {
    posX -= canvasBound.left;
    posY -= canvasBound.top;

    if (mouseDown == 1) {
	  context.fillRect(posX-10, posY-10, 2,2)
	  l.push([posX, posY])
	  //console.log(posX, posY)
    }
  }
  else if (purpose == "scroll") {

    if (mouseDown == 1)
    {
      var xx = e.pageX - scroller.offsetLeft;
      var scroll = xx - scrollStartX;
      scroller.scrollLeft = scrollLeft - scroll;
      return
    }
  }
  if (mode == "m")
  {
  	e.preventDefault()
  }
}
 
window.addEventListener('touchmove',handleMouseMove, {passive:false});


