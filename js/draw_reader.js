/*********
* Draw curved line. Requires an attributes-object
*********/
function drawLine(objType,no,pData,save){ 
	var objKey = objType+"_"+no;
	objectsArray[objKey] = new Array();
	var p = pData;
	var path = "M"+p[0][1]+" "+p[0][2]+p[1].shift();
	var firstLineNo = p[1].shift();
	path = path+firstLineNo;
	
	for(var n in p[1]){
		path = path+" "+p[1][n];
	}
	var x = p[0][1];
	var y = p[0][2];
	var y2 = pData[1].pop();
	var x2 = pData[1].pop();
	
	objectsArray[objKey][0] = paper.path(path);
	
	objectsArray[objKey][0].attr(eval("attributes."+objType));
	
	objectsArray[objKey][3] = paper.circle(x2,y2, 7);
	var y1 = pData[1].pop();
	var x1 = pData[1].pop();

}
/**********
* Draw figure from graphic file
***********/
function drawFigure(type,no, attr,save){
	var key = type+"_"+no;
    objectsArray[key] = paper.image(attr.src,attr.x,attr.y,attr.width,attr.height); 

    objectsArray[key].attr("title", key);
    if($("body").data("imagesrc")){
    	    objectsArray[key].attr({src:$("body").data("imagesrc")});
     	$("body").data("imagesrc","");
    }
    
    if(save) saveLocal(key, objectsArray[key].attr());
}
