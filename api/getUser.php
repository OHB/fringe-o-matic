<?php
if ($_SERVER['REQUEST_METHOD'] !== 'GET' || ! isset($_GET['privateHash']) || ! isset($_GET['helpCode'])) {
    http_response_code(400);
    exit;
}

if (strlen($_GET['helpCode']) !== 6) {
    http_response_code(400);
    exit;
}

if (strlen($_GET['privateHash']) !== 32) {
    http_response_code(400);
    exit;
}

/** @var mysqli $db */
$db = include __DIR__ . '/../../fringe_db_connect.php';

$statement = $db->prepare('SELECT * FROM `users` WHERE isAdmin=1 AND `privateHash`=?');
$statement->bind_param('s', $_GET['privateHash']);
$statement->execute();
$result = $statement->get_result();

if ($result->num_rows < 1) {
    http_response_code(401);
    exit;
}

$statement = $db->prepare('SELECT `id` FROM `users` WHERE `helpCode`=?');
$statement->bind_param('s', $_GET['helpCode']);
$statement->execute();
$result = $statement->get_result();
$userId = $result->fetch_object()->id;

$result = $db->query("SELECT * FROM `user_settings` WHERE `userId`={$userId}");
$row = $result->fetch_object();
$settings = [
    'scheduleMode' => $row->scheduleMode,
    'autoScheduleIntroComplete' => (bool) $row->autoScheduleIntroComplete,
    'availabilityIntroComplete' => (bool) $row->autoScheduleIntroComplete,
    'displaySchedulerStats' => (bool) $row->displaySchedulerStats,
    'googleCalendarSyncId' => $row->googleCalendarSyncId,
    'publicScheduleName' => $row->publicScheduleName
];


$schedule = $maybe = $interests = [];

$result = $db->query("SELECT * FROM `user_shows` WHERE `userId`={$userId} AND interest > 0");
while ($row = $result->fetch_object()) {
    $interests[$row->showId] = (string) $row->interest;
}


$result = $db->query("SELECT * FROM `user_performances` WHERE `userId`={$userId} AND attending != 'no'");
while ($row = $result->fetch_object()) {
    if ($row->attending == 'yes') {
        $schedule[] = (string) $row->performanceId;
    } else if ($row->attending == 'maybe') {
        $maybe[] = (string) $row->performanceId;
    }
}

$unavailability = [];
$result = $db->query("SELECT * FROM `user_availability` WHERE `userId`={$userId} AND `available`=0");
while ($row = $result->fetch_object()) {
    $unavailability[] = (string) $row->slotStart;
}

header('Content-type: application/json');
echo json_encode([
    'settings' => $settings,
    'schedule' => $schedule,
    'maybe' => $maybe,
    'preferences' => (object) $interests,
    'unavailability' => $unavailability
]);
