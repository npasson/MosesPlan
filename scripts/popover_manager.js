/**
 * Gets the popover for the events.
 *
 * @param {Event} event The event to get the popover for.
 * @param {string} type The type to list in the popover.
 * @return {*} A jQuery object with the popover.
 */
function getPopover( event, type = 'Custom' ) {
	return $( `
	<div class="mosesplan__popover popover termin-popover hidden-xs top in">
  <div class="arrow"></div>
  <h3 class="popover-title">${event.name}</h3>
  <div class="popover-content">
    <div class="row">
      <div class="col-sm-6">
       <div class="form-group">
        <label>${window.mp_strings.event_time}</label>
        <br>${getWeekdayString( event.weekday, true )} ${event.start}:00 - ${event.end}:00
        </div>
      </div>
      <div class="col-sm-6">
        <div class="form-group"><label>${window.mp_strings.event_location}</label><br>${event.location}</div>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-6">
        <div class="form-group"><label>${window.mp_strings.event_host}</label><br>${event.host}</div>
      </div>
      <div class="col-sm-6">
        <div class="form-group"><label>Format</label><br>${type}</div>
      </div>
    </div>
  </div>
</div>
	` );
}