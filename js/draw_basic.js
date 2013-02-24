/****************
* Interpret the key to determine which function to use for drawing
*****************/
var objectsArray = new Array(),
elements = {}, 
paper,
editor_mode,
i=0;
var attributes = {
    movementLine: {"arrow-end": "classic-wide-long", "stroke-dasharray": "--", "stroke-width": 2},
    ballLine: {"arrow-end": "classic-wide-long", "stroke-dasharray": "-", "stroke-width": 2},
    coach: function(no){
      var src;
        JSON.stringify(src)
        return src;
      },
    player: function(no){
        var src;
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
  var p = pData.path, p2 = pData.path;
  delete pData.path;
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
  var y2 = p2[1].pop();
  var x2 = p2[1].pop();
  
  objectsArray[objKey][0] = paper.path(path);

  objectsArray[objKey][0].attr(eval("attributes."+objType)).attr(pData);
  if (editor_mode) {
    objectsArray[objKey][1] = paper.circle(x,y, 7);
    objectsArray[objKey][1].attr("title",objKey).attr("fill","#F00").click(drupal_draw_drawing.editor.activate_line);

    objectsArray[objKey][3] = paper.circle(x2,y2, 7);
    var y1 = p2[1].pop();
    var x1 = p2[1].pop();

    objectsArray[objKey][2] = paper.circle(x1,y1, 7);
    objectsArray[objKey][3].attr("title",objKey).attr("fill","#FFF");
    objectsArray[objKey][3].drag(drupal_draw_drawing.editor.pointMoveCurve,drupal_draw_drawing.editor.pointStart,drupal_draw_drawing.editor.pointUp);
    objectsArray[objKey][1].drag(drupal_draw_drawing.editor.pointMoveCurve,drupal_draw_drawing.editor.pointStart,drupal_draw_drawing.editor.pointUp);
    objectsArray[objKey][2].drag(drupal_draw_drawing.editor.pointMoveCurve,drupal_draw_drawing.editor.pointStart,drupal_draw_drawing.editor.pointUp);
    objectsArray[objKey][2].attr("opacity",0).hide();
    objectsArray[objKey][3].attr("opacity",0).hide();

    objectsArray[objKey][2].attr("title",objKey).attr("fill","#FFF");
  }
  return objectsArray[objKey][0].attr();
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
  attr.type = type;
  objectsArray[key] = paper.add([attr]);
  objectsArray[key].attr({title: key});
  if (editor_mode) {
    // Make the object selectable in editor mode.
    objectsArray[key].click(function() { drupal_draw_drawing.editor.activate_object(this.attr("title")) });
  }

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
    temp = drawObject(info[0], info[1], objTemp, false);
  }
  elements[key] = temp;
  saveLocal(elements, key);
  i++;
}

function saveLocal(objects_array, last_title){
  if (jQuery(".draw-diagram-input").length > 0) {
    // Undo option
    jQuery("body").data("draw_latest", last_title)
    if(typeof localStorage !=="undefined") {
      localStorage.undo = JSON.stringify(objects_array);
    }
    jQuery(".draw-diagram-input").val(JSON.stringify(objects_array));
  }
}
