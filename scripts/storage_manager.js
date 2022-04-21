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
 * Loads a value from local storage.
 * Defined differently on Chrome and Firefox.
 *
 * @type function
 * @param {string} key The key to retrieve.
 * @returns Promise
 */
let loadValue;

/**
 * Saves a value to local storage.
 * Defined differently on Chrome and Firefox.
 *
 * @type function
 * @param {string} key The key to save.
 * @param {*} value The value to save.
 * @returns Promise
 */
let saveValue;

if ( typeof browser !== 'undefined' ) {
	// FIREFOX

	loadValue = function ( key ) {
		return browser.storage.local.get( key );
	};

	saveValue = function ( key, value ) {
		return browser.storage.local.set( {
			[key]: value
		} );
	};
} else {
	// CHROMIUM

	loadValue = function ( key ) {
		return new Promise( resolve => {
			chrome.storage.local.get( [ key ], function ( result ) {
				resolve( result );
			} );
		} );
	};

	saveValue = function ( key, value ) {
		return new Promise( resolve => {
			chrome.storage.local.set( {
				[key]: value
			}, resolve );
		} );
	};
}

/**
 * Loads events from local storage. Defined later based on browser.
 * @type function
 * @returns {Promise[{mosesplan_events: Array[Event]}]} An array with the 'mosesplan_events' key
 *                                             set (or undefined) to the event list.
 */
function loadEvents() {
	return loadValue( 'mosesplan_events' );
}

/**
 * Saves the given events to local storage. Defined later based on browser.
 * @type function
 * @param events {Array[Event]} The events to save. This overrides, it does not add.
 * @returns {Promise}
 */
function saveEvents( events ) {
	return saveValue( 'mosesplan_events', events );
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