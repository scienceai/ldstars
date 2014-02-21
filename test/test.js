var assert = require('assert')
  , ldstars = require('..');

describe('stars', function(){

  it('should give no stars if dataset got nothing good', function(){
    var s = ldstars.rate({});   
    assert.deepEqual(s, { ol: false, of: false, re: false, uri:false, ld: false });
  });

  it('should give an "ol" star if license is open', function(){
    var s = ldstars.rate({license: 'CC0-1.0'});   
    assert.deepEqual(s, { ol: true, of: false, re: false, uri:false, ld: false });
  });

  it('should give an "of" star if dataset use open format', function(){
    var s = ldstars.rate({dataset: [{distribution: {encodingFormat: 'text/csv'}}]});   
    assert.deepEqual(s, { ol: false, of: true, re: false, uri:false, ld: false });
  });

  it('should not give an "of" star if dataset do not use open format', function(){
    var s = ldstars.rate({dataset: [{distribution: {encodingFormat: 'application/vnd.ms-excel'}}]});   
    assert.deepEqual(s, { ol: false, of: false, re: false, uri:false, ld: false });
  });


  it('should give an "of" star if code use open format', function(){
    var s = ldstars.rate({code: [{programmingLanguage: {name: 'python'}}]});   
    assert.deepEqual(s, { ol: false, of: true, re: false, uri:false, ld: false });
  });

  it('should give an "of" star if figure use open format', function(){
    var s = ldstars.rate({figure: [{encodingFormat: 'image/png'}]});   
    assert.deepEqual(s, { ol: false, of: true, re: false, uri:false, ld: false });
  });

  it('should give a "re" star if dataset a code or a figure got a description', function(){
    ['dataset', 'code', 'figure'].forEach(function(t){
      var dpkg = {};
      dpkg[t] = [{description:'a'}];
      
      var s = ldstars.rate(dpkg);   
      assert.deepEqual(s, { ol: false, of: false, re: true, uri:false, ld: false });
    });
  });

  it('should give an "ld" star if dataset a code or a figure got a isBasedOnUrl', function(){
    ['dataset', 'code', 'figure'].forEach(function(t){
      var dpkg = {};
      dpkg[t] = [{isBasedOnUrl:['http://ex.com']}];
      
      var s = ldstars.rate(dpkg);   
      assert.deepEqual(s, { ol: false, of: false, re: false, uri:false, ld: true });
    });
  });
  
  it('should give an "ld" star if a dataset got a context with url', function(){
    var dpkg = {
      dataset: [ { '@context': {a:'http://ex.com/a', b: 'http://ex.com/b' }} ]
    };
    
    var s = ldstars.rate(dpkg);   
    assert.deepEqual(s, { ol: false, of: false, re: false, uri:false, ld: true });
  });

  it('should give a star if more than half of resource are good', function(){
    var dpkg = {
      dataset: [ {description:'a'} ],
      code: [ {description:'b'} ],
      figure: [ {isBasedOnUrl:['http://ex.com']} ],
    };
    
    var s = ldstars.rate(dpkg);   

    assert.deepEqual(s, { ol: false, of: false, re: true, uri:false, ld: false });
  });

});
