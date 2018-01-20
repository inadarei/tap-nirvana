#!/usr/bin/env node
const through = require('through2');
const duplexer = require('duplexer');

var vdiff = require('variable-diff');

var jsdiff = require('json-diff');
var { colorize } = require('json-diff/lib/colorize');

var jsondiffpatch = require("jsondiffpatch");

const expected =  {
  "class": ["order"],
  "properties": {
    "orderNumber": 42,
    "foonull": null,
    "itemCount": 3,
    "status": "pending"
  },
  "entities": [
    {
      "properties": {"entityId": "kfk24", "amount": 999},
      "rel": ["foo", "bar"],
      "class": ["foo", "bar"],
      "links": [{"rel": ["self"], "href": "http://api.x.io/foo/bar"}]
    },
    {
      "class": ["items", "collection"],
      "rel": ["http://x.io/rels/order-items"],
      "href": "http://api.x.io/orders/42/items"
    },
    {
      "class": ["items", "collection"],
      "rel": ["http://x.io/rels/discounts", "second"],
      "href": "http://api.x.io/discounts/52/items",
      "title": "This is testing proper translation of link titles"
    },
    {
      "properties": {"customerId": "pj123", "name": "Peter Joseph"},
      "class": ["info", "customer"],
      "rel": ["info", "customer"],
      "links": [{"rel": ["self"], "href": "http://api.x.io/customers/pj123"}]
    }
  ],
  "actions": [
    {
      "name": "add-item",
      "title": "Add Item",
      "method": "POST",
      "href": "http://api.x.io/orders/42/items",
      "type": "application/x-www-form-urlencoded",
      "fields": [
        {"name": "orderNumber", "type": "hidden", "value": "42"},
        {"name": "productCode", "type": "text"},
        {"name": "quantity", "type": "number"}
      ]
    }
  ],
  "links": [
    {"rel": ["self"], "href": "http://api.x.io/orders/42"},
    {"rel": ["previous"], "href": "http://api.x.io/orders/41"},
    {"rel": ["next"], "href": "http://api.x.io/orders/43"}
  ]
};

const actual =  {
  "class": ["order"],
  "properties": {
    "orderNumber": 42,
    "foonull": null,
    "itemCount": 3,
    "status": "pending"
  },
  "entities": [
    {
      "properties": {"entityId": "kfk24", "amount": 999},
      "rel": ["foo", "bar"],
      "class": ["foo", "bar"],
      "links": [{"rel": ["self"], "href": "http://api.x.io/foo/bar"}]
    },
    {
      "class": ["items", "collection"],
      "rel": ["http://x.io/rels/order-items"],
      "href": "http://api.x.io/orders/42/items"
    },
    {
      "class": ["items", "collection"],
      "rel": ["http://x.io/rels/discounts", "second"],
      "href": "http://api.x.io/discounts/52/items",
      "title": "This is testing proper translation of link titles",
      "new": null
    },
    {
      "properties": {"customerId": "pj123", "name": "Peter Joseph"},
      "class": ["info", "customer"],
      "rel": ["info", "customer"],
      "links": [{"rel": ["self"], "href": "http://api.x.io/customers/pj123"}]
    }
  ],
  "actions": [
    {
      "name": "add-item",
      "title": "Add Item",
      "method": "POST",
      "href": "http://api.x.io/orders/42/items",
      "type": "application/x-www-form-urlencoded",
      "fields": [
        {"name": "orderNumber", "type": "hidden", "value": "42"},
        {"name": "productCode", "type": "text"},
        {"name": "quantity", "type": "number"}
      ]
    }
  ],
  "links": [
    {"rel": ["self"], "href": "http://api.x.io/orders/42"},
    {"rel": ["previous"], "href": "http://api.x.io/orders/41"},
    {"rel": ["next"], "href": "http://api.x.io/orders/43"}
  ]
};


 
var difference = colorize(jsdiff.diff(expected, actual));
console.log("json-diff");
console.log(difference);


// ---------

console.log("variable-diff");
result = vdiff(expected, actual).text;
console.log(result);

// --------
console.log("jsondiffpatch");
var delta = jsondiffpatch.diff(expected, actual);
var deltaColor = jsondiffpatch.formatters.console.format(delta);
console.log(deltaColor);