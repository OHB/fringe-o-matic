angular.module('fringeApp').component('show', {
    templateUrl: 'app/show/show.html',
    controller: ['$scope', '$routeParams', 'Data', 'Schedule', '$sce', function($scope, $routeParams, Data, Schedule, $sce) {
        $scope.moment = moment;
        $scope.now = Date.now() / 1000;
        $scope.showId = Data.findShowIdBySlug($routeParams.show);
        $scope.show = Data.getShow($scope.showId);
        $scope.firstPerformance = Data.getPerformance($scope.show.performances[0]);
        $scope.performances = Data.getPerformances();
        $scope.venues = Data.getVenues();
        $scope.ratings = Data.getRatings();
        $scope.isUserAttendingPerformance = Schedule.isUserAttendingPerformance;
        $scope.trustAsHtml = $sce.trustAsHtml;

        var allShows = Data.getSortedShows(),
            current = allShows.indexOf($scope.showId);

            $scope.nextShow = Data.getShow(allShows[current === allShows.length - 1 ? 0 : current + 1]);
            $scope.previousShow = Data.getShow(allShows[current === 0 ? allShows.length - 1 : current - 1]);
            $scope.randomShow = Data.getShow(allShows.filter(function(i) {
                return i !== $scope.showId;
            }).randomElement());

        var img = document.createElement('img');
        img.setAttribute('src', 'img/show/' + $scope.show.image);
        img.addEventListener('load', function() {
            var swatches = new Vibrant(img).swatches();

            $scope.$apply(function() {
                $scope.hasImage = false;
                if (swatches.Vibrant) {
                    $scope.hasImage = true;
                    $scope.backgroundColor = swatches.Vibrant.getHex();
                    $scope.titleColor = swatches.Vibrant.getTitleTextColor();
                    $scope.textColor = swatches.Vibrant.getBodyTextColor();
                }

                $scope.loaded = true;
            });


            (new Image()).src = 'img/show/' + $scope.nextShow.image;
            (new Image()).src = 'img/show/' + $scope.previousShow.image;
            (new Image()).src = 'img/show/' + $scope.randomShow.image;
        });
        img.addEventListener('error', function() {
            $scope.$apply(function() {
                $scope.hasImage = false;
                $scope.loaded = true;
            });
        });

        $scope.random = function() {
            return false;
        };

        $scope.jsonld = [];

        var venue = $scope.venues[$scope.show.venue],
            host = Data.getVenueHost(venue.host);

        angular.forEach($scope.show.performances, function(performanceId) {
            var performance = $scope.performances[performanceId],
                json = {
                    "@context": "http://schema.org",
                    "@type": "Event",
                    "name": $scope.show.name,
                    "startDate": moment(performance.start, 'X').utcOffset(-5, true).toISOString(true),
                    "endDate": moment(performance.start, 'X').utcOffset(-5, true).toISOString(true),
                    "location": {
                        "@type": "Place",
                        "name": venue.name + ' at ' + host.name,
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": host.addressStreet,
                            "addressLocality": host.addressLocality,
                            "addressRegion": host.addressRegion,
                            "postalCode": host.addressPostalCode,
                            "addressCountry": host.addressCountry
                        }
                    },
                    "description": function (html) {
                        var tmp = document.createElement("DIV");
                        tmp.innerHTML = html;
                        return tmp.innerText || "";
                    }($scope.show.description),
                    "performer": $scope.artist
                };

            if ($scope.show.image) {
                json.image = 'https://fringeomatic.com/img/show/' + $scope.show.image;
            }

            if ($scope.show.artist) {
                json.performer = {
                    "@type": "PerformingGroup",
                    "name": $scope.show.artist
                };
            }

            if ($scope.show.price && performance.storeId) {
                json.offers = {
                    "@type": "Offer",
                    "url": "https://orlandofringe.showare.com/ordertickets.asp?p=" + performance.storeId,
                    "price": $scope.show.price,
                    "priceCurrency": "USD"
                };
            }

            $scope.jsonld.push(json);
        });
    }]
});