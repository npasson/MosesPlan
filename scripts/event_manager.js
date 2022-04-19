/**
 * An Event class to serialize event data.
 */
class Event {
	constructor( name, location, host, weekday, start_hour, end_hour ) {
		this.name     = name;
		this.location = location;
		this.host     = host;
		this.weekday  = weekday;
		this.start    = start_hour;
		this.end      = end_hour;
	}
}

/**
 * Loads events from local storage. Defined later based on browser.
 * @type function
 * @returns {{mosesplan_events: Array[Event]}} An array with the 'mosesplan_events' key
 *                                             set (or undefined) to the event list.
 */
let loadEvents;

/**
 * Saves the given events to local storage. Defined later based on browser.
 * @type function
 * @param _events {Array[Event]} The events to save. This overrides, it does not add.
 */
let saveEvents;

if ( typeof browser !== 'undefined' ) {
	// FIREFOX

	loadEvents = function () {
		return browser.storage.local.get( 'mosesplan_events' );
	};

	saveEvents = function ( _events ) {
		return browser.storage.local.set( {
			'mosesplan_events': _events
		} );
	};
} else {
	// CHROMIUM

	loadEvents = function () {
		return new Promise( resolve => {
			chrome.storage.local.get( [ 'mosesplan_events' ], function ( result ) {
				resolve( result );
			} );
		} );
	};

	saveEvents = function ( _events ) {
		return new Promise( resolve => {
			chrome.storage.local.set( {
				'mosesplan_events': _events
			}, resolve );
		} );
	};
}

/**
 * Creates an event based on the Event constructor.
 * Then saves, loads and re-renders the custom events.
 * @param args
 * @see Event
 */
function createEvent( ...args ) {
	let event = new Event( ...args );

	loadEvents().then( events => {
		// this section does a bunch of stuff because
		// sometimes local storage returns an empty object
		// and not, as expected, an object with a key
		// that's just empty. There's probably a better way,
		// but this works and since createEvent() is not
		// called in a time-sensitive context, it can be
		// more expensive than needed.

		if ( !events || ( typeof events === 'object' && Object.getOwnPropertyNames( events ).length === 0 ) ) {
			events = [];
		}

		if ( typeof events === 'object' ) {
			events = events['mosesplan_events'];
		}

		if ( typeof events === 'undefined' ) {
			events = [];
		}

		events.push( event );

		saveEvents( events ).then( loadEvents ).then( render );
	} );
}