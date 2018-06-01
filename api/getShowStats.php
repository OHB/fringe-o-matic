<?php
if ($_SERVER['REQUEST_METHOD'] !== 'GET' || ! isset($_GET['privateHash']) || ! isset($_GET['show'])) {
    http_response_code(400);
    exit;
}

if (! is_numeric($_GET['show'])) {
    http_response_code(400);
    exit;
}

if (strlen($_GET['privateHash']) !== 32) {
    http_response_code(400);
    exit;
}

header('Content-type: application/json');

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
$json = ['attendeeCount' => 0, 'performances' => [], 'interestCounts' => [0, 0, 0, 0, 0], 'topGenres' => [[], [], [], []], 'interestRels' => []];

$sql = 'select interest,count(*) as ct from user_shows where showId= ? and userId in(select distinct userId from user_shows where interest > 0) and userId not in(select id from users where isAdmin=1) group by interest order by interest desc';
$showId = $_GET['show'];

$statement = $db->prepare($sql);
$statement->bind_param('i', $showId);
$statement->execute();
$result = $statement->get_result();

while ($row = $result->fetch_object()) {
    $json['interestCounts'][$row->interest] = $row->ct;
}

$sql = 'select us.interest,sg.genreId,count(*) as ct from user_shows us, show_genres sg where sg.showId=us.showId and us.interest>0 and us.userId in(select distinct userId from user_shows where interest > 0 and showId=?) and us.userId not in(select id from users where isAdmin=1) group by interest,genreId order by interest, ct desc';
$showId = $_GET['show'];

$statement = $db->prepare($sql);
$statement->bind_param('i', $showId);
$statement->execute();
$result = $statement->get_result();

while ($row = $result->fetch_object()) {
    if (count($json['topGenres'][$row->interest]) < 5) {
        $json['topGenres'][$row->interest][] = $row->genreId;
    }
}

$sql = 'SELECT p.id as id,count(*) AS ct FROM performances p, user_performances up WHERE p.id=up.performanceId AND p.showId = ? AND up.attending="yes" AND up.userId NOT IN (SELECT id FROM users WHERE isAdmin=1) GROUP BY p.id';
$showId = $_GET['show'];

$statement = $db->prepare($sql);
$statement->bind_param('i', $showId);
$statement->execute();
$result = $statement->get_result();

while ($row = $result->fetch_object()) {
    $json['performances'][$row->id] = $row->ct;
    $json['attendeeCount'] += $row->ct;
}

$sql = 'select *, count(*) as ct
from (
    select subquery.interest as originalInterest,q1.showId as alsoInterestedInShow,q1.interest as alsoInterestedInInterest
    from user_shows q1, (
        SELECT q2.userId,q2.interest 
        FROM `user_shows` q2
        WHERE q2.showId = ?
        and q2.userId in(select distinct userId from user_shows where interest > 0)
        and q2.userId not in(select id from users where isAdmin=1) ) subquery 
    where q1.userId=subquery.userId and q1.interest > 0 and q1.showId != ?) as outerQuery 
group by originalInterest, alsoInterestedInShow,alsoInterestedInInterest
order by ct desc';

$showId1 = $_GET['show'];
$showId2 = $_GET['show'];

$statement = $db->prepare($sql);
$statement->bind_param('ii', $showId1, $showId2);
$statement->execute();
$result = $statement->get_result();

while ($row = $result->fetch_object()) {
    if (! isset($json['interestRels'][$row->originalInterest])) {
        $json['interestRels'][$row->originalInterest] = [];
    }

    if (count($json['interestRels'][$row->originalInterest]) > 9) {
        continue;
    }

    $json['interestRels'][$row->originalInterest][] = ['show' => $row->alsoInterestedInShow, 'interest' => $row->alsoInterestedInInterest, 'count' => $row->ct];
}

//foreach ($json['interestRels'] as $oi => &$p2) {
//    usort($p2, function($a, $b) {
//        return $b['interest'] - $a['interest'];
//    });
//}
echo json_encode($json, JSON_UNESCAPED_UNICODE + JSON_UNESCAPED_SLASHES);
