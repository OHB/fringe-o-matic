angular.module('fringeApp').component('showsOld', {
    templateUrl: 'app/showsOld/showsOld.html',
    controller: [
        '$scope', '$window', '$timeout', '$filter', '$routeParams', 'debounce', 'Data', 'UserData', 'Plurals', 'Schedule',
        function($scope, $window, $timeout, $filter, $routeParams, debounce, Data, UserData, Plurals, Schedule) {
        console.log('here');
            $scope.isSignedIn = UserData.isSignedIn();
            $scope.moment = moment;
            $scope.plurals = Plurals;
            $scope.allShowPerformances = {};
            $scope.currentPage = 1;
            $scope.perPage = 10;
            $scope.isUserAttendingPerformance = Schedule.isUserAttendingPerformance;

            $scope.userData = {
                preferences: UserData.getPreferences()
            };

            $scope.otherOptions = [
                {value: '*', label: 'All Shows'},
                {value: 'interested', label: 'Interested Only'},
                {value: 'attending', label: 'Attending Only'}
            ];

            $scope.shows = Data.getShows();
            $scope.venues = Data.getVenues();
            $scope.ratings = Data.getRatings();
            $scope.prices = Data.getPrices();
            $scope.sortedShows = Data.getSortedShows();
            $scope.performances = Data.getPerformances();

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

            $scope.priceOptions = $scope.prices.map(function(id) {
                return {value: id, label: $filter('price')(id)};
            });
            $scope.priceOptions.unshift({value: '*', label: 'All Prices'});

            $scope.showAllPerformances = function(showId) {
                $scope.allShowPerformances[showId] = true;
            };

            $scope.scroll = function() {
                $timeout(function() {
                    $window.scroll(0, 210);
                });
            };

            $scope.resetFilters = function() {
                $scope.selectedVenue = '*';
                $scope.selectedRating = '*';
                $scope.selectedPrice = '*';
                $scope.selectedOther = '*';
                $scope.search = '';
                $scope.searchText = '';
            };

            $scope.refresh = function() {
                $scope.buildData();
                $scope.scroll();
            };

            $scope.buildData = function() {
                var showsAttending = Schedule.getShowsAttending();

                $scope.searchText = $scope.search.toLowerCase().replace(/[^\s\d\w'!?"&-:,\(\)#]/g, '').trim() || '';

                var sanitized = $scope.searchText.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
                    searchRegex = new RegExp('(' + sanitized + ')(?![^<]*>|[^<>]*<\\/)', 'i');

                $scope.allShows = $scope.sortedShows.filter(function(showId) {
                    var show = $scope.shows[showId];
                    if ($scope.selectedVenue !== '*' && show.venue !== $scope.selectedVenue) {
                        return false;
                    }
                    if ($scope.selectedRating !== '*' && show.rating !== $scope.selectedRating) {
                        return false;
                    }
                    if ($scope.selectedPrice !== '*' && show.price !== $scope.selectedPrice) {
                        return false;
                    }
                    if ($scope.selectedOther === 'interested' && Schedule.getShowDesire(showId) === 0) {
                        return false;
                    }
                    if ($scope.selectedOther === 'attending' && showsAttending.indexOf(showId) === -1) {
                        return false;
                    }

                    var target = show.name + ' ' + show.description + ' ' + show.artist;
                    target = target.replace(/&amp;/g, '&').replace(/&quot;/g, '"');

                    if ($scope.searchText && ! searchRegex.exec(target)) {
                        return false;
                    }

                    return true;
                });
            };

            $scope.searchTextEntered = debounce(function() {
                $scope.$apply($scope.buildData)
            }, 50);

            $scope.clearSearch = function() {
                $scope.search = '';
                $scope.buildData();
            };

            $scope.$watch('userData.preferences', $scope.buildData, true);

            $scope.resetFilters();

            if ($routeParams.venue !== undefined) {
                $scope.selectedVenue = $routeParams.venue;
            } else if ($routeParams.show !== undefined) {
                $scope.search = $scope.shows[$routeParams.show].name;
            }

            $scope.buildData();
        }
    ]
});