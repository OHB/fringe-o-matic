angular.module('fringeApp').component('myFringeAvailability', {
    templateUrl: 'app/myFringe/availability/availability.html',
    controller: ['$scope', '$uibModal', '$timeout', '$q', 'Data', 'Schedule', 'Availability', function($scope, $uibModal, $timeout, $q, Data, Schedule, Availability) {
        $scope.moment = moment;
        $scope.currentPage = 1;

        $scope.performancesInSlot = {};

        $timeout(function() {
            Data.getAvailabilitySlots().then(function(availabilitySlots) {
                $scope.availabilitySlots = availabilitySlots;
                $scope.totalItems = Object.keys($scope.availabilitySlots).length - 4;

                var qList = {};
                angular.forEach(availabilitySlots, function(slots) {
                    angular.forEach(slots, function(slot) {
                        qList[slot] = Schedule.getPerformancesInSlot(slot, slot + 1800);
                    });
                });
                $q.all(qList).then(function(slotPerformances) {
                    $scope.performancesInSlot = slotPerformances;

                    Data.getAvailabilitySlotsAll().then(function(availabilitySlotsAll) {
                        $scope.availabilitySlotsAll = availabilitySlotsAll;
                    });
                });
            });
        }, 100);

        $scope.hasAvailability = function(slot) {
            return Availability.isSlotAvailable(slot);
        };

        $scope.toggleAvailability = function(slot) {
            if ($scope.hasAvailability(slot)) {
                Schedule.setSlotUnavaialble(slot);
            } else {
                Schedule.setSlotAvaialble(slot);
            }
        };

        $scope.showPerformances = function(start, stop, performances) {
            $uibModal.open({
                templateUrl: 'app/myFringe/availability/slotPerformancesModal/slotPerformancesModal.html',
                controller: 'slotPerformancesModalCtrl',
                size: 'lg',
                scope: $scope,
                resolve: {
                    slotStart: function() {
                        return start;
                    },
                    slotStop: function() {
                        return stop;
                    },
                    slotPerformances: function() {
                        return performances;
                    }
                }
            });
        };
    }]
});