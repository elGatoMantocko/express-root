App.Presenters.Home = function() {
  // initialize the input(s)
  App.libs.input.initFloats();

  let now = moment();
  /**
   * Updates time block and icon
   */
  function updateTime() {
    now = moment();
    if (now.isAfter(moment('04:00 pm', 'hh:mm a', true))) {
      $('#confirm-beer')
        .removeClass('fa-times text-danger')
        .addClass('fa-check text-success');
    } else {
      $('#confirm-beer')
        .addClass('fa-times text-danger')
        .removeClass('fa-check text-success');
    }
    $('#time-container').empty().append(now.format('LTS'));
  }

  // render the time on the page
  updateTime();
  setInterval(updateTime, 1000);
};
