function closeAllPopups() {
	$('.mosesplan__currently-editing').removeClass('mosesplan__currently-editing');
	let $prevPopup = $( '.mosesplan__popup' );
	if ( $prevPopup.length !== 0 ) {
		$prevPopup.remove();
	}
}

/**
 * Styles a popup according to default Moses stylesheets.
 * This makes the dialogue look native.
 *
 * @param $popup The popup, unstyled, as a jQuery object.
 * @returns {*} A jQuery object containing the styled popup.
 */
function applyPopupStyles( $popup ) {
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

	$popup.find( '.mosesplan__pseudo-button' ).each( function () {
		if ( !$( this ).hasClass( 'btn-emph' ) ) {
			$( this ).addClass( 'btn-default' );
		}
		$( this ).addClass( 'btn' );

	} );

	$popup.find( 'button' ).each( function () {
		if ( !$( this ).hasClass( 'btn-emph' ) ) {
			$( this ).addClass( 'btn-default' );
		}
		$( this ).addClass( 'btn' );
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
function getBarebonesPopupWrapper() {
	let $popup = $( document.createElement( 'div' ) );
	$popup.addClass( 'mosesplan__popup' );
	$popup.append( `<h2 class="mosesplan__popup__title"></h2><hr />` );

	return $popup;
}

function getDefaultColorButtonsObject() {
	let defaults = [
		'#666666',
		'#EF5350',
		'#AB47BC',
		'#5C6BC0',
		'#26C6DA',
		'#66BB6A',
		'#FFCA28',
		'#8D6E63'
	];

	let ret = $( '<div class="form-group btn-group mosesplan__colors" style="display: block"></div>' );

	for ( const color of defaults ) {
		let $button = $( `<a 
			class="mosesplan__pseudo-button mosesplan__color-button"
			data-color="${color}" 
			style="background-color:${color};"
			>&nbsp;&nbsp;&nbsp;</a>` );

		$button.on( 'click', handleColorSelection );

		ret.append( $button );
	}

	return ret;
}

/**
 * Gets the relevant data from the submitted form. If edit dialogue, includes UUID.
 *
 * @param form_event The form event of the submitted form.
 * @returns {
 *      {color: *, name: *, host: *, weekday: number, start: number, location: *, end: number}
 *      | boolean
 *      | {color: *,name: *, host: *, weekday: number, start: number, location: *, end: number, uuid: null}
 * }
 */
function getEventDataFromFormEvent( form_event ) {
	let $form = $( '.mosesplan__popup-form' );

	if ( !$form[0].checkValidity() ) {
		$form[0].reportValidity();
		form_event.preventDefault();
		return false;
	}

	let data = form_event.target.elements;

	form_event.preventDefault();

	let name     = data.name.value;
	let location = data.location.value;
	let host     = data.host.value;
	let color    = data.color.value;
	let weekday  = parseInt( data.weekday.value );
	let start    = parseInt( data.start.value );
	let end      = parseInt( data.end.value );

	let uuid = null;
	try {
		uuid = data.edit_uuid.value;
	} catch ( e ) {
		// ignore
	}

	if ( weekday !== weekday ) {
		// lmao wtf js
		alert( window.mp_strings.error_no_weekday );
		return false;
	}

	if ( start >= end ) {
		alert( window.mp_strings.error_spacetime );
		return false;
	}

	if ( uuid !== null ) {
		return {
			uuid: uuid,
			name: name,
			location: location,
			host: host,
			weekday: weekday,
			start: start,
			end: end,
			color: color
		};
	}

	return {
		name: name,
		location: location,
		host: host,
		weekday: weekday,
		start: start,
		end: end,
		color: color
	};
}

/**
 * Handles a user click on a weekday selection. Until I understand the logic of hidden radios in Moses, this uses a
 * hidden input field that is filled when the user changes the weekday selection.
 * @param e The button press event of a weekday.
 */
function handleWeekdaySelection( e ) {
	e.preventDefault();

	let $weekdays = $( '.mosesplan__weekdays' ).find( 'button' );
	$weekdays.each( function () {
		$( this ).removeClass( 'active' );
	} );

	$( this ).addClass( 'active' );

	$( '#mosesplan-weekday' ).attr( 'value', $( this ).attr( 'value' ) );
}

function handleColorSelection( e ) {
	e.preventDefault();

	$( '.mosesplan__color-button' ).each( function () {
		$( this ).removeClass( 'active' );
	} );

	$( this ).addClass( 'active' );

	$( '#mosesplan-color' ).attr( 'value', $( this ).data( 'color' ) );
}

/**
 * Handles the submission of the Add Event form.
 * @param event The FormEvent from the Add Event form.
 */
function handleAddEvent( event ) {
	let event_data = getEventDataFromFormEvent( event );
	if ( !event_data ) {
		return;
	}

	createEvent( {
		uuid: uuidv4(),
		name: event_data.name,
		location: event_data.location,
		host: event_data.host,
		weekday: event_data.weekday,
		start_hour: event_data.start,
		end_hour: event_data.end,
		color: event_data.color
	} );
}

/**
 * Handles the submission of the Delete Event form.
 * @param event The FormEvent from the Delete Event form.
 */
function handleDeleteEvent( event ) {
	let data = event.target.elements;
	event.preventDefault();

	let uuid = data.delete.value;
	deleteEvent( uuid ).then( showDeletePopup );
}

/**
 * Handles the edit form submit and refreshes the render.
 * @param form_event
 */
function handleEditEvent( form_event ) {
	let event_data = getEventDataFromFormEvent( form_event );
	if ( !event_data ) {
		return;
	}

	loadEvents().then( events => {

		for ( let i = 0; i < events.length; i++ ) {
			let event = events[i];

			if ( event.uuid === event_data.uuid ) {
				events[i] = {
					...event,
					...event_data
				};

				saveEvents( events ).then( loadEvents )
				                    .then( render )
				                    .then( closeAllPopups );
				return;
			}
		}
		for ( let event_element of events ) {

		}

		alert( 'Error -4: Edit failed. Please notify the developer about this. Event UUID: ' + uuid );
	} );
}

/**
 * Shows an Add Event dialogue, removing the old one if needed.
 */
function showAddPopup() {
	closeAllPopups();

	let $popup = getBarebonesPopupWrapper();

	$popup.find( '.mosesplan__popup__title' ).text( window.mp_strings.addEventTitle );

	let $popup_form = `
	<form class="mosesplan__popup-form">
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
		<div class="col-sm-6 mosesplan__weekday-element">
        <div class="form-group">
            <label>${window.mp_strings.weekday}</label>
            <div class="form-group btn-group mosesplan__weekdays">
                <button value="0">${window.mp_strings.monday_short}</button
                ><button value="1">${window.mp_strings.tuesday_short}</button
                ><button value="2">${window.mp_strings.wednesday_short}</button
                ><button value="3">${window.mp_strings.thursday_short}</button
                ><button value="4">${window.mp_strings.friday_short}</button>
            </div>
            <input type="hidden" name="weekday" id="mosesplan-weekday" required>
        </div>
        </div>
        <div class="col-sm-6 mosesplan__color__wrapper">
        <div class="form-group mosesplan__color__form">
            <label>${window.mp_strings.color}</label>
            <input type="hidden" name="color" id="mosesplan-color" required>
        </div>
        </div>
        </div>
        <div class="row">
		<div class="col-sm-6 mosesplan__time-element">
			<div class="form-group">
                <label>${window.mp_strings.start_time}</label>
                <select name="start" id="start"></select>
			</div>
		</div>
		<div class="col-sm-6 mosesplan__time-element">
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
	$popup.find( '.mosesplan__popup-form' ).on( 'submit', handleAddEvent );

	// add weekdays
	let $weekdays = $popup.find( '.mosesplan__weekdays' ).find( 'button' );
	$weekdays.on( 'click', handleWeekdaySelection );

	// add colors
	$popup.find( '.mosesplan__color__form' ).append( getDefaultColorButtonsObject() );

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
 * Shows a Delete Event dialogue, removing the old one if needed.
 */
function showDeletePopup() {
	closeAllPopups();

	let $popup = getBarebonesPopupWrapper();
	$popup.find( '.mosesplan__popup__title' ).text( window.mp_strings.deleteEventTitle );

	let $popup_form = `
	<form class="mosesplan__popup-form">
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
	$popup.find( '.mosesplan__popup-form' ).on( 'submit', handleDeleteEvent );

	// apply style and add
	$popup = applyPopupStyles( $popup );
	$( '.mosesplan' ).append( $popup );
}

/**
 * Shows the Settings popup. Uses SettingsEntry objects to handle state.
 * @see SettingsEntry
 */
function showSettingsPopup() {
	closeAllPopups();

	let $popup = getBarebonesPopupWrapper();

	$popup.find( '.mosesplan__popup__title' ).text( window.mp_strings.settingsTitle );

	let settings = [];

	settings.push( new SettingsEntry( {
		displayname: window.mp_strings.showCustomEventsCheckbox,
		type: 'checkbox',
		id: 'mosesplan-show-custom-events-setting',
		input_id: 'mosesplan-show-custom-events-setting-checkbox',
		clickCallback: function () {
			saveValue( StorageKey.RENDER_EVENTS, $( this ).prop( 'checked' ) )
				.then( loadEvents )
				.then( render );
		},
		beforeCallback: function () {
			loadValue( StorageKey.RENDER_EVENTS ).then( value => {
				if ( value ) {
					$( this ).find( '.mosesplan__settings-input' )
					         .prop( 'checked', true );
				}
			} );
		}
	} ) );

	settings.push( new SettingsEntry( {
		displayname: window.mp_strings.showTutorialsCheckbox,
		type: 'checkbox',
		id: 'mosesplan-show-tutorials-setting',
		input_id: 'mosesplan-show-tutorials-setting-checkbox',
		clickCallback: function () {
			let checked = $( this ).prop( 'checked' );

			// disable child checkboxes if not applicable
			$( this ).parent()
			         .find( '.mosesplan__checkbox-deeper-level' )
			         .find( 'input' )
			         .attr( 'disabled', !checked );

			// save the value to local storage
			saveValue( StorageKey.RENDER_TUTORIALS, checked )
				.then( loadEvents )
				.then( render );
		},
		beforeCallback: function () {
			// check checkboix if value is true
			loadValue( StorageKey.RENDER_TUTORIALS ).then( value => {
				if ( value ) {
					$( this ).find( '.mosesplan__settings-input' )
					         .prop( 'checked', true );
				}
			} );

			// render the tutorial list
			getTutorialPageRaw( getCookie( 'JSESSIONID' ) )
				.then( parseTutorialAnswer )
				.then( ( tutorials ) => {

					// load blacklist to pre-fill checkboxes
					getBlacklist().then( blacklist => {

						// create list of tutorials
						let $tutorial_list = $( document.createElement( 'ul' ) );
						$tutorial_list.addClass( 'mosesplan__checkbox-deeper-level' );

						for ( const tutorial of tutorials ) {
							// create checkbox and label
							let $li = $( document.createElement( 'li' ) );
							$li.append(
								$( `<input type="checkbox" data-name="${tutorial.name}" id="${tutorial.uuid}"/>` )
							);
							$li.append( $( `<label for="${tutorial.uuid}">${tutorial.name}</label>` ) );

							// set to checked if tutorial is not in blacklist
							$li.find( 'input' ).prop(
								'checked',
								!( blacklist.includes( tutorial.name ) )
							);

							// append to list
							$tutorial_list.append( $li );
						}

						// add handler for click to either remove or add to blacklist
						$tutorial_list.find( 'input' ).on( 'click', function () {
							let checked = $( this ).prop( 'checked' );
							let name    = $( this ).data( 'name' );
							if ( checked ) {
								removeFromTutorialBlacklist( name );
							} else {
								addToTutorialBlacklist( name );
							}
						} );

						// disable checkboxes if tutorials aren't rendered right now
						loadValue( StorageKey.RENDER_TUTORIALS ).then( value => {
							if ( !value ) {
								$tutorial_list.find( 'input' ).attr( 'disabled', 'yes' );
							}

							// and finally, add list
							$( this ).append( $tutorial_list );
						} );
					} );
				} );
		}
	} ) );

	let $popup_form = $( `
		<form class="mosesplan__popup-form"></form>
	` );

	// add form
	$popup.append( $popup_form );

	// add onclicks
	for ( const setting of settings ) {
		$popup_form.append( getSettingJQueryObject( setting ) );
	}

	// apply style and add
	$popup = applyPopupStyles( $popup );
	$( '.mosesplan' ).append( $popup );
}

/**
 * Shows the Edit dialogue. Uses a modified Add dialogue.
 * @param uuid The UUID of the event to edit.
 */
function showEditPopup( uuid ) {
	closeAllPopups();

	// for this function, we're just modifying an add dialogue and pre-filling it
	showAddPopup();

	$( '.mosesplan__popup__title' ).text( window.mp_strings.editEventTitle );
	let $form  = $( '.mosesplan__popup-form' );
	let $popup = $( '.mosesplan__popup' );
	$popup.addClass( 'mosesplan__popup--edit' );

	loadEvents().then( ( events ) => {
		/**
		 * @type Event
		 */
		let event;
		for ( const event_element of events ) {
			if ( event_element.uuid === uuid ) {
				event = event_element;
				break;
			}
		}

		if ( typeof event === 'undefined' ) {
			alert( 'Error -4: Could not find event. Please notify the developer about this. Event UUID: ' + uuid );
			closeAllPopups();
			return;
		}

		// mark edit event (and remove mark from others)
		$( '.mosesplan__event' ).removeClass( 'mosesplan__currently-editing' );
		$( `#mosesplan-event-${event.uuid}` ).addClass( 'mosesplan__currently-editing' );

		// basic text attributes
		$form.find( '[name=name]' )
		     .val( event.name );
		$form.find( '[name=location]' )
		     .val( event.location );
		$form.find( '[name=host]' )
		     .val( event.host );

		// weekday
		$form.find( `.mosesplan__weekdays button[value=${event.weekday}]` )
		     .addClass( 'active' );
		$form.find( `#mosesplan-weekday` )
		     .val( event.weekday );

		// color
		$form.find( `.mosesplan__colors a[data-color="${event.color}"]` )
		     .addClass( 'active' );
		$form.find( `#mosesplan-color` )
		     .attr( 'value', event.color );

		// start time
		$form.find( `#start option[value=${event.start}]` )
		     .attr( 'selected', 'selected' );
		$form.find( `#end option[value=${event.end}]` )
		     .attr( 'selected', 'selected' );

		// edit submit button
		let $submit = $form.find( 'button[type=submit]' );
		$submit.text( window.mp_strings.saveChanges );

		$form.append( `<input type="hidden" name="edit_uuid" value="${event.uuid}">` );

		$form.off( 'submit' );
		$form.on( 'submit', handleEditEvent );

		$form.find( '.action-buttons' )
		     .append( `<button id="mosesplan-cancel-edit" class="btn">${window.mp_strings.cancel}</button>` );

		$form.find( '#mosesplan-cancel-edit' )
		     .on( 'click', ( e ) => {
			     e.preventDefault();
			     loadEvents().then( render ).then( closeAllPopups );
		     } );
	} );

}
