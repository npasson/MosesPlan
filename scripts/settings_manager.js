class SettingsEntry {
	constructor( data ) {
		this.displayname    = data.displayname;
		this.id             = data.id;
		this.input_id       = data.input_id;
		this.clickCallback  = data.clickCallback;
		this.beforeCallback = data.beforeCallback;
		this.type           = data.type;
		this.options        = data.options;
	}
}

/**
 *
 * @param {SettingsEntry} settings_entry
 */
function getSettingJQueryObject( settings_entry ) {
	let $setting = $( document.createElement( 'div' ) );
	$setting.addClass( 'form-group' );
	$setting.attr( 'id', settings_entry.id );

	let $setting_input;

	switch ( settings_entry.type ) {
		case 'checkbox':
			$setting_input = $( document.createElement( 'input' ) );
			$setting_input.attr( 'type', 'checkbox' );
	}

	$setting_input.on( 'click', settings_entry.clickCallback );
	$setting_input.attr( 'id', settings_entry.input_id );
	$setting_input.addClass( 'mosesplan__settings-input' );
	$setting.append( $setting_input );

	let $setting_label = $( document.createElement( 'label' ) );
	$setting_label.attr( 'for', settings_entry.input_id );
	$setting_label.text( settings_entry.displayname );
	$setting.append( $setting_label );

	// call beforeCallback with `this` set to the settings object
	settings_entry.beforeCallback.call( $setting );

	return $setting;
}