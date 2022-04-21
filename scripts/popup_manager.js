/**
 * Styles a popup according to default Moses stylesheets.
 * This makes the dialogue look native.
 *
 * @param $popup The popup, unstyled, as a jQuery object.
 * @returns {*} A jQuery object containing the styled popup.
 */
function applyPopupStyles( $popup ) {
	$popup.css( {
		'border-radius': '4px',
		'border': '1px solid #dddddd',
		'background-color': '#ffffff',
		'max-width': '800px',
		'margin-top': '10px',
		'padding': '14px 12px'
	} );

	$popup.find( '.mosesplan_input_class_placeholder' ).each( function () {
		$( this ).find( 'span' ).each( function () {
			$( this ).addClass( 'ui-autocomplete form-control ui-inputwrapper-filled' );
			$( this ).find( 'input' ).each( function () {
				$( this ).addClass(
					'ui-autocomplete-input ui-inputfield ui-widget ui-state-default ui-corner-all ui-state-filled' );
				$( this ).attr( 'aria-disabled', 'false' );
				$( this ).attr( 'aria-readonly', 'false' );
				$( this ).attr( 'aria-autocomplete', 'list' );
				$( this ).attr( 'autocomplete', 'off' );
			} );
		} );

		$( this ).removeClass( 'mosesplan_input_class_placeholder' );
	} );

	$popup.find( 'button' ).each( function () {
		if ( !$( this ).hasClass( 'btn-emph' ) ) {
			$( this ).addClass( 'btn-default' );
		}
		$( this ).addClass( 'btn' );
		$( this ).css( 'outline', 'none' );
	} );

	$popup.find( 'select' ).addClass( 'form-control' );

	return $popup;
}

/**
 * Creates a popup that can be used for any purpose. Used to avoid code duplication.
 *
 * @returns {*} A jQuery object containing an empty popup.
 * @private
 */
function _createBarebonesPopupWrapper() {
	let $popup = $( document.createElement( 'div' ) );
	$popup.addClass( 'mosesplan_popup' );

	$popup.append( `<h2 style="margin-top: 0" class="mosesplan_popup__title"></h2><hr />` );

	return $popup;
}

/**
 * Handles the submission of the Add Event form.
 * @param event The FormEvent from the Add Event form.
 */
function handleAddEvent( event ) {
	let $form = $( '.mosesplan_popup__form' );

	if ( !$form[0].checkValidity() ) {
		$form[0].reportValidity();
		event.preventDefault();
		return;
	}

	let data = event.target.elements;

	event.preventDefault();

	let name     = data.name.value;
	let location = data.location.value;
	let host     = data.host.value;
	let weekday  = parseInt( data.weekday.value );
	let start    = parseInt( data.start.value );
	let end      = parseInt( data.end.value );

	if ( weekday !== weekday ) {
		// lmao wtf js
		alert( window.mp_strings.error_no_weekday );
		return;
	}

	if ( start >= end ) {
		alert( window.mp_strings.error_spacetime );
		return;
	}

	createEvent( {
		uuid: uuidv4(),
		name: name,
		location: location,
		host: host,
		weekday: weekday,
		start_hour: start,
		end_hour: end
	} );
}

/**
 * Handles a user click on a weekday selection. Until I understand the logic of hidden radios in Moses, this uses a
 * hidden input field that is filled when the user changes the weekday selection.
 * @param e The button press event of a weekday.
 */
function handleWeekdaySelection( e ) {
	e.preventDefault();

	let $weekdays = $( '.weekdays' ).find( 'button' );
	$weekdays.each( function () {
		$( this ).removeClass( 'active' );
	} );

	$( this ).addClass( 'active' );

	$( '#weekday' ).attr( 'value', $( this ).attr( 'value' ) );
}

/**
 * Shows an Add Event dialogue, removing the old one if needed.
 */
function showAddPopup() {
	let $prevPopup = $( '.mosesplan_popup' );
	if ( $prevPopup.length !== 0 ) {
		$prevPopup.remove();
	}

	let $popup = _createBarebonesPopupWrapper();

	$popup.find( '.mosesplan_popup__title' ).text( window.mp_strings.addEventTitle );

	let $popup_form = `
	<form class="mosesplan_popup__form">
		<div class="form-group mosesplan_input_class_placeholder">
            <label>${window.mp_strings.event_name}</label>
            <span><input type="text" name="name" placeholder="${window.mp_strings.event_name_placeholder}" required/></span>
		</div>
		
		<div class="form-group mosesplan_input_class_placeholder">
            <label>${window.mp_strings.event_location}</label>
            <span><input type="text" name="location" placeholder="${window.mp_strings.event_location_placeholder}" required/></span>
		</div>
		
		<div class="form-group mosesplan_input_class_placeholder">
            <label>${window.mp_strings.event_host}</label>
            <span><input type="text" name="host" placeholder="${window.mp_strings.event_host_placeholder}" required/></span>
		</div>
		
		<div class="row">
		<div class="col-sm-4 mosesplan__weekday-element">
        <div class="form-group">
            <label>${window.mp_strings.weekday}</label>
            <div class="form-group btn-group weekdays" style="display: block">
                <button value="0">${window.mp_strings.monday_short}</button
                ><button value="1">${window.mp_strings.tuesday_short}</button
                ><button value="2">${window.mp_strings.wednesday_short}</button
                ><button value="3">${window.mp_strings.thursday_short}</button
                ><button value="4">${window.mp_strings.friday_short}</button>
            </div>
            <input type="hidden" name="weekday" id="weekday" required>
        </div>
        </div>
		<div class="col-sm-4 mosesplan__time-element">
			<div class="form-group">
                <label>${window.mp_strings.start_time}</label>
                <select name="start" id="start"></select>
			</div>
		</div>
		<div class="col-sm-4 mosesplan__time-element">
			<div class="form-group">
                <label>${window.mp_strings.end_time}</label>
                <select name="end" id="end"></select>
			</div>
		</div>
		</div>

		<div class="btn-group action-buttons">
		</div>
	</form>
	<style>
	@media (min-width: 768px) and (max-width: 1000px) { 
		.mosesplan__weekday-element {
			width: 100%;
		}
		.mosesplan__time-element {
			width: 50%;
		}
	}
	</style>
	`;

	// add form
	$popup.append( $popup_form );

	// add submit button
	let $submit = $( document.createElement( 'button' ) );
	$submit.text( window.mp_strings.addEventSubmitButton );
	$submit.addClass( 'btn-emph' );
	$submit.attr( 'type', 'submit' );
	$popup.find( '.action-buttons' ).append( $submit );
	$popup.find( '.mosesplan_popup__form' ).on( 'submit', handleAddEvent );

	// add weekdays
	let $weekdays = $popup.find( '.weekdays' ).find( 'button' );
	$weekdays.on( 'click', handleWeekdaySelection );

	// add time selectors
	for ( let i = 8; i <= 18; ++i ) {
		if ( i !== 18 ) {
			$popup.find( '#start' ).append( new Option( `${i}:00`, `${i}` ) );
		}

		if ( i !== 8 ) {
			$popup.find( '#end' ).append( new Option( `${i}:00`, `${i}` ) );
		}
	}

	// apply style and add
	$popup = applyPopupStyles( $popup );
	$( '.mosesplan' ).append( $popup );
}

/**
 * Handles the submission of the Delete Event form.
 * @param event The FormEvent from the Delete Event form.
 */
function handleDeleteEvent( event ) {
	let data = event.target.elements;

	event.preventDefault();

	let uuid = data.delete.value;

	loadEvents().then(
		events => {
			for ( let i = 0; i < events.length; i++ ) {
				if ( events[i].uuid === uuid ) {
					events.splice( i, 1 );
					break;
				}
			}

			saveEvents( events ).then( loadEvents ).then( render ).then( showDeletePopup );
		}
	);
}

/**
 * Shows a Delete Event dialogue, removing the old one if needed.
 */
function showDeletePopup() {
	let $prevPopup = $( '.mosesplan_popup' );
	if ( $prevPopup.length !== 0 ) {
		$prevPopup.remove();
	}

	let $popup = _createBarebonesPopupWrapper();

	$popup.find( '.mosesplan_popup__title' ).text( window.mp_strings.deleteEventTitle );

	let $popup_form = `
	<form class="mosesplan_popup__form">
		<div class="form-group">
            <label>${window.mp_strings.delete_dropdown}</label>
            <select name="delete" id="delete"></select>
		</div>

		<div class="btn-group action-buttons">
		</div>
	</form>
	`;

	// add form
	$popup.append( $popup_form );

	loadEvents().then( events => {
		if ( !events || events.length === 0 ) {
			$popup = applyPopupStyles( $popup );
			$( '.mosesplan' ).append( $popup );
			return;
		}

		let $dropdown = $popup.find( '#delete' );

		events.sort( ( lhs, rhs ) => {
			// return < 0 if lhs < rhs
			// return = 0 if lhs = rhs
			// return > 0 if lhs > rhs

			if ( lhs.weekday < rhs.weekday ) {
				return -1;
			}

			if ( lhs.weekday > rhs.weekday ) {
				return 1;
			}

			if ( lhs.start < rhs.start ) {
				return -1;
			}

			if ( lhs.start > rhs.start ) {
				return 1;
			}

			if ( lhs.end < rhs.end ) {
				return -1;
			}

			if ( lhs.end > rhs.end ) {
				return 1;
			}

			return 0;
		} );

		for ( const event of events ) {
			let weekday = getWeekdayString( event.weekday );

			$dropdown.append( new Option( `[${weekday} ${event.start}-${event.end}] ${event.name}`, `${event.uuid}` ) );
		}
	} );

	// add submit button
	let $submit = $( document.createElement( 'button' ) );
	$submit.text( window.mp_strings.deleteEventSubmitButton );
	$submit.addClass( 'btn-emph' );
	$submit.attr( 'type', 'submit' );
	$popup.find( '.action-buttons' ).append( $submit );
	$popup.find( '.mosesplan_popup__form' ).on( 'submit', handleDeleteEvent );

	// apply style and add
	$popup = applyPopupStyles( $popup );
	$( '.mosesplan' ).append( $popup );
}