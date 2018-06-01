angular.module('fringeApp').service('User', ['$q', '$http', 'debounce', function($q, $http, debounce) {
    var self = this,
        data,
        lastSavedData,
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

    this.signIn = function(googleToken) {
        var deferred = $q.defer();

        if (googleToken) {
            $http.post('api/signin.php', {googleToken: googleToken}).then(function(response) {
                data = response.data;
                lastSavedData = angular.copy(data);
                // $crisp.push(["set", "session:data", ["helpCode", data.account.helpCode]]);
                deferred.resolve();
            }, function() {
                deferred.reject();
            });
        } else {
            deferred.reject();
        }
        return deferred.promise;
    };

    this.signOut = function() {
        // $crisp.push(["set", "session:data", ["helpCode", '']]);
        data = {
            account: {},
            preferences: {},
            unavailability: [],
            schedule: [],
            maybe: [],
            settings: {
                scheduleMode: 'full'
            }
        };
    };

    this.save = debounce(function() {
        if (self.isSignedIn() && ! angular.equals(data, lastSavedData)) {
            var deferred = $q.defer();
            onSave(deferred.promise);
            $http.post('api/save.php', data).then(deferred.resolve, deferred.reject);
            lastSavedData = angular.copy(data);
        }
    }, 1000);

    this.signOut();

    this.getAccount = basicGetter('account');
    this.getPreferences = basicGetter('preferences');
    this.setPreferences = basicSetter('preferences');
    this.getUnavailability = basicGetter('unavailability');
    this.setUnavailability = basicSetter('unavailability');
    this.getSchedule = basicGetter('schedule');
    this.setSchedule = basicSetter('schedule');
    this.getMaybes = basicGetter('maybe');
    this.setMaybes = basicSetter('maybe');
    this.getSettings = basicGetter('settings');
    this.setSettings = basicSetter('settings');

    this.isSignedIn = function() {
        return data.account.privateHash !== undefined;
    };

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