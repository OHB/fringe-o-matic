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

        var cities = {
            'Coral Springs, FL': [26.271192, -80.2706044],
            'Casselberry, FL': [28.677775, -81.3278455],
            'Lakeland, FL': [28.0394654, -81.9498042],
            'Longwood, FL': [28.7030519, -81.3384011],
            'Orlando, FL': [28.5383355, -81.3792365],
            'Oviedo, FL': [28.669997, -81.2081203],
            'Sanford, FL': [28.8028612, -81.269453],
            'Tallahassee, FL': [30.4382559, -84.2807329],
            'Windermere, FL': [28.4955593, -81.5347952],
            'Winter Garden, FL': [28.5652787, -81.5861847],
            'Winter Park, FL': [28.5999998, -81.3392352],
            'Winter Springs, FL': [28.698885, -81.308123],
            'Atlamonte Springs, FL': [28.661109, -81.365624]
        };
        var data = objToData(flaloc, 'City', 'Artists');
        data.cols.unshift({id: 'lng', label: 'lng', type: 'number'});
        data.cols.unshift({id: 'lon', label: 'lon', type: 'number'});
        data.rows = data.rows.map(function(row) {
            var city = cities[row.c[0].v];
            row.c.unshift({v: city[1]});
            row.c.unshift({v: city[0]});
            return row;
        });

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
            data: data
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

        var performanceData = {};
        angular.forEach(Data.getPerformances(), function(performance) {
            var m = moment(performance.start, 'X'),
                hour = m.hour(),
                min = m.minute(),
                day = m.date();

            if (min === 59) {
                hour ++;
            }

            if (! performanceData[day]) {
                performanceData[day] = {};
            }

            if (! performanceData[day][hour]) {
                performanceData[day][hour] = 0;
            }
            performanceData[day][hour] ++;
        });

        var rows = [];
        angular.forEach(performanceData, function(hours, day) {
            angular.forEach(hours, function(performances, hour) {
                rows.push({
                    c: [
                        {v: ''},
                        {v: day},
                        {v: hour},
                        {v: performances},
                        {v: performances},
                        {v: 'FOO'}
                    ]
                });
            });
        });

        $scope.performanceDistribution = {
            type: 'BubbleChart',
            data: {
                cols: [
                    {id: 'k', label: 'ID', type: 'string'},
                    {id: 'x', label: 'Day', type: 'number'},
                    {id: 'y', label: 'Hour', type: 'number'},
                    {id: 'p1', label: 'Performances', type: 'number'},
                    {id: 'p2', label: 'Performances', type: 'number'}
                ],
                rows: rows
            },
            options: {
                enableInteractivity: false,
                colorAxis: {minValue: 0,  colors: ['#fff', '#a2238d']},
                theme: 'maximized',
                hAxis: {
                    viewWindow: {min: 14, max: 29},
                    ticks: Object.keys(performanceData).map(function(i) {
                        return {v: i, f: 'May ' + i};
                    })
                },
                vAxis: {
                    viewWindow: {min: 10, max: 25},
                    ticks: [10, 12, 14, 16, 18, 20, 22, 24].map(function(i) {
                        if (i === 24) {
                            return {v: 24, f: '12am'};
                        }

                        return {v: i, f: i < 12 ? i + 'am' : ((i > 12 ? (i - 12) : i) + 'pm')};
                    })
                }
            }
        };
    }]
});