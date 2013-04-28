<%@ page pageEncoding="utf-8" contentType="text/html;charset=utf-8" session="false" %><!DOCTYPE html>
<html>
	<head>
		<title>Star Wars CCG Deck Builder</title>
		<meta charset="utf-8" />
		<script type="text/javascript" src="js/jquery-1.9.0.js"></script>
		<script type="text/javascript" src="js/jquery-ui-1.10.0.custom.min.js"></script>
		<script type="text/javascript" src="js/core_data.js"></script>
		<script type="text/javascript" src="js/deckbuilder.js"></script>
		<link rel="stylesheet" type="text/css" href="css/deckbuilder.css" />
		<link rel="stylesheet" type="text/css" href="css/ui-lightness/jquery-ui-1.10.0.custom.css" />
	</head>
<body>
	<div id="infoBox">
		<div id="tabs">
			<ul>
				<li><a href="#adminDiv"><span>Admin</span></a></li>
				<li><a href="#cardsDiv"><span>Card Blocks</span></a></li>
				<li><a href="#statisticsDiv"><span>Statistics</span></a></li>
				<li><a href="#helpDiv"><span>Help</span></a></li>
			</ul>
			<div id="adminDiv">
				<div id="mainLinkLogout" style='display:none;'>
					<a href="javascript:void(0)" onclick="user.logout()">Log out</a> / <a href="javascript:void(0)" onclick="user.changePass()">Change password</a>
				</div>
				<div id="mainLinkLoad" style='display:none;'>
					<a href="javascript:void(0)" onclick="user.showDeckList()">Load deck</a>
				</div>
				<div id="mainLinkSave" style='display:none;'>
					<a href="javascript:void(0)" onclick="user.saveDeck()">Save deck</a>
				</div>
				<div id="mainLinkSaveAs" style='display:none;'>
					<a href="javascript:void(0)" onclick="user.saveAsDeck()">Save deck as ...</a>
				</div>
				<div id="mainLinkRegister">
					<a href="javascript:void(0)" onclick="user.register()">Register account</a>
				</div>
				<div id="mainLinkLogin">
					<a href="javascript:void(0)" onclick="user.login()">Login</a> / <a href="javascript:void(0)" onclick="user.recoverPass()">Password recovery</a>
				</div>
				<div id="mainLinkDark">
					<a href="javascript:void(0)" onclick="cards.createSide('Dark')">Create new Dark side deck</a> 
				</div>
				<div id="mainLinkLight">
					<a href="javascript:void(0)" onclick="cards.createSide('Light')">Create new Light side deck</a>
				</div>
				<div id="mainLinkReset" style='display:none;'>
					<a href="javascript:void(0)" onclick="cards.askForReset()">Discard deck</a>
				</div>
			</div>
			<div id="statisticsDiv"></div>
			<div id="cardsDiv">
				<div id="setsDiv"></div>
				<div>
					All:<input type="radio" name="show" value="all" checked="checked" onchange="cards.changeShow()" /> Selected:<input type="radio" name="show" value="sel" onchange="cards.changeShow()" /> Not:<input type="radio" name="show" value="not" onchange="cards.changeShow()" />
					<div id="categoryDiv"></div>
				</div>
				<div id="selectedCardsDiv"></div>
			</div>
			<div id="helpDiv">
				<ul>
					<li>Use Chrome or Firefox since they cache images properly.</li>
					<li>To put a card into a deck do a left-click</li>
					<li>To remove a card from a deck do a middle-click or a shift-left-click</li>
					<li>A deck must contain exactly 60 cards to be valid</li>
					<li>
					Cha = Character, Eff = Effect, Veh = Vehicle, Sta = Starship, Epi = Epic, Loc = Location, Dev = Device, Cre = Creature, Wea = Weapon, Int = Interrupt, Obj = Objective, Jed = Jedi Test, Adm = Admiral's Order, Def = Defensive Shield, Pod = Podracer, Und = Undefined
					</li>
				</ul>
			</div>
		</div>
	</div>
	<div id="main"></div>
	<div id="waitDialog">
		<div id="waitDialogFrame">
			<div id="waitDialogText">Loading images ... initializing</div>
			<br/>	
			<img id="waitDialogLoadingGif" src="images/loading.gif" alt="" />
		</div>
	</div></body>
</html>






