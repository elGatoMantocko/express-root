App.libs.input = {
  init: function() {
    /**
     * Necessary code for float labels to work no shadow dom required
     * This should be run after float labels are rendered
     *
     * Possibly move to an input init lib function
     */
    $('.float-label').on('focusin', function(e) {
      e.preventDefault();
      $(this).addClass('label-adjusted');
    });
    $('.float-label').on('focusout', function(e) {
      e.preventDefault();
      const $el = $(this);
      if (!$el.val()) $el.removeClass('label-adjusted');
    });
  },
  verifyPassword: function(el) {
    const $el = $(el);
    if (!$el.data('verifyFor')) throw new Error('This input doesn\'t verify any password input');
    if ($el.val() !== $($el.data('verifyFor')).val()) {
      el.setCustomValidity('Passwords must match');
    } else {
      el.setCustomValidity('');
    }
  },
};
