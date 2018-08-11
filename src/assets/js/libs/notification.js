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
    const el = document.createElement('div');
    el.className = `notification ${color}`;
    el.innerHTML = `
      <div class="float-left">
        ${title ? `<h3 class="title display-4">${title}</h3>` : ''}
        <div class="message">${message}</div>
      </div>
      <button type="button" class="close" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    `;

    // apply options and objects to this notification instance
    Object.assign(this, {message, title, color, el, $el: $(el)});
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
