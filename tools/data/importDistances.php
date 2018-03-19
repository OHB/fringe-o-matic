<?php
$venueGroups = [
    'shakesmoma' => [2, 3, 4, 6, 7, 8, 9, 11, 16, 17, 18, 19],
    'rep' => [5, 10, 14],
    'venue' => [1],
    'savoy' => [13],
    'breakthrough' => [12],
    'aqua' => [15]
];

$distances = [
    ['shakesmoma', 'rep', 5, 0],
    ['shakesmoma', 'venue', 20, 20],
    ['shakesmoma', 'savoy', 20, 20],
    ['shakesmoma', 'breakthrough', 45, 20],
    ['shakesmoma', 'aqua', 20, 20],
    ['rep', 'venue', 25, 15],
    ['rep', 'savoy', 20, 20],
    ['rep', 'breakthrough', 50, 25],
    ['rep', 'aqua', 25, 25],
    ['venue', 'savoy', 15, 15],
    ['venue', 'breakthrough', 60, 20],
    ['venue', 'aqua', 35, 20],
    ['savoy', 'breakthrough', 60, 20],
    ['savoy', 'aqua', 35, 20],
    ['breakthrough', 'aqua', 45, 20]
];

$all = [];

foreach ($venueGroups as $groupName => $places) {
    foreach ($places as $id1) {
        foreach ($places as $id2) {
            $all[] = [$id1, $id2, 4 * 60, 0];
        }
    }
}

foreach ($distances as $set) {
    list($fromGroup, $toGroup, $walking, $driving) = $set;

    foreach ($venueGroups[$fromGroup] as $from) {
        foreach ($venueGroups[$toGroup] as $to) {
            $all[] = [$from, $to, $walking * 60, $driving * 60];
            $all[] = [$to, $from, $walking * 60, $driving * 60];
        }
    }
}

/** @var mysqli $db */
$db = include __DIR__ . '/../../../fringe_db_connect.php';

$statement = $db->prepare('insert into venue_distances values(?, ?, ?, ?)');

foreach ($all as $item) {
    $statement->bind_param('iiii', $item[0], $item[1], $item[2], $item[3]);
    $statement->execute();
}