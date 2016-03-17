import spdxLicenseList from 'spdx-license-list';

const FREE_LICENSES = new Set(Object.keys(spdxLicenseList).filter(key => {
  return spdxLicenseList[key].osiApproved || /^CC/.test(key);
}));

const FREE_LICENSE_URLS = new Set(
  Object.keys(spdxLicenseList).filter(key => {
    return spdxLicenseList[key].url && spdxLicenseList[key].osiApproved || /^CC/.test(key);
  }).map(key => spdxLicenseList[key].url)
);

const NON_FREE = new Set([
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

const NON_FREE_LANG = new Set([
  'matlab',
  'mathematica'
]);

export function rate(doc, opts = {}) {
  var scores = {
    ol: !! isOl(doc),
    uri: !! isUri(doc),
    of: !! isOf(doc),
    re: !! isRe(doc),
    ld: !! isLd(doc)
  };

  return opts.string ? toString(scores) : scores;
};

export function toString(scores) {
  var s = [];
  ['ol', 're', 'of', 'uri', 'ld'].forEach(function(x) {
    if(scores[x]) {
      s.push(x);
    }
  });

  return s.join('-');
};


/**
 * check if a resource is URI: (use URIs to denote things, so that
 * people can point at your stuff)
 */
export function isUri(r) {
  return (
    r['@id'] ||
    r.url ||
    (r.sameAs && (!Array.isArray(r.sameAs) || r.sameAs.length))
  );
};


/**
 * check if a resource is OL: open license
 */
export function isOl(r) {
  if (!r.license) return false;

  if (
    FREE_LICENSE_URLS.has(r.license['@id']) ||
    FREE_LICENSE_URLS.has(r.license.url)
  ) {
    return true;
  }

  if (r.sameAs) {
    const sameAs = Array.isArray(sameAs) ? sameAs : [sameAs];
    if (sameAs.some(uri => FREE_LICENSE_URLS.has(uri))) {
      return true;
    }
  }

  if (typeof r.license === 'string') {
    if (FREE_LICENSE_URLS.has(r.license)) {
      return true;
    }
  } else {
    if (FREE_LICENSES.has(r.license.name) || FREE_LICENSES.has(r.license.alternateName)) {
      return true;
    }
  }

  return false;
};




/**
 * check if a resource is Of: use non-proprietary formats (e.g.,
 * CSV instead of Excel)
 */
export function isOf(r) {

  var encoding = r.encoding || r.distribution || r;
  var encodings = Array.isArray(encoding) ? encoding : [encoding];
  var formats = encodings.filter(x => x.fileFormat)
                         .map(x =>  x.fileFormat);

  if (r.programmingLanguage && r.programmingLanguage.name) {
    return ! NON_FREE_LANG.has(r.programmingLanguage.name);
  } else if (formats.length) {
    return ! formats.every(function(f) {return NON_FREE.has(f);});
  } else {
    return true; //no content and not code JSON-LD is OK
  }

};


/**
 * check if a resource is Re: Make it available as structured data
 * (e.g., Excel instead of image scan of a table)
 */
export function isRe(r) {
  var isMedia;
  var encoding = r.encoding || r;
  var encodings = Array.isArray(encoding) ? encoding : [encoding];
  var reMedia = /^\s*image|\s*video|\s*audio/;

  if (encodings.length) {
    if (encodings.every(function(x) {
      return reMedia.test(x.fileFormat);
    })) {
      isMedia = true;
    };
  }

  if (isMedia) {
    //we check that it as some machine readable metadata
    return r.description || r.caption || r.transcript;
  } else if (r.targetProductOf) {
    // currently schema.org lacks a reverse property for targetProduct (on SoftwareSourceCode)
    // it's a sofware application linked to it's source code
    return true;
  } else {
    //data, article etc... we just check that it's not in an image like format (pdf etc)
    var content = r.encoding || r.distribution || r;
    if (content) {
      content = Array.isArray(content) ? content : [content];
      var reNonRe = /^\s*image|\s*video|\s*audio|\s*application\/pdf|\s*application\/postscript|\s*application\/octet-stream/;
      if (!content.some(function(x) {
        return ! reNonRe.test(x.fileFormat);
      })) {
        return false;
      }
    }
  }

  //there was no content we are good as JSON-LD is machine readable
  return true;
};


/**
 * check if a resource is ld:
 * link your data to other data to provide context
 */
export function isLd(r, _isNested) {
  if (!r) {
    return false;
  }

  r = Array.isArray(r) ? r : [r];

  for(var i = 0; i < r.length; i++) {
    if ((_isNested && r[i]['@id']) ||
        (_isNested && r[i].url) ||
        (r[i].sameAs && (!Array.isArray(r[i].sameAs) || r[i].sameAs.length)) ||
        (r[i].isBasedOnUrl && (!Array.isArray(r[i].isBasedOnUrl) || r[i].isBase)) ||
        (r[i].about && isLd(r[i].about, true)) ||
        (r[i].citation && isLd(r[i].citation, true)) ||
        r[i].exampleOfWork ||
        r[i].discussionUrl ||
        r[i].codeRepository
    ) {
      return true;
    }
  }

  return false;
};
