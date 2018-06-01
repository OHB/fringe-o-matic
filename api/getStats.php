<?php
/** @var mysqli $db */
$db = include __DIR__ . '/../../fringe_db_connect.php';

header('Content-type: application/json');

function callback(callable $fn, $data) {
    return $fn($data);
}

$attendance = [];
$result = $db->query('select p.showId as id, count(*) as ct from user_performances up, performances p where p.id=up.performanceId and up.attending="yes" group by p.showId');
while ($row = $result->fetch_object()) {
    $attendance[$row->id] = $row->ct;
}

$showInterests = [];
$result = $db->query('select showId,interest,count(*) as ct from user_shows where interest > 0 group by showId,interest');
while ($row = $result->fetch_object()) {
    if (! isset($showInterests)) {
        $showInterests[$row->showId] = [1 => 0, 2 => 0, 3 => 0, 4 => 0];
    }
    $showInterests[$row->showId][(int) $row->interest] = $row->ct ?: 0;
}

echo json_encode([
    'userCount' => $db->query('SELECT count(*) as ct FROM `users`')->fetch_object()->ct,
    'usersWithInterestsCount' => $db->query('select count(distinct userId) as ct from user_shows where interest > 0')->fetch_object()->ct,
    'usersWithScheduleCount' => $db->query('select count(distinct userId) as ct from user_performances where attending = "yes"')->fetch_object()->ct,
    'startedAutoSchedulerCount' => $db->query("SELECT count(*) as ct FROM `user_settings` where autoScheduleIntroComplete=1")->fetch_object()->ct,
    'syncEnabledCount' => $db->query("SELECT count(*) as ct FROM `user_settings` where not isnull(googleCalendarSyncId)")->fetch_object()->ct,
    'sharedCount' => $db->query("SELECT count(*) as ct FROM `user_settings` where not isnull(publicScheduleName)")->fetch_object()->ct,
    'attendingCount' => $db->query("SELECT count(*) as ct FROM `user_performances` where attending='yes'")->fetch_object()->ct,
    'maybeCount' => $db->query("SELECT count(*) as ct FROM `user_performances` where attending='maybe'")->fetch_object()->ct,
    'interestCount' => $db->query("SELECT count(*) as ct FROM `user_shows` where interest>0")->fetch_object()->ct,
    'interestCounts' => callback(function($data) {
        return (object) array_combine(array_column($data, 'interest'), array_map(function($item) {
            return (int) $item;
        }, array_column($data, 'ct')));
    }, $db->query('select `interest`,count(*) as ct from `user_shows` where `interest` > 0 group by `interest`')->fetch_all(MYSQLI_ASSOC)),
    'topShows' => array_map(function($row) use ($attendance, $showInterests) {
        $row['attendingCount'] = isset($attendance[$row['showId']]) ? (int) $attendance[$row['showId']] : 0;
        $row['interestCounts'] = $showInterests[$row['showId']];
        $row['interestCount'] = (int) $row['count'];
        $row['interest'] = number_format($row['interest'], 2);
        $row['marginOfError'] = (float) number_format($row['stdDeviation'] / sqrt($row['interestCount']) * 1.645, 2);
        unset($row['stdDeviation']);

        return $row;
    }, $db->query('SELECT showId,count(*) as `count`,AVG(interest) as interest, sum(interest) as `sum`, STDDEV(interest) as stdDeviation FROM `user_shows` WHERE interest>0 and userId not in (select id from users where isAdmin=1) group by showId order by interest desc, `sum` desc')->fetch_all(MYSQLI_ASSOC)),
    'showInterests' => $showInterests
]);