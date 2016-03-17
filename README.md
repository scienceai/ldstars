# ld-stars

Rate (as in
[five stars linked data](http://www.w3.org/DesignIssues/LinkedData.html))
a [schema.org](http://schema.org) document in
[JSON-LD](http://json-ld.org/).

![Logo](http://www.w3.org/DesignIssues/diagrams/lod/597992118v2_350x350_Back.jpg)

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
import * as ldstars from 'ldstars';
```

### ldstars.rate(doc [, opts])

Rates a schema.org [CreativeWork](http://schema.org/CreativeWork) JSON-LD document.

`opts` include `string: true`.

returns a rating object.

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


### ldstars.toString(rating)

Converts a rating object to a string:

```
ldstars.toString({ ol: false, of: false, re: true, uri:false, ld: true })
```

returns `'re-ld'`.
