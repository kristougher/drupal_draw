var palette = new Array(),
objectsArray = new Array(),
tempObject,
elements = {},
i = 0,
editor_mode = (jQuery(".draw-diagram-input").length > 0),
current_attributes = {},
bounding_box = {};
(function ($) {
  /**
  var drupal_draw_drawing = {
    attributes: {
      editor_mode: false
    },
    image_path: "/" + $("#draw-diagram").attr("data-image_path"),
    form_element_name: $("#draw-diagram").attr("data-target_element"),
    paper: Raphael(document.getElementById("draw-diagram"), 500, 640), //Drupal.settings.draw.width, Drupal.settings.draw.height),
    palette: {},
    objectsArray: {},
    elements: {},
    i: 0,
    load_drawing: function(json_data) {
      if (typeof jsonstr != 'object') {
        jsonstr = JSON.parse(json_data);
      }
      if (json_data.length < 1) {
        return false;
      }
      for(var element_title in saved_drawing) {
        drawFromJSON(element_title, saved_drawing[element_title]);
      }
    }

  };
  /**/
$(document).ready(function(){
var image_path = "/" + $("#draw-diagram").attr("data-image_path");
var form_element_name = $("#draw-diagram").attr("data-target_element");

/*** Draw the court and background ***/
var paper = Raphael(document.getElementById("draw-diagram"), 500, 640);

// var i = 0;
paper.setStart();
paper.rect(0,0,400,640, 5).attr("fill","#ddd");

var court = paper.rect(50,20,300,600);
court.attr("fill", "#fb7");
court.attr("stroke", "#FFF");
var lines = paper.set();
lines.push(
	paper.path("M50 320L350 320"),
	paper.path("M50 220L350 220"),
	paper.path("M50 420L350 420")
);
lines.attr("stroke","#FFF");
var bg = paper.setFinish();
$("body").data("current_color", "#000");

/***
Attributes for the objects in the palette
***/
var attributes = {
	ballLine: { "stroke":"#222","stroke-dasharray":"-", "arrow-end": "classic-wide-long", "stroke-width": 2},
	movementLine: {"stroke":"#999","stroke-dasharray":"--", "arrow-end": "classic-wide-long", "stroke-width": 2},
	coach: function(no){
		var src;
		$.get(imagePath, {op:"image",image:"coach", no:no},function(data){
			src = data;

		});
			JSON.stringify(src)
			return src;
		},
	player: function(no){
			var src;
		$.get(imagePath, {op:"image",image:"player", no:no},function(data){
			src = {src:data};

		});
			return src;

		}
}
/*********
* Draw curved line. Requires an attributes-object
*********/
function drawLine(objType,no,pData){
  // Constructs an object ID
  var objKey = objType + "_" + no;

  objectsArray[objKey] = new Array();

  // We need pData a lot, so it is abbreviated
  var p = pData;

  // Constructs the first part of the SVG path-string p[0] is the starting coordinates.
  // The following 'C' is then shifted from array
  var path = "M"+p[0][1]+" "+p[0][2]+p[1].shift();

  //var firstLineNo = p[1].shift();
  // Adds the first coordinate.
  path = path+ p[1].shift(); //firstLineNo;

  for(var n in p[1]){
    path = path+" "+p[1][n];
  }
  var x = p[0][1];
  var y = p[0][2];
  var y2 = pData[1].pop();
  var x2 = pData[1].pop();

  objectsArray[objKey][0] = paper.path(path);
  objectsArray[objKey][0].attr(eval("attributes."+objType)).attr({stroke: $("body").data("current_color")});
  if ($(".draw-diagram-input").length > 0) {
    objectsArray[objKey][1] = paper.circle(x,y, 7);
    objectsArray[objKey][1].attr("title",objKey).attr("fill","#F00").click(activate_line);

    objectsArray[objKey][3] = paper.circle(x2,y2, 7);
    var y1 = pData[1].pop();
    var x1 = pData[1].pop();

    objectsArray[objKey][2] = paper.circle(x1,y1, 7);
    objectsArray[objKey][3].attr("title",objKey).attr("fill","#FFF");
    objectsArray[objKey][3].drag(pointMoveCurve,pointStart,pointUp);
    objectsArray[objKey][1].drag(pointMoveCurve,pointStart,pointUp);
    objectsArray[objKey][2].drag(pointMoveCurve,pointStart,pointUp);
    objectsArray[objKey][2].attr("opacity",0).hide();
    objectsArray[objKey][3].attr("opacity",0).hide();

    objectsArray[objKey][2].attr("title",objKey).attr("fill","#FFF");
  }
  return objectsArray[objKey][0].attr("path");
}
/**********
* Draw figure from graphics file
***********/
function drawFigure(type, no, attr){
  var key = type + "_" + no;
    objectsArray[key] = paper.image(attr.src,attr.x,attr.y,attr.width,attr.height);
    objectsArray[key].drag(move, start, up);
    objectsArray[key].attr("title", key);
    if($("body").data("imagesrc")){
          objectsArray[key].attr({src:$("body").data("imagesrc")});
      $("body").data("imagesrc","");
    }

    return objectsArray[key].attr();
}
/**
 * Draw generic.
 */
function drawObject(type, key, attr) {
  key = type + "_" + key;
  if (type == "coach" || type == "player") {
    type = "image";
  }
  if (type == "freehand") {
    type = "path";
  }
  objectsArray[key] = eval("paper." + type + "({})");
  objectsArray[key].attr(attr).drag(move, start, up);
  objectsArray[key].click(function () {
    $("body").data("active", this.attr("title"));
  });

  return attr;
}
/***************
* Get saved data
****************/
function travLocal(existing_data){
  for(var key in existing_data){
    drawFromJSON(key,existing_data[key]);
  }
}
function drawFromJSON(key,jsonstr){
  var info = key.split("_");

  var objTemp = jsonstr, temp;
  if(info[0].indexOf("Line") > -1){
    temp = drawLine(info[0], info[1], objTemp);
  }
  else {
    temp = drawObject(info[0], info[1], objTemp, false); // drawFigure(info[0], info[1], objTemp, false);
  }
  elements[key] = temp;
  saveLocal(elements);
  i++;
}

if ($(".draw-diagram-input").length > 0) {
  palette['player'] = paper.image(image_path + "/player.png", 450, 30, 25, 29);
  palette['player'].attr("title","player");

  palette['coach'] = paper.image(image_path + "/coach.png", 450, 70, 25, 29);
  palette['coach'].attr("fill", "#0fb");
  palette['coach'].attr("stroke", "#00f");
  palette['coach'].attr("title","coach");

  palette['ballLine'] = paper.image(image_path + "/pathicon1.png", 450, 110, 29, 28);
  palette['ballLine'].attr({"title":"ballLine"});

  palette['movementLine'] = paper.image(image_path + "/pathicon2.png", 450, 150, 30, 27);
  palette['movementLine'].attr({"title":"movementLine"});

  palette['freehand'] = paper.image(image_path + "/pencil.png", 410, 190, 30, 27);
  palette['freehand'].attr({"title":"path"});

  palette['rect'] = paper.image(image_path + "/rectangle.png", 450, 190, 30, 27);
  palette['rect'].attr({"title":"rect"});

  palette['undo'] = paper.image(image_path + "/undo.png", 450, 230, 30, 27);
  palette['undo'].attr({"title":"undo"});

  palette['trash'] = paper.image(image_path + "/trash.png", 450, 270, 30, 27);
  palette['trash'].attr({"title":"trash"});

  palette['colors'] = {
    blue: paper.rect(468, 320, 30, 30).attr({fill : "#77F", stroke: "#000", "stroke-width": 2}),
    red: paper.rect(428, 320, 30, 30).attr({fill : "#F33", stroke: "#000", "stroke-width": 2}),
    black: paper.rect(428, 400, 30, 30).attr({fill : "#000", stroke: "#000", "stroke-width": 2}),
    green: paper.rect(468, 400, 30, 30).attr({fill : "#3F3", stroke: "#000", "stroke-width": 2}),
    grey: paper.rect(468, 360, 30, 30).attr({fill : "#777", stroke: "#000", "stroke-width": 2}),
  };

  for (var col in palette["colors"]) {
    palette["colors"][col].click(function() {
      $("body").data("current_color", this.attr("fill"));

      for (var color in palette["colors"]) {
        palette["colors"][color].attr({stroke: "#000"})
      }
      this.attr({stroke: this.attr("fill")});
    })
  }

  var toolbox = paper.set();
  toolbox.push(palette['coach'],palette['player']);

// The temp var. Frequently used below
var temp;

// Attributes for dragging instances
var start = function () {
    // storing original coordinates
    this.ox = this.attr("x");
    this.oy = this.attr("y");
    this.oop = this.attr("opacity");
    this.attr({opacity: .5});
},
move = function (dx, dy) {
    // move will be called with dx and dy
    this.attr({x: (Math.round(this.ox) + dx), y: (Math.round(this.oy) + dy)});
},
up = function () {
    // restoring state
    this.attr({opacity: this.oop});
    elements[this.attr("title")] = this.attr();
    saveLocal(elements);
    this.attr({opacity: 1});
    //jsonObj.figures[this.attr("title")] = this.attr();
},
activate_line = function() {
  if ($("body").data("active").length > 0) {
    deactivate_object($("body").data("active"));
  }
  $("body").data("active", this.attr("title"));
  for(var key in objectsArray[this.attr("title")]) {
    objectsArray[this.attr("title")][key].show().attr("opacity", 1);
  }
  $("body").data("active", this.attr("title"));
},
deactivate_object = function(objKey) {
  if (typeof objKey != "undefined" && objKey.indexOf("Line") > -1) {
    objectsArray[objKey][1].attr("opacity", "50%");
    objectsArray[objKey][2].attr("opacity", 0).hide();
    objectsArray[objKey][3].attr("opacity", 0).hide();
  }
},
activate_object = function(objTitle) {
  deactivate_object($("body").data("active"));
//  bounding_box = objectsArray[objTitle].getBBox();

  $("body").data("active", objTitle);
},
point_add = function(path_object, x, y) {
  console.log(path_object);
  var new_path = path_object.attr("path") + " " + x + " " + y;
  path_object.attr({path: new_path});

  return path_object;
}
rectangle_start = function(x, y) {
  var canvas_offset = $("#draw-diagram").offset();

  tempObject = paper.rect((x - canvas_offset.left), (y - canvas_offset.top), 5, 5);
  tempObject.attr({stroke: $("body").data("current_color"), "stroke-width": 2, title: "rect_" + i});
  tempObject.key = "rect_" + i;
},
rectangle_draw = function(dx, dy, x, y) {
  tempObject.attr({width: Math.sqrt(dx * dx), height: Math.sqrt(dy * dy)});
},
rectangle_end = function() {
  bg.undrag().attr({cursor: "default"});
  elements["rect_" + i] = tempObject.attr();
  i++;
  saveLocal(elements);
},
freehand_start = function(x, y) {
  tempObject = paper.path().attr({stroke: $("body").data("current_color"), "stroke-width": 2, title: "path_" + i});
  var canvas_offset = $("#draw-diagram").offset();
  tempObject.ox = x - canvas_offset.left;
  tempObject.oy = y - canvas_offset.top;
  tempObject.key = "path_" + i;
  i++;

  tempObject.attr({path: "M" + tempObject.ox + " " + tempObject.oy + " C" + tempObject.ox + " " + tempObject.oy});
},
freehand_draw = function(dx, dy, x, y) {
  dx += tempObject.ox;
  dy += tempObject.oy;

  var new_path = tempObject.attr("path") + " " + dx + " " + dy;
  tempObject.attr({path: new_path});
},
freehand_end = function() {
  bg.undrag().attr({cursor: "default"});
  objectsArray[tempObject.key] = tempObject;
  elements[tempObject.key] = tempObject.attr();
  
  objectsArray[tempObject.key].click(function(){ activate_object(this.attr("title")) });

  saveLocal(elements);
};

// Attributes for manipulating lines
var pointStart = function () {
    // storing original coordinates
    this.ox = this.attr("cx");
    this.oy = this.attr("cy");
    this.oop = this.attr("opacity");
    this.attr({opacity: .5});
},
pointMove = function (dx, dy) {
    // move will be called with dx and dy
    this.attr({cx: (Math.round(this.ox) + dx), cy: (Math.round(this.oy) + dy)});

    //gonna use the title quite a bit
	var t = this.attr("title");

    objectsArray[t][0].attr("path","M"+objectsArray[t][1].attr("cx")+" "+objectsArray[t][1].attr("cy")+"L"+objectsArray[t][2].attr("cx")+" "+objectsArray[t][2].attr("cy"));
},
pointMoveCurve = function (dx, dy) {
    // move will be called with dx and dy
    this.attr({cx: (Math.round(this.ox) + dx), cy: (Math.round(this.oy) + dy)});

    //gonna use the title quite a bit
    var t = this.attr("title");

    objectsArray[t][0].attr("path","M"+objectsArray[t][1].attr("cx")+" "+objectsArray[t][1].attr("cy")+"C"+objectsArray[t][1].attr("cx")+" "+objectsArray[t][1].attr("cy")+" "+objectsArray[t][2].attr("cx")+" "+objectsArray[t][2].attr("cy")+" "+objectsArray[t][3].attr("cx")+" "+objectsArray[t][3].attr("cy"));
},
pointUp = function () {
    // restoring state
    this.attr({opacity: this.oop});
    elements[this.attr("title")] = objectsArray[this.attr("title")][0].attr("path");
    saveLocal(elements);
};

// Attributes for dragging prototypes
var startOrig = function () {
	temp = this.clone();
/*	     if($("#imagelabel").val().length > 0){
		var label =  $("#imagelabel").val();
		 $("#imagelabel").val("");
	     } else {
*/
		var label = i;
		i++;
//	     }
	$("body").data("imagelabel",label);
/*	$.get(imagePath, {op:'image',image:this.attr("title"), no:label},function(data){
			$("body").data("imagesrc",data); //{src:data};

		});
*/
	 // storing original coordinates
	temp.ox = temp.attr("x");
	temp.oy = temp.attr("y");
	temp.attr({opacity: 0.5});
},
moveOrig = function (dx, dy) {
    // move will be called with dx and dy
    temp.attr({x: temp.ox + dx, y: temp.oy + dy});
},
upOrig = function () {
  // restoring state
  temp.attr({opacity: 1});

  elements[this.attr("title") + "_" + i] = drawFigure(this.attr("title"), i, temp.attr());
  i++;
  $("body").data("imagelabel","");
  temp.remove();
  saveLocal(elements);
  $("body").data("active", this.attr("title") + "_" + i);
},
upOrigLine = function(){
	var lineArray = new Array();
	lineArray[0]=["M",this.attr("x"),this.attr("y")];

	lineArray[1]=["C",this.attr("x"),this.attr("y"),(this.attr("x")+30),(this.attr("y")+40),(this.attr("x")+60),(this.attr("y")+60)];

	var templine = drawLine(this.attr("title"),i, lineArray);

  elements[this.attr("title") + "_" + i] = templine;
  saveLocal(elements);
	this.attr({x: this.ox, y: this.oy, opacity: 1});
  $("body").data("active", this.attr("title") + "_" + i);
  i++;
};

// Palette functions.
palette['ballLine'].drag(move, start, upOrigLine);
palette['movementLine'].drag(move, start, upOrigLine);
palette['freehand'].click(function(){
  bg.drag(freehand_draw, freehand_start, freehand_end).attr({cursor: "crosshair"});
});
palette['rect'].click(function(){
  bg.drag(rectangle_draw, rectangle_start, freehand_end).attr({cursor: "crosshair"});
});
toolbox.drag(moveOrig, startOrig, upOrig);

palette['trash'].click(function(){
  // Lines are actually 3 objects. They all need to be removed.
  if($("body").data("active").indexOf("Line") > -1) {
    for (var j in objectsArray[$("body").data("active")]) {
      objectsArray[$("body").data("active")][j].remove();
    }
  }
  else {
    // Other objects.
    objectsArray[$("body").data("active")].remove();
  }
  // Delete the data of the object.
  delete objectsArray[$("body").data("active")];
  delete elements[$("body").data("active")];
  saveLocal(elements);
  $("body").data("active", "");
});
palette['undo'].click(function(){
  if (typeof(Storage)!=="undefined") {

  }
  if (typeof $("body").data("draw_latest") != "undefined") {
    elements[$("body").data("draw_latest")].remove();
    saveLocal(elements);
  }
});
}
var saved_drawing;
if ($("#edit-field-diagram-und-0-value").length && $("#edit-field-diagram-und-0-value").val().length > 2) {
   saved_drawing = JSON.parse($("#edit-field-diagram-und-0-value").val());
}
else {
  saved_drawing = JSON.parse(Drupal.settings.draw.drawing);
}
if (typeof saved_drawing != "undefined") {
  for(var element_title in saved_drawing) {
    drawFromJSON(element_title, saved_drawing[element_title]);
  }
}
$("body").data("active", "");
});
})(jQuery);