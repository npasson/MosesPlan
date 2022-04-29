function getGlobalStyles() {
	let css_url;
	if ( typeof browser !== 'undefined' ) {
		css_url = browser.runtime.getURL( 'style/global.css' );
	} else {
		css_url = chrome.runtime.getURL( 'style/global.css' );
	}

	return fetch( css_url );
}