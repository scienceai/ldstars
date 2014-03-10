var isUrl = require('is-url');

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
  'text/csv': true,
  'application/vnd.ms-excel': false,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': false,
  'application/json': true,
  'application/ld+json': true,
  'application/x-ldjson': true
};

var img = {
  'image/png':true,
  'image/jpeg':true,
  'image/tiff':true,
  'image/gif':true,
  'image/svg+xml':true
};

var article = {
  'application/x-tex': true,
  'application/pdf': true,
  'text/x-markdown': true,
  'application/msword': false,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': false
};

/**
 * Supposes that pkg is a valid pkg
 */
function rate(pkg, opts){

  opts = opts || {};
  
  var scores = {
    ol: !! (pkg.license && licenses[pkg.license]), //open license
    of: 0, //open format
    uri: 0, //uri TODO check pkg level stuff
    re: 0, //re-usable for human and machine => structured, description and metadata TODO check pkg level stuff
    ld: 0  //linked data -> URL or input or about or isBasedOnUrl TODO check pkg level stuff
  };

  var n = 0;

  if(pkg.description){
    scores.re++;
  }

  ['dataset', 'code', 'figure', 'article'].forEach(function(t){
    if(t in pkg){
      pkg[t].forEach(function(r){
        var grade = rateResource(r);
        for(var key in grade){
          scores[key] += grade[key];
        }
        n++;
      });
    }
  });

  ['of', 're', 'uri', 'ld'].forEach(function(t){
    scores[t] = (scores[t]/n >= 0.5);
  });
  
  return (opts.string) ? toString(scores): scores;

};

function rateResource(r, license, opts){
  if((arguments.length === 2) && typeof license !== 'string'){
    opts = license;
    license = undefined;
  }

  opts = opts || {};

  var scores = { 
    ol: !! (license && licenses[license]),
    uri: !! r['@id'],
    of: !! (img[r.encodingFormat] || 
            article[r.encoding && r.encoding.encodingFormat] ||
            (r.distribution && data[r.distribution.encodingFormat]) ||
            (r.programmingLanguage && lang[r.programmingLanguage.name.toLowerCase()])),
    re: !! ( (r.description && r.description.trim()) || _isRe(r.about) || r.caption ),
    ld: !! ( (r.isBasedOnUrl && r.isBasedOnUrl.length) ||
             (r.targetProduct &&  r.targetProduct.input && Object.keys(r.targetProduct.input).length) ||
             (r._input && r._input.length) ||
             r.discussionUrl ||
             r.codeRepository ||
             _isLdAbout(r.about) ||
             _isLdCitation(r.citation)
           )
  }; 

  return (opts.string) ? toString(scores): scores; 
};

function toString(scores){

  var s = [];
  ['ol', 're', 'of', 'uri', 'ld'].forEach(function(x){
    if(scores[x]){
      s.push(x);
    }
  });

  return s.join('-');  
};


/**
 * check if an about got urls
 */
function _isLdAbout(about){
  if(!about){
    return false;
  }

  for(var i=0; i<about.length; i++){
    if(about[i].sameAs && isUrl(about[i].sameAs)){
      return true;
    }
  };

  return false;
};

/**
 * check if an about got urls
 */
function _isLdCitation(citation){
  if(!citation){
    return false;
  }

  for(var i=0; i<citation.length; i++){
    if(citation[i].url && isUrl(citation[i].url)){
      return true;
    }
  };

  return false;
};


/**
 * check if an about got description
 */
function _isRe(about){
  if(!about){
    return false;
  }

  if(Array.isArray(about)){
    for(var i=0; i<about.length; i++){
      if(about[i].description && about[i].description.trim()){
        return true;
      }
    };
  } else {
    return about.description && about.description.trim();
  }


  return false;
};

exports.rate = rate;
exports.rateResource = rateResource;
exports.toString = toString;
