/**
 * Returns a fetch of the CSS for the extension.
 * @returns {Promise<Response>}
 */
function getGlobalStyles() {
	let css_url;
	const style_path = 'src/style/global.css';
	if ( typeof browser !== 'undefined' ) {
		css_url = browser.runtime.getURL( style_path );
	} else {
		css_url = chrome.runtime.getURL( style_path );
	}

	return fetch( css_url );
}