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
/**
 * Draw generic.
 */
function drawObject(type, key, attr, nosave) {
  key = type + "_" + key;
  if (type == "coach" || type == "player") {
    type = "image";
  }
  if (type == "freehand" || type == "vector") {
    type = "path";
  }
  attr.type = type;
  if (typeof nosave == 'undefined') {
    objectsArray[key] = paper.add([attr]);
    objectsArray[key].attr({title: key});
    if (editor_mode) {
      // Make the object selectable in editor mode.
      objectsArray[key].click(function() { drupal_draw_drawing.editor.activate_object(this.attr("title")) });
    }
    return attr;
  }
  else {
    paper.add([attr]);
  }
  
}
/***************
* Get saved data
****************/
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
function travLocal(existing_data){
  for(var key in existing_data){
    drawFromJSON(key,existing_data[key]);
  }
}
function drawFromJSON(key, jsonstr, nosave){
  var info = key.split("_");

  var objTemp = jsonstr, temp;
  if(info[0].indexOf("Line") > -1){
    temp = drawLine(info[0], info[1], objTemp, nosave);
  }
  else {
    temp = drawObject(info[0], info[1], objTemp, nosave);
  }
  
  if (typeof nosave == 'undefined' && editor_mode) { 
    elements[key] = temp;
    saveLocal(elements, key);
    i++;
  }
}
