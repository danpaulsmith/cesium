/*global defineSuite*/
defineSuite([
        'Core/Geocode',
        'Core/Cartesian3',
        'Specs/pollToPromise'
    ], function(
        Geocode,
        Cartesian3,
        pollToPromise) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn*/

    it('constructor sets expected properties', function() {
        var url = 'bing.invalid/';
        var key = 'testKey';
        var callback = function(result){};
        var getJsonOptions = function(query){return {};};

        var geocode = new Geocode({
            url: url,
            key: key,
            callback: callback,
            getJsonOptions: getJsonOptions
        });
        expect(geocode.url).toBe(url);
        expect(geocode.key).toBe(key);
        expect(geocode.callback).toBe(callback);
        expect(geocode.getJsonOptions).toBe(getJsonOptions);
    });

    it('geocodes', function() {
        var geocode = new Geocode();
        //TODO
    });
});