var isUrl = require('is-url');

//TODO scrap from http://spdx.org/licenses/
var LICENSES = {
  'CC0-1.0': true
};


var DATA = {
  'text/csv': true,
  'application/vnd.ms-excel': false,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': false,
  'application/json': true,
  'application/ld+json': true,
  'application/x-ldjson': true
};

var FIGURE = {
  'image/png':true,
  'image/jpeg':true,
  'image/tiff':true,
  'image/gif':true,
  'image/svg+xml':true
};

var ARTICLE = {
  'application/x-tex': true,
  'application/pdf': true,
  'text/x-markdown': true,
  'application/msword': false,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': false
};

var VIDEO = {
  'video/avi': true,
  'video/mpeg': true,
  'video/mp4': true,
  'video/ogg': true,
  'video/quicktime': false,
  'video/webm': true,
  'video/x-matroska': true,
  'video/x-ms-wmv': false,
  'audio/x-flv': false
};

var AUDIO = {
  'audio/basic': true,
  'audio/L24': true,
  'audio/mp4': true,
  'audio/mpeg': true,
  'audio/ogg': true,
  'audio/opus': true,
  'audio/orbis': true,
  'audio/vorbis': true,
  'audio/vnd.rn-realaudio': true,
  'audio/vnd.wave': false,
  'audio/webl':true
};

var LANG = {
  r: true,
  python: true,
  matlab: false,
  c: true
};


/**
 * Supposes that pkg is a valid pkg
 */
function rate(pkg, opts){

  opts = opts || {};

  var scores = {
    ol: !! (pkg.license && LICENSES[pkg.license]), //open license
    of: 0, //open format
    uri: 0, //uri
    re: 0, //re-usable for human and machine => structured, description and metadata
    ld: 0  //linked data -> URL or input or about or isBasedOnUrl
  };

  var n = 0;

  if(pkg['@id']){
    scores.uri++;
  }

  if(pkg.isBasedOnUrl || _isLdCitation(pkg.citation)){
    scores.ld++;
  }

  if(pkg.description){
    scores.re++;
  }

  [ 'dataset', 'code', 'figure', 'article', 'audio', 'video' ].forEach(function(t){
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

    ol: !! (license && LICENSES[license]),

    uri: !! r['@id'],

    of: !! (( r.encoding && (r.encoding.filter(function(x){ return FIGURE[x.encodingFormat];})).length) ||
            ( r.encoding && (r.encoding.filter(function(x){ return VIDEO[x.encodingFormat];})).length) ||
            ( r.encoding && (r.encoding.filter(function(x){ return AUDIO[x.encodingFormat];})).length) ||
            ( r.encoding && (r.encoding.filter(function(x){ return ARTICLE[x.encodingFormat];})).length) ||
            (r.distribution && (r.distribution.filter(function(x){ 
              var format;
              if(x.contentData && !x.encodingFormat){           
                var s = (typeof x.contentData === 'string') ? x.contentData: JSON.stringify(x.contentData);
                format = (typeof x.contentData === 'string') ? 'text/plain':
                  (s.indexOf('@context') !== -1) ? 'application/ld+json' : 'application/json';
              } else {
                format = x.encodingFormat;
              }
              return DATA[format];
            })).length) ||
            (r.programmingLanguage && r.programmingLanguage.name && LANG[r.programmingLanguage.name.toLowerCase()])),

    re: !! ( (r.description && r.description.trim()) || _isRe(r.about) || r.caption ),

    ld: !! ( (r.isBasedOnUrl && r.isBasedOnUrl.length) ||
             (r.targetProduct &&  r.targetProduct.filter(function(x){ return x.input && Object.keys(x.input).length; })) ||
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
