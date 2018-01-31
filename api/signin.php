<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(400);
    exit;
}

$input = file_get_contents('php://input');

if (strlen($input) > 2000) {
    http_response_code(400);
    exit;
}


$json = json_decode($input);

if (! is_object($json)) {
    http_response_code(400);
    exit;
}

if (! isset($json->googleToken)) {
    http_response_code(400);
    exit;
}

require_once '../vendor/autoload.php';

$client = new Google_Client();
$client->setApplicationName("Fringe_o_Matic");
$client->setDeveloperKey("728570220201-2tkhj9m3stsqgprscc77o256r0f441au.apps.googleusercontent.com");
$ticket = $client->verifyIdToken($json->googleToken);

if (! $ticket) {
    http_response_code(401);
    exit;
}

$googleId = $ticket['sub'];

/** @var mysqli $db */
$db = include __DIR__ . '/../../fringe_db_connect.php';

$statement = $db->prepare('SELECT * FROM `users` WHERE `googleId`=?');
$statement->bind_param('s', $googleId);
$statement->execute();
$result = $statement->get_result();

if ($result->num_rows === 0) {
    $accountData = [
        'privateHash' => md5('FOMPRIVATE' . microtime(true) . rand(1000, 1000000)),
        'publicHash' => md5('FOMPUBLIC' . microtime(true) . rand(1000, 1000000)),
        'helpCode' => strtoupper(substr(md5('FOMHELPCODE' . microtime(true) . rand(1000, 1000000)), 0, 6)),
        'isAdmin' => false
    ];

    $statement = $db->prepare(
        "INSERT INTO `users` (`helpCode`, `privateHash`, `publicHash`, `googleId`, `dateCreated`, `dateLastLogin`) VALUES ('" . $accountData['helpCode'] . "', '" . $accountData['privateHash'] . "', '" . $accountData['publicHash'] . "', ?, now(), now())");

    $statement->bind_param('s', $googleId);
    $statement->execute();

    $userId = $db->insert_id;

    $statement = $db->prepare('INSERT INTO `user_settings` (`userId`) VALUES (?)');
    $statement->bind_param('i', $userId);
    $statement->execute();

    $festivalData = json_decode(file_get_contents(__DIR__ . '/data.json'), JSON_OBJECT_AS_ARRAY);

    $sql = '';

    $values = [];
    foreach (array_keys($festivalData['performances']) as $performanceId) {
        $values[] = '(' . $userId . ', ' . $performanceId . ')';
    }
    $sql .= 'INSERT INTO `user_performances` (`userId`, `performanceId`) VALUES ' . implode(',', $values) . ';';


    $values = [];
    foreach ($festivalData['availabilitySlots'] as $day => $slots) {
        foreach ($slots as $slot) {
            $values[] = '(' . $userId . ', ' . $slot . ')';
        }
    }
    $sql .= 'INSERT INTO `user_availability` (`userId`, `slotStart`) VALUES ' . implode(',', $values) . ';';

    $db->multi_query($sql);
    while ($db->next_result()) {;}

} else {
    $obj = $result->fetch_object();

    $accountData = [
        'privateHash' => $obj->privateHash,
        'publicHash' => $obj->publicHash,
        'helpCode' => $obj->helpCode,
        'isAdmin' => (bool) $obj->isAdmin
    ];

    $userId = $obj->id;
}

$db->query("UPDATE `users` SET `dateLastLogin`=now() WHERE `privateHash`='" . $accountData['privateHash'] . "'");


$result = $db->query("SELECT * FROM `user_settings` WHERE `userId`={$userId}");
$row = $result->fetch_object();
$settings = [
    'scheduleMode' => $row->scheduleMode,
    'autoScheduleIntroComplete' => (bool) $row->autoScheduleIntroComplete,
    'displaySchedulerStats' => (bool) $row->displaySchedulerStats,
    'googleCalendarSyncId' => $row->googleCalendarSyncId,
    'publicScheduleName' => $row->publicScheduleName
];


// @todo if interested or attending != 'no'
$schedule = $maybe = $interests = [];
$result = $db->query("SELECT * FROM `user_performances` WHERE `userId`={$userId}");
while ($row = $result->fetch_object()) {
    if ($row->interest) {
        $interests[$row->performanceId] = (string) $row->interest;
    }
    if ($row->attending == 'yes') {
        $schedule[] = (string) $row->performanceId;
    } else if ($row->attending == 'maybe') {
        $maybe[] = (string) $row->performanceId;
    }
}

$unavailability = [];
$result = $db->query("SELECT * FROM `user_availability` WHERE `userId`={$userId} AND `available`=0");
while ($row = $result->fetch_object()) {
    $unavailability[] = $row->slotStart;
}

header('Content-type: application/json');
echo json_encode([
    'account' => $accountData,
    'settings' => $settings,
    'schedule' => $schedule,
    'maybe' => $maybe,
    'preferences' => (object) $interests,
    'unavailability' => $unavailability
]);
