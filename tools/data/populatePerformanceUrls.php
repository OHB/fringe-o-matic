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

    if ($eventId == -1 || in_array($eventId, [341, 340, 336, 337, 339, 346])) {
        continue;
    }

    $showId = $performanceId = null;

    echo date('Y-m-d H:i:s', $start) . "\n";

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

                $storeUrl = 'https://orlandofringe.showare.com/ordertickets.asp?p=' . $perfId;
                $statement->bind_param('si', $storeUrl, $id);
                $statement->execute();

                $image = $performance->Image1;

                if (! file_exists('../../img/show/' . $image)) {
                    file_put_contents('../../img/show/' . $image, file_get_contents('https://orlandofringe.showare.com/uplimage/' . $image));
                }

                $db->query('update shows set image450="' . $db->escape_string($image) . '" where id=' . $showId);

                break;
            }
        }
    }

    if (! $performanceId) {
        print_r([$performance->Event, $performance->PerformanceDateTime, $eventId, $perfId, $start]);
        print_r([$showId]);
        exit;
    }
}
