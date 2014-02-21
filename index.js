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

/**
 * Supposes that dpkg is a valid dpkg
 */
function rate(dpkg){

  var scores = {
    ol: !! (dpkg.license && licenses[dpkg.license]), //open license
    of: 0, //open format
    uri: 0, //uri
    re: 0, //re-usable for human and machine => structured, description and metadata
    ld: 0  //linked data -> URL or input or @context
  };

  var n = 0;

  if(dpkg.description){
    scores.re++;
  }

  ['dataset', 'code', 'figure'].forEach(function(t){
    if(t in dpkg){
      dpkg[t].forEach(function(r){
        var grade = rateResource(r);
        for(var key in grade){
          scores[key] += grade[key];
        }
        n++;
      });
    }
  });


  ['of', 're', 'ld'].forEach(function(t){
    scores[t] = (scores[t]/n >= 0.5);
  });


  return scores;
};

function rateResource(r, license){
  return { 
    ol: !! (license && licenses[license]),
    uri: !! r['@id'],
    of: !! (img[r.encodingFormat] || 
            (r.distribution && data[r.distribution.encodingFormat]) ||
            (r.programmingLanguage && lang[r.programmingLanguage.name.toLowerCase()])),
    re: !! ( (r.description && r.description.trim()) || (r.about &&  Object.keys(r.about).length) || r.caption ),
    ld: !! ( (r.isBasedOnUrl && r.isBasedOnUrl.length) ||
             (r.targetProduct &&  r.targetProduct.input && Object.keys(r.targetProduct.input).length) ||
             (r._input && r._input.length) ||
             r.discussionUrl ||
             r.codeRepository ||
             _isLd(r['@context'])
           )
  };  
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

exports.rate = rate;
exports.rateResource = rateResource;
