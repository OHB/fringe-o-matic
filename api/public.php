<?php
if ($_SERVER['REQUEST_METHOD'] !== 'GET' || ! isset($_GET['hash'])) {
    http_response_code(400);
    exit;
}

if (strlen($_GET['hash']) !== 32) {
    http_response_code(400);
    exit;
}

/** @var mysqli $db */
$db = include __DIR__ . '/../../fringe_db_connect.php';

$statement = $db->prepare('SELECT `id` FROM `users` WHERE `publicHash`=?');
$statement->bind_param('s', $_GET['hash']);
$statement->execute();
$result = $statement->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    exit;
}

$obj = $result->fetch_object();
$userId = $obj->id;


$result = $db->query("SELECT `publicScheduleName` FROM `user_settings` WHERE `userId`={$userId}");
$obj = $result->fetch_object();
$title = $obj->publicScheduleName;

$schedule = [];
$result = $db->query("SELECT `performanceId` FROM `user_performances` WHERE `userId`={$userId} AND `attending`='yes'");
while ($row = $result->fetch_object()) {
    $schedule[] = (string) $row->performanceId;
}

header('Content-type: application/json');
echo json_encode([
    'title' => $title,
    'schedule' => $schedule
]);
