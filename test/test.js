var assert = require('assert')
  , ldstars = require('..');

describe('ldstars', function(){

  describe('rate()', function() {
    it('should give of and re stars if doc is empty', function(){
      var s = ldstars.rate({});
      assert.deepEqual(s, { ol: false, of: true, re: true, uri:false, ld: false });
    });

    it('should give an "ol" star if license is open', function(){
      var s = ldstars.rate({license: 'CC0-1.0'});
      assert.deepEqual(s, { ol: true, of: true, re: true, uri:false, ld: false });
    });

    it('should give an "of" and "re" star if dataset use open machine readable format', function(){
      var s = ldstars.rate({distribution: [{encodingFormat: 'text/csv'}]});
      assert.deepEqual(s, { ol: false, of: true, re: true, uri:false, ld: false });
    });

    it('should not give an "re" star if dataset use non open but machine readable format', function(){
      var s = ldstars.rate({distribution: [{encodingFormat: 'application/vnd.ms-excel'}]});
      assert.deepEqual(s, { ol: false, of: false, re: true, uri:false, ld: false });
    });

    it('should not give an "re" star if article use image format', function(){
      var s = ldstars.rate({encoding: [{encodingFormat: 'application/pdf'}]});
      assert.deepEqual(s, { ol: false, of: true, re: false, uri:false, ld: false });
    });

    it('should not give an "of" star if sourceCode use non open programming language', function(){
      var s = ldstars.rate({programmingLanguage: {name: 'matlab'}});
      assert.deepEqual(s, { ol: false, of: false, re: true, uri:false, ld: false });
    });

    it('should give an "of" star if image use open format', function(){
      var s = ldstars.rate({encoding: [{encodingFormat: 'image/png'}]});
      assert.deepEqual(s, { ol: false, of: true, re: false, uri:false, ld: false });
    });

    it('should give a "re" star if image (or media) got a description', function(){
      var s = ldstars.rate({description: 'xx', encoding: {encodingFormat: 'image/png'}});
      assert.deepEqual(s, { ol: false, of: true, re: true, uri:false, ld: false });
    });

    it('should give a "uri" star if @id is present', function(){
      var s = ldstars.rate({'@id': 'id'});
      assert.deepEqual(s, { ol: false, of: true, re: true, uri:true, ld: false });
    });

    it('should give a "uri" star if url is present', function(){
      var s = ldstars.rate({url: 'http://example.com'});
      assert.deepEqual(s, { ol: false, of: true, re: true, uri:true, ld: false });
    });

    it('should give a "ld" star if resource got about', function(){
      var s = ldstars.rate({about: {'@id': 'http://example.com'}});
      assert.deepEqual(s, { ol: false, of: true, re: true, uri:false, ld: true });
    });

    it('should give an "ld" star if dataset a sourceCode or a image got a isBasedOnUrl', function(){
      var s = ldstars.rate({isBasedOnUrl: 'http://example.com'});
      assert.deepEqual(s, { ol: false, of: true, re: true, uri:false, ld: true });
    });

    it('should give an "ld" star if a dataset got a about with sameAs url', function(){
      var s = ldstars.rate({about: {sameAs: 'http://example.com'}});
      assert.deepEqual(s, { ol: false, of: true, re: true, uri:false, ld: true });
    });

    it('should give an "ld" star if article use open format and citation with URL', function(){
      var s = ldstars.rate({encoding: {encodingFormat: 'text/x-markdown'}, citation: {url:'http://ex.com'}});
      assert.deepEqual(s, { ol: false, of: true, re: true, uri:false, ld: true });
    });

    it('#3 defaults to a number rating when multiple options are passed', function() {
      assert.equal(ldstars.rate({}, { string: true, number: true }), 2);
    });
  });

  describe('toString()', function() {
    it('should convert a score object to a string', function(){
      var s = ldstars.toString({ ol: false, of: false, re: true, uri:false, ld: true });
      assert.equal(s, 're-ld');
    });
  });

  describe('toNumber()', function() {
    it('#3 should convert a score object to a number between 0 and 5', function() {
      var fiveStars = { ol: true,  of: true,  re: true,  uri: true,  ld: true  };
      var fourStars = { ol: true,  of: true,  re: true,  uri: true,  ld: false };
      var zeroStars = { ol: false, of: false, re: false, uri: false, ld: false };

      assert.equal(ldstars.toNumber(fiveStars), 5);
      assert.equal(ldstars.toNumber(fourStars), 4);
      assert.equal(ldstars.toNumber(zeroStars), 0);
    });
  });

});
