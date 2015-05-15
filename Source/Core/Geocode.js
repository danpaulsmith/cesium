/*global define*/
define([
        './BingMapsApi',
        './Cartesian3',
        './defaultValue',
        './defined',
        './defineProperties',
        './DeveloperError',
        './jsonp',
        './Matrix4',
        './Rectangle',
        '../ThirdParty/when'
    ], function(
        BingMapsApi,
        Cartesian3,
        defaultValue,
        defined,
        defineProperties,
        DeveloperError,
        jsonp,
        Matrix4,
        Rectangle,
        when) {
    "use strict";

    function bingAPIResultFunction(result) {
        if (result.resourceSets.length === 0) {
            return;
        }

        var resourceSet = result.resourceSets[0];
        if (resourceSet.resources.length === 0) {
            return;
        }

        var resource = resourceSet.resources[0];

        var bbox = resource.bbox;
        var south = bbox[0];
        var west = bbox[1];
        var north = bbox[2];
        var east = bbox[3];
        var rectangle = Rectangle.fromDegrees(west, south, east, north);
        return {
            name: resource.name,
            rectangle: rectangle
        };
    }

    function getBingAPIOptions(geocode, query) {
        return {
            parameters : {
                query : query,
                key : geocode.key
            },
            callbackParameterName : 'jsonp'
        };
    }

    var Geocode = function(options) {
        this.url = defaultValue(options.url, '//dev.virtualearth.net/REST/v1/Locations');
        if (this.url.length > 0 && this.url[this.url.length - 1] !== '/') {
            this.url += '/';
        }

        this.key = defined(options.url) ? options.key : BingMapsApi.getKey(options.key);
        this._geocodeInProgress = undefined;
        this.callback = defaultValue(options.callback, bingAPIResultFunction);
        this.getJsonOptions = defaultValue(options.getOptions, getBingAPIOptions);
    };

    Geocode.prototype.geocode = function (input) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(input)) {
            throw new DeveloperError('input is required.');
        }
        //>>includeEnd('debug');

        var that = this;
        var promise = jsonp(this.url, this.getJsonOptions(this, input));

        var geocodeInProgress = this._geocodeInProgress = when(promise, function(result) {
            if (geocodeInProgress.cancel) {
                return;
            }
            return that.callback(result);
         }, function() {
            if (geocodeInProgress.cancel) {
                return;
            }
        });
        return geocodeInProgress;
    };

    Geocode.prototype.cancelGeocode = function() {
        if (defined(this._geocodeInProgress)) {
            this._geocodeInProgress.cancel = true;
            this._geocodeInProgress = undefined;
        }
    };

    return Geocode;
});