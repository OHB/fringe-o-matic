<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || ! isset($_GET['privateHash']) || ! isset($_GET['fromHelpCode'])) {
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

$targetUserId = $result->fetch_assoc()['id'];

$statement = $db->prepare('SELECT * FROM `users` WHERE `helpCode`=?');
$statement->bind_param('s', $_GET['fromHelpCode']);
$statement->execute();
$result = $statement->get_result();

if ($result->num_rows < 1) {
    http_response_code(400);
    exit;
}

$sourceUserId = $result->fetch_assoc()['id'];


$db->query('delete from user_performances where userId=' . $targetUserId);
$db->query('insert into user_performances SELECT ' . $targetUserId . ' as userId,performanceId,attending FROM `user_performances` WHERE userId=' . $sourceUserId);
$db->query('delete from user_shows where userId=' . $targetUserId);
$db->query('insert into user_shows SELECT ' . $targetUserId . ' as userId,showId,interest FROM `user_shows` WHERE userId=' . $sourceUserId);
$db->query('delete from user_availability where userId=' . $targetUserId);
$db->query('insert into user_availability SELECT ' . $targetUserId . ' as userId,slotStart,available FROM `user_availability` WHERE userId=' . $sourceUserId);


