var palette = new Array(),
tempObject,
i = 0,
current_attributes = {"stroke-width": 2},
bounding_box = {},
drupal_draw_drawing = {};
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
editor_mode = (jQuery(".draw-diagram-input").length > 0);
/*** Draw the court and background ***/
paper = Raphael(document.getElementById("draw-diagram"), 500, 640);

// var i = 0;
paper.setStart();
paper.rect(0,0,400,640, 5).attr({"fill": "#ddd"});

var court = paper.rect(50,20,300,600);
court.attr({"fill": "#aaa", "stroke-width": 3});
court.attr("stroke", "#FFF");
var lines = paper.set();
lines.push(
	paper.path("M50 320L350 320"),
	paper.path("M50 220L350 220"),
	paper.path("M50 420L350 420")
);
lines.attr({"stroke":"#FFF", "stroke-width": 3});
var bg = paper.setFinish();
$("body").data("current_color", "#000");

/***
Attributes for the objects in the palette
***/
var attributes = {
  movementLine: {"arrow-end": "classic-wide-long", "stroke-dasharray": "--", "stroke-width": 2},
	ballLine: {"arrow-end": "classic-wide-long", "stroke-dasharray": "-", "stroke-width": 2},
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


if ($(".draw-diagram-input").length > 0) {
  palette['player'] = paper.image(image_path + "/player.png", 450, 30, 25, 29);
  palette['player'].attr("title","player");

  palette['coach'] = paper.image(image_path + "/coach.png", 410, 30, 25, 29);
  palette['coach'].attr("fill", "#0fb");
  palette['coach'].attr("stroke", "#00f");
  palette['coach'].attr("title","coach");

  palette['text'] = paper.image(image_path + "/type.png", 410, 70, 29, 28);
  palette['text'].attr({"title":"text", opacity: "0.7"});

  palette['ballLine'] = paper.image(image_path + "/pathicon1.png", 410, 110, 29, 28);
  palette['ballLine'].attr({"title":"ballLine", opacity: "0.7"});

  palette['circle'] = paper.image(image_path + "/circle.png", 450, 110, 29, 28);
  palette['circle'].attr({"title":"circle", opacity: "0.7"});

  palette['freehand'] = paper.image(image_path + "/pencil.png", 410, 150, 30, 27);
  palette['freehand'].attr({"title":"path", opacity: "0.7"});

  palette['rect'] = paper.image(image_path + "/rectangle.png", 450, 150, 30, 27);
  palette['rect'].attr({"title":"rect", opacity: "0.7"});
/*
  palette['undo'] = paper.image(image_path + "/undo.png", 450, 230, 30, 27);
  palette['undo'].attr({"title":"undo"});
*/
  palette['trash'] = paper.image(image_path + "/trash.png", 450, 190, 30, 27);
  palette['trash'].attr({"title":"trash"});

  palette['dashes'] = [];
  palette['dashes']['dash'] = paper.image(image_path + "/pathicon0.png", 410, 270, 29, 28).attr({"stroke-dasharray": ""});
  palette['dashes']['dash-'] = paper.image(image_path + "/pathicon1.png", 440, 270, 29, 28).attr({"stroke-dasharray": "-", opacity: "0.7"});
  palette['dashes']['dash--'] = paper.image(image_path + "/pathicon2.png", 470, 270, 30, 27).attr({"stroke-dasharray": "--", opacity: "0.7"});

  for (var dash in palette["dashes"]) {
    console.log(i, {item:palette["dashes"][dash].attr("stroke-dasharray")});
    palette["dashes"][dash].click(function() {

      current_attributes["stroke-dasharray"] = this.attr("stroke-dasharray");
      
      for (var dash_type in palette["dashes"]) {
        palette["dashes"][dash_type].attr({opacity: "0.7"});
      };
      this.attr({opacity: 1});
    });
  }

  palette['colors'] = {
    blue: paper.rect(409, 320, 25, 25).attr({fill : "#77F", stroke: "#000", "stroke-width": 2}),
    red: paper.rect(442, 320, 25, 25).attr({fill : "#F33", stroke: "#000", "stroke-width": 2}),
    black: paper.rect(475, 320, 25, 25).attr({fill : "#000", stroke: "#000", "stroke-width": 2}),
    green: paper.rect(409, 360, 25, 25).attr({fill : "#3F3", stroke: "#000", "stroke-width": 2}),
    white: paper.rect(442, 360, 25, 25).attr({fill : "#FFF", stroke: "#000", "stroke-width": 2}),
    grey: paper.rect(475, 360, 25, 25).attr({fill : "#777", stroke: "#000", "stroke-width": 2}),
  };

  for (var col in palette["colors"]) {
    palette["colors"][col].click(function() {
      current_attributes.stroke = this.attr("fill");

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
drupal_draw_drawing.editor = {
  // Attributes for dragging instances
  start: function () {
      // storing original coordinates
      this.ox = this.attr("x");
      this.oy = this.attr("y");
      this.oop = this.attr("opacity");
      this.attr({opacity: .5});
  },
  move: function (dx, dy) {
      // move will be called with dx and dy
      this.attr({x: (Math.round(this.ox) + dx), y: (Math.round(this.oy) + dy)});
  },
  up: function () {
      // restoring state
      this.attr({opacity: this.oop});
      elements[this.attr("title")] = this.attr();
      saveLocal(elements, this.attr("title"));
      this.attr({opacity: 1});
  },
  // Make a line active
  activate_line: function() {
    if ($("body").data("active").length > 0) {
      drupal_draw_drawing.editor.deactivate_object($("body").data("active"));
    }
    $("body").data("active", this.attr("title"));

    for(var key in objectsArray[this.attr("title")]) {
      objectsArray[this.attr("title")][key].show().attr("opacity", 1);
    }
    $("body").data("active", this.attr("title"));
  },
  deactivate_object: function(objKey) {
    if (typeof objKey != "undefined" && objKey.indexOf("Line") > -1) {
      objectsArray[objKey][1].attr("opacity", "50%");
      objectsArray[objKey][2].attr("opacity", 0).hide();
      objectsArray[objKey][3].attr("opacity", 0).hide();
    }
    else if (typeof objectsArray[objKey] != "undefined") {
      objectsArray[objKey].attr({opacity: 1}).undrag();
    }
  },
  // Make an object active
  activate_object: function(objTitle) {
    drupal_draw_drawing.editor.deactivate_object($("body").data("active"));
    $("body").data("active", objTitle);
    objectsArray[objTitle].attr({opacity: "0.4"}).undrag();
    objectsArray[objTitle].drag(drupal_draw_drawing.editor.move, drupal_draw_drawing.editor.start, drupal_draw_drawing.editor.up); 
  },
  point_add: function(path_object, x, y) {
    var new_path = path_object.attr("path") + " " + x + " " + y;
    path_object.attr({path: new_path});

    return path_object;
  },
  text_start: function(e) {
    $("body").append('<div id="draw-text-input"><input type="text" /></div>');
    $("#draw-text-input").css({position: "absolute", top: e.pageY, left: e.pageX});
    $("#draw-text-input input").keyup(function(k){ 
      if (k.keyCode == 13) {
        tempObject = paper.text(e.layerX, e.layerY, $(this).val()).attr(current_attributes).attr({"font-size":"20px", type: "text"});
        tempObject.key = "text_" + i;

        objectsArray[tempObject.key] = tempObject;
        objectsArray[tempObject.key].attr({title: tempObject.key})
        objectsArray[tempObject.key].click(function(){ drupal_draw_drawing.editor.activate_object(this.attr("title")) });
        elements["text_" + i] = tempObject.attr();
        i++;
        saveLocal(elements);
        $("#draw-text-input").remove();
        bg.unclick().attr({cursor: "auto"});
      } 

    }).focus();
  },
  circle_start: function(x, y) {
    var canvas_offset = $("#draw-diagram").offset();

    tempObject = paper.circle((x - canvas_offset.left), (y - canvas_offset.top), 5);
    tempObject.attr({"stroke-width": 2, type: "circle", title: "circle_" + i}).attr(current_attributes);
    tempObject.key = "circle_" + i;
  },
  circle_draw: function(dx, dy, x, y) {
    tempObject.attr({r: Math.sqrt((dx * dx) + (dy * dy))});
  },
  circle_end: function() {
    bg.undrag().attr({cursor: "default"});
    elements["circle_" + i] = tempObject.attr();
    i++;
    saveLocal(elements);
  },
  rectangle_start: function(x, y) {
    var canvas_offset = $("#draw-diagram").offset();

    tempObject = paper.rect((x - canvas_offset.left), (y - canvas_offset.top), 5, 5);
    tempObject.attr({"stroke-width": 2, title: "rect_" + i}).attr(current_attributes);
    tempObject.key = "rect_" + i;
  },
  rectangle_draw: function(dx, dy, x, y) {
    tempObject.attr({width: Math.sqrt(dx * dx), height: Math.sqrt(dy * dy)});
  },
  rectangle_end: function() {
    bg.undrag().attr({cursor: "default"});
    elements["rect_" + i] = tempObject.attr();
    i++;
    saveLocal(elements);
  },
  freehand_start: function(x, y) {
    tempObject = paper.path().attr(current_attributes);
    var canvas_offset = $("#draw-diagram").offset();
    tempObject.ox = x - canvas_offset.left;
    tempObject.oy = y - canvas_offset.top;
    tempObject.key = "path_" + i;
    i++;

    tempObject.attr({path: "M" + tempObject.ox + " " + tempObject.oy + " C" + tempObject.ox + " " + tempObject.oy});
  },
  freehand_draw: function(dx, dy, x, y) {
    dx += tempObject.ox;
    dy += tempObject.oy;

    var new_path = tempObject.attr("path") + " " + dx + " " + dy;
    tempObject.attr({path: new_path});
  },
  freehand_end: function() {
    bg.undrag().attr({cursor: "default"});
    objectsArray[tempObject.key] = tempObject;
    objectsArray[tempObject.key].attr("title", tempObject.key);
    elements[tempObject.key] = tempObject.attr();
    
    objectsArray[tempObject.key].click(function(){ drupal_draw_drawing.editor.activate_object(this.attr("title")) });

    saveLocal(elements);
  },
  // Attributes for manipulating lines
  pointStart: function () {
      // storing original coordinates
      this.ox = this.attr("cx");
      this.oy = this.attr("cy");
      this.oop = this.attr("opacity");
      this.attr({opacity: .5});
  },
  pointMove: function (dx, dy) {
      // move will be called with dx and dy
      this.attr({cx: (Math.round(this.ox) + dx), cy: (Math.round(this.oy) + dy)});

      //gonna use the title quite a bit
  	var t = this.attr("title");

      objectsArray[t][0].attr("path","M"+objectsArray[t][1].attr("cx")+" "+objectsArray[t][1].attr("cy")+"L"+objectsArray[t][2].attr("cx")+" "+objectsArray[t][2].attr("cy"));
  },
  pointMoveCurve: function (dx, dy) {
      // move will be called with dx and dy
      this.attr({cx: (Math.round(this.ox) + dx), cy: (Math.round(this.oy) + dy)});

      //gonna use the title quite a bit
      var t = this.attr("title");

      objectsArray[t][0].attr("path","M"+objectsArray[t][1].attr("cx")+" "+objectsArray[t][1].attr("cy")+"C"+objectsArray[t][1].attr("cx")+" "+objectsArray[t][1].attr("cy")+" "+objectsArray[t][2].attr("cx")+" "+objectsArray[t][2].attr("cy")+" "+objectsArray[t][3].attr("cx")+" "+objectsArray[t][3].attr("cy"));
  },
  pointUp: function () {
      // restoring state
      this.attr({opacity: this.oop});
      elements[this.attr("title")] = objectsArray[this.attr("title")][0].attr();
      saveLocal(elements);
  },

  // Attributes for dragging prototypes
  startOrig: function () {
  	temp = this.clone();
  		var label = i;
  		i++;
  //	     }
  	$("body").data("imagelabel",label);
  	 // storing original coordinates
  	temp.ox = temp.attr("x");
  	temp.oy = temp.attr("y");
  	temp.attr({opacity: 0.5});
  },
  moveOrig: function (dx, dy) {
      // move will be called with dx and dy
      temp.attr({x: temp.ox + dx, y: temp.oy + dy});
  },
  upOrig: function () {
    // restoring state
    temp.attr({opacity: 1});
    temp.undrag();
    elements[this.attr("title") + "_" + i] = drawObject(this.attr("title"), i, temp.attr());
    i++;
    $("body").data("imagelabel","");
    temp.remove();
    saveLocal(elements);
    $("body").data("active", this.attr("title") + "_" + i);
  },
  upOrigLine: function(){
  	var lineArray = current_attributes;
    lineArray.path = [];
  	lineArray.path[0]=["M",this.attr("x"),this.attr("y")];

  	lineArray.path[1]=["C",this.attr("x"),this.attr("y"),(this.attr("x")+30),(this.attr("y")+40),(this.attr("x")+60),(this.attr("y")+60)];

  	var templine = drawLine(this.attr("title"),i, lineArray);

    elements[this.attr("title") + "_" + i] = templine;
    saveLocal(elements);
  	this.attr({x: this.ox, y: this.oy, opacity: 1});
    $("body").data("active", this.attr("title") + "_" + i);
    i++;
  }
};
function palette_select(selected){
  $.each(palette, function(index, item){
    item.attr({stroke: "#FFF"});
  });
  palette[selected].attr({stroke: "#000"});
}

// Palette functions.
palette['ballLine'].drag(drupal_draw_drawing.editor.move, drupal_draw_drawing.editor.start, drupal_draw_drawing.editor.upOrigLine).attr({cursor: "pointer"});

palette['text'].click(function(){
  bg.click(drupal_draw_drawing.editor.text_start).attr({cursor: "text"});
  palette_select("text");
}).attr({cursor: "pointer"});

palette['circle'].click(function(){
  bg.drag(drupal_draw_drawing.editor.circle_draw, drupal_draw_drawing.editor.circle_start, drupal_draw_drawing.editor.freehand_end).attr({cursor: "crosshair"});
}).attr({cursor: "pointer"});

palette['freehand'].click(function(){
  bg.drag(drupal_draw_drawing.editor.freehand_draw, drupal_draw_drawing.editor.freehand_start, drupal_draw_drawing.editor.freehand_end).attr({cursor: "crosshair"});
}).attr({cursor: "pointer"});

palette['rect'].click(function(){
  bg.drag(drupal_draw_drawing.editor.rectangle_draw, drupal_draw_drawing.editor.rectangle_start, drupal_draw_drawing.editor.freehand_end).attr({cursor: "crosshair"});
}).attr({cursor: "pointer"});
toolbox.drag(drupal_draw_drawing.editor.moveOrig, drupal_draw_drawing.editor.startOrig, drupal_draw_drawing.editor.upOrig).attr({cursor: "pointer"});

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

}

var saved_drawing;
if ($("#edit-field-diagram-und-0-value").length && $("#edit-field-diagram-und-0-value").val().length > 2) {
   saved_drawing = JSON.parse($("#edit-field-diagram-und-0-value").val());
}
else {
  saved_drawing = {}; //JSON.parse(Drupal.settings.draw.drawing);
}
if (typeof saved_drawing != "undefined") {
  for(var element_title in saved_drawing) {
    drawFromJSON(element_title, saved_drawing[element_title]);
  }
}
$("body").data("active", "");
});
})(jQuery);