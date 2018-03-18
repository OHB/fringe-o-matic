<?php
echo "Loading...\n";
$json = json_decode(file_get_contents('../../api/cache.json'));

echo "Downloading...\n";
$data = json_decode(file_get_contents('https://orlandofringe.showare.com/include/widgets/events/performancelist.asp?showHidden=1&showPackages=0&action=perf&listPageSize=1000&listMaxSize=0&page=1'));

echo "Connecting...\n";

/** @var mysqli $db */
$db = include __DIR__ . '/../../../fringe_db_connect.php';

$statement = $db->prepare("UPDATE performances SET `storeUrl`=? WHERE `id`=?");

echo "\n";

foreach ($data->performance as $performance) {
    $eventId = $performance->EventID;
    $perfId = $performance->PerformanceID;
    $start = strtotime($performance->PerformanceDateTime);
    $showareVenueId = $performance->SingleAreaVenueAreaID;

    if (in_array($eventId, [188, 314, 315])) {
        continue;
    }

    $showId = $performanceId = null;

    echo date('Y-m-d H:i:s', $start) . "\t";

    foreach ($json->shows as $id => $show) {
        if ($show->storeUrl === 'https://orlandofringe.showare.com/eventperformances.asp?evt=' . $eventId) {
            $showId = $id;
            echo $show->name . "\n";
        }
    }

    if ($showId) {
        foreach ($json->performances as $id => $performance2) {
            if ($performance2->start === $start && $performance2->show == $showId) {
                $performanceId = $id;

                $storeUrl = 'https://orlandofringe.showare.com/orderticketsarea.asp?p=' . $perfId . '&a=' . $showareVenueId;
                $statement->bind_param('si', $storeUrl, $id);
                $statement->execute();

                break;
            }
        }
    }

    if (! $performanceId) {
        print_r([$performance->PerformanceDateTime, $eventId, $perfId, $start]);
        print_r([$showId]);
        exit;
    }
}
