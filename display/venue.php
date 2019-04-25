<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$data = json_decode(file_get_contents('../api/cache.json'));
$config = json_decode(file_get_contents('./config.json'));

$venueId = $_REQUEST['id'];
if (! isset($data->venues->$venueId)) {
    http_send_status(404);
    exit;
}

$manualOffset = isset($config->config->manualOffset) ? $config->config->manualOffset : 0;

$now = time();
$now += $manualOffset;

$midnight = strtotime(date('Y-m-d', $now)) + (60 * 60 * 24) + $config->config->effectiveMidnight;

$venue = $data->venues->$venueId;

$performances = [];
foreach ($data->performances as $pId => $performance) {
    if ($data->shows->{$performance->show}->venue !== $venueId) {
        continue;
    }
    if ($performance->stop < $now) {
        continue;
    }
    if ($performance->start > $midnight) {
        continue;
    }

    $performances[$pId] = [
        'start' => $performance->start,
        'stop' => $performance->stop,
        'show' => $data->shows->{$performance->show}->name,
        'description' => $data->shows->{$performance->show}->description,
    ];
}

usort($performances, function($a, $b) {
    return $a['start'] - $b['start'];
});
?>
<!DOCTYPE html>
<html ng-app="fringeDisplay">
<head>
<title>Fringe-o-Matic: Displays</title>
<link href="https://fonts.googleapis.com/css?family=Comfortaa:300,400,700" rel="stylesheet">
<style>
    html, body {
        margin: 0;
        padding: 0;
        background-color: #000;
        color: #fff;
        font-family: Comfortaa, Calibri, Arial, sans-serif;
        font-size: 1.5em;
        font-weight: 300;
        overflow: hidden;
    }
    header {
        width: 100%;
        text-align: center;
        border-bottom: 2px solid white;
        padding: 30px 0;
    }
    header h1 {
        font-size: 100px;
        margin: 0;
    }
    main h1, main h2 {
        margin: 20px 0;
    }
    main {
        padding: 30px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    th {
        text-align: left;
        font-weight: 700;
    }
    td:last-child, th:last-child {
        text-align: right;
    }
    td, th {
        padding: 10px 0;
    }
    th, tr:not(:last-child) td {
        border-bottom: 1px solid white;
    }
    blockquote {
        margin-bottom: 50px;
    }
</style>
</head>
<body>
<header>
    <h1><?php echo $venue->name; ?></h1>
</header>
<main ng-controller="DisplayCtrl">
    <div ng-if="currentPerformance && ! nextPerformance">
        <h2>{{currentPerformance.show}}</h2>
        <blockquote>
            <p>{{minsUntil(currentPerformance.stop, true)}} remaining</p>
        </blockquote>
        <hr>
    </div>
    <div ng-if="nextPerformance">
        <h2>Next Show</h2>
        <blockquote>
            <h3>{{nextPerformance.show}}</h3>
            <p style="font-size: .7em">{{nextPerformance.description}}</p>
            <p>Starts in {{minsUntil(nextPerformance.start, true)}}</p>
        </blockquote>
        <hr>
    </div>
    <h3>Upcoming Shows Today</h3>
    <blockquote>
        <div ng-if="! upcoming">
            <p>No more shows today in this venue.</p>
        </div>
        <table ng-if="upcoming">
            <thead>
            <tr>
                <th>Show</th>
                <th>Starts In</th>
            </tr>
            </thead>
            <tbody>
            <tr ng-repeat="performance in upcoming">
                <td>{{performance.show}}</td>
                <td nowrap>{{minsUntil(performance.start)}}</td>
            </tr>
            </tbody>
        </table>
    </blockquote>
</main>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/moment.min.js" integrity="sha256-ABVkpwb9K9PxubvRrHMkk6wmWcIHUE9eBxNZLXYQ84k=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.5/angular.min.js" integrity="sha256-zBy1l2WBAh2vPF8rnjFMUXujsfkKjya0Jy5j6yKj0+Q=" crossorigin="anonymous"></script>
<script type="text/javascript">
    angular.module('fringeDisplay', []);
    angular.module('fringeDisplay').value('Performances', <?php echo json_encode($performances); ?>);
    angular.module('fringeDisplay').value('ManualOffset', <?php echo json_encode($manualOffset); ?>);
    angular.module('fringeDisplay').value('NextShowCutover', <?php echo json_encode($config->config->nextShowCutover); ?>);
    angular.module('fringeDisplay').controller('DisplayCtrl', ['$scope', '$timeout', 'Performances', 'ManualOffset', 'NextShowCutover', function($scope, $timeout, Performances, ManualOffset, NextShowCutover) {
        $scope.update = function() {
            $scope.upcoming = [];
            $scope.currentPerformance = $scope.nextPerformance = undefined;

            var now = (Date.now() / 1000) + ManualOffset;

            for (var i = 0; i < Performances.length; i ++) {
                if (Performances[i].stop < now) {
                    continue;
                }

                if (Performances[i].start < now) {
                    $scope.currentPerformance = Performances[i];
                } else {
                    if (! $scope.nextPerformance && (! $scope.currentPerformance || Performances[i].start - now <= NextShowCutover)) {
                        $scope.nextPerformance = Performances[i];
                    } else {
                        $scope.upcoming.push(Performances[i]);
                    }
                }
            }

            $timeout($scope.update, 10000);
        };

        $scope.minsUntil = function(time, full) {
            var now = (Date.now() / 1000) + ManualOffset,
                mins = Math.floor(Math.abs(time - now) / 60);

            var ret = '';

            if (mins > 60) {
                var hr = Math.floor(mins / 60);
                ret = hr + 'hr ';

                mins -= (60 * hr);
            }

            ret += mins;

            if (full) {
                ret += mins === 1 ? ' minute' : ' minutes';
            } else {
                ret += ' min';
            }

            return ret;
        };

        $scope.update();
    }]);
</script>
</body>
</html>
