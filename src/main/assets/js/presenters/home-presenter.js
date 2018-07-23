App.Presenters.Home = function() {
  // initialize the input(s)
  App.libs.input.initFloats();
  App.libs.input.initValidation();

  let now = dayjs();
  /**
   * Updates time block and icon
   */
  function updateTime() {
    now = dayjs();
    if (now.isAfter(dayjs().set('hour', 15))) {
      $('#confirm-beer')
        .removeClass('fa-times text-danger')
        .addClass('fa-check text-success');
    } else {
      $('#confirm-beer')
        .addClass('fa-times text-danger')
        .removeClass('fa-check text-success');
    }
    $('#time-container').empty().append(now.format('h:mm:ss A'));
  }

  // render the time on the page
  updateTime();
  setInterval(updateTime, 1000);

  App.bootstrapped.malicious.forEach(function(str) {
    $('.malicious-container').append('<p><code>' + str + '</code></p>');
  });
};
