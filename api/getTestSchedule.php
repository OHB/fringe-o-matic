<?php
ob_start("ob_gzhandler");
$showsToSuppress = range(164, 185);
$colorVenues = [11, 2, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 23];
$byov = [3, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

$venueHosts = [
    1 => ['name' => 'Orlando Shakespeare Theater', 'address' => ['812 E Rollins St', 'Orlando, FL 32803']],
    2 => ['name' => 'Orlando Museum of Art', 'address' => ['2416 N Mills Ave', 'Orlando, FL 32803']],
    3 => ['name' => 'Orlando Repertory Theatre', 'address' => ['1001 E Princeton St', 'Orlando, FL 32803']],
    4 => ['name' => 'Junior Achievement', 'address' => ['2121 Camden Rd', 'Orlando, FL 32803']],
    5 => ['name' => 'The Venue', 'address' => ['511 Virginia Dr', 'Orlando, FL 32803'], 'driving' => 'possible'],
    6 => ['name' => 'Breakthrough Theatre of Winter Park', 'address' => ['421 W Fairbanks Ave', 'Winter Park, FL 32789'], 'driving' => 'assumed'],
    7 => ['name' => "St. Matthew's Tavern at the Orlando Beer Garden", 'address' => ['1300 N Mills Ave', 'Orlando, FL 32803'], 'driving' => 'possible'],
    8 => ['name' => 'Savoy Orlando', 'address' => ['1913 N Orange Ave', 'Orlando, FL 32804'], 'driving' => 'possible'],
    9 => ['name' => 'The Pergande Home', 'address' => ['1314 Chichester St', 'Orlando, FL 32803'], 'driving' => 'recommended'],
    10 => ['name' => 'Loch Haven Park', 'address' => ['777 E Princeton St', 'Orlando, FL 32803'], 'mapPos' => [28.571989, -81.366292]]
];

$venueDetails = [
    1 => ['host' => '5', 'mapPos' => [28.564200, -81.371095], 'mapIcon' => 'black'], //black lawn
    2 => ['host' => '1', 'mapPos' => [28.573512, -81.366985], 'mapIcon' => 'orange'],
    3 => ['host' => '8', 'mapPos' => [28.569191, -81.372610], 'mapIcon' => 'other-venue'], //savoy
    4 => ['host' => '1', 'mapPos' => [28.572828, -81.366687], 'mapIcon' => 'pink'],
    5 => ['host' => '3', 'mapPos' => [28.571193, -81.365546], 'mapIcon' => 'silver'],
    6 => ['host' => '1', 'mapPos' => [28.572854, -81.366859], 'mapIcon' => 'brown'],
    7 => ['host' => '1', 'mapPos' => [28.573298, -81.366974], 'mapIcon' => 'yellow'],
    8 => ['host' => '1', 'mapPos' => [28.573126, -81.366710], 'mapIcon' => 'purple'],
    9 => ['host' => '1', 'mapPos' => [28.573594, -81.366760], 'mapIcon' => 'blue'],
    10 => ['host' => '1', 'mapPos' => [28.572749, -81.366984], 'mapIcon' => 'red'],
    11 => ['host' => '5', 'mapPos' => [28.564206, -81.371232], 'mapIcon' => 'black'],
    12 => ['host' => '2', 'mapPos' => [28.572950, -81.365061], 'mapIcon' => 'gold'],
    13 => ['host' => '3', 'mapPos' => [28.571059, -81.365140], 'mapIcon' => 'green'],
    14 => ['host' => '4', 'mapPos' => [28.571032, -81.369062], 'mapIcon' => 'white'],
    15 => ['host' => '7', 'mapPos' => [28.562274, -81.364683], 'mapIcon' => 'other-venue'], //st matts
    16 => ['host' => '6', 'mapPos' => [28.593251, -81.354743], 'mapIcon' => 'other-venue'], //breakthrough
    17 => ['host' => '2', 'mapPos' => [28.573137, -81.365470], 'mapIcon' => 'other-venue'], //artists
    18 => ['host' => '9', 'mapPos' => [28.581072, -81.362175], 'mapIcon' => 'other-venue'], //livingroom
    19 => ['host' => '1', 'mapPos' => [28.573016, -81.366936], 'mapIcon' => 'other-venue'], //courtyard
    20 => ['host' => '1', 'mapPos' => [28.572943, -81.366522], 'mapIcon' => 'other-venue'], //in front
    21 => ['host' => '1', 'mapPos' => [28.572846, -81.367439], 'mapIcon' => 'other-venue'], //tree
    22 => ['host' => '10', 'mapPos' => [28.571660, -81.366992], 'mapIcon' => 'other-venue'], //rocket thrower
    23 => ['host' => '3', 'mapPos' => [28.570885, -81.365778], 'mapIcon' => 'other-venue'], //teen
    24 => ['host' => '10', 'mapPos' => [28.571805, -81.366895], 'mapIcon' => 'tent'], //stage
];

$showsToSuppress[] = 3;
$showsToSuppress[] = 187;
$venueGroups = [
    'shakesmomalawn' => [2, 4, 6, 7, 8, 9, 10, 12, 17, 19, 20, 21, 22, 23, 24],
    'rep' => [5, 13],
    'venue' => [1, 11],
    'savoy' => [3],
    'jac' => [14],
    'stmatt' => [15],
    'breakthrough' => [16],
    'livingroom' => [18]
];

$groupDistances = [
    'shakesmomalawn' => [
        'rep' => 10,
        'venue' => 20,
        'savoy' => 20,
        'jac' => 15,
        'stmatt' => 20,
        'breakthrough' => 25,
        'livingroom' => 20
    ],
    'rep' => [
        'venue' => 30,
        'savoy' => 30,
        'jac' => 15,
        'stmatt' => 30,
        'breakthrough' => 35,
        'livingroom' => 30
    ],
    'venue' => [
        'savoy' => 20,
        'jac' => 25,
        'stmatt' => 20,
        'breakthrough' => 30,
        'livingroom' => 25
    ],
    'savoy' => [
        'jac' => 20,
        'stmatt' => 25,
        'breakthrough' => 25,
        'livingroom' => 25
    ],
    'jac' => [
        'stmatt' => 25,
        'breakthrough' => 40,
        'livingroom' => 30
    ],
    'stmatt' => [
        'breakthrough' => 30,
        'livingroom' => 25
    ],
    'breakthrough' => [
        'livingroom' => 25
    ]
];

$ratings = ['All Ages', '7+', '13+', '16+', '18+', 'TBD'];

header('Content-type: application/json');

if (file_exists('cache.json')) {
//    echo file_get_contents('cache.json');
//    exit;
}

$supplementalData = [];
$csv = parse_csv(file_get_contents('data.csv'));
//echo json_encode($csv);exit;
foreach ($csv as $csvData) {
    $title = trim($csvData[2]);
    $rating = trim($csvData[6]);

    if (! $rating) {
        $rating = 'TBD';
    } else if (strtolower($rating) == 'all ages') {
        $rating = 'All Ages';
    }

    $supplementalData[$title] = [
        'artist' => trim($csvData[3]),
        'price' => (int) $csvData[4],
        'rating' => $rating
    ];
}

$extraData = json_decode(file_get_contents('extraData.json'), JSON_OBJECT_AS_ARRAY);

foreach ($extraData as $showId => $data) {
    $data['title'] = str_replace('&amp;', '&', trim($data['title']));
    $data['title'] = str_replace('&quot;', '"', trim($data['title']));
    if (! isset($supplementalData[$data['title']])) {
        die ($data['title'] . "\n\n");
    }
    $supplementalData[$data['title']]['description'] = $data['description'];
    $supplementalData[$data['title']]['artistLocation'] = $data['artistLocation'];
    $supplementalData[$data['title']]['storeId'] = $showId;
    if (isset($data['img'])) {
        $supplementalData[$data['title']]['image'] = $data['img'];
    }
    if (isset($data['warnings'])) {
        $supplementalData[$data['title']]['warnings'] = $data['warnings'];
    }
}

$json = json_decode(file_get_contents('shows.json'));

$events = [];
$performances = [];
$venues = [];
$availabilitySlots = [];
$availabilitySlotsAll = [];

$performanceCount = 0;

$venueMap = [];

foreach ($json as $showId => $show) {
    $showId ++;

    if (in_array($showId, $showsToSuppress)) {
        continue;
    }

    if (! isset($venueMap[$show->venue])) {
        $venueId = count($venues) + 1;
        $venues[$venueId] = ['name' => $show->venue, 'byov' => in_array($venueId, $byov)];
        if (isset($venueDetails[$venueId])) {
            $venues[$venueId] += $venueDetails[$venueId];
        }
        $venueMap[$show->venue] = $venueId;

        if (in_array($venueId, $colorVenues)) {
            $venues[$venueId]['name'] .= ' Venue';
        }

    }

    $name = trim($show->name);
    if (! isset($supplementalData[$name])) {
        die($showId . ': ' . $show->name);
    }

    $event = [
        'name' => $name,
        'rating' => array_search($supplementalData[$name]['rating'], $ratings),
        'venue' => (string) $venueMap[$show->venue],
        'performances' => []
    ];

    foreach ($supplementalData[$name] as $key => $value) {
        if ($key == 'rating') {
            continue;
        }
        $event[$key] = $value;
    }

    if (isset($event['image']) && (! file_exists('../img/show/' . $event['image']) || ! filesize('../img/show/' . $event['image']))) {
        $file = file_get_contents('https://orlandofringe.showare.com/uplimage/' . str_replace(' ', '%20', $event['image']));
        if (! $file) {
            print_r($event);exit;
        }
        if (! file_put_contents('../img/show/' . $event['image'], $file)) {
            print_r($event);exit;
        }
    }

    foreach ($show->shows as $start) {
        $performanceCount ++;
        $performanceId = $performanceCount;
        $end = $start + ($show->duration * 60);

        $performances[$performanceId] = [
            'start' => $start,
            'stop' => $end,
            'show' => (string) $showId,
            'storeId' => $performanceId
        ];

        $event['performances'][] = (string) $performanceId;

        $day = strtotime(date('Y-m-d', $start));

        if (! isset($availabilitySlots[$day])) {
            $availabilitySlots[$day] = [];
        }

        // why was this $end + 900 ???
        for ($i = $start; $i < $end; $i += 3600) {
            $slot = $i - ($i % 3600);
            $availabilitySlots[$day][$slot] = true;
            $availabilitySlotsAll[$slot - $day] = true;
        }

    }

    $events[$showId] = $event;
}

uasort($events, function($a, $b) {
    return strcmp($a['name'], $b['name']);
});

$availabilitySlotsAll = array_keys($availabilitySlotsAll);
sort($availabilitySlotsAll);

foreach ($availabilitySlots as $day => &$slots) {
    $slots = array_keys($slots);
}

$distances = array_combine(array_keys($venues), array_fill(0, count($venues), []));

foreach ($groupDistances as $fromGroup => $tos) {
    if (! isset($tos['*'])) {
        $tos['*'] = 2;
    }
    foreach ($venueGroups[$fromGroup] as $from) {
        foreach ($tos as $toGroup => $time) {
            $time *= 60;
            foreach ($venueGroups[$toGroup == '*' ? $fromGroup : $toGroup] as $to) {
                $distances[$from][$to] = $time;
                $distances[$to][$from] = $time;
            }
        }
    }
}

$json = json_encode([
    'shows' => $events,
    'performances' => $performances,
    'ratings' => $ratings,
    'venues' => $venues,
    'venueHosts' => $venueHosts,
    'distances' => $distances,
    'availabilitySlots' => $availabilitySlots,
    'availabilitySlotsAll' => $availabilitySlotsAll,
], JSON_UNESCAPED_UNICODE + JSON_UNESCAPED_SLASHES);

file_put_contents('cache.json', $json);

echo $json;



function parse_csv ($csv_string, $delimiter = ",", $skip_empty_lines = true, $trim_fields = true)
{
    $enc = preg_replace('/(?<!")""/', '!!Q!!', $csv_string);
    $enc = preg_replace_callback(
        '/"(.*?)"/s',
        function ($field) {
            return rawurlencode(utf8_encode($field[1]));
        },
        $enc
    );
    $lines = preg_split($skip_empty_lines ? ($trim_fields ? '/( *\R)+/s' : '/\R+/s') : '/\R/s', $enc);
    return array_map(
        function ($line) use ($delimiter, $trim_fields) {
            $fields = $trim_fields ? array_map('trim', explode($delimiter, $line)) : explode($delimiter, $line);

            return array_map(
                function ($field) {
                    return str_replace('!!Q!!', '"', utf8_decode(rawurldecode($field)));
                },
                $fields
            );
        },
        $lines
    );
}