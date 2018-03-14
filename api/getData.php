<?php
header('Content-type: application/json');

ob_start('ob_gzhandler');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(400);
    exit;
}

if (! isset($_GET['refresh']) && file_exists('cache.json')) {
    readfile('cache.json');
    exit;
}

/** @var mysqli $db */
$db = include __DIR__ . '/../../fringe_db_connect.php';

$showPerformances = [];
$results = $db->query('select * from performances where showId in (select id from shows where seasonId=2)');
while ($row = $results->fetch_assoc()) {
    if (! isset($showPerformances[$row['showId']])) {
        $showPerformances[$row['showId']] = [];
    }
    $showPerformances[$row['showId']][$row['id']] = $row;
}

$showGenres = [];
$results = $db->query('select * from show_genres where showId in (select id from shows where seasonId=2)');
while ($row = $results->fetch_assoc()) {
    if (! isset($showGenres[$row['showId']])) {
        $showGenres[$row['showId']] = [];
    }
    $showGenres[$row['showId']][] = (string) $row['genreId'];
}

$data = [
    'shows' => [],
    'performances' => [],
    'ratings' => [],
    'genres' => [],
    'venues' => [],
    'venueHosts' => [],
    'distances' => [],
    'availabilitySlots' => [],
    'availabilitySlotsAll' => []
];

$showResults = $db->query('select * from shows where seasonId=2');

while ($show = $showResults->fetch_assoc()) {
    $data['shows'][$show['id']] = [
        'name' => $show['name'],
        'slug' => $show['slug'],
        'rating' => (string) $show['ratingId'],
        'venue' => (string) $show['venueId'],
        'price' => $show['price'],
        'description' => $show['description'],
        'artist' => $show['artist'],
        'artistLocation' => $show['artistLocation'],
        'storeUrl' => $show['storeUrl'],
        'image' => $show['image450'],
        'warnings' => $show['warnings'],
        'duration' => (int) $show['duration'],
        'genres' => $showGenres[$show['id']],
        'performances' => []
    ];

    foreach ($showPerformances[$show['id']] as $performance) {
        $start = strtotime($performance['start']);
        $end = strtotime($performance['start']) + $show['duration'];
        $day = strtotime(date('Y-m-d', $start));


        $data['shows'][$show['id']]['performances'][] = (string) $performance['id'];
        $data['performances'][$performance['id']] = [
            'start' => $start,
            'stop' => $end,
            'show' => (string) $show['id'],
            'storeUrl' => $performance['storeUrl']
        ];

        if (! isset($data['availabilitySlots'][$day])) {
            $data['availabilitySlots'][$day] = [];
        }

        // why was this $end + 900 ???
        for ($i = $start; $i < $end; $i += 3600) {
            $slot = $i - ($i % 3600);
            $data['availabilitySlots'][$day][$slot] = true;
            $data['availabilitySlotsAll'][$slot - $day] = true;
        }
    }
}

$data['availabilitySlotsAll'] = array_keys($data['availabilitySlotsAll']);
sort($data['availabilitySlotsAll']);

foreach ($data['availabilitySlots'] as $day => &$slots) {
    $slots = array_keys($slots);
    sort($slots);
}

ksort($data['availabilitySlots']);

$results = $db->query('select * from ratings where seasonId=2');
while ($row = $results->fetch_assoc()) {
//    $data['ratings'][$row['id']] = [
//        'name' => $row['name'],
//        'slug' => $row['slug']
//    ];
    $data['ratings'][$row['id']] = $row['name'];
}

$results = $db->query('select * from genres where seasonId=2 order by name');
while ($row = $results->fetch_assoc()) {
//    $data['genres'][$row['id']] = [
//        'name' => $row['name'],
//        'slug' => $row['slug']
//    ];
    $data['genres'][$row['id']] = $row['name'];
}

$hostResults = $db->query('select * from venue_hosts where seasonId=2');

while ($host = $hostResults->fetch_assoc()) {
    $data['venueHosts'][$host['id']] = [
        'name' => $host['name'],
        'slug' => $host['slug'],
        'addressStreet' => $host['street'],
        'addressLocality' => $host['locality'],
        'addressRegion' => $host['region'],
        'addressPostCode' => $host['postCode'],
        'addressCountry' => $host['country']
    ];
}

$results = $db->query('select * from venues where venueHostId in (select id from venue_hosts where seasonId=2)');

while ($row = $results->fetch_assoc()) {
    $data['venues'][$row['id']] = [
        'name' => $row['name'],
        'slug' => $row['slug'],
        'host' => (string) $row['venueHostId'],
        'mapPos' => [$row['latitude'], $row['longitude']],
        'mapIcon' => $row['mapIcon']
    ];
}

$results = $db->query('select * from venue_distances where venueId1 in (select id from venues where venueHostId in (select id from venue_hosts where seasonId=2))');

while ($row = $results->fetch_assoc()) {
    if (! isset($data['distances'][$row['venueId1']])) {
        $data['distances'][$row['venueId1']] = [];
    }

    $data['distances'][$row['venueId1']][$row['venueId2']] = [(int) $row['walkingTime']];
    if ($row['drivingTime']) {
        $data['distances'][$row['venueId1']][$row['venueId2']][] = (int) $row['drivingTime'];
    }
//    $data['distances'][$row['venueId1']][$row['venueId2']] = min((int) $row['walkingTime'], (int) $row['drivingTime'] ?: 9999);
}

$json = json_encode($data, JSON_UNESCAPED_UNICODE + JSON_UNESCAPED_SLASHES);
file_put_contents('cache.json', $json);

echo $json;
exit;