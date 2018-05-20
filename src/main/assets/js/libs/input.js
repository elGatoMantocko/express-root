App.libs.input = {
  initFloats: function() {
    /**
     * Necessary code for float labels to work no shadow dom required
     * This should be run after float labels are rendered
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

    // validation control for inputs with 'validation-control' class
    $('input.validation-control')
      .on('focusout focusin', function() {
        if (!this.checkValidity()) {
          $(this).addClass('invalid');
        } else {
          $(this).removeClass('invalid');
        }
      }).on('input', function() {
        if (this.checkValidity()) {
          $(this).removeClass('invalid');
        }
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
