const {expect} = require('chai');
const {join} = require('path');
const extendModel = require(join(process.cwd(), 'src', 'server', 'middleware', 'model.js'));
describe('Middleware handler', function() {
  it('should return a middleware function', function() {
    expect(extendModel()).to.be.a('function');
  });

  describe('extendModel();', function() {
    beforeEach(function() {
      this.req = null;
      this.res = {
        locals: {
          model: {
            App: {libs: {}},
          },
        },
      };
      this.callback = function() {};
    });

    it('should continue in the case of a null model', function() {
      const middleware = extendModel().bind(this, this.req, {locals: {}}, this.callback);
      expect(middleware).to.not.throw();
    });

    it('should add Models', function() {
      const middleware = extendModel();
      middleware(this.req, this.res, this.callback);
      expect(this.res.locals.model.App.Models).to.be.an('object');
    });

    it('should add Presenters', function() {
      const middleware = extendModel();
      middleware(this.req, this.res, this.callback);
      expect(this.res.locals.model.App.Presenters).to.be.an('object');
    });

    it('should add bootstrapped', function() {
      const middleware = extendModel();
      middleware(this.req, this.res, this.callback);
      expect(this.res.locals.model.App.bootstrapped).to.be.an('object');
    });

    it('shouldn\'t override default properties', function() {
      const middleware = extendModel();
      middleware(this.req, this.res, this.callback);
      expect(this.res.locals.model.App.libs).to.be.an('object');
    });
  });
});
