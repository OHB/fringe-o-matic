angular.module('fringeApp')
    .value('Sorters', {
        performance: function(a, b) {
            return a.start - b.start || a.stop - b.stop;
        }
    })
    .value('Configuration', {
        seasonSlug: '2018-orlando-fringe-festival',
        googleAuthClientId: '728570220201-2tkhj9m3stsqgprscc77o256r0f441au.apps.googleusercontent.com',
        googleApiKey: 'AIzaSyD0y40AVRhf_DDSsFCRT0mBXhjdkQZP4Ys',
        slotSize: 3600,
        minimumArriveBeforeShowTime: 600,
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
        // {route: 'map', title: 'Map'}
    ])
    // .value('MapConfig', {
    //     initialView: 0,
    //     views: [
    //         {name: 'Fringe Central', center: [28.572253, -81.367035], zoom: 18, markerGroups: true},
    //         {name: 'Green Lawn of Fabulousness', markerGroups: true, center: [28.571914, -81.366537], zoom: 19},
    //         {name: 'All Venues', markerGroups: ['venues', 'byov']},
    //         {name: 'Parking', markerGroups: ['parking']}
    //     ],
    //     markerGroups: [
    //         {
    //             id: 'venues',
    //             name: 'Venues',
    //             markers: []
    //         },
    //         {
    //             id: 'fringe',
    //             name: 'Festival Locations',
    //             markers: [
    //                 {position: [28.573317, -81.366730], title: 'Box Office', icon: 'information', host: 1},
    //                 // {position: [28.572936, -81.365307], title: 'Club Fringe Lounge', icon: 'club-fringe', host: 2, notes: 'Club Fringe members only.'},
    //                 // {position: [28.573403, -81.367468], title: 'Kids Fringe', icon: 'kids', host: 1},
    //                 // {position: [28.571664, -81.366011], title: 'Information', icon: 'information', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57184, -81.36679], title: 'Outdoor Stage', icon: 'tent', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.573189, -81.366661], title: 'Visual Fringe', icon: 'artgallery', host: 1}
    //             ]
    //         },
    //         {
    //             id: 'foodAndDrink',
    //             name: 'Food & Drink',
    //             markers: [
    //                 {position: [28.572965, -81.367007], title: 'Wine & Beer', icon: 'beer-garden', host: 1},
    //                 {position: [28.57213, -81.36699], title: 'Ice Cream', icon: 'icecream', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57211, -81.36687], title: 'Jimmy Bear\'s BBQ', icon: 'barbecue', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57208, -81.3668], title: 'Woodson\'s Wrap Shack', icon: 'foodtruck', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57201, -81.3665], title: 'McGrath Beer Tent', icon: 'beer', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57203, -81.36609], title: 'Bar Tent', icon: 'bar', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57213, -81.36634], title: 'Greek Food', icon: 'food', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57216, -81.36628], title: 'Mugshots Espresso & Coffee', icon: 'coffee', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.5722, -81.36621], title: 'Miss Vi\'s Cook-Up - Caribbean Cuisine', icon: 'food', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57224, -81.36609], title: 'Veggie Garden', icon: 'food', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57223, -81.36603], title: 'Lemonade', icon: 'drink', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57221, -81.36598], title: 'Empenadas', icon: 'food', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57213, -81.36581], title: 'Pizza', icon: 'pizza', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57218, -81.36607], title: 'Crepes', icon: 'food', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57216, -81.366], title: 'Manna International Street Food', icon: 'food', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57173, -81.3658], title: 'Cheese Curds', icon: 'cheese', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.5718, -81.36599], title: 'Papa Korn', icon: 'food', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57171, -81.36624], title: 'Pete & Peg\'s Roadhouse Grill', icon: 'food', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57168, -81.36646], title: 'Drinking Fountain', icon: 'drinkingfountain', location: 'Green Lawn of Fabulousness'}
    //             ]
    //         },
    //         {
    //             id: 'other',
    //             name: 'Other',
    //             markers: [
    //                 {position: [28.57223, -81.36615], title: 'Psychic Reading by Sylvia', icon: 'peace', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57217, -81.36619], title: 'Poetry Vending Machine', icon: 'text', location: 'Green Lawn of Fabulousness', notes: 'Cash in. Poems out. / Keep a wordsmith off the street. / Fresh verse, unrehearsed.'},
    //                 {position: [28.57176, -81.36587], title: 'For Our Future', icon: 'reception', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57178, -81.36593], title: 'Breathe Oxygen Bar', icon: 'yinyang', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57179, -81.36605], title: 'Chair Massage', icon: 'massage', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.57178, -81.36611], title: 'The Center', icon: 'reception', location: 'Green Lawn of Fabulousness'}
    //             ]
    //         },
    //         {
    //             id: 'services',
    //             name: 'Services',
    //             markers: [ // #3875d7
    //                 {position: [28.572980, -81.366786], title: 'ATM', icon: 'atm', host: 1},
    //                 {position: [28.57209, -81.36643], title: 'ATM', icon: 'atm', location: 'Green Lawn of Fabulousness'},
    //                 {position: [28.573535, -81.366921], title: 'Restrooms', icon: 'bathroom', host: 1},
    //                 {position: [28.573117, -81.366799], title: 'Restrooms', icon: 'bathroom', host: 1},
    //                 {position: [28.572941, -81.364958], title: 'Restrooms', icon: 'bathroom', host: 2},
    //                 {position: [28.570965, -81.365557], title: 'Restrooms', icon: 'bathroom', host: 3},
    //                 {position: [28.57163, -81.36599], title: 'Restrooms', icon: 'bathroom', location: 'Green Lawn of Fabulousness'}
    //             ]
    //         },
    //         {
    //             id: 'parking',
    //             name: 'Parking',
    //             markers: [
    //                 {position: [28.573059, -81.366112], title: 'Free Parking', icon: 'parking', host: 1, notes: 'The most convenient for all venues and the Fringe Lawn, but it fills up fast and is the most challenging for finding a spot – it can take as long as 45 minutes to 1 hour at busy times.'},
    //                 {position: [28.571236, -81.366444], title: 'Free Parking', icon: 'parking', host: 3, notes: 'This lot fills up quickly and is occasionally closed to Fringe guests for special events.'},
    //                 {
    //                     position: [28.573045, -81.371020],
    //                     title: 'Parking Garage',
    //                     icon: 'parking-garage',
    //                     location: 'Orlando Hospital',
    //                     address: ['2328 Alden Rd', 'Orlando, FL 32803'],
    //                     notes: 'Free on Saturday or if leaving after midnight.'
    //                 },
    //                 {
    //                     position: [28.568979, -81.363516],
    //                     title: 'Free Weekend Parking',
    //                     icon: 'parking',
    //                     location: 'Magruder Eye Institute',
    //                     address: ['1911 N Mills Ave', 'Orlando, FL 32803'],
    //                     notes: 'Available on Saturdays and Sundays all day during Fringe. Lots of spaces, the perfect location for a short walk to Silver and Green venues.'
    //                 },
    //                 {
    //                     position: [28.568475, -81.365177],
    //                     title: 'Free Weekend Parking',
    //                     icon: 'parking',
    //                     location: 'Florida Urology Associates',
    //                     address: ['1812 N Mills Ave', 'Orlando, FL 32803'],
    //                     notes: 'Available on Saturdays and Sundays all day during Fringe. Lots of spaces, the perfect location for a short walk to Silver and Green venues.'
    //                 }
    //             ]
    //         }
    //     ],
    //     lawnPolygon: [
    //         [28.5722265,-81.3657573],
    //         [28.5723172,-81.365819],
    //         [28.5723524,-81.3659236],
    //         [28.5723972,-81.3660496],
    //         [28.5723901,-81.3661435],
    //         [28.572376,-81.3662173],
    //         [28.5723548,-81.3663125],
    //         [28.5723348,-81.3663729],
    //         [28.5723172,-81.3664654],
    //         [28.5722877,-81.3665673],
    //         [28.5722677,-81.3666679],
    //         [28.5722747,-81.36681],
    //         [28.5723042,-81.3668865],
    //         [28.5723183,-81.3669375],
    //         [28.572217,-81.3670394],
    //         [28.5721723,-81.3670917],
    //         [28.5721311,-81.3671668],
    //         [28.572081,-81.3672198],
    //         [28.5720404,-81.3672741],
    //         [28.5719944,-81.3673438],
    //         [28.5719555,-81.3673693],
    //         [28.5719119,-81.3673747],
    //         [28.5718778,-81.3673452],
    //         [28.5718107,-81.3671829],
    //         [28.5717789,-81.3670447],
    //         [28.5716635,-81.3668329],
    //         [28.5716046,-81.3667417],
    //         [28.5715822,-81.3666947],
    //         [28.5715681,-81.3666545],
    //         [28.5715651,-81.3666036],
    //         [28.5715681,-81.3665566],
    //         [28.5715787,-81.3664708],
    //         [28.5716281,-81.3662776],
    //         [28.5716234,-81.3661489],
    //         [28.5716105,-81.3660725],
    //         [28.5715986,-81.3660175],
    //         [28.5715739,-81.3659652],
    //         [28.5715339,-81.3658551],
    //         [28.571475,-81.3657733],
    //         [28.5717082,-81.3657385],
    //         [28.5718048,-81.3657144],
    //         [28.5718778,-81.365701],
    //         [28.5719803,-81.3657117],
    //         [28.5720734,-81.3657305],
    //         [28.5721393,-81.3657372],
    //         [28.5722265,-81.3657573]
    //     ],
    //     pathLines: [
    //         [
    //             [28.5714868,-81.3658042],
    //             [28.5715304,-81.3657935],
    //             [28.5715622,-81.3657989],
    //             [28.571604,-81.3658089],
    //             [28.5716505,-81.3658069],
    //             [28.5716964,-81.3658002],
    //             [28.571753,-81.3657627],
    //             [28.5718507,-81.3657304],
    //             [28.5719202,-81.3657258],
    //             [28.5719838,-81.3657305],
    //             [28.5720315,-81.3657573],
    //             [28.5720827,-81.3657962],
    //             [28.5721304,-81.3658478],
    //             [28.5721687,-81.3659075],
    //             [28.5722158,-81.3660336],
    //             [28.5722247,-81.3660798],
    //             [28.5722241,-81.3661341],
    //             [28.5721935,-81.3662173],
    //             [28.5721369,-81.3662964],
    //             [28.5720922,-81.3663876],
    //             [28.5720639,-81.3664855],
    //             [28.5720486,-81.3666478],
    //             [28.5720451,-81.3667148],
    //             [28.5720486,-81.3667819],
    //             [28.5720639,-81.3668369],
    //             [28.5720816,-81.3668811],
    //             [28.572131,-81.3669509],
    //             [28.5721581,-81.3669723],
    //             [28.5722111,-81.3669442],
    //             [28.5722747,-81.366908],
    //             [28.5723042,-81.3668865]
    //         ],
    //         [
    //             [28.5716623,-81.366464],
    //             [28.5716894,-81.366393],
    //             [28.5717388,-81.3662897],
    //             [28.5717883,-81.3661851],
    //             [28.5718295,-81.3660845],
    //             [28.5718348,-81.3660329],
    //             [28.5718378,-81.3659839],
    //             [28.5718248,-81.3659316],
    //             [28.5718048,-81.365874],
    //             [28.5717612,-81.3657854],
    //             [28.571753,-81.3657627]
    //         ]
    //     ]
    // })
    .config(['agcLibraryLoaderProvider', 'agcGstaticLoaderProvider', function(agcLibraryLoaderProvider, agcGstaticLoaderProvider) {
        agcLibraryLoaderProvider.setLoader('gstatic');
        agcGstaticLoaderProvider.setOption('mapsApiKey', 'AIzaSyD0y40AVRhf_DDSsFCRT0mBXhjdkQZP4Ys');
    }])
    .config(['$locationProvider', '$routeProvider',
        function config($locationProvider, $routeProvider) {
            $locationProvider.html5Mode(true);

            $routeProvider
                .when('/', {
                    template: '<home></home>',
                    title: 'Create your perfect Fringe schedule automatically'
                }).when('/my-fringe', {
                    template: '<my-fringe></my-fringe>',
                    title: 'My Fringe'
                }).when('/my-fringe/availability', {
                    template: '<my-fringe></my-fringe>',
                    title: 'My Fringe · Availability'
                }).when('/my-fringe/auto-scheduler', {
                    template: '<my-fringe></my-fringe>',
                    title: 'My Fringe · Auto-Scheduler'
                }).when('/shows', {
                    template: '<shows></shows>',
                    title: 'Shows'
                }).when('/shows/venue/:venue', {
                    template: '<shows></shows>',
                    title: 'Shows'
                }).when('/show/:show', {
                    template: '<show></show>',
                    title: 'Show'
                }).when('/show/:show/stats', {
                    template: '<show-stats></show-stats>',
                    title: 'Show Statistics'
                }).when('/schedule/:param1?/:param2?', {
                    template: '<schedule></schedule>',
                    title: 'Schedule'
                }).when('/venues', {
                    template: '<venues></venues>',
                    title: 'Venues'
                // }).when('/map', {
                //     template: '<fringe-map></fringe-map>',
                //     title: 'Map'
                // }).when('/map/venue/:venue', {
                //     template: '<fringe-map></fringe-map>',
                //     title: 'Map'
                // }).when('/map/host/:host', {
                //     template: '<fringe-map></fringe-map>',
                //     title: 'Map'
                }).when('/public/:id', {
                    template: '<public></public>',
                    title: 'Public Schedule'
                }).when('/fun', {
                    template: '<fun></fun>',
                    title: 'Fun'
                }).when('/about/credits', {
                    templateUrl: 'pages/about/credits.html',
                    title: 'Credits'
                }).when('/policies/privacy', {
                    templateUrl: 'pages/policies/privacy.html',
                    title: 'Privacy Policy'
                }).when('/policies/terms', {
                    templateUrl: 'pages/policies/terms.html',
                    title: 'Terms of Service'
                }).when('/admin', {
                    template: '<admin></admin>',
                    title: 'Admin'
                }).when('/admin/users', {
                    template: '<admin-users></admin-users>',
                    title: 'Admin'
                }).when('/admin/sellouts', {
                    template: '<admin-sellouts></admin-sellouts>',
                    title: 'Admin'
                }).when('/admin/users/:helpCode', {
                    template: '<admin-users-view></admin-users-view>',
                    title: 'Admin'
                // }).when('/test', {
                //     template: '<test></test>',
                //     title: 'Test'
                }).otherwise({redirectTo: '/'});
        }
    ])
    .config(['$analyticsProvider', function($analyticsProvider) {
        $analyticsProvider.trackExceptions(false);
        if (ENVIRONMENT === 'dev') {
            $analyticsProvider.developerMode(true);
        }
    }]);