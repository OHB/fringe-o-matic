<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(400);
    exit;
}

$input = file_get_contents('php://input');

if (strlen($input) > 1000) {
    http_response_code(400);
    exit;
}

$json = json_decode($input);

if (! is_object($json)) {
    http_response_code(400);
    exit;
}

if (! isset($json->performanceId)) {
    http_response_code(400);
    exit;
}

if (! isset($json->privateHash)) {
    http_response_code(400);
    exit;
}

/** @var mysqli $db */
$db = include __DIR__ . '/../../fringe_db_connect.php';

$pHash = $json->privateHash;
$statement = $db->prepare('SELECT * FROM `users` WHERE isAdmin=1 AND `privateHash`=?');
$statement->bind_param('s', $pHash);
$statement->execute();
$result = $statement->get_result();

if ($result->num_rows < 1) {
    http_response_code(401);
    exit;
}

header('Content-type: application/json');

$statement = $db->prepare('update `performances` set `soldOut`=1 where `id`= ?');

$pId = $json->performanceId;
$statement->bind_param('i', $pId);

$statement->execute();

$pId = $json->performanceId;
$cache = json_decode(file_get_contents(__DIR__ . '/cache.json'));
$cache->performances->$pId->soldOut = true;

file_put_contents(__DIR__ . '/cache.json', json_encode($cache, JSON_UNESCAPED_UNICODE + JSON_UNESCAPED_SLASHES));
