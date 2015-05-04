require('es6-collections');

//TODO scrap from http://spdx.org/licenses/ and publish in JSON-LD as an npm module
var FREE_LICENSES = new Set([
  'CC0-1.0'
]);

var NON_FREE = new Set([
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

  'video/quicktime',
  'video/x-ms-wmv',
  'application/x-shockwave-flash',
  'audio/x-flv',
  'audio/vnd.wave',

  'text/x-matlab',
  'application/mathematica'
]);

var NON_FREE_LANG = new Set([
  'matlab',
  'mathematica'
]);


function rate(doc, opts) {

  opts = opts || {};

  var scores = {
    ol: !! (doc.license && FREE_LICENSES.has(doc.license)),
    uri: !! (doc['@id'] || doc.url),
    of: !! _isOf(doc),
    re: !! _isRe(doc),
    ld: !! _isLd(doc)
  };

  if (opts.number) {
    return toNumber(scores);
  } else if (opts.string) {
    return toString(scores);
  } else {
    return scores;
  }
};

function toString(scores) {

  var s = [];
  ['ol', 're', 'of', 'uri', 'ld'].forEach(function(x) {
    if(scores[x]) {
      s.push(x);
    }
  });

  return s.join('-');
};


/**
 * returns a 0 to 5 star rating based on the output of `rate()`
 */
function toNumber(scores) {
  return Object.keys(scores || {})
               .reduce(function(stars, category) {
                 return (scores[category] && (stars + 1)) || stars;
               }, 0);
}




/**
 * check if a resource is Of: use non-proprietary formats (e.g.,
 * CSV instead of Excel)
 */
function _isOf(r) {

  var encoding = r.encoding || r.distribution || r;
  var encodings = Array.isArray(encoding) ? encoding : [encoding];
  var formats = encodings.filter(function(x) {return x.encodingFormat || x.fileFormat;})
                         .map(function(x) {return x.encodingFormat || x.fileFormat;});


  if (r.programmingLanguage && r.programmingLanguage.name) {
    return ! NON_FREE_LANG.has(r.programmingLanguage.name);
  } else if (formats.length) {
    return ! formats.every(function(f) {return NON_FREE.has(f);});
  } else {
    return true; //no content and not code JSON-LD is OK
  }

}


/**
 * check if a resource is Re: Make it available as structured data
 * (e.g., Excel instead of image scan of a table)
 */
function _isRe(r) {
  var isMedia;
  var encoding = r.encoding || r;
  var encodings = Array.isArray(encoding) ? encoding : [encoding];
  var reMedia = /^\s*image|\s*video|\s*audio/;

  if (encodings.length) {
    if (encodings.every(function(x) {
      return reMedia.test(x.encodingFormat);
    })) {
      isMedia = true;
    };
  }

  if (isMedia) {
    //we check that it as some machine readable metadata
    return r.description || r.caption || r.transcript;
  } else if (r.sourceCode) {
    //it's a sofware application linked to it's source code
    return true;
  } else {
    //data, article etc... we just check that it's not in an image like format (pdf etc)
    var content = r.encoding || r.distribution || r;
    if (content) {
      content = Array.isArray(content) ? content : [content];
      var reNonRe = /^\s*image|\s*video|\s*audio|\s*application\/pdf|\s*application\/postscript|\s*application\/octet-stream/;
      if (!content.some(function(x) {
        return ! reNonRe.test(x.encodingFormat || x.fileFormat);
      })) {
        return false;
      }
    }
  }

  //there was no content we are good as JSON-LD is machine readable
  return true;
}


/**
 * check if a resource is ld
 * link your data to other data to provide context
 */
function _isLd(r, _isNested) {
  if(!r) {
    return false;
  }

  r = Array.isArray(r) ? r : [r];

  for(var i = 0; i < r.length; i++) {
    if ((_isNested && r[i]['@id']) ||
        (_isNested && r[i].url) ||
        r[i].sameAs ||
        r[i].isBasedOnUrl ||
        (r[i].about && _isLd(r[i].about, true)) ||
        (r[i].citation && _isLd(r[i].citation, true)) ||
        r[i].discussionUrl ||
        r[i].codeRepository
    ) {
      return true;
    }
  }

  return false;
};


exports.rate = rate;
exports.toString = toString;
exports.toNumber = toNumber;
