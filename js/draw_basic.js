/****************
* Interpret the key to determine which function to use for drawing
*****************/

function saveLocal(objectsArray){
  if (jQuery(".draw-diagram-input").length > 0) {
    jQuery(".draw-diagram-input").val(JSON.stringify(objectsArray));
  }
}
