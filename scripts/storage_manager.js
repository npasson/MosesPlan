/**
 * Generates a UUIDv4 using the Crypto API. (No, this will not mine Bitcoin to generate a UUID.)
 * @return {string} A UUIDv4
 */
function uuidv4() {
	return ( [ 1e7 ] + -1e3 + -4e3 + -8e3 + -1e11 ).replace( /[018]/g, c =>
		( c ^ crypto.getRandomValues( new Uint8Array( 1 ) )[0] & 15 >> c / 4 ).toString( 16 )
	);
}

/**
 * An Event class to serialize event data.
 */
class Event {
	constructor( uuid, name, location, host, weekday, start_hour, end_hour ) {
		this.uuid     = uuid;
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
		return new Promise( resolve => {
			browser.storage.local.get( key ).then( ( data ) => {
				resolve( data[key] );
			} );
		} );
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
				resolve( result[key] );
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
	// this has backwards compatibility in case some events don't have a UUID yet
	return new Promise( resolve => {
		loadValue( 'mosesplan_events' ).then( events => {
			if ( typeof events === 'undefined' ) {
				resolve( events );
				return;
			}

			for ( const event of events ) {
				if ( !( 'uuid' in event ) ) {
					event['uuid'] = uuidv4();
				}
			}

			resolve( events );
		} );
	} );
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
		if ( typeof events === 'undefined' ) {
			events = [];
		}

		events.push( event );

		saveEvents( events ).then( loadEvents ).then( render ).catch( e => console.log( e ) );
	} );
}