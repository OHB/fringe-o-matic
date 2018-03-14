<?php
mb_internal_encoding('UTF-8');

function makeSlug($text) {
    return preg_replace('/[\s-]+/', '-',
        preg_replace('/[^a-z0-9- ]/', '',
            str_replace('&', ' and ',
                strtolower($text)
            )
        )
    );
}

function parse_csv ($csv_string, $delimiter = ",", $skip_empty_lines = true, $trim_fields = true) {
    $enc = preg_replace('/(?<!")""/', '!!Q!!', $csv_string);
    $enc = preg_replace_callback(
        '/"(.*?)"/s',
        function ($field) {
            return urlencode(utf8_encode($field[1]));
        },
        $enc
    );
    $lines = preg_split($skip_empty_lines ? ($trim_fields ? '/( *\R)+/s' : '/\R+/s') : '/\R/s', $enc);
    return array_map(
        function ($line) use ($delimiter, $trim_fields) {
            $fields = $trim_fields ? array_map('trim', explode($delimiter, $line)) : explode($delimiter, $line);
            return array_map(
                function ($field) {
                    return str_replace('!!Q!!', '"', utf8_decode(urldecode($field)));
                },
                $fields
            );
        },
        $lines
    );
}

/** @var mysqli $db */
$db = include __DIR__ . '/../../../fringe_db_connect.php';

$ratingMap = [];
$result = $db->query("select * from ratings where seasonId=2");
while ($row = $result->fetch_assoc()) {
    $ratingMap[$row['name']] = $row['id'];
}

$genreMap = [];
$result = $db->query("select * from genres where seasonId=2");
while ($row = $result->fetch_assoc()) {
    $genreMap[$row['name']] = $row['id'];
}

$venueMap = [
    'savoy' => 13,
    'breakthrough' => 12,
    'site-specific the aqua venue, 1314 chichester st. orlando, fl 32803' => 15,
    'site-specific a van in front of the lowndes shakespeare center' => 16,
    'site-specific club fringe lounge' => 17,
    'site-specific tree by the firehouse museum' => 18
];
$result = $db->query("select * from venues");
while ($row = $result->fetch_assoc()) {
    $name = strtolower($row['name']);
    if (substr($name, -6) === ' venue') {
        $name = substr($name, 0, -6);
    }
    $venueMap[$name] = $row['id'];
}

$csv = parse_csv(file_get_contents('data.csv'));
array_shift($csv);

$showIds = [];

foreach ($csv as $bits) {
    if (! isset($venueMap[strtolower(trim($bits[8]))])) {
        echo 'ERROR: Unknown Venue: ' . $bits[8] . "\n";
        $showIds[] = '';
        continue;
    }

    $name = $bits[0];

    echo $name . "\n";

    foreach ($bits as $bit) {
        $json = json_encode($bit);
        if (json_last_error()) {
            echo 'ERROR: ' . json_last_error_msg() . "\n";
            echo "\t" . $bit . "\n\n";
        }
    }

    $slug = makeSlug($name);
    $artistName = $bits[1];
    $artistLocation = $bits[2];

    if (! in_array($bits[3], ['USA', 'United States'])) {
        $artistLocation .= ', ' . $bits[3];
    }

    $price = (float) str_replace('$', '', $bits[4]);
    $duration = (int) str_replace('minutes', '', strtolower($bits[7])) * 60;
    $venue = $venueMap[strtolower(trim($bits[8]))];
    $rating = $ratingMap[$bits[9]];
    $warnings = $bits[10] == 'NA' ? null : $bits[10];
    $genres = array_map(function($i) use ($genreMap) {
        return $genreMap[trim($i)];
    }, explode(', ', $bits[11]));

    if (trim($bits[13])) {
        $description = nl2br(htmlentities(trim($bits[13]), ENT_COMPAT, 'UTF-8'));
    } else {
        $description = nl2br(htmlentities(trim($bits[12]), ENT_COMPAT, 'UTF-8'));
    }
    $image = $bits[20] ?: null;
    if ($image) {
        $image .= '.png';
    }

    $storeUrl = $bits[21] ? 'https://orlandofringe.showare.com/eventperformances.asp?evt=' . $bits[21] : null;

    $times = array_map(function($i) {
        $i = trim(strtolower($i));
        if (! $i) {
            return null;
        }
        $i = str_replace('(midnight)', '', $i);
        $i = trim(str_replace('(noon)', '', $i));
        $t = strtotime($i);
        if ($t < 1000) {
            echo 'ERROR Bad Time: ' . $i . "\n";
        }
        return date('Y-m-d H:i:s', $t);
    }, explode("\n", trim($bits[6])));

    if ($bits[19]) {
        $showId = $bits[19];
        $db->query('delete from shows where id=' . $showId);
        $statement = $db->prepare('insert into shows values(?, 2, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $statement->bind_param('issssiissiiss', $showId, $name, $slug, $description, $warnings, $venue, $rating, $artistName, $artistLocation, $price, $duration, $image, $storeUrl);
        $statement->execute();
    } else {
        $statement = $db->prepare('insert into shows values(null, 2, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $statement->bind_param('ssssiissiiss', $name, $slug, $description, $warnings, $venue, $rating, $artistName, $artistLocation, $price, $duration, $image, $storeUrl);
        $statement->execute();
        $showId = $db->insert_id;
    }
    $showIds[] = $showId;

    $db->query('delete from show_genres where showId=' . $showId);
    foreach ($genres as $genre) {
        $db->query('insert into show_genres values(' . $showId . ', ' . $genre . ')');
    }

    $db->query('delete from performances where showId=' . $showId);
    $statement = $db->prepare('insert into performances values (null, ?, ?)');
    foreach ($times as $time) {
        if (! $time) {
            continue;
        }
        $statement->bind_param('is', $showId, $time);
        $statement->execute();
    }
}

file_put_contents('showIds.txt', implode("\n", $showIds));

$db->query('delete from user_performances');