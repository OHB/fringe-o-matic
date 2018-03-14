angular.module('fringeApp').component('fringeMap', {
    templateUrl: 'app/map/map.html',
    controller: [
        '$scope', '$routeParams', 'NgMap', '$window', '$timeout', '$q', 'debounce', 'Data', 'MapConfig', '$analytics',
        function($scope, $routeParams, NgMap, $window, $timeout, $q, debounce, Data, MapConfig, $analytics) {
            $scope.lawnPolygon = MapConfig.lawnPolygon;
            $scope.isGroupVisible = {};

            $scope.venueHosts = Data.getVenueHosts();

            var venues = Data.getVenues();

            $scope.markerGroups = MapConfig.markerGroups.slice(0);
            $scope.views = MapConfig.views.slice(0);
            $scope.venueViews = {};

            $scope.markerGroups[0].markers = Object.keys(venues).map(function(venueId) {
                var venue = venues[venueId];

                return {
                    position: venue.mapPos,
                    title: venue.name,
                    icon: venue.mapIcon,
                    venue: venueId,
                    host: venue.host
                };
            });

            $scope.toggleGroup = function(group) {
                $analytics.eventTrack('Toggle Group', {category: 'Map', label: group.name});
                $scope.isGroupVisible[group.id] = !$scope.isGroupVisible[group.id];
            };

            var zoomToBoundedRegion = function(boundList, maxZoom) {
                var bounds = new google.maps.LatLngBounds();
                for (var i = 0; i < boundList.length; i ++) {
                    bounds.extend(new google.maps.LatLng(boundList[i][0], boundList[i][1]));
                }
                closeMarkerWindow();
                NgMap.getMap().then(function(map) {
                    map.setCenter(bounds.getCenter());
                    map.fitBounds(bounds);
                    if (map.getZoom() > maxZoom) {
                        map.setZoom(maxZoom);
                    }
                });
            };

            $scope.gotoView = function(view) {
                $analytics.eventTrack('Display', {category: 'Map', label: view.name});

                var boundList = [];

                angular.forEach($scope.markerGroups, function(group) {
                    $scope.isGroupVisible[group.id] = false;
                    if (view.markerGroups === true || view.markerGroups.indexOf(group.id) > -1) {
                        $scope.isGroupVisible[group.id] = true;
                        angular.forEach(group.markers, function(marker) {
                            if (group.id === 'venues') {
                                if (view.venueHosts && view.venueHosts.indexOf(marker.venueHost) === -1) {
                                    return true;
                                }
                            }

                            boundList.push(marker.position);
                        });
                    }
                });

                if (view.center && view.zoom) {
                    NgMap.getMap().then(function(map) {
                        map.setCenter(new google.maps.LatLng(view.center[0], view.center[1]));
                        map.setZoom(view.zoom);
                    });
                    return;
                }

                zoomToBoundedRegion(boundList);
            };

            angular.element($window).on('resize', debounce(function() {
                NgMap.getMap().then(function(map) {
                    google.maps.event.trigger(map, "resize");
                });
            }, 100));

            var closeMarkerWindow = function() {
                if ($scope.markerWindow) {
                    NgMap.getMap().then(function(map) {
                        map.hideInfoWindow('marker-info');
                        $scope.markerWindow = undefined;
                    });
                }
            };

            $scope.markerClick = function(e, marker, groupId, markerId) {
                closeMarkerWindow();
                $analytics.eventTrack('Click', {category: 'Map', label: marker.title});
                NgMap.getMap().then(function(map) {
                    $scope.markerWindow = {
                        title: marker.title,
                        location: marker.location || (marker.host && $scope.venueHosts[marker.host].name),
                        address: marker.address || (marker.host && $scope.venueHosts[marker.host].address),
                        venue: groupId === 'venues' ? marker.venue : false,
                        id: groupId + '-' + markerId,
                        notes: marker.notes
                    };
                    map.setCenter(new google.maps.LatLng(marker.position[0], marker.position[1]));
                    map.showInfoWindow('marker-info', $scope.markerWindow.id);
                });
            };

            $timeout(function() {
                NgMap.getMap().then(function() {
                    if ($routeParams.venue) {
                        var venueId = Data.findVenueIdBySlug($routeParams.venue);

                        if (venueId) {
                            var pos = venues[venueId].mapPos;
                            angular.forEach($scope.markerGroups, function (group) {
                                $scope.isGroupVisible[group.id] = true;
                            });
                            NgMap.getMap().then(function (map) {
                                map.setCenter(new google.maps.LatLng(pos[0], pos[1]));
                                map.setZoom(21);
                            });
                        }
                    } else if ($routeParams.host) {
                        var hostId = Data.findVenueHostIdBySlug($routeParams.host),
                            boundList = [];

                        if (hostId) {
                            angular.forEach($scope.markerGroups, function(group) {
                                $scope.isGroupVisible[group.id] = true;
                                angular.forEach(group.markers, function(marker) {
                                    if (marker.host === hostId) {
                                        boundList.push(marker.position);
                                    }
                                })
                            });
                            zoomToBoundedRegion(boundList, 19);
                        }
                    } else {
                        $scope.gotoView($scope.views[MapConfig.initialView]);
                    }
                    $scope.mapLoaded = true;
                });
            });
        }
    ]
});