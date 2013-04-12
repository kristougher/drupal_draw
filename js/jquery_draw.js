(function ($) {
  var palette = {},
  tempObject, tempCurve = {},
  i = 0,
  current_attributes = {"stroke-width": 2},
  bounding_box = {},
  drupal_draw_drawing = {},
  elements = {},
  objectsArray = {},
  background_list = {};
  var paper;
  var temp;
  var bg;
  var editor = {
    currentObjectID: "",
  setBackground: function(backgrounds, bg_id, width, height) {
    if (backgrounds.length < 1) {
      bg = paper.rect(0, 0, width, height);
      return;
    }
    $.each(backgrounds, function(index, item){
      item.hide();
    });
    $(".draw-background-select").find("option[value='" + bg_id + "']").attr("selected", "selected");
    backgrounds[bg_id].show();
    bg = background_list[bg_id];
  },
  // Attributes for dragging instances
  start: function () {
    if (this.type == "circle") {
      this.ox = this.attr("cx");
      this.oy = this.attr("cy");
    }
    else {
      this.ox = this.attr("x");
      this.oy = this.attr("y");
    }
    // storing original coordinates
    this.oop = this.attr("opacity");
    this.attr({opacity: .5});
  },
  move: function (dx, dy) {
      // move will be called with dx and dy
    if (this.type == "circle") {
      this.attr({cx: (Math.round(this.ox) + dx), cy: (Math.round(this.oy) + dy)});
    }
    else {
      this.attr({x: (Math.round(this.ox) + dx), y: (Math.round(this.oy) + dy)});
    }
  },
  up: function () {
      // restoring state
      this.attr({opacity: this.oop});
      elements[this.attr("title")] = this.attr();
      editor.saveLocal(elements, this.attr("title"));
      this.attr({opacity: 1});
  },
  // Make a line active
  activate_line: function() {
    if (editor.currentObjectID.length > 0) {
      editor.deactivate_object($("body").data("active"));
    }
    $("body").data("active", this.attr("title"));

    for(var key in objectsArray[this.attr("title")]) {
      objectsArray[this.attr("title")][key].show().attr("opacity", 1);
    }
    editor.currentObjectID = this.attr("title");
  },
  deactivate_object: function(objKey) {
    if (objKey.length > 0 && objKey.indexOf("vector") > -1) {
      delete tempCurve[0];
      for(var j in tempCurve) {
        tempCurve[j].remove();
        delete tempCurve[j];
      }
      tempCurve = {};
    }
    else if (typeof objectsArray[objKey] != "undefined") {
      objectsArray[objKey].attr({opacity: 1}).undrag();
    }
    editor.currentObjectID = "";
  },
  // Make an object active
  activate_object: function(objTitle) {
    editor.deactivate_object(editor.currentObjectID);
    editor.currentObjectID = objTitle;

    if (objTitle.indexOf("vector") === -1){
      objectsArray[objTitle].op = objectsArray[objTitle].attr("opacity");
      objectsArray[objTitle].attr({opacity: "0.4"}).undrag();
      objectsArray[objTitle].drag(editor.move, editor.start, editor.up); 
    }
    else {
      editor.vectorPoints(objTitle); //objTitle);
    }
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
        objectsArray[tempObject.key].click(function(){ editor.activate_object(this.attr("title")) });
        elements["text_" + i] = tempObject.attr();
        i++;
        editor.saveLocal(elements);
        $("#draw-text-input").remove();
        bg.unclick().attr({cursor: "auto"});
      } 

    }).focus();
  },
  circle_start: function(x, y) {
    var canvas_offset = $("#draw-diagram").offset();

    tempObject = paper.circle((x - canvas_offset.left), (y - canvas_offset.top), 5);
    tempObject.attr({type: "circle", title: "circle_" + i}).attr(current_attributes);
    tempObject.key = "circle_" + i;
  },
  circle_draw: function(dx, dy, x, y) {
    tempObject.attr({r: Math.sqrt((dx * dx) + (dy * dy))});
  },
  circle_end: function() {
    bg.undrag().attr({cursor: "default"});
    elements["circle_" + i] = tempObject.attr();
    i++;
    editor.saveLocal(elements);
  },
  vector_start: function(mx, my, event) {
    var canvas_offset = $("#draw-diagram").offset();
    var x = event.pageX - canvas_offset.left;
    var y = event.pageY - canvas_offset.top;
    // The object has not been created yet.

      tempObject = paper.path().attr(current_attributes);
      tempObject.key = "vector_" + i;
      i++;
      tempObject.coord = {x:x,y:y};
      tempObject.coord_old = {x:x,y:y};

      tempObject.attr({path: "M" + x + "," + y, title: tempObject.key});
  },
  vector_move: function(dx, dy, x, y, event) {
    dx += tempObject.coord.x;
    dy += tempObject.coord.y;

    var middle_x = (dx + tempObject.coord.x) / 2,
    middle_y = (dy + tempObject.coord.y) / 2;

    var new_path = "M" + tempObject.coord.x + "," + tempObject.coord.y + "L " + middle_x + "," + middle_y + " " + dx + "," + dy;
    tempObject.attr({path: new_path});
  },
  vector_point_add: function(event) {
    var canvas_offset = $("#draw-diagram").offset();
    var x = event.pageX - canvas_offset.left;
    var y = event.pageY - canvas_offset.top;
    

    var new_path = tempObject.attr("path") + "L" + x + "," + y; //+ tempObject.coord.x + "," + tempObject.coord.y + " " + x + "," + y;
    tempObject.attr({path: new_path});
    tempObject.coord_old = tempObject.coord;
    tempObject.coord = {x:x,y:y}
  },
  vector_end: function(event) {
    tempObject.attr();

    elements[tempObject.key] = tempObject.attr();
    objectsArray[tempObject.key] = tempObject;
    objectsArray[tempObject.key].click(function(){ editor.activate_object(this.attr("title")) });

    editor.saveLocal(elements);
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

    /*
    objectsArray[tempObject.key] = tempObject;
    objectsArray[tempObject.key].attr("title", tempObject.key);
    elements[tempObject.key] = tempObject.attr();
    
    objectsArray[tempObject.key].click(function(){ editor.activate_object(this.attr("title")) });

    editor.saveLocal(elements);
    */
    editor.finishElement(tempObject);
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

      objectsArray[t].attr("path","M"+tempCurve[1].attr("cx")+" "+ tempCurve[1].attr("cy")+"L"+objectsArray[t][2].attr("cx")+" "+objectsArray[t][2].attr("cy"));
  },
  pointMoveCurve: function (dx, dy) {
      // move will be called with dx and dy
      this.attr({cx: (Math.round(this.ox) + dx), cy: (Math.round(this.oy) + dy)});

      //gonna use the title quite a bit
      var t = this.attr("title");

       objectsArray[t].attr("path","M"
        +tempCurve[1].attr("cx")+" "+tempCurve[1].attr("cy")
        +"C"+tempCurve[1].attr("cx")+" "+tempCurve[1].attr("cy")
        +" "+tempCurve[2].attr("cx")+" "+tempCurve[2].attr("cy")
        +" "+tempCurve[3].attr("cx")+" "+tempCurve[3].attr("cy"));
  },
  pointUp: function () {
      // restoring state
      this.attr({opacity: this.oop});
      var attr = objectsArray[tempCurve[0]].attr();;
      // Odd difference between loaded and newly created curves.
      if (editor.isset(attr.items)) {
        attr = attr[0].attrs;
      }

      elements[tempCurve[0]] = attr;
      editor.saveLocal(elements);
  },
  rectangle_start: function(x, y) {
    var canvas_offset = $("#draw-diagram").offset();

    tempObject = paper.rect((x - canvas_offset.left), (y - canvas_offset.top), 5, 5);
    tempObject.attr({title: "rect_" + i}).attr(current_attributes);
    tempObject.key = "rect_" + i;
  },
  rectangle_draw: function(dx, dy, x, y) {
    tempObject.attr({width: Math.sqrt(dx * dx), height: Math.sqrt(dy * dy)});
  },
  rectangle_end: function() {
    bg.undrag().attr({cursor: "default"});

    editor.finishElement(tempObject);
  },
  finishElement: function(element) {
    var key = element.type + "_" + i;
    i++;
    objectsArray[key] = element;
    objectsArray[key].attr("title", key);
    elements[key] = element.attr();
    
    objectsArray[key].click(function(){ editor.activate_object(this.attr("title")); });
    element = {};
    editor.activate_object(key);
    editor.saveLocal(elements);

  },
  /*********
  * Draw curved line. Requires an attributes-object
  *********/
  vectorPoints: function(key){
    // We need pData a lot, so it is abbreviated
    var p = objectsArray[key].attr("path");
  
    // Odd difference between newly created and loaded curves.
    if (editor.isset(p.items)) {
  
      var x = p[0]["attrs"]["path"][1][1];
      var y = p[0]["attrs"]["path"][1][2];
      var x1 = p[0]["attrs"]["path"][1][3];
      var y1 = p[0]["attrs"]["path"][1][4];
      var x2 = p[0]["attrs"]["path"][1][5];
      var y2 = p[0]["attrs"]["path"][1][6];
    }
    else {
      var x = p[0][1];
      var y = p[0][2];
      var y1 = p[1][2];
      var x1 = p[1][1];
      var y2 = p[2][2];
      var x2 = p[2][1];
    }
  
    tempCurve[0] = key
    tempCurve[1] = paper.circle(x,y, 7);
    tempCurve[1].attr({"title": key, "fill": "#F00"});
    tempCurve[1].drag(editor.pointMoveCurve,editor.pointStart,editor.pointUp);
  
    tempCurve[2] = paper.circle(x1,y1, 7);
    tempCurve[2].attr({"title": key, "fill": "#FFF"});
    tempCurve[2].drag(editor.pointMoveCurve,editor.pointStart,editor.pointUp);
  
    tempCurve[3] = paper.circle(x2,y2, 7);
    tempCurve[3].attr({"title": key, "fill": "#FFF"});
    tempCurve[3].drag(editor.pointMoveCurve,editor.pointStart,editor.pointUp);
  },
  drawObject: function (type, key, attr, nosave) {
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
      objectsArray[key].click(function() { editor.activate_object(this.attr("title")) });
      return attr;
    }
    else {
      paper.add([attr]);
    }
    
  },
  drawFromJSON: function (key, jsonstr, nosave){
    var info = key.split("_");

    var objTemp = jsonstr, temp;
    temp = editor.drawObject(info[0], info[1], objTemp, nosave);

    if (typeof nosave == 'undefined') { 
      elements[key] = temp;
      editor.saveLocal(elements, key);
      i++;
    }
  },
  /*
  saveLocal: function  (objects_array, last_title){
    if (jQuery(".draw-diagram-input").length > 0) {
      // Undo option
      jQuery("body").data("draw_latest", last_title)
      if(typeof localStorage !=="undefined") {
        localStorage.undo = JSON.stringify(objects_array);
      }
      jQuery(".draw-diagram-input").val(JSON.stringify(objects_array));
    }
  },
  */
  saveLocal: function (objects_array, last_title, storage_selector){
    $("body").data("draw_latest", last_title)
    // Undo option
    if(typeof localStorage !=="undefined") {
      localStorage.undo = JSON.stringify($(".draw-input-wrapper textarea").val());
    }
    $(".draw-input-wrapper textarea").val(JSON.stringify(objects_array));
  },
  isset: function (variable) {
      return (typeof variable != "undefined");
    }
};

  
  $.fn.raphaelPaper = function(options) {

    var image_path = "/" + $("#draw-diagram").data("image_path"); // "../images";
    console.log(image_path);
    var settings = $.extend({
      canvas_width: 400,
      canvas_height: 640,
      backgrounds: {},
      image_palette: {},
      // Tools regarding the attributes of the drawn object.
      attr_tools: {
        "stroke-dasharray": {
          " ": image_path + "/pathicon0.png",
          "-": image_path + "/pathicon1.png",
          "--": image_path + "/pathicon2.png"
        },
        "stroke-width": {
          2: image_path + "/stroke-narrow.png",
          4: image_path + "/stroke-medium.png",
          6: image_path + "/stroke-wide.png"
        },
        "arrow-end": {
          "diamond-wide-long": image_path + "/arrow-arrow.png",
          "oval-wide-long": image_path + "/arrow-ball.png",
          "none": image_path + "/arrow-none.png"
        }
      },
      stroke: [
        "#77F", "#F33", "#000", "#3F3", "#FFF", "#777"
      ],
      fill: [
        "#77F", "#F33", "#000", "#3F3", "#FFF", "#777"
      ],
      tools: {
        texttool: { 
          icon_url: image_path + "/type.png",
          action: function() {
            bg.click(function(e) {
              editor.text_start(e);

              clear_element_events(this);
            }).attr({cursor: "text"});
          }
        },
        vector: {
          icon_url: image_path + "/vector.png",
          action: function(){
            bg.drag(editor.vector_move, editor.vector_start, function(e) {
              editor.vector_end(e);
              bg.undrag();
            }); //click(editor.vector_start).attr({cursor: "crosshair"});
          }
        },
        circle: {
          icon_url: image_path + "/circle.png",
          action: function(){
            bg.drag(editor.circle_draw, editor.circle_start, editor.freehand_end).attr({cursor: "crosshair"});
          }
        },
        freehand: {
          icon_url: image_path + "/pencil.png",
          action: function(){
            bg.drag(editor.freehand_draw, editor.freehand_start, editor.freehand_end).attr({cursor: "crosshair"});
          }
        },
        rect: {
          icon_url: image_path + "/rectangle.png",
          action: function(){
            bg.drag(editor.rectangle_draw, editor.rectangle_start, editor.freehand_end).attr({cursor: "crosshair"});
          }
        },
        trash: {
          icon_url: image_path + "/trash.png",
          action: function(){
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
            editor.saveLocal(elements);
            $("body").data("active", "");
          }
        }
      }
    /*
    palette['undo'] = paper.image(image_path + "/undo.png", 450, 230, 30, 27);
    palette['undo'].attr({"title":"undo"});
    */
    }, options);
    // Setting up the required markup around the widget.
    this.wrap('<div class="draw-widget-diagram"></div>');
    this.wrap('<div class="draw-input-wrapper"></div>');
    this.closest(".draw-widget-diagram").append('<div class="draw-view-source">View source</div>');
    this.closest(".draw-widget-diagram").prepend('<div id="draw-tools-palette"></div>');
    this.closest(".draw-widget-diagram").prepend('<div id="draw-image-palette"></div>');
    this.closest(".draw-widget-diagram").prepend('<div id="draw-diagram"></div>');

    // Toggle source view.
    $(".draw-view-source").click(function(){
      $(this).closest(".field-widget-diagram").find(".draw-input-wrapper").toggle();
    });
    
    // Where it all happens. Initiating the paper.
    paper = Raphael(document.getElementById("draw-diagram"), settings.canvas_width, settings.canvas_height);
    var palette = {tools: []}, width = settings.canvas_width;

    // Setting up the toolboxes. 
    // First the images to be used.
    $.each(settings.image_palette, function(index, item) {
      $("#draw-image-palette").append('<div class="draw-clipart" id="draw-' + index + '" style="background-image: ' + item + '"></div>').click(function(){
        objectsArray[index + "_" + i] = paper.image(item.url, (settings.canvas_width / 2), (settings.canvas_height / 2), item.width, item.height);
        objectsArray[index + "_" + i].click(function() {
        }).drag(move, start, up);
      });
    });

    // Drawing tools.
    $("#draw-tools-palette").append('<div class="draw-tool-section draw-tools" data-attr="type"></div>');
    $.each(settings.tools, function(index, item) {
      $(".draw-tools").append('<div class="draw-tool-icon ' + index + '" style="background-image: url(' + item.icon_url + ');">' + index + '</div>');
      $(".draw-tools ." + index).click(function(){
        item.action();
        $(this).parent().find(".draw-tool-icon").css("opacity", "0.5");
        $(this).css("opacity", 1);
        clear_element_events(bg);
      });
    });

    var this_section;
    // Attribute tools
    $.each(settings.attr_tools, function(index, item) {
      this_section = '<div class="draw-tool-section draw-' + index + '" data-attr="' + index + '">';
      $.each(item, function(attr_value, icon_url) {
        this_section += '<div class="draw-tool-icon" style="background-image: url(' + icon_url + ');">' + attr_value + '</div>'; 
      });

      this_section += '</div>';
      $("#draw-tools-palette").append(this_section);
    });

    // Assign stroke palette.
    this_section = '<div class="draw-tool-section draw-stroke" data-attr="stroke">';
    $.each(settings.stroke, function(index, item) {
      this_section += '<div class="draw-tool-icon" style="border: 2px solid ' + item + '">' + item + '</div>';
    });
    $("#draw-tools-palette").append(this_section);

    // Fill palette
    this_section = '<div class="draw-tool-section draw-fill" data-attr="fill">';
    $.each(settings.stroke, function(index, item) {
      this_section += '<div class="draw-tool-icon" style="background: ' + item + '">' + item + '</div>';
    });
    $("#draw-tools-palette").append(this_section);
    delete this_section;
    
    $("#draw-tools-palette .draw-tool-icon").bind("click", function(){
      current_attributes[$(this).parent().data("attr")] = $(this).text();

      // If there is an active object, assign the attribute to it.
      if (editor.currentObjectID.length > 0) {
        objectsArray[editor.currentObjectID].attr($(this).parent().data("attr"), $(this).text());
        elements[editor.currentObjectID] = objectsArray[editor.currentObjectID].attr();
        editor.saveLocal(elements);
      }
    });

    // Set up the backgrounds and background selector.
    var background_object, background_list = {}, background_index = 0;
    if (typeof settings.backgrounds != 'undefined' && settings.backgrounds.length > 0) {
      for (var background_id in Drupal.settings.draw_settings.backgrounds) {
        paper.setStart();
        paper.rect(0,0,settings.canvas_width, settings.canvas_height).attr({"fill": "#eee"});

        background_object = Drupal.settings.draw_settings.backgrounds[background_id];
        $(".draw-background-select").append('<option value="' + background_id + '">' + background_object.title + '</option>');

        for(var index in background_object.content) {
          var item = background_object.content[index];
          drawFromJSON(index, item, true);
        }

        background_list[background_id] = paper.setFinish();
        background_list[background_id].hide();

        if (background_index === 0) {
          bg = background_list[background_id];
          background_index++;
          background_list[background_id].show();
        }
      }
    }
    else {
      paper.setStart();
      paper.rect(0,0, settings.canvas_width, settings.canvas_height).attr({"fill": "#fefefe"});

      bg = paper.setFinish();
    }

    
    function clear_element_events(element) {
      if (typeof element.events == "undefined") {
        return false;
      }
      while(element.events.length){          
                var e = element.events.pop();
                e.unbind();
            }
    }

    var saved_drawing;
    if (this.val().length > 2) {
      saved_drawing = JSON.parse($(".draw-diagram-input").val());
      if (typeof saved_drawing.background != "undefined") {
        delete saved_drawing.background;
      }
    }
    else {
      saved_drawing = {};
    }
    if (typeof saved_drawing != "undefined") {
      for(var element_title in saved_drawing) {
        editor.drawFromJSON(element_title, saved_drawing[element_title]);
      }
    }

    $("body").data("active", "");
  };
  $(document).ready(function(){
    $(".draw-diagram-input").raphaelPaper({backgrounds: Drupal.settings.draw_settings.backgrounds });
  });
})(jQuery);