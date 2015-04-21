var assert = require('assert')
  , ldstars = require('..');

describe('ldstars', function(){

  describe('rate()', function() {
    it('should give no stars if dataset got nothing good', function(){
      var s = ldstars.rate({});
      assert.deepEqual(s, { ol: false, of: false, re: false, uri:false, ld: false });
    });

    it('should give an "ol" star if license is open', function(){
      var s = ldstars.rate({license: 'CC0-1.0'});
      assert.deepEqual(s, { ol: true, of: false, re: false, uri:false, ld: false });
    });

    it('should give an "of" star if dataset use open format', function(){
      var s = ldstars.rate({dataset: [{distribution: [{encodingFormat: 'text/csv'}]}]});
      assert.deepEqual(s, { ol: false, of: true, re: false, uri:false, ld: false });
    });

    it('should not give an "of" star if dataset do not use open format', function(){
      var s = ldstars.rate({dataset: [{distribution: [{encodingFormat: 'application/vnd.ms-excel'}]}]});
      assert.deepEqual(s, { ol: false, of: false, re: false, uri:false, ld: false });
    });

    it('should give an "of" star if sourceCode use open format', function(){
      var s = ldstars.rate({sourceCode: [{programmingLanguage: {name: 'python'}}]});
      assert.deepEqual(s, { ol: false, of: true, re: false, uri:false, ld: false });
    });

    it('should give an "of" star if image use open format', function(){
      var s = ldstars.rate({image: [{encoding: [{encodingFormat: 'image/png'}]}]});
      assert.deepEqual(s, { ol: false, of: true, re: false, uri:false, ld: false });
    });

    it('should give a "re" star if dataset a sourceCode or a image got a description', function(){
      ['dataset', 'sourceCode', 'image'].forEach(function(t){
        var ctnr = {};
        ctnr[t] = [{description:'a'}];

        var s = ldstars.rate(ctnr);
        assert.deepEqual(s, { ol: false, of: false, re: true, uri:false, ld: false });
      });
    });

    it('should give a "re" star if resource got about with description', function(){
      var s = ldstars.rate({dataset: [{about: [{description: 'lalalala'}]}]});
      assert.deepEqual(s, { ol: false, of: false, re: true, uri:false, ld: false });
    });

    it('should give an "ld" star if dataset a sourceCode or a image got a isBasedOnUrl', function(){
      ['dataset', 'sourceCode', 'image'].forEach(function(t){
        var ctnr = {};
        ctnr[t] = [{isBasedOnUrl:['http://ex.com']}];

        var s = ldstars.rate(ctnr);
        assert.deepEqual(s, { ol: false, of: false, re: false, uri:false, ld: true });
      });
    });

    it('should give an "ld" star if a dataset got a about with sameAs url', function(){
      var ctnr = {
        dataset: [
          {
            'about': [
              { name: "a", sameAs: 'http://ex.com/a'},
              { name: 'b', sameAs: 'http://ex.com/b' }
            ]
          }
        ]
      };

      var s = ldstars.rate(ctnr);
      assert.deepEqual(s, { ol: false, of: false, re: false, uri:false, ld: true });
    });

    it('should give an "of and ld" star if article use open format and citation with URL', function(){
      var s = ldstars.rate({article: [{encoding: [{encodingFormat: 'text/x-markdown'}], citation: [{url:'http://ex.com'}]}]});
      assert.deepEqual(s, { ol: false, of: true, re: false, uri:false, ld: true });
    });

    it('should give a star if more than half of resource are good', function(){
      var ctnr = {
        dataset: [ {description:'a'} ],
        sourceCode: [ {description:'b'} ],
        image: [ {isBasedOnUrl:['http://ex.com']} ],
      };

      var s = ldstars.rate(ctnr);

      assert.deepEqual(s, { ol: false, of: false, re: true, uri:false, ld: false });
    });

    it('#1 should not throw an error if the package has non-array rateable property', function() {
      var resource = { license: 'CC0-1.0', image: {} };
      var s;
      assert.doesNotThrow(function() {
        s = ldstars.rate(resource);
      }, TypeError);
      assert.deepEqual(s, { ol: true, of: false, uri: false, re: false, ld: false });
    });

    it('#3 defaults to a number rating when multiple options are passed', function() {
      var encoding = {
        sourceCode: [
          {
            programmingLanguage: {
              name: 'python'
            }
          }
        ]
      };

      assert.equal(ldstars.rate(encoding, { string: true, number: true }), 1);
    });
  });

  describe('rateResource()', function() {
    it('should give an "ol-of" rate', function(){
      var s = ldstars.rateResource({programmingLanguage: {name: 'python'}}, 'CC0-1.0', {string: true});
      assert.equal(s, 'ol-of');
    });

    it('should give an "of" rate', function(){
      var s = ldstars.rateResource({programmingLanguage: {name: 'python'}}, {string: true});
      assert.equal(s, 'of');
    });
  });

  describe('toString()', function() {
    it('should convert a score object to a string', function(){
      var s = ldstars.toString({ ol: false, of: false, re: true, uri:false, ld: true });
      assert.equal(s, 're-ld');
    });

    it('should give an "of" star if sourceCode use open format and return a string', function(){
      var s = ldstars.rate({sourceCode: [{programmingLanguage: {name: 'python'}}]}, {string: true});
      assert.equal(s, 'of');
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
