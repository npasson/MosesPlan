const RENDER_PIXELS_PER_HOUR = 40;
const RENDER_HOUR_OFFSET     = 8;

/**
 * Gets the name of a weekday.
 *
 * @param index The index of the weekday, from 0 to 4.
 * @param long Whether to return the long version of the name.
 * @return {string} The weekday name.
 */
function getWeekdayString( index, long = false ) {
	let weekday = 'WRONG_WEEKDAY_INDEX_' + index;
	switch ( index ) {
		case 0:
			weekday = long ? window.mp_strings.monday : window.mp_strings.monday_short;
			break;
		case 1:
			weekday = long ? window.mp_strings.tuesday : window.mp_strings.tuesday_short;
			break;
		case 2:
			weekday = long ? window.mp_strings.wednesday : window.mp_strings.wednesday_short;
			break;
		case 3:
			weekday = long ? window.mp_strings.thursday : window.mp_strings.thursday_short;
			break;
		case 4:
			weekday = long ? window.mp_strings.friday : window.mp_strings.friday_short;
			break;
	}

	return weekday;
}

/**
 * Creates an event <div> suitable for inserting into the table.
 * @param event The event data to insert into the div.
 * @param type The type. 'custom' or 'tutorial'
 * @returns {*} A HTMLElement (_not_ jQuery) of the block.
 */
function getBlock( event, type = 'custom' ) {
	let top_offset = ( event.start - RENDER_HOUR_OFFSET ) * RENDER_PIXELS_PER_HOUR;
	let height     = ( event.end - event.start ) * RENDER_PIXELS_PER_HOUR;

	let $event = $( `
		<div class="moses-calendar-event-wrapper mosesplan__event mosesplan__event--${type}" 
		     style="width: 100%; height: ${height}px; top: ${top_offset}px; left: 0.000000%;">
			<div class="moses-calendar-event ellipsis">
				<span class="ellipsis">${event.name}</span>
				<br><small class="ellipsis">${event.location}</small>
				<br><small class="ellipsis">${event.host}</small>
            </div>
        </div>
	` );

	switch ( type ) {
		case 'tutorial':
			break;
		case 'custom':
		default:
			$event.find( '.moses-calendar-event' ).css( {
				'color': '#111111',
				'border-color': '#656565',
				'background-color': 'rgba(150, 150, 150, 0.4)'
			} );
			break;
	}

	return $event[0];
}

/**
 * Shows the info popover for events.
 *
 * @param e The MouseOverEvent.
 * @param event {Event} The event object to show.
 * @param type {string} The type of event, for the popover.
 */
function handleEventMouseover( e, event, type = 'Custom' ) {
	let $target  = $( e.currentTarget );
	let $popover = $( getPopover( event, type ) );
	let $body    = $( document.body );

	$body.append( $popover );
	$popover.css( 'display', 'block' );

	let target_offset = $target.offset();
	let popover_top   = target_offset.top - $popover.height();
	let popover_left  = target_offset.left + ( $target.width() / 2 ) - ( $popover.width() / 2 );

	$popover.css( 'top', popover_top );
	$popover.css( 'left', popover_left );
}

/**
 * Deletes the popover on mouse out.
 */
function handleEventMouseout() {
	$( '.mosesplan__popover ' ).remove();
}

/**
 * Renders the tutorials (given in the event prarameter)
 *
 * @param {Array[Event]} events The events to render.
 */
function renderTutorials( events ) {
	let $days_wrapper = $( '.moses-calendar-days' );
	let days          = [];
	$days_wrapper.children().each( function () {
		days.push( $( $( this ).find( '.moses-calendar-day-body-inner' )[0] ) );
	} );

	for ( const event of events ) {
		let weekday = event.weekday;

		let $event = $( getBlock( event, 'tutorial' ) );

		$event.find( '.moses-calendar-event' )
		      .on( 'mouseover', ( e ) =>
			      handleEventMouseover( e, event, window.mp_strings.tutorial ) );

		$event.find( '.moses-calendar-event' )
		      .on( 'mouseout',
			      handleEventMouseout );

		days[weekday].append( $event );
	}

	cleanEvents( days );
}

/**
 * Renders the given list of events to the table.
 * Does a visual refresh, removing all previously rendered custom events first.
 * @param events {Array[Event]} The list of events to render.
 */
function render( events ) {
	$( '.mosesplan__event' ).remove();

	let $days_wrapper = $( '.moses-calendar-days' );
	let days          = [];
	$days_wrapper.children().each( function () {
		days.push( $( $( this ).find( '.moses-calendar-day-body-inner' )[0] ) );
	} );

	loadValue( Settings.RENDER_EVENTS ).then( value => {
		value = value[Settings.RENDER_EVENTS];
		if ( value
		     && events
		     && ( ( typeof events === 'object' && Object.getOwnPropertyNames( events ).length !== 0 )
		          || ( events instanceof Array && events.length !== 0 ) )
		) {
			// render custom events if everything is okay

			if ( typeof events === 'object' ) {
				events = events['mosesplan_events'];
			}

			for ( const event of events ) {
				let weekday = event.weekday;

				let $event = $( getBlock( event ) );

				$event.find( '.moses-calendar-event' ).on( 'mouseover', ( e ) => handleEventMouseover( e, event ) );
				$event.find( '.moses-calendar-event' ).on( 'mouseout', handleEventMouseout );

				days[weekday].append( $event );
			}
		}

		// whether or not we rendered the events, we clean the calendar once
		cleanEvents( days );

		loadValue( Settings.RENDER_TUTORIALS ).then( value => {
			value = value[Settings.RENDER_TUTORIALS];
			if ( !value ) {
				return;
			}

			let tutorial_page = 'moses/tutorium/stundenplan.html';
			if ( location.pathname.substring( 1 ) === tutorial_page ) {
				// don't load tutorials on their page
				return;
			}

			// this is the only time the session cookie is read, and it's only passed
			// to getTutorialPageRaw() to get the tutorial page (to show tutorials).
			// Usage of the session cookie can be prevented by not using the Tutorials option.
			getTutorialPageRaw( getCookie( 'JSESSIONID' ) )
				.then( parseTutorialAnswer )
				.then( renderTutorials );
		} ).catch( ( e ) => console.log( e ) );
	} );
}

