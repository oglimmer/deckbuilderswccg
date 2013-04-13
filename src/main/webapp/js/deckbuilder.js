core_data.getCard = function(cardId) {
	if(typeof(this.idCardCache) === 'undefined') {
		this.idCardCache = {}
		var icc = this.idCardCache;
		$.each([this.main.Dark,this.main.Light], function() {
			$.each(this, function() {
				icc[this.id] = this;
			});
		});
	}
	return this.idCardCache[cardId];
}

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
	this.updateUi();
}

Cards.prototype.resetStatistics = function() {
}

Cards.prototype.calcStatistics = function() {
}

Cards.prototype.updateUi = function() {
	$('#statisticsDiv').html("Cards selected: "+this.getTotalNumberOfSelectedCards()+"<br/>");
	var allselectedBlocks = "";
	$.each(this.selectedCards, function(cardId,number) {		
		if(allselectedBlocks != "") {
			allselectedBlocks += "<br/>"
		}
		var card = core_data.getCard(cardId)
		allselectedBlocks += "["+card.Set+"] "+ card.Name +" ("+number+"x)";
	})
	$('#selectedCardsDiv').html(allselectedBlocks);
}

Cards.prototype.selectionChanged = function() {
	this.changeShow()
	this.calcStatistics();
	this.updateUi();
}

Cards.prototype.changeShow = function () {
	var self = this
	var showSelected = $("#cardsDiv input[type=radio]:checked").val()	
	var categoriesSelected = {};
	$.each(core_data.categories, function(ind, set) {
		categoriesSelected[set] = $("#categoryDiv input[name=set_"+set+"]:checked").val()
	});
	var setsSelected = {};
	$.each(core_data.sets, function(ind, set) {
		setsSelected[set] = $("#setsDiv input[name=set_"+set+"]:checked").val()
	});
	$("#main > div > div").each(function() {
		var card = core_data.getCard(this.id);
		var showSelection = showSelected == 'all' || 
			showSelected == 'sel' && typeof(self.selectedCards[this.id]) !== 'undefined' || 
			showSelected == 'not' && typeof(self.selectedCards[this.id]) === 'undefined';
		if(categoriesSelected[card.Category] && setsSelected[card.Set] && showSelection) {
			$(this).show();
		} else {
			$(this).hide();
		};
	});
}

Cards.prototype.createSide = function (side) {
	this.side = side;
	var self = this;
	if(side=='reset') {
		$('#mainLinkReset').hide();
		$('#mainLinkLight').show();
		$('#mainLinkDark').show();
		$('#main').empty();
		this.reset(true);
		$('#statisticsDiv').empty();
		if(user.loggedIn) {
			$('#mainLinkLoad').show();
			$('#mainLinkSave').hide();
			$('#mainLinkSaveAs').hide();
		}
	} else {
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
		$.each(core_data.main[side], function(index, value) {
			if(lastCategory != value.Category) {
				lastCategory = value.Category;
				$('#main').append(mainDiv);
				mainDiv = $("<div />");
			}
			var staticDiv = $('<div />');
			staticDiv.css("display","inline-block");
			staticDiv.css("margin","5px");
			staticDiv.attr('id',value.id);
			mainDiv.append(staticDiv);
			
			var innerDiv = $('<div />');
			innerDiv.css("position","relative");
			staticDiv.append(innerDiv);		
			
			var img = $("<img />").attr('src',user.path+'/'+value.ImageFile);
			innerDiv.append(img);
			
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
				if(e.button==0) {
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
					staticDiv.css("border","5px solid green");
					staticDiv.css("borderRadius","5px");
					counterSpan.html(self.selectedCards[value.id]);
				} else {
					staticDiv.css("border","");
					counterSpan.html("");
				}
				self.updateUi();
			});
		});
		$('#main').append(mainDiv);
		
		$.each(core_data.sets, function(index, value) {
			var div = $("<input />");
			div.attr("type", "checkbox");
			div.attr("name", "set_"+value);
			div.attr("value", "yes");
			div.attr("checked", "checked");
			div.click(function(e) {
				cards.changeShow();
			});
			$("#setsDiv").append(value);
			$("#setsDiv").append(div);
		});
				
		$.each(core_data.categories, function(index, value) {
			var div = $("<input />");
			div.attr("type", "checkbox");
			div.attr("name", "set_"+value);
			div.attr("value", "yes");
			div.attr("checked", "checked");
			div.click(function(e) {
				cards.changeShow();
			});
			$("#categoryDiv").append(value.substring(0,2));
			$("#categoryDiv").append(div);
		});
		
	}
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
		var div = $("#card"+kv[0])
		div.css("border","5px solid green");
		div.css("borderRadius","5px");
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





