angular.module('fringeApp').service('Availability', ['UserData', function(UserData) {
    this.isSlotAvailable = function(slot) {
        return UserData.getUnavailability().indexOf(slot) === -1;
    };

    this.setSlotAvaialble = function(slot) {
        var unavailability = UserData.getUnavailability();
        unavailability.remove(slot);
        UserData.setUnavailability(unavailability);
    };

    this.setSlotUnavailable = function(slot) {
        if (this.isSlotAvailable(slot)) {
            var unavailability = UserData.getUnavailability();
            unavailability.push(slot);
            UserData.setUnavailability(unavailability);
        }
    };

    this.isUserAvailable = function(startTime, stopTime) {
        var unavailability = UserData.getUnavailability(),
            i = unavailability.length;

        while (i--) {
            var u = unavailability[i];
            if (! (stopTime < u || startTime > u + 1800)) {
                return false;
            }
        }

        return true;
    };
}]);