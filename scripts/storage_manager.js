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
	/**
	 * @param data Event data.
	 * @param {string|null} data.uuid The event UUID. See uuidv4().
	 * @param {string} data.name The event name.
	 * @param {string} data.location The event location.
	 * @param {string} data.host The event host.
	 * @param {number} data.weekday The event weekday index (0 to 4).
	 * @param {number} data.start_hour The event start hour.
	 * @param {number} data.end_hour The event end hour.
	 * @param {string?} data.color The event color, as a hex code.
	 */
	constructor( data ) {
		this.uuid     = data.uuid;
		this.name     = data.name;
		this.location = data.location;
		this.host     = data.host;
		this.weekday  = data.weekday;
		this.start    = data.start_hour;
		this.end      = data.end_hour;
		this.color    = data.color;
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

/**
 * Deletes the entire local storage for the extension.
 * Defined differently on Chrome and Firefox.
 *
 * @type function
 * @returns Promise
 */
let clearLocalStorage;

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

	clearLocalStorage = function () {
		return browser.storage.local.clear();
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

	clearLocalStorage = function () {
		return chrome.storage.local.clear();
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

				if ( !( 'color' in event ) ) {
					event['color'] = '#666666';
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
 * @param data The event data.
 * @see Event
 * @param data Event data.
 * @param {string|null} data.uuid The event UUID. See uuidv4().
 * @param {string} data.name The event name.
 * @param {string} data.location The event location.
 * @param {string} data.host The event host.
 * @param {number} data.weekday The event weekday index (0 to 4).
 * @param {number} data.start_hour The event start hour.
 * @param {number} data.end_hour The event end hour.
 */
function createEvent( data ) {
	let event = new Event( data );

	loadEvents().then( events => {
		if ( typeof events === 'undefined' ) {
			events = [];
		}

		events.push( event );

		saveEvents( events ).then( loadEvents ).then( render ).catch( e => console.log( e ) );
	} );
}

function getBlacklist() {
	return new Promise( resolve => {
		loadValue( Settings.TUTORIAL_BLACKLIST ).then( blacklist => {
			if ( !( blacklist instanceof Array ) ) {
				blacklist = [];
			}

			resolve( blacklist );
		} );
	} );
}

function addToTutorialBlacklist( tutorial_name ) {
	getBlacklist().then(
		blacklist => {
			if ( !( blacklist.includes( tutorial_name ) ) ) {
				blacklist.push( tutorial_name );
			}

			saveValue( Settings.TUTORIAL_BLACKLIST, blacklist )
				.then( loadEvents )
				.then( render );
		}
	);
}

function removeFromTutorialBlacklist( tutorial_name ) {
	getBlacklist().then(
		blacklist => {
			for ( let i = 0; i < blacklist.length; i++ ) {
				if ( blacklist[i] === tutorial_name ) {
					blacklist.splice( i, 1 );
					break;
				}
			}

			saveValue( Settings.TUTORIAL_BLACKLIST, blacklist )
				.then( loadEvents )
				.then( render );
		}
	);
}