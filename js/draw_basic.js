/****************
* Interpret the key to determine which function to use for drawing
*****************/
function drawFromJSON(key,jsonstr){
	var info = key.split("_");
	var objTemp = jsonstr;
	if(info[0].indexOf("Line") > -1) drawLine(info[0],it,objTemp, false);
	else drawFigure(info[0],key,objTemp, false);
	it++;
	
	
}
/***************
* Get saved data 
****************/
function travLocal(){
	var ajaxstring;
	$.ajax({
		url: ajaxURL,
		data: {op: 'retrieve'},
		dataType: "json",
		success:function(e){
			$.each(e,function(key,el){
				drawFromJSON(key,el);
			});
		}
	});
}
function saveLocal(objectsArray){
	console.log(objectsArray);
	document.getElementById("edit-field-diagram-und-0-value").value = JSON.stringify(objectsArray);
	
	/*
	$.post(ajaxURL,{op:'save',objKey:key,objAttr:testData},function(e){

	});
	*/
}
