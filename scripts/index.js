const VERSION = '0.3';

const Settings = {
	RENDER_EVENTS: 'mosesplan_render-events',
	RENDER_TUTORIALS: 'mosesplan_render-tutorials'
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
 * Handles the click of the Toggle Events button. Toggles visibility of custom added events.
 * @param e The button event.
 */
function toggleButton_onClick( e ) {
	e.preventDefault();
	let $this = $( this );

	if ( $this.hasClass( 'active' ) ) {
		$this.removeClass( 'active' );
		$( '.mosesplan__event' ).each( function () {
			$( this ).remove();
		} );

		saveValue( Settings.RENDER_EVENTS, false )
			.then( loadEvents )
			.then( render ).catch( ( e ) => console.log( e ) );
	} else {
		$this.addClass( 'active' );
		saveValue( Settings.RENDER_EVENTS, true )
			.then( loadEvents )
			.then( render ).catch( ( e ) => console.log( e ) );
	}
}

/**
 * Handles the click of the Toggle Tutorials button. Toggles loading of tutorials.
 * Shows warning on first click to make sure user is okay with XHR.
 *
 * @param e The button event.
 */
function tutorialButton_onClick( e ) {
	e.preventDefault();
	let $this = $( this );

	loadValue( Settings.RENDER_TUTORIALS ).then( value => {
		if ( typeof value[Settings.RENDER_TUTORIALS] === 'undefined' ) {
			$( '.mosesplan__render-events-hint' ).remove();
		}

		if ( $this.hasClass( 'active' ) ) {
			$this.removeClass( 'active' );
			$( '.mosesplan__event--tutorial' ).each( function () {
				$( this ).remove();
			} );

			saveValue( Settings.RENDER_TUTORIALS, false )
				.then( loadEvents )
				.then( render ).catch( ( e ) => console.log( e ) );
		} else {
			$this.addClass( 'active' );
			saveValue( Settings.RENDER_TUTORIALS, true )
				.then( loadEvents )
				.then( render ).catch( ( e ) => console.log( e ) );
		}
	} );

}

/**
 * Creates the array of buttons shown to the user below the calendar.
 * @param $mosesplan The jQuery object to insert the button group into.
 * @param {boolean} is_tutorial_page Whether the current page is the tutorial page.
 * @returns {*[]} Returns the button array for further event binding.
 */
function createButtonArray( $mosesplan, is_tutorial_page ) {
	let buttons = [];

	let $buttonGroup = $( document.createElement( 'div' ) );
	$buttonGroup.addClass( 'btn-group' );
	$buttonGroup.css( 'margin-top', '10px' );

	let strings = is_tutorial_page ? [
		window.mp_strings.addButtonTitle,
		window.mp_strings.deleteButtonTitle,
		window.mp_strings.toggleButtonTitle
	] : [
		window.mp_strings.addButtonTitle,
		window.mp_strings.deleteButtonTitle,
		window.mp_strings.toggleButtonTitle,
		window.mp_strings.tutorialButtonTitle
	];

	for ( const text of strings ) {
		let $button = $( document.createElement( 'button' ) );

		$button.addClass( 'btn btn-default' );
		$button.text( text );
		$button.appendTo( $buttonGroup );
		$button.css( 'outline', 'none' );

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
		<div id="mosesplan-version-hint" 
		     style="display: inline-block; padding: 0 20px; float:left; line-height:20px; color:#888;">
            <small>MosesPlan</small><br><span class="fa fa-space fa-calendar"></span>
            v${VERSION}
        </div>
	` ) );

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

	let tutorial_page    = 'moses/tutorium/stundenplan.html';
	let is_tutorial_page = location.pathname.substring( 1 ) === tutorial_page;

	// FIXME: HOTFIX FOR TUTORIALS NOW SHOWING
	is_tutorial_page = true;

	// add buttons
	let buttons = createButtonArray( $mosesplan, is_tutorial_page );

	let $addButton    = buttons[0];
	let $deleteButton = buttons[1];
	let $toggleButton = buttons[2];

	// add button event listeners
	$addButton[0].addEventListener( 'click', addButton_onClick );
	$deleteButton[0].addEventListener( 'click', deleteButton_onClick );
	$toggleButton[0].addEventListener( 'click', toggleButton_onClick );

	// if RENDER_EVENTS is set, show button as pressed
	loadValue( Settings.RENDER_EVENTS ).then( value => {
		if ( value[Settings.RENDER_EVENTS] ) {
			$toggleButton.addClass( 'active' );
		}
	} );

	// only render tutorials outside of tutorial page
	if ( !is_tutorial_page ) {

		let $tutorialButton = buttons[3];
		$tutorialButton[0].addEventListener( 'click', tutorialButton_onClick );

		// if RENDER_TUTORIALS is set, show button as pressed
		// if RENDER_TUTORIALS is undefined, show short privacy hint
		loadValue( Settings.RENDER_TUTORIALS ).then( value => {
			if ( typeof value[Settings.RENDER_TUTORIALS] === 'undefined' ) {
				$mosesplan.append( `
				<div class="mosesplan__render-events-hint"
				     style="opacity: 70%; font-size: 0.8em; margin-top: 5px; margin-bottom: 5px">
					${window.mp_strings.confirm_loading}
				</div>
			` );
				return;
			}

			if ( value[Settings.RENDER_TUTORIALS] ) {
				$tutorialButton.addClass( 'active' );
			}
		} );
	}

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
