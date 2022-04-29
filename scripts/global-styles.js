function getGlobalStyles() {
	let css_url = browser.runtime.getURL("style/global.css");
	return fetch( css_url );
}