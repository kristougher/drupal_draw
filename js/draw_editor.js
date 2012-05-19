/*********
* Draw curved line. Requires an attributes-object
*********/
function drawLine(objType,no,pData,save){
	// Constructs an object ID
	var objKey = objType+"_"+no;
	
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
	objectsArray[objKey][1] = paper.circle(x,y, 7);
	
	objectsArray[objKey][0] = paper.path(path);
	
	objectsArray[objKey][0].attr(eval("attributes."+objType));
	
	objectsArray[objKey][1].attr("title",objKey).attr("fill","#F00");
	
//	if(objKey.indexOf("movement") > -1){
	// det er en kurve
	objectsArray[objKey][3] = paper.circle(x2,y2, 7);
	var y1 = pData[1].pop();
	var x1 = pData[1].pop();

	objectsArray[objKey][2] = paper.circle(x1,y1, 7);
	objectsArray[objKey][3].attr("title",objKey).attr("fill","#FFF");
	objectsArray[objKey][3].drag(pointMoveCurve,pointStart,pointUp);
	objectsArray[objKey][1].drag(pointMoveCurve,pointStart,pointUp);
	objectsArray[objKey][2].drag(pointMoveCurve,pointStart,pointUp);
	objectsArray[objKey][2].attr("opacity",0.2);

	objectsArray[objKey][2].attr("title",objKey).attr("fill","#FFF");

	if(save) saveLocal(objKey, objectsArray[objKey][0].attr("path"));
}
/**********
* Draw figure from graphics file
***********/
function drawFigure(type,no, attr,save){
	var key = type+"_"+no;
    objectsArray[key] = paper.image(attr.src,attr.x,attr.y,attr.width,attr.height); //temp.clone();
    objectsArray[key].drag(move, start, up);
    objectsArray[key].attr("title", key);
    if($("body").data("imagesrc")){
    	    objectsArray[key].attr({src:$("body").data("imagesrc")});
     	$("body").data("imagesrc","");
    }
    
    if(save) saveLocal(key, objectsArray[key].attr());
}
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
    saveLocal(this.attr("title"),this.attr(), true);
    this.attr({opacity: 1});
    //jsonObj.figures[this.attr("title")] = this.attr();
};

// Attributes for manipulating lines
var pointStart = function () {
    // storing original coordinates
    this.ox = this.attr("cx");
    this.oy = this.attr("cy");
    this.oop = this.attr("opacity");
    this.attr({opacity: .5});
},pointMove = function (dx, dy) {
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
   // jsonObj.lines[this.attr("title")] = objectsArray[this.attr("title")][0].attr("path");
    saveLocal(this.attr("title"),objectsArray[this.attr("title")][0].attr("path"), true);
};

// Attributes for dragging prototypes
var startOrig = function () {
	temp = this.clone();
	     if($("#imagelabel").val().length > 0){
		var label =  $("#imagelabel").val();
		 $("#imagelabel").val("");
	     } else {
		var label = i;
		i++;     
	     }
	$("body").data("imagelabel",label);     
	$.get(imagePath, {op:'image',image:this.attr("title"), no:label},function(data){
			$("body").data("imagesrc",data); //{src:data};
			
		});
	
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

     var key = this.attr("title"); //+"_"+i;

     drawFigure(key,$("body").data("imagelabel"),temp.attr(),true);
    $("body").data("imagelabel","");
    temp.remove();
},
upOrigLine = function(){
	var lineArray = new Array();
	lineArray[0]=["M",this.attr("x"),this.attr("y")];

	lineArray[1]=["C",this.attr("x"),this.attr("y"),(this.attr("x")+30),(this.attr("y")+40),(this.attr("x")+60),(this.attr("y")+60)];

	drawLine(this.attr("title"),i, lineArray);
	i++;
	this.attr({x: this.ox, y: this.oy, opacity: 1});
};
palette['ballLine'].drag(move, start, upOrigLine);
palette['movementLine'].drag(move, start, upOrigLine);
toolbox.drag(moveOrig, startOrig, upOrig);
