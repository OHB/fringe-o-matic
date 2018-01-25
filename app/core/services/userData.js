angular.module('fringeApp').service('UserData', ['$q', '$http', 'debounce', function($q, $http, debounce) {
    var self = this,
        currentUserId,
        data,
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
        onSave = function() {};

    this.load = function(userId) {
        var deferred = $q.defer();
        currentUserId = userId;

        if (userId) {
            $http.get('api/getUserData.php?id=' + userId).then(function(response) {
                data = response.data;
                deferred.resolve();
                console.log('User data loaded');
            }, function() {
                deferred.reject();
            });
        } else {
            deferred.reject();
        }

        return deferred.promise;
    };

    this.save = debounce(function() {
        var deferred = $q.defer();

        onSave(deferred.promise);

        if (currentUserId !== undefined) {
            $http.post('api/setUserData.php', {id: currentUserId, data: data}).then(deferred.resolve, deferred.reject);
        } else {
            deferred.reject();
        }
    }, 5000);

    this.reset = function() {
        data = {
            preferences: {},
            unavailability: [],
            schedule: [],
            maybe: [],
            settings: {
                scheduleMode: 'full'
            }
        };
        currentUserId = undefined;
    };

    this.reset();

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

    this.export = function() {
        return JSON.stringify(data);
    };

    this.import = function(input) {
        data = JSON.parse(input);
        this.save();
    };

    this.onSave = function(fn) {
        onSave = fn;
    };
}]);