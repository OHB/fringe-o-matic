<?php
if (! isset($_GET['id'])) {
    exit;
}
$id = $_GET['id'];

if (strlen($id) > 32 || preg_match('/[^a-zA-Z0-9]/', $id)) {
    exit;
}

$filename = __DIR__ . '/../userData/' . $id . '.json';

header('Content-type: application/json');

ob_start('ob_gzhandler');

if (file_exists($filename)) {
    echo file_get_contents($filename);
} else {
    echo json_encode([
        'preferences' => [],
        'unavailability' => [],
        'schedule' => [],
        'maybe' => [],
        'settings' => [
            'scheduleMode' => 'full'
        ]
    ]);
}