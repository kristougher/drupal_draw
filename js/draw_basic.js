/****************
* Interpret the key to determine which function to use for drawing
*****************/

function saveLocal(objectsArray){
	console.log(objectsArray);
	document.getElementById("edit-field-diagram-und-0-value").value = JSON.stringify(objectsArray);
	
	/*
	$.post(ajaxURL,{op:'save',objKey:key,objAttr:testData},function(e){

	});
	*/
}
