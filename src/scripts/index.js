/**
 * The extension version.
 * @type {string}
 */
const VERSION = '0.5.3';

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

	let $buttonGroup = $( document.createElement( 'div' ) );
	$buttonGroup.addClass( 'btn-group mosesplan__home-buttons' );

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

	$mosesplan.append( $buttonGroup );

	return buttons;
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

	// we're safe here

	// remove previous instance, in case plugin is reloaded
	let $prevOptions = $( '#mosesplan' );
	if ( $prevOptions.length !== 0 ) {
		$prevOptions.remove();
	}

	// load language and load i18n strings
	let lang          = $( '.language-button .text-primary' ).text();
	window.mp_strings = getLangObject( lang );

	// add mosesplan object
	let $mosesplan = $( document.createElement( 'div' ) );
	$mosesplan.addClass( 'mosesplan' );
	$mosesplan.attr( 'id', 'mosesplan' );
	$calendar.after( $mosesplan );

	// add style to the object
	getGlobalStyles().then( ( response ) => {
		response.text().then( text => {
			$mosesplan.append( $( `
				<style>${text}</style>
			` ) );
		} );
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
	// this CSS has to be inline to be included even if the full thing isn't loaded
	$( '.mosesplan__version-hint' ).remove();
	$( $( '#footer > .pull-right' )[0] ).before( $( `
		<div class="mosesplan__version-hint" >
			<style>.mosesplan__version-hint {
			  display: inline-block;
			  padding: 0 20px;
			  float: left;
			  line-height: 20px;
			  color: #888888;
			}</style>
            <small>MosesPlan</small><br><span class="fa fa-space fa-calendar"></span>
            v${VERSION}
        </div>
	` ) );

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
