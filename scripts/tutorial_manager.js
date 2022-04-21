function getTutorialPageRaw( cookie ) {
	return $.ajax( {
		url: 'https://moseskonto.tu-berlin.de/moses/tutorium/stundenplan.html',
		headers: { 'JSESSIONID': cookie }
	} );
}

function parseTutorialAnswer( data ) {
	let $answer   = $( data );
	let $calendar = $answer.find( '.moses-calendar-days' );

	let events = [];
	let i      = 0;

	$calendar.find( '.moses-calendar-day' ).each( function () {
		let $day = $( this );

		$day.find( '.moses-calendar-event-wrapper' ).each( function () {
			let $event = $( this );

			let height = Math.round( parseFloat( $event.css( 'height' ) ) );
			let top    = Math.round( parseFloat( $event.css( 'top' ) ) );

			let start = ( top / RENDER_PIXELS_PER_HOUR ) + RENDER_HOUR_OFFSET;
			let end   = ( ( top + height ) / RENDER_PIXELS_PER_HOUR ) + RENDER_HOUR_OFFSET;

			// now to find out the data

			let location;
			$event.find( '.content' ).find( '.form-group' ).each( function () {
				let $label = $( this ).find( 'label' );
				if ( $label.text() === 'Raum' || $label.text() === 'Room' ) {
					$label.remove();
					location = $( this ).text().trim();
				}
			} );

			$( $event.find( '.content' ).remove() );
			$( $event.find( '.title' ).remove() );
			$( $event.find( 'script' ).remove() );
			let name = $event.text().trim();

			let host = 'TU Berlin';

			let event = new Event( name, location, host, i, start, end );
			events.push( event );
		} );

		// has to be last
		++i;
	} );

	return new Promise( ( resolve => {
		resolve( events );
	} ) );
}