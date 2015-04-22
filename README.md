# ld-stars

Rate (as in
[five stars linked data](http://www.w3.org/DesignIssues/LinkedData.html))
a [schema.org](http://schema.org) document in
[JSON-LD](http://json-ld.org/).

![Logo](http://www.w3.org/DesignIssues/diagrams/lod/597992118v2_350x350_Back.jpg)

[![Build Status](https://travis-ci.org/standard-analytics/ldstars.svg)](https://travis-ci.org/standard-analytics/ldstars)
[![Coverage Status](https://coveralls.io/repos/standard-analytics/ldstars/badge.svg?branch=master)](https://coveralls.io/r/standard-analytics/ldstars?branch=master)
[![Dependency Status](https://david-dm.org/standard-analytics/ldstars.svg)](https://david-dm.org/standard-analytics/ldstars)
[![devDependency Status](https://david-dm.org/standard-analytics/ldstars/dev-status.svg)](https://david-dm.org/standard-analytics/ldstars#info=devDependencies)
___

## Background

Developed by Tim Berners-Lee, the purpose of the 5-star rating system is to encourage adoption of best linked open data practices. Here are the requirements, taken from his [original proposal](http://www.w3.org/DesignIssues/LinkedData.html):

★ Available on the web (whatever format) but with an open licence, to be Open Data

★★ Available as machine-readable structured data (e.g. excel instead of image scan of a table)

★★★ as (2) plus non-proprietary format (e.g. CSV instead of excel)

★★★★ All the above plus, Use open standards from W3C (RDF and SPARQL) to identify things, so that people can point at your stuff

★★★★★ All the above, plus: Link your data to other people’s data to provide context

## API

```
var ldstars = require('ldstars');
```

A scores object is as follows:

```
{ 
  ol: true,  
  of: true,  
  re: true,  
  uri: true,  
  ld: true  
}
```

+ `ol`: open license

+ `of`: open format

+ `re`: machine readable

+ `uri`: uniform resource identifiers

+ `ld`: linked data

### ldstars.rate(package [, opts])

Rates a package containing any or all of `dataset`, `sourceCode`, `image`, `article`, `audio`, or `video`, calling `rateResource` for each.

`opts` include `string: true` or `number: true`.


### ldstars.rateResource(resource, license [, opts])

Rates a resource +/- license:

```
ldstars.rateResource(
  {
    programmingLanguage: { 
      name: 'python' 
    }
  }, 
  'CC0-1.0', 
  { 
    string: true 
  }
)
```

returns `'ol-of'`.

### ldstars.toString(scores)

Converts a score object to a string:

```
ldstars.toString({ ol: false, of: false, re: true, uri:false, ld: true })
```

returns `'re-ld'`.


### ldstars.toNumber(scores)

Converts a score object to a number between 0 and 5:

```
ldstars.toNumber({ ol: true,  of: true,  re: true,  uri: true,  ld: true  })
```

returns `5`.

