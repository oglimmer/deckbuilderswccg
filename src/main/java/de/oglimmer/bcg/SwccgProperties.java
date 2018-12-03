package de.oglimmer.bcg;

import de.oglimmer.utils.AbstractProperties;

public class SwccgProperties extends AbstractProperties {

	public static final SwccgProperties INSTANCE = new SwccgProperties();

	public SwccgProperties() {
		super("swccg.properties");
	}

	public String getDbHost() {
 	   return getJson().getString("db.host");
	}

}