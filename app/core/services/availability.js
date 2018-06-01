angular.module('fringeApp').service('Availability', ['User', function(User) {
    this.isSlotAvailable = function(slot) {
        return User.getUnavailability().indexOf('' + slot) === -1;
    };

    this.setSlotAvaialble = function(slot) {
        var unavailability = User.getUnavailability();
        unavailability.remove('' + slot);
        User.setUnavailability(unavailability);
    };

    this.setSlotUnavailable = function(slot) {
        if (this.isSlotAvailable(slot)) {
            var unavailability = User.getUnavailability();
            unavailability.push('' + slot);
            User.setUnavailability(unavailability);
        }
    };

    this.isUserAvailable = function(startTime, stopTime) {
        var unavailability = User.getUnavailability(),
            i = unavailability.length;

        while (i--) {
            var u = parseInt(unavailability[i]);
            if (! (stopTime < u || startTime > u + 3600)) {
                return false;
            }
        }

        return true;
    };
}]);