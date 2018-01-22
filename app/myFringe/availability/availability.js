angular.module('fringeApp').component('myFringeAvailability', {
    templateUrl: 'app/myFringe/availability/availability.html',
    controller: [
        '$scope', '$uibModal', '$timeout', '$q', 'Data', 'Schedule', 'Availability', 'Configuration',
        function($scope, $uibModal, $timeout, $q, Data, Schedule, Availability, Configuration) {
            var performances;

            $scope.moment = moment;
            $scope.slotSize = Configuration.slotSize;
            $scope.availability = {};

            var refreshPerformancesInSlots = function() {
                var schedule = Schedule.getSchedule();

                $scope.slotPerformances = {};

                angular.forEach($scope.availabilitySlots, function(slots) {
                    angular.forEach(slots, function(slot) {
                        $scope.slotPerformances[slot] = [];

                        for (var i = 0; i < schedule.length; i ++) {
                            var pId = schedule[i],
                                performance = performances[pId];

                            if (! (performance.stop <= slot || performance.start >= slot + Configuration.slotSize)) {
                                $scope.slotPerformances[slot].push(pId)
                            }
                        }
                    });
                });
            };

            $timeout(function() {
                $q.all([
                    Data.getPerformances(),
                    Data.getAvailabilitySlots(),
                    Data.getAvailabilitySlotsAll()
                ]).then(function(results) {
                    performances = results[0];
                    $scope.availabilitySlots = results[1];
                    $scope.availabilitySlotsAll = results[2];

                    angular.forEach($scope.availabilitySlots, function(slots) {
                        angular.forEach(slots, function(slot) {
                            $scope.availability[slot] = Availability.isSlotAvailable(slot);
                        });
                    });

                    refreshPerformancesInSlots();
                });
            });

            $scope.toggleAvailability = function(slot) {
                $scope.availability[slot] ? Availability.setSlotUnavailable(slot) : Availability.setSlotAvaialble(slot);
                $scope.availability[slot] = ! $scope.availability[slot];
            };

            var dragType;

            $scope.dragStart = function(slot) {
                $scope.toggleAvailability(slot);
                dragType = $scope.availability[slot];
                $scope.dragging = true;
            };

            $scope.dragStop = function() {
                $scope.dragging = false;
            };

            $scope.dragOver = function (slot) {
                if ($scope.dragging && $scope.availability[slot] !== dragType) {
                    $scope.toggleAvailability(slot);
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
        }
    ]
});