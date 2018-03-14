<?php
header('Content-type: text/csv');
header('Content-Disposition: attachment; filename="OrlandoFringeFestivalSchedule2018.csv"');

/** @var mysqli $db */
$db = include __DIR__ . '/../../fringe_db_connect.php';

function writeRow(array $row) {
    echo implode(',', array_map(function($i) {
        $i = trim(str_replace('"', '""', $i));

        if (strstr($i, ',') !== false || strstr($i, '"') !== false || strstr($i, ' ') !== false) {
            return '"' . $i . '"';
        }

        return $i;
    }, $row)) . "\n";
}

$ratings = [];
$results = $db->query('select * from ratings where seasonId=2');
while ($row = $results->fetch_assoc()) {
    $ratings[$row['id']] = $row['name'];
}

$venues = [];
$results = $db->query('select * from venues where venueHostId in (select id from venue_hosts where seasonId=2)');
while ($row = $results->fetch_assoc()) {
    $venues[$row['id']] = $row['name'];
}

$shows = [];
$results = $db->query('select * from shows where seasonId=2');
while ($row = $results->fetch_assoc()) {
    $shows[$row['id']] = $row;
}

writeRow(["Date", "Time", "Show Title", "Production Co. Name", "Price", "Length", "Rating", "Venue", "Fringe-o-Matic Link"]);

$results = $db->query('select * from performances where showId in (select id from shows where seasonId=2) order by start');
while ($row = $results->fetch_assoc()) {
    $start = strtotime($row['start']);
    $show = $shows[$row['showId']];

    writeRow([
        date('l, F jS', $start),
        date('g:iA', $start),
        $show['name'],
        $show['artist'],
        $show['price'],
        $show['duration'] / 60,
        $ratings[$show['ratingId']],
        $venues[$show['venueId']],
        "https://fringeomatic.com/show/" . $show['slug']
    ]);
}