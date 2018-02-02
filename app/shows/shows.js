angular.module('fringeApp').component('shows', {
    templateUrl: 'app/shows/shows.html',
    controller: [
        '$scope', '$window', '$timeout', '$filter', '$routeParams', 'debounce', 'Data', 'User', 'Plurals', 'Schedule', '$analytics',
        function($scope, $window, $timeout, $filter, $routeParams, debounce, Data, User, Plurals, Schedule, $analytics) {
            $scope.moment = moment;
            $scope.plurals = Plurals;
            $scope.allShowPerformances = {};
            $scope.isUserAttendingPerformance = Schedule.isUserAttendingPerformance;
            $scope.isFringeOngoing = Data.isFringeOngoing();

            $scope.userData = {
                preferences: User.getPreferences()
            };

            $scope.shows = Data.getShows();
            $scope.venues = Data.getVenues();
            $scope.ratings = Data.getRatings();
            $scope.prices = Data.getPrices();
            $scope.sortedShows = Data.getSortedShows();
            $scope.performances = Data.getPerformances();

            $scope.performanceCounts = {};
            $scope.canAttendShow = {};

            var possiblePerformances = Schedule.getPossiblePerformances();

            angular.forEach($scope.shows, function(show, showId) {
                var availablePerformances = show.performances.filter(function(performanceId) {
                    return $scope.performances[performanceId].start > Date.now() / 1000;
                });

                $scope.performanceCounts[showId] = availablePerformances.length;

                if (User.isSignedIn()) {
                    $scope.canAttendShow[showId] = false;

                    angular.forEach(show.performances, function(performanceId) {
                        if (possiblePerformances.indexOf(performanceId) > -1) {
                            $scope.canAttendShow[showId] = true;

                            return false;
                        }
                    });
                }
            });

            $scope.venueOptions = Object.keys($scope.venues).map(function(id) {
                return {value: id, label: $scope.venues[id].name};
            }).sort(function(a, b) {
                return a.label.localeCompareSmart(b.label);
            });
            $scope.venueOptions.unshift({value: '*', label: 'All Venues'});

            $scope.ratingOptions = $scope.ratings.map(function(id, idx) {
                return {value: idx, label: id};
            });
            $scope.ratingOptions.unshift({value: '*', label: 'All Ratings'});

            $scope.resetFilters = function() {
                $scope.search = '';
                $scope.selectedVenue = '*';
                $scope.selectedRating = '*';
                $scope.hideWithoutShowtimes = false;
                $scope.hideNotInterested = false;
                $scope.hideNotAttending = false;
                $scope.hideCantAttend = false;
            };

            $scope.refresh = function() {
                var showsAttending = Schedule.getShowsAttending(),
                    searchText = $scope.search.toLowerCase().replace(/[^\s\d\w'!?"&-:,\(\)#]/g, '').trim() || '',
                    sanitized = searchText.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
                    searchRegex = new RegExp('(' + sanitized + ')(?![^<]*>|[^<>]*<\\/)', 'i');

                $scope.allShows = $scope.sortedShows.filter(function(showId) {
                    var show = $scope.shows[showId];
                    if ($scope.selectedVenue !== '*' && show.venue !== $scope.selectedVenue) {
                        return false;
                    }

                    if ($scope.selectedRating !== '*' && show.rating !== $scope.selectedRating) {
                        return false;
                    }

                    if ($scope.hideWithoutShowtimes && $scope.performanceCounts[showId] === 0) {
                        return false;
                    }

                    if ($scope.hideNotInterested && Schedule.getShowDesire(showId) === 0) {
                        return false;
                    }

                    if ($scope.hideNotAttending && showsAttending.indexOf(showId) === -1) {
                        return false;
                    }

                    if ($scope.hideCantAttend && ! $scope.canAttendShow[showId] && showsAttending.indexOf(showId) === -1) {
                        return false;
                    }

                    var target = [
                        show.name,
                        show.description | '',
                        show.artist || '',
                        show.artistLocation || '',
                        $scope.venues[show.venue].name
                    ].join(' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"');

                    if (searchText && ! searchRegex.exec(target)) {
                        return false;
                    }

                    return true;
                });

                $scope.displayedShows = $scope.allShows.slice(0, 10);
                $scope.dataLoaded = true;
            };

            $scope.addMoreItems = function() {
                var displayed = $scope.displayedShows.length;

                for (var i = displayed; i < displayed + 5; i ++) {
                    if ($scope.allShows[i] === undefined) {
                        break;
                    }

                    $scope.displayedShows.push($scope.allShows[i]);
                }
            };

            var trackKeywordFilter = debounce(function() {
                $analytics.eventTrack('Filter by Keyword', {category: 'Shows', label: $scope.search});
            }, 2000);
            $scope.searchTextEntered = debounce(function() {
                trackKeywordFilter();
                $scope.$apply($scope.refresh)
            }, 50);

            $scope.venueSelected = function() {
                if ($scope.selectedVenue !== '*') {
                    $analytics.eventTrack('Filter by Venue', {category: 'Shows', label: $scope.venues[$scope.selectedVenue].name});
                }
                $scope.refresh();
            };

            $scope.ratingSelected = function() {
                if ($scope.selectedRating !== '*') {
                    $analytics.eventTrack('Filter by Rating', {
                        category: 'Shows',
                        label: $scope.ratings[$scope.selectedRating]
                    });
                }
                $scope.refresh();
            };

            $scope.hideWithoutShowtimesSelected = function() {
                if ($scope.hideWithoutShowtimes) {
                    $analytics.eventTrack('Filter', {category: 'Shows', label: 'Hide shows with no performances'});
                }
                $scope.refresh();
            };

            $scope.hideNotInterestedSelected = function() {
                if ($scope.hideNotInterested) {
                    $analytics.eventTrack('Filter', {category: 'Shows', label: "Hide shows I'm not interested in"});
                }
                $scope.refresh();
            };

            $scope.hideNotAttendingSelected = function() {
                if ($scope.hideNotAttending) {
                    $analytics.eventTrack('Filter', {category: 'Shows', label: "Hide shows I'm not attending"});
                }
                $scope.refresh();
            };

            $scope.hideCantAttendSelected = function() {
                if ($scope.hideCantAttend) {
                    $analytics.eventTrack('Filter', {category: 'Shows', label: "Hide shows I can't see"});
                }
                $scope.refresh();
            };

            $scope.clearSearch = function() {
                $scope.search = '';
                $scope.refresh();
            };

            $scope.resetFilters();

            if ($routeParams.venue !== undefined) {
                $scope.selectedVenue = Data.findVenueIdBySlug($routeParams.venue) || '*';
            }

            $timeout(function() {
                $scope.$watch('userData.preferences', $scope.refresh, true);
            });
        }
    ]
});