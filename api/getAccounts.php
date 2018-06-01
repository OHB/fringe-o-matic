<?php
if ($_SERVER['REQUEST_METHOD'] !== 'GET' || ! isset($_GET['privateHash'])) {
    http_response_code(400);
    exit;
}

$privateHash = $_GET['privateHash'];

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

$result = $db->query('select id,helpCode from users where privateHash != "' . $privateHash . '" order by helpCode');

$results = [];

while ($row = $result->fetch_object()) {
    $results[] = $row;
}

header('Content-type: application/json');
echo json_encode($results);
