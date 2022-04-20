// most of the code in this file is taken from:
// https://stackoverflow.com/a/28231581
// licensed under CC-BY-SA 3.0 as indicated here:
// https://stackoverflow.com/help/licensing

function cleanEvents( days ) {
	for ( const day of days ) {
		let block_width     = $( day ).width();
		let columns         = [];
		let lastEventEnding = null;

		// Create an array of all events
		let events = $( '.moses-calendar-event-wrapper', $( day ) ).map( function ( index, o ) {
			o         = $( o );
			const top = o.offset().top;
			return {
				'obj': o, 'top': top, 'bottom': top + o.height()
			};
		} ).get();

		// Sort it by starting time, and then by ending time.
		events = events.sort( function ( e1, e2 ) {
			if ( e1.top < e2.top ) {
				return -1;
			}
			if ( e1.top > e2.top ) {
				return 1;
			}
			if ( e1.bottom < e2.bottom ) {
				return -1;
			}
			if ( e1.bottom > e2.bottom ) {
				return 1;
			}
			return 0;
		} );

		// Iterate over the sorted array
		$( events ).each( function ( index, e ) {

			// Check if a new event group needs to be started
			if ( lastEventEnding !== null && e.top >= lastEventEnding ) {
				// The latest event is later than any of the event in the
				// current group. There is no overlap. Output the current
				// event group and start a new event group.
				PackEvents( columns, block_width );
				columns         = [];  // This starts new event group.
				lastEventEnding = null;
			}

			// Try to place the event inside the existing columns
			let placed = false;
			for ( let i = 0; i < columns.length; i++ ) {
				let col = columns[i];
				if ( !collidesWith( col[col.length - 1], e ) ) {
					col.push( e );
					placed = true;
					break;
				}
			}

			// It was not possible to place the event. Add a new column
			// for the current event group.
			if ( !placed ) {
				columns.push( [ e ] );
			}

			// Remember the latest event end time of the current group.
			// This is later used to determine if a new groups starts.
			if ( lastEventEnding === null || e.bottom > lastEventEnding ) {
				lastEventEnding = e.bottom;
			}
		} );

		if ( columns.length > 0 ) {
			PackEvents( columns, block_width );
		}
	}
}

// Function does the layout for a group of events.
function PackEvents( columns ) {
	let n = columns.length;
	for ( let i = 0; i < n; i++ ) {
		let col = columns[i];
		for ( let j = 0; j < col.length; j++ ) {
			let bubble  = col[j];
			let colSpan = ExpandEvent( bubble, i, columns );

			bubble.obj.css( 'left', ( i / n ) * 100 + '%' );
			bubble.obj.css( 'width', ( 100 * colSpan / n ) + '%' );
		}
	}
}

// Check if two events collide.
function collidesWith( a, b ) {
	return a.bottom > b.top && a.top < b.bottom;
}

// Expand events at the far right to use up any remaining space.
// Checks how many columns the event can expand into, without
// colliding with other events. Step 5 in the algorithm.
function ExpandEvent( ev, iColumn, columns ) {
	let colSpan = 1;

	// To see the output without event expansion, uncomment
	// the line below. Watch column 3 in the output.
	//return colSpan;

	for ( let i = iColumn + 1; i < columns.length; i++ ) {
		let col = columns[i];
		for ( let j = 0; j < col.length; j++ ) {
			let ev1 = col[j];
			if ( collidesWith( ev, ev1 ) ) {
				return colSpan;
			}
		}
		colSpan++;
	}
	return colSpan;
}