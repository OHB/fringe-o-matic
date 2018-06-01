<?php
/** @var mysqli $db */
$db = include __DIR__ . '/../../fringe_db_connect.php';

$festivalData = json_decode(file_get_contents(__DIR__ . '/../api/cache.json'), JSON_OBJECT_AS_ARRAY);

$availabilities = [];
foreach ($festivalData['availabilitySlots'] as $day => $slots) {
    foreach ($slots as $slot) {
        $availabilities[] = $slot;
    }
}

$results = $db->query('select * from user_availability');

while ($row = $results->fetch_object()) {
    if (! in_array($row->slotStart, $availabilities)) {
        echo $row->slotStart . ',';
    }
}