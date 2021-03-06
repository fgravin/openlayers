/**
 * @module ol/format/WMSCapabilities
 */
import {inherits} from '../index.js';
import {readHref} from '../format/XLink.js';
import XML from '../format/XML.js';
import XSD from '../format/XSD.js';
import {makeArrayPusher, makeObjectPropertyPusher, makeObjectPropertySetter,
  makeStructureNS, pushParseAndPop} from '../xml.js';


/**
 * @classdesc
 * Format for reading WMS capabilities data
 *
 * @constructor
 * @extends {ol.format.XML}
 * @api
 */
const WMSCapabilities = function() {

  XML.call(this);

  /**
   * @type {string|undefined}
   */
  this.version = undefined;
};

inherits(WMSCapabilities, XML);


/**
 * @const
 * @type {Array.<string>}
 */
const NAMESPACE_URIS = [
  null,
  'http://www.opengis.net/wms'
];


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 */
const PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'Service': makeObjectPropertySetter(readService),
    'Capability': makeObjectPropertySetter(readCapability)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 */
const CAPABILITY_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'Request': makeObjectPropertySetter(readRequest),
    'Exception': makeObjectPropertySetter(readException),
    'Layer': makeObjectPropertySetter(readCapabilityLayer)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 */
const SERVICE_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'Name': makeObjectPropertySetter(XSD.readString),
    'Title': makeObjectPropertySetter(XSD.readString),
    'Abstract': makeObjectPropertySetter(XSD.readString),
    'KeywordList': makeObjectPropertySetter(readKeywordList),
    'OnlineResource': makeObjectPropertySetter(readHref),
    'ContactInformation': makeObjectPropertySetter(readContactInformation),
    'Fees': makeObjectPropertySetter(XSD.readString),
    'AccessConstraints': makeObjectPropertySetter(XSD.readString),
    'LayerLimit': makeObjectPropertySetter(XSD.readNonNegativeInteger),
    'MaxWidth': makeObjectPropertySetter(XSD.readNonNegativeInteger),
    'MaxHeight': makeObjectPropertySetter(XSD.readNonNegativeInteger)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 */
const CONTACT_INFORMATION_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'ContactPersonPrimary': makeObjectPropertySetter(readContactPersonPrimary),
    'ContactPosition': makeObjectPropertySetter(XSD.readString),
    'ContactAddress': makeObjectPropertySetter(readContactAddress),
    'ContactVoiceTelephone': makeObjectPropertySetter(XSD.readString),
    'ContactFacsimileTelephone': makeObjectPropertySetter(XSD.readString),
    'ContactElectronicMailAddress': makeObjectPropertySetter(XSD.readString)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 */
const CONTACT_PERSON_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'ContactPerson': makeObjectPropertySetter(XSD.readString),
    'ContactOrganization': makeObjectPropertySetter(XSD.readString)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 */
const CONTACT_ADDRESS_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'AddressType': makeObjectPropertySetter(XSD.readString),
    'Address': makeObjectPropertySetter(XSD.readString),
    'City': makeObjectPropertySetter(XSD.readString),
    'StateOrProvince': makeObjectPropertySetter(XSD.readString),
    'PostCode': makeObjectPropertySetter(XSD.readString),
    'Country': makeObjectPropertySetter(XSD.readString)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 */
const EXCEPTION_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'Format': makeArrayPusher(XSD.readString)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 */
const LAYER_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'Name': makeObjectPropertySetter(XSD.readString),
    'Title': makeObjectPropertySetter(XSD.readString),
    'Abstract': makeObjectPropertySetter(XSD.readString),
    'KeywordList': makeObjectPropertySetter(readKeywordList),
    'CRS': makeObjectPropertyPusher(XSD.readString),
    'EX_GeographicBoundingBox': makeObjectPropertySetter(readEXGeographicBoundingBox),
    'BoundingBox': makeObjectPropertyPusher(readBoundingBox),
    'Dimension': makeObjectPropertyPusher(readDimension),
    'Attribution': makeObjectPropertySetter(readAttribution),
    'AuthorityURL': makeObjectPropertyPusher(readAuthorityURL),
    'Identifier': makeObjectPropertyPusher(XSD.readString),
    'MetadataURL': makeObjectPropertyPusher(readMetadataURL),
    'DataURL': makeObjectPropertyPusher(readFormatOnlineresource),
    'FeatureListURL': makeObjectPropertyPusher(readFormatOnlineresource),
    'Style': makeObjectPropertyPusher(readStyle),
    'MinScaleDenominator': makeObjectPropertySetter(XSD.readDecimal),
    'MaxScaleDenominator': makeObjectPropertySetter(XSD.readDecimal),
    'Layer': makeObjectPropertyPusher(readLayer)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 */
const ATTRIBUTION_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'Title': makeObjectPropertySetter(XSD.readString),
    'OnlineResource': makeObjectPropertySetter(readHref),
    'LogoURL': makeObjectPropertySetter(readSizedFormatOnlineresource)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 */
const EX_GEOGRAPHIC_BOUNDING_BOX_PARSERS =
    makeStructureNS(NAMESPACE_URIS, {
      'westBoundLongitude': makeObjectPropertySetter(XSD.readDecimal),
      'eastBoundLongitude': makeObjectPropertySetter(XSD.readDecimal),
      'southBoundLatitude': makeObjectPropertySetter(XSD.readDecimal),
      'northBoundLatitude': makeObjectPropertySetter(XSD.readDecimal)
    });


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 */
const REQUEST_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'GetCapabilities': makeObjectPropertySetter(readOperationType),
    'GetMap': makeObjectPropertySetter(readOperationType),
    'GetFeatureInfo': makeObjectPropertySetter(readOperationType)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 */
const OPERATIONTYPE_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'Format': makeObjectPropertyPusher(XSD.readString),
    'DCPType': makeObjectPropertyPusher(readDCPType)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 */
const DCPTYPE_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'HTTP': makeObjectPropertySetter(readHTTP)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 */
const HTTP_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'Get': makeObjectPropertySetter(readFormatOnlineresource),
    'Post': makeObjectPropertySetter(readFormatOnlineresource)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 */
const STYLE_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'Name': makeObjectPropertySetter(XSD.readString),
    'Title': makeObjectPropertySetter(XSD.readString),
    'Abstract': makeObjectPropertySetter(XSD.readString),
    'LegendURL': makeObjectPropertyPusher(readSizedFormatOnlineresource),
    'StyleSheetURL': makeObjectPropertySetter(readFormatOnlineresource),
    'StyleURL': makeObjectPropertySetter(readFormatOnlineresource)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 */
const FORMAT_ONLINERESOURCE_PARSERS =
    makeStructureNS(NAMESPACE_URIS, {
      'Format': makeObjectPropertySetter(XSD.readString),
      'OnlineResource': makeObjectPropertySetter(readHref)
    });


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 */
const KEYWORDLIST_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'Keyword': makeArrayPusher(XSD.readString)
  });


/**
 * Read a WMS capabilities document.
 *
 * @function
 * @param {Document|Node|string} source The XML source.
 * @return {Object} An object representing the WMS capabilities.
 * @api
 */
WMSCapabilities.prototype.read;


/**
 * @inheritDoc
 */
WMSCapabilities.prototype.readFromDocument = function(doc) {
  for (let n = doc.firstChild; n; n = n.nextSibling) {
    if (n.nodeType == Node.ELEMENT_NODE) {
      return this.readFromNode(n);
    }
  }
  return null;
};


/**
 * @inheritDoc
 */
WMSCapabilities.prototype.readFromNode = function(node) {
  this.version = node.getAttribute('version').trim();
  const wmsCapabilityObject = pushParseAndPop({
    'version': this.version
  }, PARSERS, node, []);
  return wmsCapabilityObject ? wmsCapabilityObject : null;
};


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} Attribution object.
 */
function readAttribution(node, objectStack) {
  return pushParseAndPop({}, ATTRIBUTION_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object} Bounding box object.
 */
function readBoundingBox(node, objectStack) {
  const extent = [
    XSD.readDecimalString(node.getAttribute('minx')),
    XSD.readDecimalString(node.getAttribute('miny')),
    XSD.readDecimalString(node.getAttribute('maxx')),
    XSD.readDecimalString(node.getAttribute('maxy'))
  ];

  const resolutions = [
    XSD.readDecimalString(node.getAttribute('resx')),
    XSD.readDecimalString(node.getAttribute('resy'))
  ];

  return {
    'crs': node.getAttribute('CRS'),
    'extent': extent,
    'res': resolutions
  };
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {ol.Extent|undefined} Bounding box object.
 */
function readEXGeographicBoundingBox(node, objectStack) {
  const geographicBoundingBox = pushParseAndPop(
    {},
    EX_GEOGRAPHIC_BOUNDING_BOX_PARSERS,
    node, objectStack);
  if (!geographicBoundingBox) {
    return undefined;
  }
  const westBoundLongitude = /** @type {number|undefined} */
        (geographicBoundingBox['westBoundLongitude']);
  const southBoundLatitude = /** @type {number|undefined} */
        (geographicBoundingBox['southBoundLatitude']);
  const eastBoundLongitude = /** @type {number|undefined} */
        (geographicBoundingBox['eastBoundLongitude']);
  const northBoundLatitude = /** @type {number|undefined} */
        (geographicBoundingBox['northBoundLatitude']);
  if (westBoundLongitude === undefined || southBoundLatitude === undefined ||
        eastBoundLongitude === undefined || northBoundLatitude === undefined) {
    return undefined;
  }
  return [
    westBoundLongitude, southBoundLatitude,
    eastBoundLongitude, northBoundLatitude
  ];
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} Capability object.
 */
function readCapability(node, objectStack) {
  return pushParseAndPop({}, CAPABILITY_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} Service object.
 */
function readService(node, objectStack) {
  return pushParseAndPop({}, SERVICE_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} Contact information object.
 */
function readContactInformation(node, objectStack) {
  return pushParseAndPop({}, CONTACT_INFORMATION_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} Contact person object.
 */
function readContactPersonPrimary(node, objectStack) {
  return pushParseAndPop({}, CONTACT_PERSON_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} Contact address object.
 */
function readContactAddress(node, objectStack) {
  return pushParseAndPop({}, CONTACT_ADDRESS_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Array.<string>|undefined} Format array.
 */
function readException(node, objectStack) {
  return pushParseAndPop([], EXCEPTION_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} Layer object.
 */
function readCapabilityLayer(node, objectStack) {
  return pushParseAndPop({}, LAYER_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} Layer object.
 */
function readLayer(node, objectStack) {
  const parentLayerObject = /**  @type {Object.<string,*>} */
        (objectStack[objectStack.length - 1]);

  const layerObject = pushParseAndPop({}, LAYER_PARSERS, node, objectStack);

  if (!layerObject) {
    return undefined;
  }
  let queryable = XSD.readBooleanString(node.getAttribute('queryable'));
  if (queryable === undefined) {
    queryable = parentLayerObject['queryable'];
  }
  layerObject['queryable'] = queryable !== undefined ? queryable : false;

  let cascaded = XSD.readNonNegativeIntegerString(
    node.getAttribute('cascaded'));
  if (cascaded === undefined) {
    cascaded = parentLayerObject['cascaded'];
  }
  layerObject['cascaded'] = cascaded;

  let opaque = XSD.readBooleanString(node.getAttribute('opaque'));
  if (opaque === undefined) {
    opaque = parentLayerObject['opaque'];
  }
  layerObject['opaque'] = opaque !== undefined ? opaque : false;

  let noSubsets = XSD.readBooleanString(node.getAttribute('noSubsets'));
  if (noSubsets === undefined) {
    noSubsets = parentLayerObject['noSubsets'];
  }
  layerObject['noSubsets'] = noSubsets !== undefined ? noSubsets : false;

  let fixedWidth = XSD.readDecimalString(node.getAttribute('fixedWidth'));
  if (!fixedWidth) {
    fixedWidth = parentLayerObject['fixedWidth'];
  }
  layerObject['fixedWidth'] = fixedWidth;

  let fixedHeight = XSD.readDecimalString(node.getAttribute('fixedHeight'));
  if (!fixedHeight) {
    fixedHeight = parentLayerObject['fixedHeight'];
  }
  layerObject['fixedHeight'] = fixedHeight;

  // See 7.2.4.8
  const addKeys = ['Style', 'CRS', 'AuthorityURL'];
  addKeys.forEach(function(key) {
    if (key in parentLayerObject) {
      const childValue = layerObject[key] || [];
      layerObject[key] = childValue.concat(parentLayerObject[key]);
    }
  });

  const replaceKeys = ['EX_GeographicBoundingBox', 'BoundingBox', 'Dimension',
    'Attribution', 'MinScaleDenominator', 'MaxScaleDenominator'];
  replaceKeys.forEach(function(key) {
    if (!(key in layerObject)) {
      const parentValue = parentLayerObject[key];
      layerObject[key] = parentValue;
    }
  });

  return layerObject;
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object} Dimension object.
 */
function readDimension(node, objectStack) {
  const dimensionObject = {
    'name': node.getAttribute('name'),
    'units': node.getAttribute('units'),
    'unitSymbol': node.getAttribute('unitSymbol'),
    'default': node.getAttribute('default'),
    'multipleValues': XSD.readBooleanString(node.getAttribute('multipleValues')),
    'nearestValue': XSD.readBooleanString(node.getAttribute('nearestValue')),
    'current': XSD.readBooleanString(node.getAttribute('current')),
    'values': XSD.readString(node)
  };
  return dimensionObject;
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} Online resource object.
 */
function readFormatOnlineresource(node, objectStack) {
  return pushParseAndPop({}, FORMAT_ONLINERESOURCE_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} Request object.
 */
function readRequest(node, objectStack) {
  return pushParseAndPop({}, REQUEST_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} DCP type object.
 */
function readDCPType(node, objectStack) {
  return pushParseAndPop({}, DCPTYPE_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} HTTP object.
 */
function readHTTP(node, objectStack) {
  return pushParseAndPop({}, HTTP_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} Operation type object.
 */
function readOperationType(node, objectStack) {
  return pushParseAndPop({}, OPERATIONTYPE_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} Online resource object.
 */
function readSizedFormatOnlineresource(node, objectStack) {
  const formatOnlineresource = readFormatOnlineresource(node, objectStack);
  if (formatOnlineresource) {
    const size = [
      XSD.readNonNegativeIntegerString(node.getAttribute('width')),
      XSD.readNonNegativeIntegerString(node.getAttribute('height'))
    ];
    formatOnlineresource['size'] = size;
    return formatOnlineresource;
  }
  return undefined;
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} Authority URL object.
 */
function readAuthorityURL(node, objectStack) {
  const authorityObject = readFormatOnlineresource(node, objectStack);
  if (authorityObject) {
    authorityObject['name'] = node.getAttribute('name');
    return authorityObject;
  }
  return undefined;
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} Metadata URL object.
 */
function readMetadataURL(node, objectStack) {
  const metadataObject = readFormatOnlineresource(node, objectStack);
  if (metadataObject) {
    metadataObject['type'] = node.getAttribute('type');
    return metadataObject;
  }
  return undefined;
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} Style object.
 */
function readStyle(node, objectStack) {
  return pushParseAndPop({}, STYLE_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Array.<string>|undefined} Keyword list.
 */
function readKeywordList(node, objectStack) {
  return pushParseAndPop([], KEYWORDLIST_PARSERS, node, objectStack);
}


export default WMSCapabilities;
