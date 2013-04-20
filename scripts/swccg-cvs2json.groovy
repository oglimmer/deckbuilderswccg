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
		
//		if((properties.Side == 'Light'||properties.Side == 'Dark') && properties.Set.startsWith("Premiere")) {
		if((properties.Side == 'Light'||properties.Side == 'Dark') && !properties.Set.startsWith("Virtual")) {
			//FILENAME
			properties.ImageFile = properties.Set +"-"+ properties.Side +"/large/"+ properties.ImageFile
					def imageFile = new File("/Users/oli/dev/java/deckbuilderswccg/src/main/webapp/images/"+properties.ImageFile)
			if(imageFile.exists()){			
				//if(properties.Set == 'Premiere' || properties.Set == 'ANewHope' || properties.Set == 'Hoth' ) {
				//ID
				properties.id = removeNonAscii(properties.Name+properties.Set+properties.Side)
				//allSets
				allSets[properties.Set] = null;
				//allCategories
				allCategories[properties.Category] = null;
				//----
				rootData[properties.Side].add(properties);
			} else {
				System.err.println("Missing image for "+properties.ImageFile);
			}
		}
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

