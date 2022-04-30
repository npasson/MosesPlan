function getCookie( cname ) {
	let name          = cname + '=';
	let decodedCookie = decodeURIComponent( document.cookie );
	let ca            = decodedCookie.split( ';' );
	for ( let i = 0; i < ca.length; i++ ) {
		let c = ca[i];
		while ( c.charAt( 0 ) === ' ' ) {
			c = c.substring( 1 );
		}
		if ( c.indexOf( name ) === 0 ) {
			return c.substring( name.length, c.length );
		}
	}
	return '';
}

/**
 * Gets a GET parameter.
 * Taken from https://stackoverflow.com/a/5448595
 *
 * @param key The GET key.
 * @returns {null|string} The value, or null if undefined.
 */
function getGetParameter( key ) {
	let result = null;
	let tmp    = [];
	location.search
	        .substring( 1 )
	        .split( '&' )
	        .forEach( function ( item ) {
		        tmp = item.split( '=' );
		        if ( tmp[0] === key ) {
			        result = decodeURIComponent( tmp[1] );
		        }
	        } );
	return result;
}

/**
 * Removes a parameter from the GET request and returns the modified URL.
 * Taken from https://stackoverflow.com/a/16941754
 *
 * @param key The key of the parameter to remove.
 * @param sourceURL The original URL.
 * @returns {string} The modified URL without the parameter.
 */
function removeGetParameter( key, sourceURL ) {
	let retval      = sourceURL.split( '?' )[0];
	let param;
	let params_arr  = [];
	let queryString = ( sourceURL.indexOf( '?' ) !== -1 ) ? sourceURL.split( '?' )[1] : '';
	if ( queryString !== '' ) {
		params_arr = queryString.split( '&' );
		for ( let i = params_arr.length - 1; i >= 0; i -= 1 ) {
			param = params_arr[i].split( '=' )[0];
			if ( param === key ) {
				params_arr.splice( i, 1 );
			}
		}
		if ( params_arr.length ) {
			retval = retval + '?' + params_arr.join( '&' );
		}
	}
	return retval;
}

/**
 * ECMA2016 / ES6
 * taken from: https://gist.github.com/danieliser/b4b24c9f772066bcf0a6
 */
function convertHexToRGBA( hexCode, opacity = 1 ) {
	let hex = hexCode.replace( '#', '' );

	if ( hex.length === 3 ) {
		hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
	}

	const r = parseInt( hex.substring( 0, 2 ), 16 );
	const g = parseInt( hex.substring( 2, 4 ), 16 );
	const b = parseInt( hex.substring( 4, 6 ), 16 );

	/* Backward compatibility for whole number based opacity values. */
	if ( opacity > 1 && opacity <= 100 ) {
		opacity = opacity / 100;
	}

	return `rgba(${r},${g},${b},${opacity})`;
}
