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
 *
 * @param key The key of the parameter to remove.
 * @param uri The original URL.
 * @returns {string} The modified URL without the parameter.
 */
function removeGetParameter( key, uri = document.location.href ) {
	let url = new URL( uri );
	url.searchParams.delete( key );
	return url.toString();
}

/**
 * Adds a parameter to the GET request and returns the modified URL.
 *
 * @param key The key of the parameter to add.
 * @param value The value of the parameter to add.
 * @param uri The original URL.
 * @returns {string} The modified URL without the parameter.
 */
function addGetParameter( key, value, uri = document.location.href ) {
	let url = new URL( document.location.href );
	url.searchParams.set( key, value );
	return url.toString();
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

function getRandomString( length = 8 ) {
	let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	let str = '';
	for ( let i = 0; i < length; ++i ) {
		str += chars.charAt( Math.floor( Math.random() * chars.length ) );
	}

	return str;
}