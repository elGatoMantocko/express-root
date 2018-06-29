App.Presenters.Input = function() {
  // initialize the input(s)
  App.libs.input.initFloats();
  App.libs.input.initValidation();

  // need to validate that the input is filled in on form submit
  // but also have to clean up the input's state on first input
  $('#my-registration-form').on('submit', function(e) {
    const $requiredInputs = $('#my-email-input, #my-password-input, #my-password-verify-input')
      .one('input', function() {
        this.setCustomValidity('');
      });

    const valid = $requiredInputs.each((i, el) => {
      if (!$(el).val()) {
        el.setCustomValidity('Required input');
      }
    }).toArray().every((el) => $(el).val());

    return valid;
  });
};
