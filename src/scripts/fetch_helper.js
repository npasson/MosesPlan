/**
 * @type function
 * @returns {string}
 */
let getURL;

if ( typeof browser !== 'undefined' ) {
	getURL = browser.runtime.getURL;
} else {
	getURL = chrome.runtime.getURL;
}

/**
 * Returns a fetch of the CSS for the extension.
 * @returns {Promise<Response>}
 */
function fetchGlobalStyle() {
	const style_path = 'src/style/global.css';
	const style_url  = getURL( style_path );

	return new Promise( resolve => {
		fetch( style_url ).then( ( response ) => {
			response.text().then( text => {
				resolve( text );
			} );
		} );
	} );
}

/**
 * Example:
 *
 * <pre>
 * fetchSite( 'extension' ).then(
 *     html => $( '.main' ).append( $( html ) )
 * )
 * </pre>
 *
 * @param name
 * @return {Promise<string>}
 */
function fetchSiteText( name ) {
	const site_path = `src/sites/${name}.html`;
	const site_url  = getURL( site_path );

	return new Promise( resolve => {
		fetch( site_url ).then( ( response ) => {
			response.text().then( text => {
				resolve( text );
			} );
		} );
	} );
}
