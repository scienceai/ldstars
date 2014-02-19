//TODO scrap from http://spdx.org/licenses/
var licenses= {
  'CC0-1.0': true
};

var lang = {
  r: true,
  python: true,
  matlab: false,
  c: true
};

var data = {
  csv: true,
  xls: false,
  xlsx: false,
  json: true,
  jsonld: true,
  ldjson: true
};

var img = {
  jpg: true,
  png: true,
  gif: true,
  svg: true
};

/**
 * Supposes that dpkg is a valid dpkg
 */
module.exports = function(dpkg){

  var scores = {
    ol: !! (dpkg.license && (dpkg.license in licenses)), //open license
    of: 0, //open format
    re: 0, //re-usable for human and machine => structured, description and metadata
    ld: 0  //linked data -> URL or input or @context
  };

  var n = 0;

  if ('dataset' in dpkg){
    dpkg.dataset.forEach(function(x){
      n++;

      if (x.distribution && data[x.distribution.encodingFormat]){
        scores.of++;
      }

      if ( (x.description && x.description.trim()) || (x.about &&  Object.keys(x.about).length) ) {
        scores.re++;
      }

      if( (x.isBasedOnUrl && x.isBasedOnUrl.length) || _isLd(x['@context']) ){
        scores.ld++;
      }
      
    });    

  }

  if ('code' in dpkg){
    dpkg.code.forEach(function(x){
      n++;

      if (x.programmingLanguage && lang[x.programmingLanguage.name.toLowerCase()]){
        scores.of++;
      }

      if (x.description && x.description.trim()){
        scores.re++;
      }

      if ( (x.isBasedOnUrl && x.isBasedOnUrl.length) ||
           (x.targetProduct &&  x.targetProduct.input && Object.keys(x.targetProduct.input).length) ||
           x.discussionUrl ||
           x.codeRepository
         ) {
        scores.ld++;
      }

    });
  }


  if('figure' in dpkg){
    dpkg.figure.forEach(function(x){
      n++;

      if (img[x.encodingFormat]){
        scores.of++;
      }

      if ((x.description && x.description.trim()) ||
          x.catpion
         ){
        scores.re++;
      }
      
      if (x.isBasedOnUrl && x.isBasedOnUrl.length){
        scores.ld++;
      }

    });      

  }


  ['of', 're', 'ld'].forEach(function(t){
    scores[t] = (scores[t]/n >= 0.5);
  });


  return scores;
};



/**
 * check if an @context got urls and not only local node
 */
function _isLd(ctx){
  if(!ctx){
    return false;
  }

  for(var key in ctx){
    var id = (typeof ctx[key] === 'string') ? ctx[key] : ctx[key]['@id'];
    if(! (/^http:\/\/www.w3.org\/2001\/XMLSchema#?$/.test(id)) ){
      var x = id.split(':')[0];
      if(x !== '_') {
        return true;
      }
    }
  };

  return false;

};
