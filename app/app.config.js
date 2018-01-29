angular.module('fringeApp')
    .value('Sorters', {
        performance: function(a, b) {
            return a.start - b.start || a.stop - b.stop;
        }
    })
    .value('Configuration', {
        googleAuthClientId: '728570220201-2tkhj9m3stsqgprscc77o256r0f441au.apps.googleusercontent.com',
        googleApiKey: 'AIzaSyD0y40AVRhf_DDSsFCRT0mBXhjdkQZP4Ys',
        slotSize: 3600,
        minimumArriveBeforeShowTime: 600,
        adminUsers: [
            'g112311867146833913606'
        ],
        interestText: [
            'Not Interested',
            'Eh...maybe.',
            'This looks good.',
            "I'd love to see this!",
            'I HAVE to see this!'
        ],
        generatorMessages: [
            'This may take a few seconds or several minutes.',
            'You may see the lower progress bars fluctuate back and forth. This is normal.',
            'It may not be possible to see all of the shows you want.',
            'You can stop the generator at any time, but the longer you let this run, the better the schedule will be.',
            'If the generator can\'t find a better schedule, it will stop automatically.',
            'The Auto-Scheduler uses a lot of computing power. It will slow down if you do other things.'
        ],
        fringeLevels: [
            {min: 0, name: 'New Recruit'},
            {min: 1, name: 'Newbie'},
            {min: 3, name: 'Rookie'},
            {min: 5, name: 'Amateur'},
            {min: 10, name: 'Awesome'},
            {min: 20, name: 'Rockstar'},
            {min: 30, name: 'Hero'},
            {min: 40, name: 'Fanatic'},
            {min: 50, name: 'Legend'},
            {min: 65, name: 'BOSS'}
        ]
    })
    .value('Plurals', {
        show: {0: 'no shows', one: 'one show', other: '{} shows'},
        showMore: {0: 'no more shows', one: 'one more show', other: '{} more shows'},
        showSome: {0: 'no shows', one: 'a show', other: 'some shows'},
        showSomeMore: {0: 'no more shows', one: 'another show', other: 'some more shows'},
        aShow: {0: 'no shows', one: 'a show', other: '{} shows'},
        performance: {0: 'no performances', one: 'one performance', other: '{} performances'},
        performanceMore: {0: 'no more performances', one: 'one more performance', other: '{} more performances'},
        Performance: {0: 'No performances', one: '1 Performance', other: '{} Performances'}
    })
    .value('Menu', [
        {route: '', title: 'Home'},
        {route: 'my-fringe', title: 'My Fringe'},
        {route: 'shows', title: 'Shows'},
        {route: 'schedule', title: 'Schedule'},
        {route: 'venues', title: 'Venues'},
        {route: 'map', title: 'Map'}
    ])
    .value('MapConfig', {
        initialView: 0,
        views: [
            {name: 'Fringe Central', center: [28.572253, -81.367035], zoom: 18, markerGroups: true},
            {name: 'Green Lawn of Fabulousness', markerGroups: true, center: [28.571914, -81.366537], zoom: 19},
            {name: 'All Venues', markerGroups: ['venues', 'byov']},
            {name: 'Parking', markerGroups: ['parking']}
        ],
        markerGroups: [
            {
                id: 'venues',
                name: 'Main Venues',
                markers: []
            },
            {
                id: 'byov',
                name: 'BYOV',
                markers: []
            },
            {
                id: 'fringe',
                name: 'Festival Locations',
                markers: [
                    {position: [28.573538, -81.366723], title: 'Box Office', icon: 'information', host: 1},
                    {position: [28.572936, -81.365307], title: 'Club Fringe Lounge', icon: 'club-fringe', host: 2, notes: 'Club Fringe members only.'},
                    {position: [28.573403, -81.367468], title: 'Kids Fringe', icon: 'kids', host: 1},
                    {position: [28.571664, -81.366011], title: 'Information', icon: 'information', location: 'Green Lawn of Fabulousness'}
                ]
            },
            {
                id: 'foodAndDrink',
                name: 'Food & Drink',
                markers: [
                    {position: [28.572994, -81.367102], title: 'Wine & Beer', icon: 'beer-garden', host: 1},
                    {position: [28.571936, -81.366611], title: 'McGrath Beer Tent', icon: 'beer', location: 'Green Lawn of Fabulousness'},
                    {position: [28.572003, -81.366468], title: 'Stonewall Bar Tent', icon: 'bar', location: 'Green Lawn of Fabulousness'},
                    {position: [28.572153, -81.366947], title: 'Ice Cream', icon: 'icecream', location: 'Green Lawn of Fabulousness'},
                    {position: [28.571776, -81.366104], title: 'Cheese Curds', icon: 'cheese', location: 'Green Lawn of Fabulousness'}
                ]
            },
            {
                id: 'services',
                name: 'Services',
                markers: [ // #3875d7
                    {position: [28.572980, -81.366786], title: 'ATM', icon: 'atm', host: 1},
                    {position: [28.572036, -81.366584], title: 'ATM', icon: 'atm', location: 'Green Lawn of Fabulousness'},
                    {position: [28.573535, -81.366921], title: 'Restrooms', icon: 'bathroom', host: 1},
                    {position: [28.573117, -81.366799], title: 'Restrooms', icon: 'bathroom', host: 1},
                    {position: [28.572941, -81.364958], title: 'Restrooms', icon: 'bathroom', host: 2},
                    {position: [28.570965, -81.365557], title: 'Restrooms', icon: 'bathroom', host: 3},
                    {position: [28.571659, -81.366254], title: 'Restrooms', icon: 'bathroom', location: 'Green Lawn of Fabulousness'}
                ]
            },
            {
                id: 'parking',
                name: 'Parking',
                markers: [
                    {position: [28.573059, -81.366112], title: 'Free Parking', icon: 'parking', host: 1, notes: 'The most convenient for all venues and the Fringe Lawn, but it fills up fast and is the most challenging for finding a spot – it can take as long as 45 minutes to 1 hour at busy times.'},
                    {position: [28.571236, -81.366444], title: 'Free Parking', icon: 'parking', host: 3, notes: 'This lot fills up quickly and is occasionally closed to Fringe guests for special events.'},
                    {
                        position: [28.573045, -81.371020],
                        title: 'Parking Garage',
                        icon: 'parking-garage',
                        location: 'Orlando Hospital',
                        address: ['2328 Alden Rd', 'Orlando, FL 32803'],
                        notes: 'Free on Saturday or if leaving after midnight.'
                    },
                    {
                        position: [28.568979, -81.363516],
                        title: 'Free Weekend Parking',
                        icon: 'parking',
                        location: 'Magruder Eye Institute',
                        address: ['1911 N Mills Ave', 'Orlando, FL 32803'],
                        notes: 'Available on Saturdays and Sundays all day during Fringe. Lots of spaces, the perfect location for a short walk to Silver and Green venues.'
                    },
                    {
                        position: [28.568475, -81.365177],
                        title: 'Free Weekend Parking',
                        icon: 'parking',
                        location: 'Florida Urology Associates',
                        address: ['1812 N Mills Ave', 'Orlando, FL 32803'],
                        notes: 'Available on Saturdays and Sundays all day during Fringe. Lots of spaces, the perfect location for a short walk to Silver and Green venues.'
                    }
                ]
            }
        ],
        lawnPolygon: [
            [28.5721511,-81.3658485],
            [28.5722194,-81.3659477],
            [28.5722641,-81.3660309],
            [28.57229,-81.3660872],
            [28.5723065,-81.3661489],
            [28.5723112,-81.3661999],
            [28.5723042,-81.3662508],
            [28.5722665,-81.3663501],
            [28.5722359,-81.3664386],
            [28.5722147,-81.3665539],
            [28.5722194,-81.3667041],
            [28.5722759,-81.3668516],
            [28.5722806,-81.3669026],
            [28.5722735,-81.3669482],
            [28.572217,-81.3670394],
            [28.5721723,-81.3670917],
            [28.5721311,-81.3671668],
            [28.572081,-81.3672198],
            [28.5720404,-81.3672741],
            [28.5719944,-81.3673438],
            [28.5719555,-81.3673693],
            [28.5719119,-81.3673747],
            [28.5718778,-81.3673452],
            [28.5718107,-81.3671829],
            [28.5717789,-81.3670447],
            [28.5716635,-81.3668329],
            [28.5716046,-81.3667417],
            [28.5715822,-81.3666947],
            [28.5715681,-81.3666545],
            [28.5715651,-81.3666036],
            [28.5715681,-81.3665566],
            [28.5715787,-81.3664708],
            [28.5716281,-81.3662776],
            [28.5716234,-81.3661489],
            [28.5716105,-81.3660725],
            [28.5715986,-81.3660175],
            [28.5715739,-81.3659652],
            [28.5715504,-81.36589],
            [28.5715174,-81.3658136],
            [28.5717082,-81.3657385],
            [28.5718048,-81.3657144],
            [28.5718778,-81.365701],
            [28.5719803,-81.3657117],
            [28.572071,-81.3657546],
            [28.5721511,-81.3658485]
        ]
    })
    .config(['$locationProvider', '$routeProvider',
        function config($locationProvider, $routeProvider) {
            $locationProvider.hashPrefix('!');
            $locationProvider.html5Mode(true);

            $routeProvider
                .when('/', {
                    template: '<home></home>'
                }).when('/my-fringe/:subpage?', {
                    template: '<my-fringe></my-fringe>'


                }).when('/shows-old', {
                    template: '<shows-old></shows-old>'
                }).when('/shows-old/show/:show', {
                    template: '<shows-old></shows-old>'
                }).when('/shows-old/venue/:venue', {
                    template: '<shows-old></shows-old>'


                }).when('/shows', {
                    template: '<shows></shows>'
                }).when('/shows/venue/:venue', {
                    template: '<shows></shows>'

                }).when('/show/:show', {
                    template: '<show></show>'

                }).when('/schedule/:param1?/:param2?', {
                    template: '<schedule></schedule>'
                }).when('/venues', {
                    template: '<venues></venues>'
                }).when('/map', {
                    template: '<fringe-map></fringe-map>'
                }).when('/map/venue/:venue', {
                    template: '<fringe-map></fringe-map>'
                }).when('/map/host/:host', {
                    template: '<fringe-map></fringe-map>'
                }).when('/credits', {
                    templateUrl: 'pages/credits.html'
                }).when('/privacy', {
                    templateUrl: 'pages/privacy.html'
                }).when('/test', {
                    template: '<test></test>'
                }).otherwise({redirectTo: '/'});
        }
    ]);