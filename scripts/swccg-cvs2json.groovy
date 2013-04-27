#!/usr/bin/env groovy

import java.lang.reflect.Array;

import groovy.xml.MarkupBuilder

String removeNonAscii(String str) {
	return (str =~ /[^a-zA-Z0-9]/).replaceAll("")
}

def basedir = "./"

// convert list with maps to more complex data structure
def rootData = [
	Dark:[],
	Light:[]
];

def allSets = [:]

def allCategories = [:]

def allVirtualCards = ["Dark":[:], "Light":[:]]

args.each { file ->
		
//	mogrify -filter LanczosSharp -resize 85x85 -format jpg -quality 89 *.jpg //small
//	mogrify -filter LanczosSharp -resize 509x509 -format jpg -quality 89 *.jpg //large
//	mogrify -filter LanczosSharp -resize 423x423 -format jpg -quality 89 *.jpg //deckbuilder
	
	def colDef = ["Name","Set","ImageFile","Side","Category","Destiny","Rarity","Restrictions","Stats","Deploy","Forfeit","Icons","Text"]
	def defFile = new File(file)
	if(!defFile.exists() || !defFile.isFile() || !file.toString().endsWith(".txt")) {
		System.out.printf("%s is not a txt-file\r\n", file)
		return;
	}
	def baseDir = defFile.getParentFile()
	
	System.out.println("Processing "+defFile)
	
	defFile.splitEachLine("\t") {fields ->
		def properties = [:]
		fields.eachWithIndex { obj, index ->
			if(colDef[index]=='Category') {
				def subFields = obj.split(" -- ")
				if(subFields[0].startsWith("Jedi Test")) {
					subFields[0] = "Jedi Test";
				}
				properties[colDef[index]] = removeNonAscii(subFields[0])
				if(subFields.length>1) {
					properties["Subcategory"] = removeNonAscii(subFields[1])
				}
			} else if(colDef[index]=='Set') {
				properties[colDef[index]] = removeNonAscii(obj)
			} else if(colDef[index]=='ImageFile') {
				properties[colDef[index]] = obj.substring(obj.indexOf("-")+1)+".gif"
			} else {
				properties[colDef[index]] = obj
			}
		}
				
		if((properties.Side == 'Light'||properties.Side == 'Dark') ) {
			//FILENAME
			properties.ImageFile = properties.Set +"-"+ properties.Side +"/large/"+ properties.ImageFile
			def imageFile = new File("/Users/oli/dev/java/deckbuilderswccg/src/main/webapp/images/"+properties.ImageFile)
			if(imageFile.exists()){
				//ID
				properties.id = removeNonAscii(properties.Name)+"_"+removeNonAscii(properties.Set)+"_"+removeNonAscii(properties.Side)
				//allSets
				allSets[properties.Set] = null;
				//allCategories
				allCategories[properties.Category] = null;
				//----												
				rootData[properties.Side].add(properties);
			} else if(!properties.ImageFile.startsWith("Virtual")) {
				System.out.println("Missing image for "+imageFile);				
			}
			
			// Virtual Sets doesn't match from card files to carddata.txt. So we remember all unique carddata
			if(properties.Set.startsWith("Virtual")) {
				def key = properties.ImageFile.substring(properties.ImageFile.lastIndexOf("/")+1, properties.ImageFile.lastIndexOf("."))
				if(allVirtualCards[properties.Side].containsKey(key)) {
					allVirtualCards[properties.Side][key] = "DUPLICATE"
				} else {
					allVirtualCards[properties.Side][key] = properties
				}
			}
		}
	}	
	
}

// We need to find all virtual cards which have a not unique file name
def allVirtualCardsDup = ["Dark":[:], "Light":[:]]

def dir = new File("/Users/oli/dev/java/deckbuilderswccg/src/main/webapp/images/")
dir.traverse {
	if(it.isFile() && it.path.contains("Virtual")){
		def path = it.path
		def properties = [:]
		properties.Name = it.name.substring(0, it.name.indexOf("."))
		path = path.substring(0, path.lastIndexOf("/"))
		path = path.substring(0, path.lastIndexOf("/"))
		path = path.substring(path.lastIndexOf("/")+1)
		properties.Side = path.substring(path.indexOf("-")+1)
		
		if(allVirtualCardsDup[properties.Side].containsKey(properties.Name)) {
			allVirtualCardsDup[properties.Side][properties.Name] = "DUPLICATE"
		} else {
			allVirtualCardsDup[properties.Side][properties.Name] = "found"
		}
	}
}

dir = new File("/Users/oli/dev/java/deckbuilderswccg/src/main/webapp/images/")
dir.traverse {
	if(it.isFile() && it.path.contains("Virtual")){
		def path = it.path
		
		def properties = [:]
		properties.Name = it.name.substring(0, it.name.indexOf("."))
		path = path.substring(0, path.lastIndexOf("/"))
		path = path.substring(0, path.lastIndexOf("/"))
		path = path.substring(path.lastIndexOf("/")+1)
		properties.Side = path.substring(path.indexOf("-")+1)
		
		def propFromVirtual = allVirtualCards[properties.Side][properties.Name]
		if(propFromVirtual != null && propFromVirtual != "DUPLICATE" && allVirtualCardsDup[properties.Side][properties.Name] != "DUPLICATE") {
			// we can only use the data from carddata.txt if the card's file name is absolutely unique
			properties = propFromVirtual
		} else {
			properties.Category = "Undefined"
			properties.Subcategory = ""
		}
		properties.Set = path.substring(0, path.indexOf("-"))
		properties.ImageFile = properties.Set +"-"+ properties.Side +"/large/"+ it.name		
		properties.id = removeNonAscii(properties.Name)+"_"+removeNonAscii(properties.Set)+"_"+removeNonAscii(properties.Side)

		//allSets
		allSets[properties.Set] = null;
		//allCategories
		allCategories[properties.Category] = null;
		
		rootData[properties.Side].add(properties);		
	}
}


// do some sorting
for(def side in rootData) {
	side.value.sort { it["Category"]+it["Subcategory"]+it["Set"] }
}

// let the JsonBuilder convert the groovy data strucutre into JSON
def builder = new groovy.json.JsonBuilder()
builder (
	main : rootData,
	categories : allCategories.keySet(),
	sets : allSets.keySet()
)

new File(basedir+"core_data.js").withWriter { out ->
	out.println "var core_data = ${builder.toPrettyString()}"
}

