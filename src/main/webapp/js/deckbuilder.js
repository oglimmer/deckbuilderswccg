core_data.getCard = function(cardId) {
	if(typeof(this.idCardCache) === 'undefined') {
		this.idCardCache = {};
		var icc = this.idCardCache;
		$.each([this.main.Dark,this.main.Light], function() {
			$.each(this, function() {
				this.nodeRef = $("#"+this.id);
				icc[this.id] = this;
			});
		});
	}
	return this.idCardCache[cardId];
};

core_data.getAllCardNodes = function() {
	if(typeof(this.idCardsAllCache) === 'undefined') {
		this.idCardsAllCache = [];
		var icc = this.idCardsAllCache;
		$.each([this.main.Dark,this.main.Light], function() {
			$.each(this, function() {
				icc.push(this.id);
			});
		});
	}
	return this.idCardsAllCache;
};

core_data.getCardsBySet = function(set) {
	if(typeof(this.idCardsSetCache) === 'undefined') {
		this.idCardsSetCache = {};
		var icc = this.idCardsSetCache;
		$.each([this.main.Dark,this.main.Light], function() {
			$.each(this, function() {
				if(typeof(icc[this.Set])==='undefined') {
					icc[this.Set] = [];
				}
				icc[this.Set].push(this.id);
			});
		});
	}
	return this.idCardsSetCache[set];
};

core_data.getCardsByCategory = function(cat) {
	if(typeof(this.idCardsCategoryCache) === 'undefined') {
		this.idCardsCategoryCache = {};
		var icc = this.idCardsCategoryCache;
		$.each([this.main.Dark,this.main.Light], function() {
			$.each(this, function() {
				if(typeof(icc[this.Category])==='undefined') {
					icc[this.Category] = [];
				}
				icc[this.Category].push(this.id);
			});
		});
	}
	return this.idCardsCategoryCache[cat];
};

String.prototype.toObject = function(rowSep, colSep) {
	var retObj = {};
	$.each(this.split(rowSep), function() {
		if(this.length > 0){
			var key = this.substring(0,this.indexOf(colSep))
			var value = this.substring(this.indexOf(colSep)+1)
			retObj[key] = value.trim();
		}
	});	
	return retObj;
}

function Cards() {
	this.reset(false);
}

Cards.prototype.askForReset = function() {		
	var self = this;
	$('<div style="padding: 10px; max-width: 500px; word-wrap: break-word;">Do you really want to discard this deck?</div>').dialog({
	    draggable: false,
	    modal: true,
	    resizable: false,
	    width: 'auto',
	    title: 'Discard current deck',
	    minHeight: 75,
        close: function(ev, ui) {
			$(this).remove();
		},
	    buttons: {
	        OK: function () {
	        	self.createSide('reset');
	            $(this).dialog('destroy');
	        },
	        Cancel: function () {           
	            $(this).dialog('destroy');
	        }
	    }
	});
}

Cards.prototype.reset = function() {
	this.currentDeckId = "";
	this.selectedCards = {};
	this.resetStatistics();
	delete core_data.idCardCache;
	delete core_data.idCardsAllCache;
	delete core_data.idCardsSetCache;
	delete core_data.idCardsCategoryCache;
	this.updateUi();
}

Cards.prototype.resetStatistics = function() {
	this.totalDeploy = 0;
	this.numberDeploy = 0;
	this.totalForfeit = 0;
	this.numberForfeit = 0;
	this.totalDestiny = 0;
	this.categoryCounter = {};
}

Cards.prototype.calcStatistics = function() {
	this.resetStatistics();	
	var self = this;
	$.each(this.selectedCards, function(cardId, number) {
		var card = core_data.getCard(cardId);
		var val = parseInt(card.Deploy);
		if(!isNaN(val)) {
			self.totalDeploy += val;
			self.numberDeploy++;
		}
		val = parseInt(card.Forfeit);
		if(!isNaN(val)) {
			self.totalForfeit += val;
			self.numberForfeit++;
		}
		val = parseInt(card.Destiny);
		if(isNaN(val)) val=0;
		self.totalDestiny += val;

		if(typeof(self.categoryCounter[card.Category]) == 'undefined') {
			self.categoryCounter[card.Category] = 0;
		}
		self.categoryCounter[card.Category] += parseInt(number);
	});	
}

Cards.prototype.updateUi = function() {
	var totalNumberCard = this.getTotalNumberOfSelectedCards();
	var categoryStr = "";
	$.each(this.categoryCounter, function(key, value) {
		if(categoryStr.length>0) categoryStr += ", ";
		categoryStr += key.substring(0,3)+"="+value+" ("+Math.round(100*value/totalNumberCard)+"%)";
	});
	$('#statisticsDiv').html("Cards selected: "+this.getTotalNumberOfSelectedCards()+"<br/>"+
		"Deploy: "+this.totalDeploy+" (ø:"+(this.totalDeploy/this.numberDeploy).toFixed(2)+")<br/>"+
		"Forfeit: "+this.totalForfeit+" (ø:"+(this.totalForfeit/this.numberForfeit).toFixed(2)+")<br/>"+
		"Destiny: "+this.totalDestiny+" (ø:"+(this.totalDestiny/totalNumberCard).toFixed(2)+")<br/>"+
		"Cat.: "+categoryStr+"<br/>");

	var allselectedBlocks = "";
	$.each(this.selectedCards, function(cardId,number) {		
		if(allselectedBlocks != "") {
			allselectedBlocks += "<br/>";
		}
		var card = core_data.getCard(cardId);
		allselectedBlocks += "["+card.Set+"] "+ card.Name +" ("+number+"x)";
	});
	$('#selectedCardsDiv').html(allselectedBlocks);
};

Cards.prototype.selectionChanged = function() {
	this.changeShow()
	this.calcStatistics();
	this.updateUi();
}

Cards.prototype.changeShow = function (changedElement) {
	if((/_ALL$/).test(changedElement)) {
		var divName,namePrefix,type;
		if(changedElement=="cat_ALL") {
			divName="categoryDiv";
			namePrefix="cat";
			type="categories";
		} else if(changedElement=="set_ALL") {
			divName="setsDiv";
			namePrefix="set";
			type="sets";
		}
		var toSet = $("#"+divName+" input[name="+changedElement+"]").is(":checked");
		$.each(core_data[type], function(ind, cat) {
			if(cat!="ALL") {
				$("#"+divName+" input[name="+namePrefix+"_"+cat+"]").prop("checked",toSet);
			}
		});			
		changedElement=null;
	}
	var self = this
	var showSelected = $("#cardsDiv input[type=radio]:checked").val();	
	var categoriesSelected = {};
	$.each(core_data.categories, function(ind, cat) {
		if(cat!="ALL") {
			categoriesSelected[cat] = $("#categoryDiv input[name=cat_"+cat+"]").is(":checked");			
		}
	});
	var setsSelected = {};
	$.each(core_data.sets, function(ind, set) {
		if(set!="ALL") {
			setsSelected[set] = $("#setsDiv input[name=set_"+set+"]").is(":checked");
		}
	});
	
	var cardsToProcess;
	if(typeof(changedElement)==='undefined' || changedElement == null) {
		cardsToProcess = core_data.getAllCardNodes();
	} else if ((/^set_/).test(changedElement)) {
		cardsToProcess = core_data.getCardsBySet(changedElement.substring(4));
	} else if ((/^cat_/).test(changedElement)) {
		cardsToProcess = core_data.getCardsByCategory(changedElement.substring(4));
	}
	
	$.each(cardsToProcess, function(ind, id) {
		var card = core_data.getCard(id);
		var showSelection = showSelected == 'all' || 
			showSelected == 'sel' && typeof(self.selectedCards[card.id]) !== 'undefined' || 
			showSelected == 'not' && typeof(self.selectedCards[card.id]) === 'undefined';
		if(categoriesSelected[card.Category] && setsSelected[card.Set] && showSelection) {
			card.nodeRef.show();
		} else {
			card.nodeRef.hide();
		};
	});
}

Cards.prototype.createSide = function (side) {
	this.side = side;
	if(side=='reset') {
		$('#mainLinkReset').hide();
		$('#mainLinkLight').show();
		$('#mainLinkDark').show();
		$('#main').empty();
		$("#setsDiv").empty();
		$("#categoryDiv").empty();
		this.reset(true);
		$('#statisticsDiv').empty();
		if(user.loggedIn) {
			$('#mainLinkLoad').show();
			$('#mainLinkSave').hide();
			$('#mainLinkSaveAs').hide();
		}
	} else {
		$("#waitDialogText").html("Loading images ... initializing");
		$("#waitDialog").show();
		setTimeout("cards.createCardNodes()", 25);
	}
};

Cards.prototype.createCardNodes = function() {
	var self = this;
	$('#mainLinkLight').hide();
	$('#mainLinkDark').hide();
	$('#mainLinkReset').show();
	$('#main').empty()
	this.reset(false);
	this.updateUi();
	if(user.loggedIn) {
		$('#mainLinkLoad').hide();
		$('#mainLinkSave').show();
		$('#mainLinkSaveAs').show();
	}

	// create all Card-Boxs
	var mainDiv = $("<div />");
	var lastCategory = null;
	var totalCardsCreated = 0;
	var totalCardsLoaded = 0;
	$.each(core_data.main[this.side], function(index, value) {
		if(lastCategory != value.Category) {
			lastCategory = value.Category;
			$('#main').append(mainDiv);
			mainDiv = $("<div />");
		}
		var staticDiv = $('<div />');
		staticDiv.css("display","inline-block");
		staticDiv.css("margin","6px");
		staticDiv.css("borderRadius","12px");
		staticDiv.attr('id',value.id);
		mainDiv.append(staticDiv);
		
		var innerDiv = $('<div />');
		innerDiv.css("position","relative");
		staticDiv.append(innerDiv);		
		
		var img = $("<img />");
		img.load(function() {
			totalCardsLoaded++;
			$("#waitDialogText").html("Loading images ... "+totalCardsLoaded+" from "+totalCardsCreated);
			if(totalCardsCreated<=totalCardsLoaded) {
				$("#waitDialog").hide();
			}
		});
		img.attr('src',user.path+'/'+value.ImageFile);
		innerDiv.append(img);
		totalCardsCreated++;
		
		var counterSpan = $("<span />");
		counterSpan.attr('id','cardInfo'+value.id);
		counterSpan.css("position", "absolute");
		counterSpan.css("top", "5px");
		counterSpan.css("left", "5px");
		counterSpan.css("fontWeight", "bolder");
		counterSpan.css("fontSize", "20px");
		counterSpan.css("fontFamily", "Arial");
		counterSpan.css("textShadow", "0 1px 0 #E2007A,0 -1px 0 #E2007A,1px 0 0 #E2007A,-1px 0 0 #E2007A");
		counterSpan.css("color", "#000");
		
		innerDiv.append(counterSpan);
		
		innerDiv.click(function(e){
			if(e.button==0 && !e.shiftKey) {
				if(typeof(self.selectedCards[value.id]) === 'undefined') {
					self.selectedCards[value.id]=0;
				}
				self.selectedCards[value.id]++;
			} else if(typeof(self.selectedCards[value.id])!=="undefined") {
				self.selectedCards[value.id]--;
				if(self.selectedCards[value.id]<=0) {
					delete self.selectedCards[value.id];
				}
			}
			if(typeof(self.selectedCards[value.id])!=="undefined") {
				staticDiv.css("margin","1px");
				staticDiv.css("border","5px solid yellow");
				counterSpan.html(self.selectedCards[value.id]);
			} else {
				staticDiv.css("margin","6px");
				staticDiv.css("border","");
				counterSpan.html("");
			}
			self.calcStatistics();
			self.updateUi();
		});				
	});
	$('#main').append(mainDiv);
	
	var div = $("<input />");
	div.attr("type", "checkbox");
	div.attr("name", "set_ALL");
	div.attr("value", "yes");
	div.attr("checked", "checked");
	div.click(function(e) {
		cards.changeShow("set_ALL");
	});
	$("#setsDiv").append("ALL");
	$("#setsDiv").append(div);
	$.each(core_data.sets, function(index, value) {
		var div = $("<input />");
		div.attr("type", "checkbox");
		div.attr("name", "set_"+value);
		div.attr("value", "yes");
		div.attr("checked", "checked");
		div.click(function(e) {
			cards.changeShow("set_"+value);
		});
		$("#setsDiv").append(value);
		$("#setsDiv").append(div);
	});
			
	var div = $("<input />");
	div.attr("type", "checkbox");
	div.attr("name", "cat_ALL");
	div.attr("value", "yes");
	div.attr("checked", "checked");
	div.click(function(e) {
		cards.changeShow("cat_ALL");
	});
	$("#categoryDiv").append("ALL");
	$("#categoryDiv").append(div);
	$.each(core_data.categories, function(index, value) {
		var div = $("<input />");
		div.attr("type", "checkbox");
		div.attr("name", "cat_"+value);
		div.attr("value", "yes");
		div.attr("checked", "checked");
		div.click(function(e) {
			cards.changeShow("cat_"+value);
		});
		$("#categoryDiv").append(value.substring(0,3));
		$("#categoryDiv").append(div);
	});	
};

Cards.prototype.getSelectedDecksAsString = function () {
	var ret="";
	$.each(this.selectedCards, function(k,v) {
		if(ret.length>0) {
			ret +=",";
		}
		ret += k+"="+v;
	});
	return ret;
}

Cards.prototype.getTotalNumberOfSelectedCards = function () {
	var ret=0;
	$.each(this.selectedCards, function(k,v) {
		ret += parseInt(v);
	});
	return ret;
}

function User() {
	this.deckList = [];
	this.path = "images"
	this.loggedIn = false
}

// jQuery's inArray uses === but I need ==
Cards.inArray = function(objToSearch, array, index) {
	for(var i = index ; i < array.length ; i++) {
		if(array[i] == objToSearch) {
			return i;
		}
	}
	return -1;
}

Cards.prototype.reverseUpdateSelectionModel = function(selectedCards) {
	var self = this;
	$.each(selectedCards, function(ind, kvString) {
		var kv = kvString.split("=");
		var div = $("#"+kv[0])
		div.css("border","5px solid yellow");
		div.css("margin","1px");
		$("#cardInfo"+kv[0]).html(kv[1]);
		self.selectedCards[kv[0]] = kv[1];
	});
}

User.prototype.saveDeck = function() {	
	var self = this;
	if(cards.currentDeckId == "") {
		this.saveAsDeck();
	} else {
		$.get( "api.groovy" , {
			type:'save',
			deckId: cards.currentDeckId, 
			blocks: cards.getSelectedDecksAsString(),
			valid: (cards.getTotalNumberOfSelectedCards() == 60)
		}, function(data, textStatus, jqXHR) {
			if(textStatus=='success') {				
				var jsonData = $.parseJSON(data)
				self.deckList = jsonData.deckNames;		
			}
		});		                	
	}
}

User.prototype.saveAsDeck = function() {	
	var self = this;
	$( 	'<div>'+
  		'<p>Please enter a name for the deck:</p>'+
  		'<input type="text" id="textDeckName" name="textDeckName" />'+
		'</div>' ).dialog({     
			modal: true,                   
            title: 'Save deck',
            close: function(ev, ui) {
				$(this).remove();
  			},
            buttons: {
                "Save deck": function () { 
                	console.log(cards.getSelectedDecksAsString())
                	console.log($(cards.selectedCards).length)
                	var textDeckName = $("#textDeckName").val()						
					$.get( "api.groovy" , {
						type:'save', 
						deckName: textDeckName, 
						side: cards.side, 
						blocks: cards.getSelectedDecksAsString(),
						valid: (cards.getTotalNumberOfSelectedCards() == 60)
					}, function(data, textStatus, jqXHR) {
							if(textStatus=='success') {
								var jsonData = $.parseJSON(data)
								self.deckList.push(jsonData)
								cards.currentDeckId = jsonData.id
							}
						}
					);		                	
                	$( this ).dialog( "destroy" )
                }
            }
        });
}

User.prototype.delDeck = function(deckId) {
	var self = this;
	$.ajax( "api.groovy" , {type: 'GET', dataType: 'json', data: {type:'delete',deckId:deckId}, 
		success: function(data, textStatus, jqXHR) {
			if(textStatus=='success') {
       			self.deckList = data.deckNames;
			}
		}
	});
	this.dialog.dialog("destroy");
}

User.prototype.loadDeck = function(deckId) {
	var self = this;
	$.ajax( "api.groovy" , {type: 'GET', dataType: 'json', data: {type:'load',deckId:deckId}, 
		success: function(data, textStatus, jqXHR) {
			if(textStatus=='success') {
				cards.createSide(data.side);
				cards.reverseUpdateSelectionModel(data.blocks.split(","));
				cards.selectionChanged();
				cards.currentDeckId = deckId
			}
		}
	});
	this.dialog.dialog("destroy");
}

User.prototype.showDeckList = function() {
	var str = "";
	$.each(this.deckList, function() {
		str += "<a href='javascript:void(0)' onclick='user.delDeck(\""+this.id
			+"\")'>[Del]</a> <a href='javascript:void(0)' onclick='user.loadDeck(\""+this.id+"\")'>"
			+this.name+" ("+this.side+"/"+(this.valid=='true'?"Valid":"Invalid")+")"+"</a><br/>";
	});
	this.dialog = $( 	'<div>'+str+'</div>' ).dialog({ 
		title:'Load a deck',
		modal:true,
		width: 500,
		buttons: { "Cancel": function() { $( this ).dialog( "destroy" ); } },
        close: function(ev, ui) {
			$(this).remove();
		},
    	open: function ()
		{
			$(this).parents().find('button').last().focus(); 
		},
	});
}

User.prototype.register = function() {
	var self = this;
	$( 	'<div>'+
  		'<p>Please enter your email and a passwort to create a new account:</p>'+
  		'Email:<br/><input type="text" id="textEmail" name="email" /><br/>'+
  		'Password:<br/><input type="text" id="textPassword" name="password" />'+
		'</div>' ).dialog({     
			modal: true,                   
            title: 'Register account',
	        close: function(ev, ui) {
				$(this).remove();
			},
            buttons: {
                "Create account": function () { 
                	if($("#textEmail").val() == "" || $("#textPassword").val() == "") {
                		alert("Empty email and/or passwords are not allowed!");
                		return;
                	} else {
		            	$.ajax( "api.groovy" , {
		            		type: 'POST',
		            		dataType: 'json',
		            		headers: { "cache-control": "no-cache" },
		            		data: {type:'create',email:$("#textEmail").val(), pass:$("#textPassword").val()} ,
		            		success : function(data, textStatus, jqXHR) {
		                		if(textStatus=='success') {
                        			$('#mainLinkLogin').hide();
                        			$('#mainLinkRegister').hide();                            			
		                			$('#mainLinkLogout').show();                            			
                        			self.deckList = data.deckNames;
                        			if(self.deckList == null) {
    	                				self.deckList = []
    	                			}
                        			self.loggedIn = true
				        			if(cards.side==null||cards.side=='reset') {
				       					$('#mainLinkLoad').show();
				       				} else {
				       					$('#mainLinkSave').show();
				       					$('#mainLinkSaveAs').show();
				       				}
		                		}
		                	},
							error : function(jqXHR, textStatus, errorThrown) {
	                			alert(jqXHR.getAllResponseHeaders().toObject("\r\n",':').X_ERROR);
		                	}
		            	});
                    	$( this ).dialog( "destroy" ); 
                	}                            	
               	},
               	"Cancel": function() {
               		$( this ).dialog( "destroy" ); 
               	}
            }
        });	
}

User.prototype.logout = function() {
	$.get( "api.groovy" , {	type:'logout' })
	$('#mainLinkLogin').show()
	$('#mainLinkRegister').show()                    			
	this.deckList = []
	this.path = "images"
	this.loggedIn = false
	$('#mainLinkLoad').hide()
	$('#mainLinkSave').hide()
	$('#mainLinkSaveAs').hide()
	$('#mainLinkLogout').hide()
}

User.prototype.changePass = function() {
	$( 	'<div>'+
	  		'<p>Please enter your old and new passwort:</p>'+
	  		'Old password:<br/><input type="password" id="oldPass" name="oldPass" /><br/>'+
	  		'New password:<br/><input type="password" id="newPass" name="newPass" />'+
			'</div>' ).dialog({     
				modal: true,                   
		        title: 'Change password',
		        close: function(ev, ui) {
					$(this).remove();
				},
		        buttons: {
		            "Change": function () { 
		            	$.ajax( "api.groovy" , {
		            		type: 'POST',
		            		dataType: 'json',
		            		headers: { "cache-control": "no-cache" },
		            		data: { type:'changePass', oldPass:$("#oldPass").val(), newPass:$("#newPass").val() },		            		
							error : function(jqXHR, textStatus, errorThrown) {
								if(errorThrown=='Forbidden') {
		                			alert("Wrong old password!");
		                		} else {
		                			alert(errorThrown);
		                		}
		                	}
		            	});
		            	$( this ).dialog( "destroy" ); 
		           	},
		           	"Cancel": function() {
		           		$( this ).dialog( "destroy" ); 
		           	}
		        }
		    });		
}

User.prototype.recoverPass = function() {
	$( 	'<div>'+
			'<p>You can get a newly generated password via email. To do so please enter your email address and we will initiate a password generation process:</p>'+
			'<br/><input type="text" id="email" name="email" />'+
	'</div>' ).dialog({     
		modal: true,                   
		title: 'Recover password',
		close: function(ev, ui) {
			$(this).remove();
		},
		buttons: {
			"Send email": function () { 
				$.ajax( "api.groovy" , {
					type: 'POST',
					dataType: 'json',
					headers: { "cache-control": "no-cache" },
					data: { type:'recoverPassReq', email:$("#email").val() },		            		
					error : function(jqXHR, textStatus, errorThrown) {
						if(errorThrown=='Forbidden') {
						} else {
							alert(errorThrown);
						}
					}
				});
				$( this ).dialog( "destroy" ); 
			},
			"Cancel": function() {
				$( this ).dialog( "destroy" ); 
			}
		}
	});		
}

User.prototype.login = function() {
	var self = this;
	$( 	'<div>'+
  		'<p>Please enter your email and a passwort to login:</p>'+
  		'Email:<br/><input type="text" id="textEmail" name="email" /><br/>'+
  		'Password:<br/><input type="password" id="textPassword" name="password" />'+
		'</div>' ).dialog({     
			modal: true,                   
	        title: 'Login',
	        close: function(ev, ui) {
				$(this).remove();
			},
	        buttons: {
	            "Login": function () { 
	            	$.ajax( "api.groovy" , {
	            		type: 'POST',
	            		dataType: 'json',
	            		headers: { "cache-control": "no-cache" },
	            		data: { type:'login', email:$("#textEmail").val(), pass:$("#textPassword").val() },
	            		success : function(data, textStatus, jqXHR) {
	                		if(textStatus=='success') {
	                			$('#mainLinkLogin').hide();
	                			$('#mainLinkRegister').hide();                            			
	                			$('#mainLinkLogout').show();                            			
	                			self.deckList = data.deckNames;
	                			if(self.deckList == null) {
	                				self.deckList = []
	                			}
	                			//self.path = data.path;
	                			self.loggedIn = true
			        			if(cards.side==null||cards.side=='reset') {
			       					$('#mainLinkLoad').show();
			       				} else {
			       					$('#mainLinkSave').show();
			       					$('#mainLinkSaveAs').show();
			       				}
	                		}
	                	},
						error : function(jqXHR, textStatus, errorThrown) {
							if(errorThrown=='Forbidden') {
	                			alert("Login failed! Wrong email or password!");
	                		} else {
	                			alert(errorThrown);
	                		}
	                	}
	            	});
	            	$( this ).dialog( "destroy" ); 
	           	},
	           	"Cancel": function() {
	           		$( this ).dialog( "destroy" ); 
	           	}
	        }
	    });	
}



var user = new User();
var cards = new Cards();

function readCookie(key)
{
    var result;
    return ((result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? (result[1]) : null);
}
function deleteCookie(key) {
    document.cookie = encodeURIComponent(key) + "=deleted; expires=" + new Date(0).toUTCString();
}

$(function() {
	$( "#tabs" ).tabs();
	if(readCookie("JSESSIONID")!=null) {
    	$.ajax( "api.groovy" , {
    		type: 'GET',
    		dataType: 'json',    		
    		data: { type:'relogin' },
    		success : function(data, textStatus, jqXHR) {
        		if(textStatus=='success') {
        			$('#mainLinkLogin').hide();
        			$('#mainLinkRegister').hide();      
        			$('#mainLinkLogout').show();                      			        			
        			user.deckList = data.deckNames;
        			if(user.deckList == null) {
        				user.deckList = []
        			}
        			//user.path = data.path;
        			user.loggedIn = true
        			if(cards.side==null||cards.side=='reset') {
       					$('#mainLinkLoad').show();
       				} else {
       					$('#mainLinkSave').show();
       					$('#mainLinkSaveAs').show();
       				}
        		}
        	}
        });
	}
});





