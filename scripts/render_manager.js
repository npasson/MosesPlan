/**
 * Creates an event <div> suitable for inserting into the table.
 * @param event The event data to insert into the div.
 * @returns {*} A HTMLElement (_not_ jQuery) of the block.
 */
function getBlock( event ) {
	let top_offset = ( event.start - 8 ) * 40;
	let height     = ( event.end - event.start ) * 40;

	let $event = $( `
		<div class="moses-calendar-event-wrapper mosesplan__event" 
		     style="width: 100%; height: ${height}px; top: ${top_offset}px; left: 0.000000%;">
			<div class="moses-calendar-event ellipsis purple szenario-unveroeffentlicht">
				<a class="ellipsis" href="#">${event.name}</a>
				<br><small class="ellipsis">${event.location}</small>
				<br><small class="ellipsis">${event.host}</small>
				<br>

                </span>
            </div>
        </div>
	` );

	$event.find( '.moses-calendar-event' ).css( {
		'color': '#111111',
		'border-color': '#656565',
		'background-color': 'rgba(150, 150, 150, 0.4)'
	} );

	return $event[0];
}

/**
 * Renders the given list of events to the table.
 * Does a visual refresh, removing all previously rendered custom events first.
 * @param events {Array[Event]} The list of events to render.
 */
function render( events ) {
	// console.log( 'Rendering.' );

	if ( !events || ( typeof events === 'object' && Object.getOwnPropertyNames( events ).length === 0 ) ) {
		return;
	}

	if ( typeof events === 'object' ) {
		events = events['mosesplan_events'];
	}

	$( '.mosesplan__event' ).remove();

	let $days_wrapper = $( '.moses-calendar-days' );

	let days = [];

	$days_wrapper.children().each( function () {
		days.push( $( $( this ).find( '.moses-calendar-day-body-inner' )[0] ) );
	} );

	for ( const event of events ) {
		let weekday = event.weekday;

		let $event = getBlock( event );
		days[weekday].append( $event );
	}
}

