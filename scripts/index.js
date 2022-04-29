const VERSION = '0.3';

const Settings = {
	RENDER_EVENTS: 'mosesplan_render-events',
	RENDER_TUTORIALS: 'mosesplan_render-tutorials',
	TUTORIAL_BLACKLIST: 'mosesplan_tutorial-blacklist'
};

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
 * Handles the click of the Add Event button. Shows the Add popup.
 * @param e The button event.
 */
function addButton_onClick( e ) {
	e.preventDefault();
	showAddPopup();
}

/**
 * Handles the click of the Delete Event button. Shows the Delete popup.
 * @param e The button event.
 */
function deleteButton_onClick( e ) {
	e.preventDefault();
	showDeletePopup();
}

/**
 * Handles the click of the Settings button. Shows the Settings popup.
 * @param e The button event.
 */
function settingsButton_onClick( e ) {
	e.preventDefault();
	showSettingsPopup();
}
/**
 * Creates the array of buttons shown to the user below the calendar.
 * @param $mosesplan The jQuery object to insert the button group into.
 * @returns {*[]} Returns the button array for further event binding.
 */
function createButtonArray( $mosesplan ) {
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

	// add a version number to the footer
	$( '#mosesplan-version-hint' ).remove();
	$( $( '#footer > .pull-right' )[0] ).before( $( `
		<div class="mosesplan__version-hint" >
            <small>MosesPlan</small><br><span class="fa fa-space fa-calendar"></span>
            v${VERSION}
        </div>
	` ) );

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
	let buttons = createButtonArray( $mosesplan );

	let $addButton    = buttons[0];
	let $deleteButton = buttons[1];
	let $toggleButton = buttons[2];

	// add button event listeners
	$addButton[0].addEventListener( 'click', addButton_onClick );
	$deleteButton[0].addEventListener( 'click', deleteButton_onClick );
	$toggleButton[0].addEventListener( 'click', settingsButton_onClick );

	// render stuff
	loadEvents().then( render );
}

function main() {
	let whitelist = [
		'moses/verzeichnis/persoenliche_uebersicht/stundenplan.html',
		'moses/tutorium/stundenplan.html',
		'moses/verzeichnis/veranstaltungen/veranstaltung.html'
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

	// make sure we stop at single day and custom range... for now
	let $main = $( '#main' );
	if ( $main.find( '#freechoice' ).length > 0
	     || $main.find( '#single-day' ).length > 0 ) {
		return;
	}

	setup( true );
}

// and finally, add main as a document.ready() callback.
$( main );
