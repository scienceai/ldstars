import spdxLicenseList from 'spdx-license-list';

const freeSpdxIds = Object.keys(spdxLicenseList).filter(key => {
  return spdxLicenseList[key].osiApproved || /^CC/.test(key); // add creative common licenses
});
function isFreeLicense(value) {
  if (!value) return false;
  value = Array.isArray(value) ? value : [value];
  for (let v of value) {
    if (typeof v === 'string') {
      if (
        freeSpdxIds.some(id => {
          const license = spdxLicenseList[id];
          return (
            v === `spdx:${id}` ||
            v === id ||
            v === license.name ||
            v === license.url
          );
        })
      ) {
        return true;
      }
    }
  }
  return false;
}

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
  var ratings = {
    ol: !! isOl(doc),
    uri: !! isUri(doc),
    of: !! isOf(doc),
    re: !! isRe(doc),
    ld: !! isLd(doc)
  };

  return opts.string ? toString(ratings) : ratings;
};

export function toString(ratings) {
  var s = [];
  ['ol', 're', 'of', 'uri', 'ld'].forEach(function(x) {
    if(ratings[x]) {
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
  const licenses = Array.isArray(r.license) ? r.license : [r.license];
  return licenses.some(license => {
    return (
      isFreeLicense(license['@id']) ||
      isFreeLicense(license.url) ||
      isFreeLicense(license) ||
      isFreeLicense(license.name) ||
      isFreeLicense(license.alternateName) ||
      isFreeLicense(license.sameAs)
    );
  });
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
    if (
      (_isNested && r[i]['@id']) ||
      (_isNested && r[i].url) ||
      (_isNested && (typeof r[i] == 'string')) ||
      (r[i].sameAs && (!Array.isArray(r[i].sameAs) || r[i].sameAs.length)) ||
      (r[i].isBasedOnUrl && (!Array.isArray(r[i].isBasedOnUrl) || r[i].isBasedOnUrl.length)) ||
      (r[i].about && isLd(r[i].about, true)) ||
      (r[i].citation && isLd(r[i].citation, true)) ||
      (r[i].mainEntity && isLd(r[i].mainEntity, true)) ||
      (r[i].mainEntityOfPage && isLd(r[i].mainEntityOfPage, true)) ||
      r[i].exampleOfWork ||
      r[i].discussionUrl ||
      r[i].codeRepository
    ) {
      return true;
    }
  }

  return false;
};
