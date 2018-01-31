<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(400);
    echo 'A';
    exit;
}

$input = file_get_contents('php://input');

if (strlen($input) > 10000) {
    http_response_code(400);
    echo 'B';
    exit;
}

$json = json_decode($input);

if (! is_object($json)) {
    http_response_code(400);
    echo 'C';
    exit;
}

if (! isset($json->account) || ! isset($json->account->privateHash) || ! isset($json->preferences) || ! isset($json->schedule) || ! isset($json->settings) || ! isset($json->unavailability) || ! isset($json->maybe)) {
    http_response_code(400);
    echo 'D';
    exit;
}

/** @var mysqli $db */
$db = include __DIR__ . '/../../fringe_db_connect.php';

$statement = $db->prepare('SELECT * FROM `users` WHERE `privateHash`=?');
$statement->bind_param('s', $json->account->privateHash);
$statement->execute();
$result = $statement->get_result();

if ($result->num_rows < 1) {
    http_response_code(401);
    exit;
}

$userId = $result->fetch_object()->id;


// SETTINGS

if (isset($json->settings->scheduleMode) && in_array($json->settings->scheduleMode, ['full', 'smart'])) {
    $db->query("UPDATE `user_settings` SET `scheduleMode`='{$json->settings->scheduleMode}' WHERE `userId`={$userId}");
}

$value = (isset($json->settings->autoScheduleIntroComplete) ? $json->settings->autoScheduleIntroComplete : false) ? 1 : 0;
$db->query("UPDATE `user_settings` SET `autoScheduleIntroComplete`={$value} WHERE `userId`={$userId}");

$value = (isset($json->settings->displaySchedulerStats) ? $json->settings->displaySchedulerStats : false) ? 1 : 0;
$db->query("UPDATE `user_settings` SET `displaySchedulerStats`={$value} WHERE `userId`={$userId}");

$value = isset($json->settings->publicScheduleName) ? trim($json->settings->publicScheduleName) : null;
if (! $value) {
    $db->query("UPDATE `user_settings` SET `publicScheduleName`=NULL WHERE `userId`={$userId}");
} else {
    $statement = $db->prepare("UPDATE `user_settings` SET `publicScheduleName`=? WHERE `userId`={$userId}");
    $statement->bind_param('s', $value);
    $statement->execute();
}

$value = isset($json->settings->googleCalendarSyncId) ? $json->settings->googleCalendarSyncId : null;
if (! $value) {
    $db->query("UPDATE `user_settings` SET `googleCalendarSyncId`=NULL WHERE `userId`={$userId}");
} else {
    $statement = $db->prepare("UPDATE `user_settings` SET `googleCalendarSyncId`=? WHERE `userId`={$userId}");
    $statement->bind_param('s', $json->settings->googleCalendarSyncId);
    $statement->execute();
}




$sql = [
    "UPDATE `user_availability` SET `available`=1 WHERE `userId`={$userId}",
    "UPDATE `user_performances` SET `interest`=0, `attending`='no' WHERE `userId`={$userId}"
];


// AVAILABILITY
$slotIds = implode(',', array_map(function($slot) {
    return (int) $slot;
}, $json->unavailability));
if ($slotIds) {
    $sql[] = "UPDATE `user_availability` SET `available`=0 WHERE `slotStart` IN ({$slotIds}) AND `userId`={$userId}";
}


// SCHEDULE
$performanceIds = implode(',', array_map(function($performanceId) {
    return (int) $performanceId;
}, $json->schedule));
if ($performanceIds) {
    $sql[] = "UPDATE `user_performances` SET `attending`='yes' WHERE `performanceId` IN ({$performanceIds}) AND `userId`={$userId}";
}

// MAYBE
$performanceIds = implode(',', array_map(function($performanceId) {
    return (int) $performanceId;
}, $json->maybe));
if ($performanceIds) {
    $sql[] = "UPDATE `user_performances` SET `attending`='maybe' WHERE `performanceId` IN ({$performanceIds}) AND `userId`={$userId}";
}
// PREFERENCES
$preferences = [4 => [], 3 => [], 2 => [], 1 => []];
foreach ($json->preferences as $performanceId => $interest) {
    $preferences[(int) $interest][] = (int) $performanceId;
}

foreach ($preferences as $interest => $ids) {
    if (! $ids) {
        continue;
    }
    $performanceIds = implode(',', $ids);

    $sql[] = "UPDATE `user_performances` SET `interest`={$interest} WHERE `performanceId` IN ({$performanceIds}) AND `userId`={$userId}";
}

$db->multi_query(implode(';', $sql));
while ($db->next_result()) {;}
