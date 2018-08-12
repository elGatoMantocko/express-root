/**
 * Notification class
 * @class
 */
class Notification {
  /**
   * Create the notification instance
   * @param {String} opts.message - notification message
   * @param {String} [opts.title] - title for the notification
   * @param {String} [opts.color] - color of the notification
   * @return {Notification} - this instance
   */
  constructor({message, title = '', color = 'info'}) {
    // handle required param
    if (!message) throw new Error('Missing required param \'message\'');

    // create the notification element
    const $el = $(Handlebars.partials['mantocko/partials/notification']({message, title, color}));

    // apply options and objects to this notification instance
    Object.assign(this, {message, title, color, $el, el: $el[0]});
    return this.initialize();
  }

  /**
   * Initialize the notification DOM element
   * @return {Notification} - this instance
   */
  initialize() {
    // append the element to the body
    document.body.appendChild(this.el);

    // animate entry and exit of notification
    window.setTimeout(() => this.$el.addClass('active'), 100);
    $(this.el).on('click', '.close', () => {
      $(this.el).removeClass('active');
      setTimeout(() => $(this.el).remove(), 300);
    });

    // return self
    return this;
  }
}

App.libs.Notification = Notification;
