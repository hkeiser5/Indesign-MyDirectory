/* JavaScript myDirectory to auto pull and format directory like text.
written by Heather C Keiser, copyright 2020.
------------------------------------------------------------------

Instructions on how to use:

Start with an .csv document and make sure each column has a header.
Ensure that you are not using the ~ or / character in your fields, if you are
you should place a space after the character and then do a find replace when done to change back
to how you have it originally. Indesigns change field does not recognize escaped characters.

Your csv must also not contain fields that begin with open ended quotes or contain a right double quote immediately followed by a comma.
ex1: "whoa
ex2: "howdy", she said

Create your paragraph styles, character styles, and grep styles for a single directory listing. Download
the sample directory indd file for how your styles could work.

Select a text box in your indesign document. Apply your paragraph style for your directory to the text box. Run the script. Place fields as needed. Hit OK, then
your directory will create itself.


----------------------------------------------------------------*/

//get active text frame
var myframe = app.selection[0];

//if nothing selected throw error
if(app.selection[0] === undefined){
    alert('Please select a text frame');
}else{

	//make sure that myframe is a text frame, and send error if it is not.-if nothing selected throw error
	if ((myframe.getElements()[0] instanceof TextFrame)||(myframe.getElements()[0] instanceof TextBox)){
		
		//import the csv file to populate the dialog box with.
		var dialogchoice = false;
		var myPropogate  = File.openDialog('Select a CSV File','comma-separated-values(*.csv):*.csv;');
		while (dialogchoice === false){
			if (!myPropogate){//dialog box was closed without file choice
				dialogchoice = true;
			} else if (myPropogate.name.match(/\.csv$/i)){//this is a csv
				dialogchoice = true;
				myPropogate.open('r',undefined, undefined);//read the file
				var myContents =  myPropogate.read(); //get info in file
				myPropogate.close();//close the file
				myPropogate = myContents;//reassign mycontents to mypropogate
			} else {
				myPropogate.close();
				alert('Please select a CSV file (ends in .csv)');
				myPropogate  = File.openDialog('Please select a CSV File (ends in .csv)','comma-separated-values(*.csv):*.csv;');
			}
		}
		//need to separate the csv file into data to populate the dialog box, and create variables to be used in execution of populating text after dialog box is closed.
		
		if (!myPropogate){
			//do nothing the dialog was closed without choice
		} else {
			//variable to hold final multidimensional array of data
			var myData = [];
			var myHeaders = [];
		
			//create an array of every row in the csv
			var rows = myPropogate.split('\n');
			//now turn every element in the rows into an array (break it by columns)
			for (var l = 0; l< rows.length; l++){
				//add a comma to front and end of each line
				var comma = ',';
				rows[l] = comma.concat(rows[l], comma);
           
				var comIndices = [];
				for (var n = 0; n < rows[l].length; n++) {
					if (rows[l][n] === ',') {
						comIndices.push(n);
					}
				}
		
				var skipIndex = -1;//starts neg so that first , always is a starter
				var newrow = [];
				//create array based off comma indicies
				for (var r =0; r < comIndices.length-1; r++){
					var curIndex = comIndices[r];//comma we are checking
					var checknext = 1;
					var nextIndex = comIndices[r+checknext];
					var lastIndex = comIndices[comIndices.length-1];
					//need to reset skip index if on the last 2nd to last index in string & to set rows[i]
                
					if (r === comIndices.length-2){//this is last iteration and has not been represented in the while loop below
						if (skipIndex === lastIndex){
							//do nothing already pushed
						}else{
							newrow.push(rows[l].slice(curIndex + 1,nextIndex));
						}
				
						skipIndex = -1;//reset skip for next loop set
						rows[l] = newrow;
						newrow = [];//reset newrow for next set
					} else if (rows[l][curIndex+1] === '"'){//this section is a quote group
						//while loop to find the end of the quote group
						var quoteend = false;
						while (quoteend === false){//need a check if nextIndex is last index
							if (nextIndex === lastIndex){//this is last group
							
								newrow.push(rows[l].slice(curIndex + 1,nextIndex));
								skipIndex = lastIndex;
								quoteend = true;
							} else if (rows[l][nextIndex-1] === '"'){//this is end of quotes
							
								newrow.push(rows[l].slice(curIndex + 1,nextIndex));
								skipIndex = nextIndex-1;
								quoteend = true;	
							} else {
								checknext += 1;
								nextIndex = comIndices[r+checknext];
							}
						}//end while loop
                   
					} else if (curIndex > skipIndex){//this section has no comma, and is not part of another comma push to next indici
						newrow.push(rows[l].slice(curIndex + 1,nextIndex));
					} //else do nothing and go to next loop
				}//end making the array based off commas
            

				//now clean up all the extra quotes that the csv data created & push values into my data
				for (var j=0; j<rows[l].length; j++){
           
					//delete single quotes at front and end, as those were added in creation of csv
					rows[l][j] = rows[l][j].replace(/^"(?!")/,'');
					//neg look behind doesn't work-need to check another way
					if (rows[l][j][rows[l][j].length-2] !== '"'){
						rows[l][j] = rows[l][j].replace(/"($|\n)/,'');
					}
					//change triple and double quotes to single quotes
					rows[l][j] = rows[l][j].replace(/"""/g,'"');
					rows[l][j] = rows[l][j].replace(/""/g,'"');
					
					
					
					
					if (l === 0){//these are the headers
						myHeaders.push(rows[l][j]);
					} else { //this is the data info
						/*var slash = String('\\');
						//escape characters for grep styling
						dont think this is necessary for the replace function
						rows[l][j] = rows[l][j].replace(/\\/g,slash + '\\');
						rows[l][j] = rows[l][j].replace(/\*///g,slash + '*');
						/*rows[l][j] = rows[l][j].replace(/\./g,slash + '.');
						rows[l][j] = rows[l][j].replace(/\+/g,slash + '+');
						rows[l][j] = rows[l][j].replace(/\?/g,slash + '?');
						rows[l][j] = rows[l][j].replace(/\^/g,slash + '^');
						rows[l][j] = rows[l][j].replace(/\$/g,slash + '$');
						rows[l][j] = rows[l][j].replace(/\(/g,slash + '(');
						rows[l][j] = rows[l][j].replace(/\)/g,slash + ')');
						rows[l][j] = rows[l][j].replace(/\</g,slash + '<');
						rows[l][j] = rows[l][j].replace(/\>/g,slash + '>');
						rows[l][j] = rows[l][j].replace(/\{/g,slash + '{');
						rows[l][j] = rows[l][j].replace(/\[/g,slash + '[');
						rows[l][j] = rows[l][j].replace(/\|/g,slash + '|');*/
						
						if (myData[j] instanceof Array){//already an array, do nothing
							
						}else{
							myData[j]=[];
						}
						myData[j].push(rows[l][j]);
					}
				}//end clean up quotes
			
			}//end creating clean arrays of rows
			//alert(myHeaders); this is correct as array of headers
			//alert(myData); this is correct, array of data under headers by columns 
			
			
		
	
			//create dialog box
			var  mydialog = new Window("dialog"); 
			mydialog.text = "My Directory"; 
			mydialog.preferredSize.width = 600; 
			mydialog.orientation = "column"; 
			mydialog.alignChildren = ["center","top"]; 
			mydialog.spacing = 10; 
			mydialog.margins = 16; 


			// replace or append radio choice
			var replace = mydialog.add("group", undefined, {name: "replace"}); 
			replace.orientation = "row"; 
			replace.alignChildren = ["left","center"]; 
			replace.spacing = 10; 
			replace.margins = 0; 

			var statictext1 = replace.add("statictext", undefined, {name: "statictext1"}); 
			statictext1.text = "Replace or Append Text?"; 

			var replaceBtn = replace.add("radiobutton", undefined, {name: "replace"}); 
			replaceBtn.text = "Replace"; 

			var appendBtn = replace.add("radiobutton", undefined, {name: "append"}); 
			appendBtn.text = "Append"; 
			appendBtn.value = true; 

			// text creation group
			var insertionGrp = mydialog.add("group", undefined, {name: "insertion"}); 
			insertionGrp.orientation = "column"; 
			insertionGrp.alignChildren = ["left","center"]; 
			insertionGrp.spacing = 10; 
			insertionGrp.margins = 0; 

			var statictext2 = insertionGrp.add("statictext", undefined, {name: "statictext2"}); 
			statictext2.text = "Double click lists to add fields, insert custom text in field, and add special characters for a single directory entry"; 
			statictext2.justify = "center"; 

			// insertion controls
			var insertionCntrl = insertionGrp.add("group", undefined, {name: "insertionCntrl"}); 
			insertionCntrl.orientation = "row"; 
			insertionCntrl.alignChildren = ["left","center"]; 
			insertionCntrl.spacing = 10; 
			insertionCntrl.margins = 0; 

			var fields = insertionCntrl.add("listbox", undefined, myHeaders, {name: "Fields"}); 
			fields.alignment = ["left","top"]; 
			fields.onDoubleClick = function(){
				fields.active = true;
				var myselect = fields.selection.text;
				dirTxt.active = true;
				dirTxt.text += '{' + myselect + '}';
			};
				
			
			
			

			var dirTxt = insertionCntrl.add('edittext {properties: {name: "dirTxt", multiline: true}}'); 
			dirTxt.text = ""; 
			dirTxt.preferredSize.width = 400; 
			dirTxt.preferredSize.height = 200; 
			dirTxt.alignment = ["left","top"];
			dirTxt.active = true;
			//need to watch somehow for when special character added? how?
			

			var specialChrs = insertionCntrl.add("button", undefined, {name: "specialChrs"}); 
			specialChrs.text = "@>"; 
			specialChrs.alignment = ["left","bottom"]; 
			//create pop up for this section to choose special characters
			//specialChrs.addEventListener('click', chooseChr());
			specialChrs.onClick = function(){
				chooseChr(dirTxt,mydialog);
			};
			
			

			// submit
			
			
			var statictext3 = mydialog.add("statictext", undefined, {name: "statictext2"}); 
			statictext3.text = 'Text above uses grep styling, avoid using \ and ~ in your text as it often replaces your text with a metacharacter'; 
			statictext3.justify = "center";
			
			
			var submitRslts = mydialog.add("group", undefined, {name: "submitRslts"}); 
			submitRslts.orientation = "row"; 
			submitRslts.alignChildren = ["right","center"]; 
			submitRslts.spacing = 10; 
			submitRslts.margins = 0; 
			submitRslts.alignment = ["right","top"]; 

			var confirmBtn = submitRslts.add("button", undefined, {name: "ok"}); 
			confirmBtn.text = "OK";

			var cancelBtn = submitRslts.add("button", undefined, {name: "cancel"}); 
			cancelBtn.text = "Cancel"; 
	
			
			
			
			//show the dialog box
			var myResult = mydialog.show();
			if (myResult ===1){
				var replaceme = false;
					if (replaceBtn.value === true){
					replaceme = true;
				}
				createDir(dirTxt.text,myHeaders,myData,replaceme);
			} else if (myResult ===2){//clicked cancel
			
			}
		}//end propogation
	
	} else {
		alert('Please select a text frame');
	}

}

function chooseChr(activeTxt,origdialog){
				
	//create dialog box
	var  myChars = new Window("dialog"); 
	myChars.orientation = "column"; 
	myChars.alignChildren = ["center","top"]; 
	myChars.spacing = 0; 
	myChars.margins = 5;
	myChars.onClose = function(){
		activeTxt.active = true;
	};
	
	//tree view list
	var charList = myChars.add('treeview', [200,0,460,400]);
	var generalChrs = charList.add('node','General');
	generalChrs.add('item','Tab');
	generalChrs.add('item', 'Forced Line Break');
	generalChrs.add('item', 'End of Paragraph');
	var symbolChrs = charList.add('node', 'Symbols');
	symbolChrs.add('item','Bullet');
	symbolChrs.add('item','Caret');
	symbolChrs.add('item','Copyright');
	symbolChrs.add('item','Ellipsis');
	symbolChrs.add('item','Paragraph Symbol');
	symbolChrs.add('item','Registered Trademark Symbol');
	symbolChrs.add('item','Selection Symbol');
	symbolChrs.add('item','Trademark Symbol');
	var mrkrChrs = charList.add('node', 'Markers');
	mrkrChrs.add('item','Current Page Number');
	mrkrChrs.add('item','Next Page Number');
	mrkrChrs.add('item','Previous Page Number');
	mrkrChrs.add('item','Section Marker');
	var dshChrs = charList.add('node', 'Hyphens & Dashes');
	dshChrs.add('item','Em Dash');
	dshChrs.add('item','En Dash');
	dshChrs.add('item','Discretionary Hyphen');
	dshChrs.add('item','Nonbreaking Hyphen');
	var spcChrs = charList.add('node', 'White Space');
	spcChrs.add('item','Em Space');
	spcChrs.add('item','En Space');
	spcChrs.add('item','Nonbreaking Space');
	spcChrs.add('item','Nonbreaking Space (Fixed Width)');
	spcChrs.add('item','Hair Space');
	spcChrs.add('item','Sixth Space');
	spcChrs.add('item','Thin Space');
	spcChrs.add('item','Quarter Space');
	spcChrs.add('item','Third Space');
	spcChrs.add('item','Punctuation Space');
	spcChrs.add('item','Figure Space');
	spcChrs.add('item','Flush Space');
	var qutsChrs = charList.add('node', 'Quotation Marks');
	qutsChrs.add('item','Straight Double Quotes');
	qutsChrs.add('item','Double Left Quotes');
	qutsChrs.add('item','Double Right Quotes');
	qutsChrs.add('item','Straight Single Quote');
	qutsChrs.add('item','Left Quote');
	qutsChrs.add('item','Right Quote');
	var brkChrs = charList.add('node', 'Break Characters');
	brkChrs.add('item','Standard Carriage Return');
	brkChrs.add('item','Column Break');
	brkChrs.add('item','Frame Break');
	brkChrs.add('item','Page Break');
	brkChrs.add('item','Odd Page Break');
	brkChrs.add('item','Even Page Break');
	brkChrs.add('item','Discretionary Line Break');
				
	var exitBtn = myChars.add("button", undefined, {name: "exit"}); 
	exitBtn.text = "EXIT";
	exitBtn.onClick = function(){
		myChars.close(2);	
	};
				
	var insert = '';			
	charList.onDoubleClick = function(){
		var myselect = charList.selection.text;
		//depending on value of myselect, change what grep gets added to the dirTxt.
		if (myselect === "Tab"){
			insert = '\\t';
		}else if(myselect === "Forced Line Break"){
			insert = '\\n';
		}else if(myselect === "End of Paragraph"){
			insert = '\\r';
		}else if(myselect === "Bullet"){
			insert = '~8';
		}else if(myselect === "Caret"){
			insert = '\\^';
		}else if(myselect === "Copyright"){
			insert = '~2';
		}else if(myselect === "Ellipsis"){
			insert = '~e';
		}else if(myselect === "Paragraph Symbol"){
			insert = '~7';
		}else if(myselect === "Registered Trademark Symbol"){
			insert = '~r';
		}else if(myselect === "Selection Symbol"){
			insert = '~6';
		}else if(myselect === "Trademark Symbol"){
			insert = '~d';
		}else if(myselect === "Current Page Number"){
			insert = '~N';
		}else if(myselect === "Next Page Number"){
			insert = '~X';
		}else if(myselect === "Previous Page Number"){
			insert = '~V';
		}else if(myselect === "Section Marker"){
			insert = '~x';
		}else if(myselect === "Em Dash"){
			insert = '~_';
		}else if(myselect === "En Dash"){
			insert = '~=';
		}else if(myselect === "Discretionary Hyphen"){
			insert = '~-';
		}else if(myselect === "Nonbreaking Hyphen"){
			insert = '~~';
		}else if(myselect === "Em Space"){
			insert = '~m';
		}else if(myselect === "En Space"){
			insert = '~>';
		}else if(myselect === "Nonbreaking Space"){
			insert = '~S';
		}else if(myselect === "Nonbreaking Space (Fixed Width)"){
			insert = '~s';
		}else if(myselect === "Hair Space"){
			insert = '~|';
		}else if(myselect === "Sixth Space"){
			insert = '~%';
		}else if(myselect === "Thin Space"){
			insert = '~<';
		}else if(myselect === "Quarter Space"){
			insert = '~4';
		}else if(myselect === "Third Space"){
			insert = '~3';
		}else if(myselect === "Punctuation Space"){
			insert = '~.';
		}else if(myselect === "Figure Space"){
			insert = '~/';
		}else if(myselect === "Flush Space"){
			insert = '~f';
		}else if(myselect === "Straight Double Quotes"){
			insert = '~"';
		}else if(myselect === "Double Left Quotes"){
			insert = '~{';
		}else if(myselect === "Double Right Quotes"){
			insert = '~}';
		}else if(myselect === "Straight Single Quote"){
			insert = "~'";
		}else if(myselect === "Left Quote"){
			insert = '~[';
		}else if(myselect === "Right Quote"){
			insert = '~]';
		}else if(myselect === "Standard Carriage Return"){
			insert = '~b';
		}else if(myselect === "Column Break"){
			insert = '~M';
		}else if(myselect === "Frame Break"){
			insert = '~R';
		}else if(myselect === "Page Break"){
			insert = '~P';
		}else if(myselect === "Odd Page Break"){
			insert = '~L';
		}else if(myselect === "Even Page Break"){
			insert = '~E';
		}else if(myselect === "Discretionary Line Break"){
			insert = '~k';
		}
					
		myChars.close(1);
					
	}; 
				
				
				
	var myCharsresult = myChars.show();
	if (myCharsresult === 1){
		//alert('clicked to add value');//I believe an indd or mac bug is in here, when alert is active below code focuses correctly
		origdialog.enabled = true;
		activeTxt.active = true;
		activeTxt.text += insert;
				
	} else if (myCharsresult === 2){
		//alert('clicked to close');//I believe an indd or mac bug is in here, when alert is active below code focuses correctly
		origdialog.enabled = true;
		activeTxt.active = true;
	}
				
				
}




function createDir(mytxt,myheads,mydata,myreplace){
	
	//if text comes in with an empty space at the end, remove it.
	mytxt = mytxt.replace(/\s$/,'');
	var mycontents = myframe.contents;
	
	//break the mytxt up into it's sections with {} pieces it's own element
	var allSections = [];
	var allIndices = [];
	var openpair = false;
	for (var c = 0; c < mytxt.length; c++){//will give me all the indexes that start and end sections//match doesn't work to not having negative look behind grrrrrr.
		if (c === 0){
			if (mytxt[c] === '{'){
				openpair = true;
			}
			allIndices.push(c);
		} else if ((openpair === true)&& (mytxt[c] === '}')&& (c !== mytxt.length-1)){
			
			allIndices.push(c);
			openpair = false;
		}else if ((mytxt[c]==='{')&&(mytxt[c-1] !== '\\')){
			allIndices.push(c);
			openpair = true;
		}else if (c === mytxt.length-1){//last iteration
			allIndices.push(c);	  
		}
	
	}//end index search

	//split txt int sections based off  indicies
	for (var s = 0; s < allIndices.length-1; s++){
		allSections.push(mytxt.slice(allIndices[s],(allIndices[s+1] + 1)));
	}
	//clean up sections of open {} from other sections
	for (var i = 0; i<allSections.length;i++){
		allSections[i] = allSections[i].replace(/^}/,'');
		allSections[i] = allSections[i].replace(/\{$/,'');
	}
	//now create the directory text to insert on each line based off the allSections array!
	var addtext = '';
	for (var d = 0; d < mydata[0].length; d++){		
		for (var f = 0; f<allSections.length; f++){
			//check if allSections[f] corrosponds to a value in myHeads
			////grrrrrr indexOf not recognized in indesign extendscript : (, find another way
			var myHeadInd = -1;
			for (var h = 0; h<myheads.length; h++){
				if (allSections[f] === '{' + myheads[h] + '}'){
					myHeadInd = h;
					break;
				}
			}
			
			//var myHeadInd = myheads.indexOf(allSections[f]);
			if(myHeadInd === -1){
				addtext = addtext + allSections[f];
			}else{
				addtext = addtext + mydata[myHeadInd][d];
			}
		}
		//add return at end of the line
		addtext = addtext + '\r';
	}
	//now insert or replace the text based off replaceme value
	if (replaceme === true){
		mycontents = addtext;
	} else {
		mycontents = mycontents + '\r' + addtext;
	}
	//reset find/replace
	app.findGrepPreferences = NothingEnum.nothing;
	app.changeGrepPreferences = NothingEnum.nothing;
	
	//Set the GREP find options 
	app.findChangeGrepOptions.includeFootnotes = false;
	app.findChangeGrepOptions.includeHiddenLayers = false;
	app.findChangeGrepOptions.includeLockedLayersForFind = false;
	app.findChangeGrepOptions.includeLockedStoriesForFind = false;
	app.findChangeGrepOptions.includeMasterPages = true;
	
	//Look for the pattern and change to
	app.findGrepPreferences.findWhat = myframe.contents;
	app.changeGrepPreferences.changeTo = mycontents;
	myframe.changeGrep();
	
	//Clear the find/change text preferences.
	app.findGrepPreferences = NothingEnum.nothing;
	app.changeGrepPreferences = NothingEnum.nothing;
	

}

