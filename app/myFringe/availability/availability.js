angular.module('fringeApp').component('myFringeAvailability', {
    templateUrl: 'app/myFringe/availability/availability.html',
    controller: [
        '$scope', '$uibModal', '$timeout', 'Data', 'User', 'Schedule', 'Availability', 'Configuration', '$analytics',
        function($scope, $uibModal, $timeout, Data, User, Schedule, Availability, Configuration, $analytics) {
            var performances;

            $scope.firstTime = ! User.getSettings().availabilityIntroComplete;
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

            $scope.completeIntro = function() {
                var settings = User.getSettings();
                settings.availabilityIntroComplete = true;
                User.setSettings(settings);
                $scope.firstTime = false;
            };

            $scope.toggleAvailability = function(slot) {
                $analytics.eventTrack('Change', {category: 'Availability'});
                $scope.availability[slot] ? Availability.setSlotUnavailable(slot) : Availability.setSlotAvaialble(slot);
                $scope.availability[slot] = ! $scope.availability[slot];
            };

            $scope.toggleDay = function(dayId) {
                for (var i = 0; i < $scope.availabilitySlots[dayId].length; i ++) {
                    $scope.toggleAvailability($scope.availabilitySlots[dayId][i]);
                }
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

            performances = Data.getPerformances();
            $scope.availabilitySlots = Data.getAvailabilitySlots();
            $scope.availabilitySlotsAll = Data.getAvailabilitySlotsAll();

            angular.forEach($scope.availabilitySlots, function(slots) {
                angular.forEach(slots, function(slot) {
                    $scope.availability[slot] = Availability.isSlotAvailable(slot);
                });
            });

            refreshPerformancesInSlots();
        }
    ]
});