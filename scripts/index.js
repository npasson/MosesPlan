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
 * Handles the click of the Toggle Events button. Toggles visibility of custom added events.
 * @param e The button event.
 */
function tutorialButton_onClick( e ) {
	e.preventDefault();
	let $this = $( this );

	loadValue( Settings.RENDER_TUTORIALS ).then( value => {
		if ( typeof value[Settings.RENDER_TUTORIALS] === 'undefined' ) {
			let rc = confirm( window.mp_strings.confirm_loading );
			if ( !rc ) {
				return;
			}
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
 * @returns {*[]} Returns the button array for further event binding.
 */
function createButtonArray( $mosesplan ) {
	let buttons = [];

	let $buttonGroup = $( document.createElement( 'div' ) );
	$buttonGroup.addClass( 'btn-group' );
	$buttonGroup.css( 'margin-top', '10px' );

	for ( const text of [
		window.mp_strings.addButtonTitle,
		window.mp_strings.deleteButtonTitle,
		window.mp_strings.toggleButtonTitle,
		window.mp_strings.tutorialButtonTitle ] ) {
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

	let lang          = $( '.language-button .text-primary' ).text();
	window.mp_strings = getLangObject( lang );
	let $mosesplan    = $( document.createElement( 'div' ) );

	$mosesplan.addClass( 'mosesplan' );
	$mosesplan.attr( 'id', 'mosesplan' );
	// let $outer_form = $( '.container-fluid' );
	$calendar.after( $mosesplan );

	let buttons = createButtonArray( $mosesplan );

	let $addButton      = buttons[0];
	let $deleteButton   = buttons[1];
	let $toggleButton   = buttons[2];
	let $tutorialButton = buttons[3];

	$addButton[0].addEventListener( 'click', addButton_onClick );
	$deleteButton[0].addEventListener( 'click', deleteButton_onClick );
	$toggleButton[0].addEventListener( 'click', toggleButton_onClick );
	$tutorialButton[0].addEventListener( 'click', tutorialButton_onClick );

	loadValue( Settings.RENDER_EVENTS ).then( value => {
		if ( value[Settings.RENDER_EVENTS] ) {
			$toggleButton.addClass( 'active' );
		}
	} );

	loadValue( Settings.RENDER_TUTORIALS ).then( value => {
		if ( value[Settings.RENDER_TUTORIALS] ) {
			$tutorialButton.addClass( 'active' );
		}
	} );

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