/**
 * The extension version.
 * @type {string}
 */
const VERSION = typeof browser !== 'undefined' ? ( browser.runtime.getManifest().version )
                                               : ( chrome.runtime.getManifest().version );

/**
 * The settings keys for local storage.
 * @type {{[]: string}}
 */
const StorageKey = {
	RENDER_EVENTS: 'mosesplan_render-events',
	RENDER_TUTORIALS: 'mosesplan_render-tutorials',
	TUTORIAL_BLACKLIST: 'mosesplan_tutorial-blacklist',
	EVENTS: 'mosesplan_events'
};

/**
 * Handles the click of the Add Event button. Shows the Add popup.
 * @param e The button event.
 */
function handleAddButtonClick( e ) {
	e.preventDefault();
	showAddPopup();
}

/**
 * Handles the click of the Delete Event button. Shows the Delete popup.
 * @param e The button event.
 */
function handleDeleteButtonClick( e ) {
	e.preventDefault();
	showDeletePopup();
}

/**
 * Handles the click of the Settings button. Shows the Settings popup.
 * @param e The button event.
 */
function handleSettingsButtonClick( e ) {
	e.preventDefault();
	showSettingsPopup();
}

/**
 * Creates the array of buttons shown to the user below the calendar.
 * @param $mosesplan The jQuery object to insert the button group into.
 * @returns {*[]} Returns the button array for further event binding.
 */
function insertButtonArray( $mosesplan ) {
	let buttons = [];

	let $buttonGroup = $mosesplan.find( '.mosesplan__home-buttons' );

	let strings = [
		window.mp_strings.addButtonTitle,
		window.mp_strings.deleteButtonTitle,
		window.mp_strings.settingsTitle
	];

	for ( const text of strings ) {
		let $button = $( document.createElement( 'button' ) );

		$button.addClass( 'btn btn-default' );
		$button.text( text );
		$button.appendTo( $buttonGroup );

		buttons.push( $button );
	}

	return buttons;
}

function buildExtension( mosesplan_html ) {
	// remove previous instance, in case plugin is reloaded
	$( '#mosesplan' ).remove();

	// load language and load i18n strings
	let lang          = $( '.language-button .text-primary' ).text();
	window.mp_strings = getLangObject( lang );

	// add mosesplan object
	let $mosesplan = $( mosesplan_html );
	$( '.moses-calendar' ).after( $mosesplan );

	// add style to the object
	fetchGlobalStyle().then( ( text ) => {
		$mosesplan.append( $( `<style>${text}</style>` ) );
	} );

	// add buttons
	let buttons = insertButtonArray( $mosesplan );

	let $addButton    = buttons[0];
	let $deleteButton = buttons[1];
	let $toggleButton = buttons[2];

	// add button event listeners
	$addButton[0].addEventListener( 'click', handleAddButtonClick );
	$deleteButton[0].addEventListener( 'click', handleDeleteButtonClick );
	$toggleButton[0].addEventListener( 'click', handleSettingsButtonClick );

	// render stuff
	loadEvents().then( render );
}

/**
 * Runs the main event loop. Binds all buttons and renders events.
 * @param {boolean} safe If true, skips checks for wrong page, assuming caller did.
 */
function setup( safe = false ) {
	let $calendar = $( '.moses-calendar' );

	if ( !safe ) {
		if ( $calendar.length === 0 ) {
			// wrong page
			return;
		}

		// make sure we stop at single day and custom range... for now
		let $main = $( '#main' );
		if ( $main.find( '#freechoice' ).length > 0
		     || $main.find( '#single-day' ).length > 0 ) {
			return;
		}
	}

	fetchSiteText( 'extension' ).then( buildExtension );
}

/**
 * Main function. Runs on every page. Does preliminary checks and calls extension setup() after checks.
 */
function main() {
	let whitelist = [
		'moses/verzeichnis/persoenliche_uebersicht/stundenplan.html',
		'moses/tutorium/stundenplan.html',
		'moses/verzeichnis/veranstaltungen/veranstaltung.html',
		'moses/verzeichnis/veranstaltungen/lv_vorlage.html'
	];

	// stop if page is wrong
	let path = location.pathname.substring( 1 );
	if ( !whitelist.includes( path ) ) {
		return;
	}

	// stop if page is wrong 2 electric boogaloo
	let $calendar = $( '.moses-calendar' );
	if ( $calendar.length === 0 ) {
		// wrong page
		return;
	}

	// make sure to re-run main if calendar is re-created
	$( 'body' ).on( 'DOMNodeInserted', function ( e ) {
		let $target = $( e.target );
		if ( $target.find( '.moses-calendar' ).length !== 0 ) {
			setTimeout( setup );
		}
	} );

	// add a version number to the footer
	$( '.mosesplan__version-hint' ).remove();
	fetchSiteText( 'version' ).then( html => {
		let $version = $( html );
		$version.find( '#mosesplan-version-number' ).text( VERSION );
		$( $( '#footer > .pull-right' )[0] ).before( $version );
	} );

	// make sure we stop at single day and custom range... for now
	let $main = $( '#main' );
	if ( $main.find( '#freechoice' ).length > 0
	     || $main.find( '#single-day' ).length > 0 ) {
		return;
	}

	// reset things if user wishes to do so
	if ( getGetParameter( 'mosesplan_action' ) === 'reset' ) {
		clearLocalStorage().then( () => {
			alert( 'MosesPlan has been reset to factory settings!' );
			// reload page and remove action parameter
			window.location.replace( removeGetParameter( 'mosesplan_action', window.location.href ) );
		} );
		return;
	}

	setup( true );
}

// and finally, add main as a document.ready() callback.
$( main );
