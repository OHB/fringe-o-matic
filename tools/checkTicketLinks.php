<?php
/** @var mysqli $db */
$db = include __DIR__ . '/../../fringe_db_connect.php';

$results = $db->query('select * from performances');

while ($row = $results->fetch_object()) {
    $url = $row['storeUrl'];

    $document = file_get_contents($url);


}