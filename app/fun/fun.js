angular.module('fringeApp').component('fun', {
    templateUrl: 'app/fun/fun.html',
    controller: ['$scope', 'Data', function($scope, Data) {
        var stateMap = {
            "AL": "Alabama",
            "AK": "Alaska",
            "AS": "American Samoa",
            "AZ": "Arizona",
            "AR": "Arkansas",
            "CA": "California",
            "CO": "Colorado",
            "CT": "Connecticut",
            "DE": "Delaware",
            "DC": "District Of Columbia",
            "FM": "Federated States Of Micronesia",
            "FL": "Florida",
            "GA": "Georgia",
            "GU": "Guam",
            "HI": "Hawaii",
            "ID": "Idaho",
            "IL": "Illinois",
            "IN": "Indiana",
            "IA": "Iowa",
            "KS": "Kansas",
            "KY": "Kentucky",
            "LA": "Louisiana",
            "ME": "Maine",
            "MH": "Marshall Islands",
            "MD": "Maryland",
            "MA": "Massachusetts",
            "MI": "Michigan",
            "MN": "Minnesota",
            "MS": "Mississippi",
            "MO": "Missouri",
            "MT": "Montana",
            "NE": "Nebraska",
            "NV": "Nevada",
            "NH": "New Hampshire",
            "NJ": "New Jersey",
            "NM": "New Mexico",
            "NY": "New York",
            "NC": "North Carolina",
            "ND": "North Dakota",
            "MP": "Northern Mariana Islands",
            "OH": "Ohio",
            "OK": "Oklahoma",
            "OR": "Oregon",
            "PW": "Palau",
            "PA": "Pennsylvania",
            "PR": "Puerto Rico",
            "RI": "Rhode Island",
            "SC": "South Carolina",
            "SD": "South Dakota",
            "TN": "Tennessee",
            "TX": "Texas",
            "UT": "Utah",
            "VT": "Vermont",
            "VI": "Virgin Islands",
            "VA": "Virginia",
            "WA": "Washington",
            "WV": "West Virginia",
            "WI": "Wisconsin",
            "WY": "Wyoming"
        };

        $scope.showCount = Object.keys(Data.getShows()).length;
        $scope.performanceCount = Object.keys(Data.getPerformances()).length;

        $scope.nationalArtistCount = 0;
        $scope.floridaArtistCount = 0;
        $scope.internationalArtistCount = 0;
        $scope.hoursTotal = 0;

        var venues = Data.getVenues(),
            ratings = Data.getRatings(),
            genres = Data.getGenres();

        var pps = {}, sds = {}, flaloc = {}, naloc = {}, ialoc = {}, k, vcts = {}, rats = {}, gens = {};
        angular.forEach(Data.getShows(), function(show) {
            $scope.hoursTotal += (show.performances.length * show.duration);
            k = show.performances.length + (show.performances.length === 1 ? ' performance' : ' performances');
            k = show.performances.length;
            pps[k] ? pps[k]++ : pps[k] = 1;

            k = (show.duration / 60) + ' minutes';
            sds[k] ? sds[k]++ : sds[k] = 1;

            var locationParts = show.artistLocation.split(', ');

            if (locationParts.length === 2 && locationParts[1].length === 2) {
                if (locationParts[1] === 'FL') {
                    k = locationParts[0] + ', FL';
                    flaloc[k] ? flaloc[k]++ : flaloc[k] = 1;
                    $scope.floridaArtistCount ++;
                } else {
                    k = stateMap[locationParts[1]];
                    naloc[k] ? naloc[k]++ : naloc[k] = 1;
                    $scope.nationalArtistCount ++;
                }
            } else {
                k = locationParts.pop();
                ialoc[k] ? ialoc[k] ++ : ialoc[k] = 1;
                $scope.internationalArtistCount ++;
            }

            k = venues[show.venue].name.replace(' Venue', '');
            vcts[k] ? vcts[k]++ : vcts[k] = 1;

            for (var i = 0; i < show.genres.length; i ++) {
                k = genres[show.genres[i]];
                gens[k] ? gens[k]++ : gens[k] = 1;
            }

            k = ratings[show.rating];
            rats[k] ? rats[k]++ : rats[k] = 1;
        });

        $scope.hoursTotal /= 3600;

        var objToData = function(obj, keyName, valueName) {
            return {
                cols: [
                    {id: 'k', label: keyName, type: 'string'},
                    {id: 'v', label: valueName, type: 'number'}
                ],
                rows: Object.keys(obj).map(function(i) {
                    return {
                        c: [
                            {v: i},
                            {v: obj[i]}
                        ]
                    };
                }).sort(function(a, b) {
                    return a.c[0].v.localeCompareSmart(b.c[0].v);
                })
            };
        };

        $scope.performancesPerShow = {
            type: 'PieChart',
            options: {
                sliceVisibilityThreshold: .05,
                legend: 'none',
                pieSliceText: 'label'
            },
            data: objToData(pps, 'Performances', 'Shows')
        };

        $scope.showDurations = {
            type: 'PieChart',
            options: {
                sliceVisibilityThreshold: .025,
                legend: 'none',
                pieSliceText: 'label'
            },
            data: objToData(sds, 'Minutes', 'Shows')
        };

        $scope.showRatings = {
            type: 'PieChart',
            options: {
                legend: 'none',
                pieSliceText: 'label'
            },
            data: objToData(rats, 'Rating', 'Shows')
        };

        $scope.floridaArtistLocations = {
            type: 'GeoChart',
            options: {
                region: 'US-FL',
                displayMode: 'markers',
                resolution: 'metros',
                datalessRegionColor: '#fff',
                colorAxis: {colors: ['#f1d4ca', '#f15922']},
                legend: 'none'
            },
            data: objToData(flaloc, 'City', 'Artists')
        };

        $scope.usArtistLocations = {
            type: 'GeoChart',
            options: {
                region: 'US',
                displayMode: 'regions',
                resolution: 'provinces',
                datalessRegionColor: '#fff',
                colorAxis: {colors: ['#f1d4ca', '#f15922']},
                legend: 'none'
            },
            data: objToData(naloc, 'State', 'Artists')
        };

        $scope.internationalArtistLocations = {
            type: 'GeoChart',
            options: {
                displayMode: 'regions',
                resolution: 'countries',
                datalessRegionColor: '#fff',
                colorAxis: {colors: ['#f1d4ca', '#f15922']},
                legend: 'none'
            },
            data: objToData(ialoc, 'Country', 'Artists')
        };

        $scope.venueCounts = {
            type: 'Bar',
            data: objToData(vcts, '', 'Shows'),
            options: {
                bars: 'horizontal',
                legend: {position: 'none'}
            }
        };

        $scope.genreCounts = {
            type: 'Bar',
            data: objToData(gens, '', 'Shows'),
            options: {
                bars: 'horizontal',
                legend: {position: 'none'}
            }
        };
    }]
});