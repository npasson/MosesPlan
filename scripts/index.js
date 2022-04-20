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
		$this.toggleClass( 'active' );
		$( '.mosesplan__event' ).each( function () {
			$( this ).remove();
		} );

		render( [] );
	} else {
		$this.toggleClass( 'active' );
		loadEvents().then( render );
	}
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

	for ( const text of [ window.mp_strings.addButtonTitle, window.mp_strings.deleteButtonTitle,
		window.mp_strings.toggleButtonTitle ] ) {
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
function main() {
	let $calendar = $( '.moses-calendar' );
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

	let $addButton    = buttons[0];
	let $deleteButton = buttons[1];
	let $toggleButton = buttons[2];

	$addButton[0].addEventListener( 'click', addButton_onClick );
	$deleteButton[0].addEventListener( 'click', deleteButton_onClick );
	$toggleButton[0].addEventListener( 'click', toggleButton_onClick );
	$toggleButton.addClass( 'active' );

	loadEvents().then( render );
}

// make sure to re-run main if calendar is re-created
$( 'body' ).on( 'DOMNodeInserted', function ( e ) {
	let $target = $( e.target );
	if ( $target.find( '.moses-calendar' ).length !== 0 ) {
		setTimeout( main );
	}
} );

// and finally, add main as a document.ready() callback.
$( main );