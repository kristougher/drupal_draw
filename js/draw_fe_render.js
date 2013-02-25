
(function ($, Drupal, window, document, undefined) {
  Drupal.behaviors.draw_render= {
    attach: function() {
      var drawings = {}, resize_factor = 1;

      $(".draw-canvas").each(function(){
        var image_path = "/" + $("#draw-diagram").attr("data-image_path");
        var form_element_name = $("#draw-diagram").attr("data-target_element");
        var saved_drawing;
        var nid = $(this).data("nid");
        /*** Draw the court and background ***/
        paper = Raphael(document.getElementById("draw-diagram-" + nid), Drupal.settings.draw_settings.canvas_width, Drupal.settings.draw_settings.canvas_height);

        // var i = 0;
        paper.setStart();
        paper.rect(0,0,Drupal.settings.draw_settings.canvas_width, Drupal.settings.draw_settings.canvas_height, 5).attr({"fill": "#ddd"});
        /*
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
        */

        
        if (typeof Drupal.settings.draw["drawing-" + nid] != "undefined") {
          if (typeof Drupal.settings.draw["drawing-" + nid].background != "undefined") {
            var background_id = Drupal.settings.draw["drawing-" + nid].background;
            delete Drupal.settings.draw["drawing-" + nid].background;
            
            for(var index in Drupal.settings.draw_settings.backgrounds['min_baggrund'].content) {
              var item = Drupal.settings.draw_settings.backgrounds['min_baggrund'].content[index];
              drawFromJSON(index, item);
            }
          }
          saved_drawing = Drupal.settings.draw["drawing-" + nid];
        }
        else {
          saved_drawing = {};
        }
        if (typeof saved_drawing != "undefined") {
          for(var element_title in saved_drawing) {
            drawFromJSON(element_title, saved_drawing[element_title]);
          }
        }
        drawings[nid] = paper.setFinish();
      });
    }
  }
})(jQuery, Drupal, this, this.document);