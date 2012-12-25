/****************
* Interpret the key to determine which function to use for drawing
*****************/

function saveLocal(objects_array, last_title){
  if (jQuery(".draw-diagram-input").length > 0) {
    // Undo option
    jQuery("body").data("draw_latest", last_title)
    if(typeof(Storage)!=="undefined") {
      localStorage.undo = JSON.stringify(objects_array);
    }
    jQuery(".draw-diagram-input").val(JSON.stringify(objects_array));
  }
}
