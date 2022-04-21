/**
 * Returns an i18n object with the language-specific strings for use in the extension.
 *
 * @param language The language key. Supported: 'de' and 'en'. Defaults to 'en'.
 * @returns {Object[string:string]} An object mapping keys to the language representations.
 */
function getLangObject( language ) {
	switch ( language.toLowerCase() ) {
		case 'de':
			return {
				addButtonTitle: '➕ Neues Event',
				deleteButtonTitle: '➖ Event löschen',
				toggleButtonTitle: 'Eigene Events anzeigen',
				tutorialButtonTitle: '+ Tutorien',
				addEventTitle: 'Neues Event',
				deleteEventTitle: 'Event löschen',
				addEventSubmitButton: 'Hinzufügen',
				deleteEventSubmitButton: 'Löschen',
				weekday: 'Wochentag',
				monday: 'Montag',
				monday_short: 'Mo',
				tuesday: 'Dienstag',
				tuesday_short: 'Di',
				wednesday: 'Mittwoch',
				wednesday_short: 'Mi',
				thursday: 'Donnerstag',
				thursday_short: 'Do',
				friday: 'Freitag',
				friday_short: 'Fr',
				delete_dropdown: 'Event auswählen',
				event_name: 'Eventname',
				event_name_placeholder: 'z.B. Spanisch-Unterricht',
				event_location: 'Eventort',
				event_location_placeholder: 'z.B. Home-Office',
				event_host: 'Eventveranstalter',
				event_host_placeholder: 'z.B. Max Mustermann',
				event_time: 'Eventzeit',
				start_time: 'Beginn',
				end_time: 'Ende',
				error_no_weekday: 'Bitte wähle einen Wochentag.',
				error_spacetime: 'Bitte lass die Raumzeit intakt. (Eventende muss nach Eventbeginn sein)',
				tutorial: 'Tutorium',
				confirm_loading: 'Diese Option verwendet deinen Session-Cookie, um die Tutorien von Moses abzufragen.\n\n'
				                 + 'Wenn du nicht weißt, was das heißt, brauchst du dir keine Sorgen zu machen,'
				                 + ' aber Technik-interessierte Menschen wollen vielleicht wählen.'
			};
		case 'en':
		default:
			return {
				addButtonTitle: '➕ Add new event',
				deleteButtonTitle: '➖ Delete event',
				toggleButtonTitle: 'Show custom events',
				tutorialButtonTitle: '+ Tutorials',
				addEventTitle: 'New event',
				deleteEventTitle: 'Delete event',
				addEventSubmitButton: 'Add Event',
				deleteEventSubmitButton: 'Delete',
				weekday: 'Day of Week',
				monday: 'Monday',
				monday_short: 'Mo',
				tuesday: 'Tuesday',
				tuesday_short: 'Tu',
				wednesday: 'Wednesday',
				wednesday_short: 'We',
				thursday: 'Thursday',
				thursday_short: 'Th',
				friday: 'Friday',
				friday_short: 'Fr',
				delete_dropdown: 'Select event',
				event_name: 'Event name',
				event_name_placeholder: 'e.g. Spanish lessions',
				event_location: 'Event location',
				event_location_placeholder: 'e.g. Home Office',
				event_host: 'Event host',
				event_host_placeholder: 'e.g. John Doe',
				event_time: 'Event time',
				start_time: 'Start',
				end_time: 'End',
				error_no_weekday: 'Please choose a day of the week.',
				error_spacetime: 'Please leave spacetime intact. (Event end has to be after event start)',
				tutorial: 'Tutorial',
				confirm_loading: 'This setting uses your session cookie to do an async request across Moses to get your tutorials.\n\n'
				                 + 'If you don\'t know what this means, everything is fine, but tech people might like to choose.'
			};
	}
}