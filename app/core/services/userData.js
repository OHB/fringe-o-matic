angular.module('fringeApp').service('UserData', ['$q', 'debounce', function($q, debounce) {
    var self = this,
        initData = {
            preferences: {},
            unavailability: [],
            schedule: [],
            maybe: [],
            settings: {
                scheduleMode: 'full'
            }
        },
        basicGetter = function(type) {
            return function() {
                return data[type];
            };
        },
        basicSetter = function(type) {
            return function(value) {
                data[type] = value;
                self.save();
            };
        },
        onSave = function() {},
        data = store.has('fringeData') ? store.get('fringeData') : angular.copy(initData);

    this.getPreferences  = basicGetter('preferences');
    this.setPreferences = basicSetter('preferences');
    this.getUnavailability = basicGetter('unavailability');
    this.setUnavailability = basicSetter('unavailability');
    this.getSchedule = basicGetter('schedule');
    this.setSchedule = basicSetter('schedule');
    this.getMaybes = basicGetter('maybe');
    this.setMaybes = basicSetter('maybe');
    this.getSettings = basicGetter('settings');
    this.setSettings = basicSetter('settings');

    this.reset = function() {
        store.set('fringeData', angular.copy(initData));
        data = store.get('fringeData');
    };
    this.save = debounce(function() {
        var deferred = $q.defer();
        onSave(deferred.promise);

        store.set('fringeData', data);
        setTimeout(deferred.resolve, 2000);
    }, 5000);

    this.export = function() {
        return JSON.stringify(data);
    };
    this.import = function(input) {
        var newData = JSON.parse(input);

        this.reset();
        angular.extend(data, newData);

        this.save();
    };

    this.onSave = function(fn) {
        onSave = fn;
    };
}]);