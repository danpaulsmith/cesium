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

    function getBingAPIOptions(query, geocode) {
        return {
            parameters : {
                query : query,
                key : geocode.key
            },
            callbackParameterName : 'jsonp'
        };
    }

    /**
     *
     * @alias Geocode
     * @constructor
     *
     * @param {Object} options Object with the following properties:
     * @param {String} [options.url='//dev.virtualearth.net'] The base URL of the Bing Maps API.
     * @param {String} [options.key] The Bing Maps key for your application, which can be
     *        created at {@link https://www.bingmapsportal.com}.
     *        If this parameter is not provided, {@link BingMapsApi.defaultKey} is used.
     *        If {@link BingMapsApi.defaultKey} is undefined as well, a message is
     *        written to the console reminding you that you must create and supply a Bing Maps
     *        key as soon as possible.  Please do not deploy an application that uses
     *        this widget without creating a separate key for your application.
     * @param {Function} [options.callback] A function to process the result of the jsonp resource request.
     * @param {FUnction} [options.getOptions] A function that returns the options sent to the jsonp resource request.
     *
     */
    var Geocode = function(options) {
        options = defaultValue(options, {});
        this.url = defaultValue(options.url, '//dev.virtualearth.net/REST/v1/Locations');
        if (this.url.length > 0 && this.url[this.url.length - 1] !== '/') {
            this.url += '/';
        }

        this.key = defined(options.url) ? options.key : BingMapsApi.getKey(options.key);
        this._geocodeInProgress = undefined;
        this.callback = defaultValue(options.callback, bingAPIResultFunction);
        this.getJsonOptions = defaultValue(options.getJsonOptions, getBingAPIOptions);
    };

    /**
     * Geocodes a given input
     *
     * @param {String} input
     * @returns {Object} The result
     */
    Geocode.prototype.geocode = function (input) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(input)) {
            throw new DeveloperError('input is required.');
        }
        //>>includeEnd('debug');

        var that = this;
        var promise = jsonp(this.url, this.getJsonOptions(input, this));

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

    /**
     * Cancels the geocode in progress
     */
    Geocode.prototype.cancelGeocode = function() {
        if (defined(this._geocodeInProgress)) {
            this._geocodeInProgress.cancel = true;
            this._geocodeInProgress = undefined;
        }
    };

    return Geocode;
});