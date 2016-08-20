var request = require("superagent");

module.exports = {
	fetch_data_get : function( url, query_params ){
		return new Promise(( resolve, reject ) => {
			request .get(url)
				.set( "Accept", "application/json" )
				.query( query_params )
				.end(( error, result ) => {
					error ? reject( error ) : resolve( result );
				});
		});
	},
	fetch_data_post : function( url, post_data, header ){
		return new Promise(( resolve, reject ) => {
			request .post( url )
				.set( header )
				.send( post_data )
				.end(( error, result ) => {
					error ? reject( error ) : resolve( result );
				});
		});
	}
}