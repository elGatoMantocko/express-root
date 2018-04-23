(() => {
  console.log('in the home presenter');

  /**
   * Necessary code for float labels to work no shadow dom required
   * This should be run after float labels are rendered
   */
  $('.float-label').on('input', function(e) {
    e.preventDefault();
    const $el = $(this);
    if ($el.val()) $el.addClass('label-adjusted');
    else $el.removeClass('label-adjusted');
  });
})();
