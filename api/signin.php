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
    $chars = str_split('acdefghkmnpqrtvwxyzACDEFGHKMNPQRTVWYZ346789');
    shuffle($chars);

    $accountData = [
        'privateHash' => md5('FOMPRIVATE' . microtime(true) . rand(1000, 1000000)),
        'publicHash' => implode('', array_map(function($i) use($chars) {
            return $chars[$i];
        }, array_rand($chars, 6))),
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

    $festivalData = json_decode(file_get_contents(__DIR__ . '/cache.json'), JSON_OBJECT_AS_ARRAY);

//    $sql = 'insert into user_shows (userId, showId) select ' . $userId . ', s.id from shows s';
    $values = [];
    foreach (array_keys($festivalData['shows']) as $showId) {
        $values[] = '(' . $userId . ', ' . $showId . ')';
    }
    $sql .= 'INSERT INTO `user_shows` (`userId`, `showId`) VALUES ' . implode(',', $values) . ';';


//    $sql = 'insert into user_performances (userId, performanceId) select ' . $userId . ', p.id from performances p';
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
    'account' => $accountData,
    'settings' => $settings,
    'schedule' => $schedule,
    'maybe' => $maybe,
    'preferences' => (object) $interests,
    'unavailability' => $unavailability
]);
