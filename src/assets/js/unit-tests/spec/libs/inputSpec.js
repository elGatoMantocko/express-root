describe('App.libs.input', function() {
  describe('#initFloats()', function() {
    it('should be a function', function() {
      assert.isFunction(App.libs.input.initFloats);
    });

    beforeEach(function() {
      $('body').prepend('<input class="float-label">');
      App.libs.input.initFloats();
    });

    it('should apply label-adjusted class on focusin', function() {
      const hasLabelAdjusted = $('.float-label')
        .trigger('focusin')
        .hasClass('label-adjusted');

      assert.equal(true, hasLabelAdjusted);
    });

    it('should remove label-adjusted class on focusout', function() {
      const hasLabelAdjusted = $('.float-label')
        .trigger('focusin')
        .trigger('focusout')
        .hasClass('label-adjusted');

      assert.equal(false, hasLabelAdjusted);
    });
  });

  describe('#initValidation', function() {
    beforeEach(function() {
      $('body').prepend('<input id="my-email" type="email" class="validation-control">');
      App.libs.input.initValidation();
    });

    it('should be valid when empty', function() {
      const hasInvalid = $('#my-email')
        .trigger('focusin')
        .hasClass('invalid');

      assert.equal(false, hasInvalid);
    });

    it('should be invalid with invalid email after focus event', function() {
      const hasInvalid = $('#my-email')
        .trigger('focusin')
        .val('invalid_email')
        .trigger('input')
        .trigger('focusout')
        .hasClass('invalid');

      assert.equal(true, hasInvalid);
    });

    it('should revalidate on input event', function() {
      const hasInvalid = $('#my-email')
        .val('invalid_email')
        .trigger('focusout')
        .val('valid@email.com')
        .trigger('input')
        .hasClass('invalid');

      assert.equal(false, hasInvalid);
    });
  });

  describe('#verifyPassword()', function() {
    beforeEach(function() {
      $('body')
        .append('<input id="my-password-input" class="validation-control">')
        .append('<input id="my-password-verify-input" class="validation-control" data-verify-for="#my-password-input" oninput="App.libs.input.verifyPassword(this)">');
      App.libs.input.initValidation();
    });

    it('should be a function', function() {
      assert.isFunction(App.libs.input.verifyPassword);
    });

    it('should have invalid verification on no match', function() {
      $('#my-password-input').val('testpass');
      const hasInvalid = $('#my-password-verify-input')
        .val('wrongpass')
        .trigger('input')
        .trigger('focusout')
        .hasClass('invalid');

      assert.equal(true, hasInvalid);
    });

    it('should have valid verification on match', function() {
      $('#my-password-input').val('testpass');
      const hasInvalid = $('#my-password-verify-input')
        .val('testpass')
        .trigger('input')
        .trigger('focusout')
        .hasClass('invalid');

      assert.equal(false, hasInvalid);
    });
  });

  afterEach(function() {
    $('input').remove();
  });
});
