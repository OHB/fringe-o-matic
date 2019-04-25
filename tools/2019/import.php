<?php
mb_internal_encoding('UTF-8');

/** @var mysqli $db */
$db = include __DIR__ . '/../../../fringe_db_connect.php';

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

function load_csv($filename, array $columns) {
    return array_map(function($row) use ($columns) {
        return array_combine($columns, array_map(function($item) {
            return trim($item);
        }, $row));
    }, parse_csv(file_get_contents($filename)));
}

function load_tsv($filename, array $columns) {
    $data = [];

    $file = file_get_contents($filename);
    foreach (explode("\n", $file) as $line) {
//        print_r(explode("\t", $line));exit;
        $data[] = array_combine($columns, array_map(function($item) {
            return trim($item);
        }, explode("\t", $line)));
    }

    return $data;
}

$shows = load_csv('shows.csv', [
    'show_title',
    'artist_name',
    'artist_city',
    'artist_state',
    'artist_country',
    'venue',
    'genres',
    'categories',
    'rating',
    'length',
    'interaction',
    'nudity',
    'language',
    'strobes',
    'price',
    'description_short',
    'description_long',
    'fb',
    'insta',
    'twitter',
    'url',
    'performances',
    'discounts',
    'cheap_show',
    'event_input',
    'perf_input',
    'event_number',
    'showare_url'
]);

$venueMap = [
    'starlite room @ savoy' => 13,
    'in front of orlando museum of art' => 20,
    'loch haven park under trees adjacent to orlando rep' => 21,
    'rainbow venue at the center' => 22,
    'angel statue at loch haven park entrance' => 23,
    'women\'s restroom by blue venue' => 24,
    'in front of lowndes shakespeare center,' => 16,
    'in front of orlando rep main entrance' => 25
];

$result = $db->query("select * from venues");
while ($row = $result->fetch_assoc()) {
    $name = strtolower($row['name']);
    $venueMap[$name] = $row['id'];
}

$ratingMap = [
    '7 and up' => 2,
    '13 and up' => 3,
    '18 and up' => 4,
];
$result = $db->query("select * from ratings where seasonId=3");
while ($row = $result->fetch_assoc()) {
    $ratingMap[$row['name']] = $row['id'];
}

$countryMap = [
    'CANADA' => 'Canada',
    'UNITED KINGDOM' => 'United Kingdom',
    'UNITED KINGDOM - ENGLAND' => 'United Kingdom',
    'AUSTRALIA' => 'Australia',
    'JAPAN' => 'Japan',
    'NEW ZEALAND' => 'New Zealand',
    'SWEDEN' => 'Sweden'
];

array_shift($shows);

$db->query('truncate table shows');
$db->query('truncate table performances');
$db->query('truncate table show_genres');
$db->query('truncate table genres');
$db->query('truncate table users');
$db->query('truncate table user_availability');
$db->query('truncate table user_performances');
$db->query('truncate table user_settings');
$db->query('truncate table user_shows');

$genres = [];
foreach ($shows as $id => $show) {
    $genres[$show['genres']] = true;

    foreach (explode(',', $show['categories']) as $category) {
        if (trim($category)) {
            $genres[trim($category)] = true;
        }
    }
}

ksort($genres);
$genres = array_keys($genres);

$statement = $db->prepare('insert into genres values(null, 3, ?, ?)');
foreach ($genres as $genre) {
    $slug = makeSlug($genre);
    $statement->bind_param('ss', $genre, $slug);
    $statement->execute();
}

$genreMap = [];
$result = $db->query("select * from genres");
while ($row = $result->fetch_assoc()) {
    $name = $row['name'];
    $genreMap[$name] = $row['id'];
}

$show_statement = $db->prepare('insert into shows values(null, 3, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
$perf_statement = $db->prepare('insert into performances values (null, ?, ?, null, 0, ?)');

foreach ($shows as $id => $show) {
    echo $id . "\n";

    $name = $show['show_title'];
    $slug = makeSlug($name);

    $description = $show['description_long'];
    $description = str_replace("\r\n", "\n", $description);
    $description = str_replace("\r", '', $description);
    $description = preg_replace("/\n\n+/", "\n\n", $description);
    $description = implode("<br>", array_map(function($line) {
        return htmlentities(trim($line), ENT_COMPAT, 'UTF-8');
    }, explode("\n", $description)));

    $warnings = [];

    if ($show['nudity'] === 'YES') {
        $warnings[] = 'Nudity';
    }

    if ($show['language'] === 'YES') {
        $warnings[] = 'Strong Language';
    }

    if ($show['strobes'] === 'YES') {
        $warnings[] = 'Strobe Effects';
    }

    if ($show['interaction'] === 'YES') {
        $warnings[] = 'Audience Interaction';
    }

    $warnings = implode(', ', $warnings);

    $show['venue'] = strtolower($show['venue']);
    $show['venue'] = str_replace('breathrough', 'breakthrough', $show['venue']);
    $show['venue'] = str_replace('breakthrough theater', 'breakthrough theatre', $show['venue']);
    $show['venue'] = str_replace('byov - ', '', $show['venue']);
    $show['venue'] = str_replace('byov -', '', $show['venue']);
    $show['venue'] = str_replace('byov- ', '', $show['venue']);
    if (! isset($venueMap[$show['venue']])) {
        if (isset($venueMap[$show['venue'] . ' venue'])) {
            $venue = $venueMap[$show['venue'] . ' venue'];
        } else {
            die('Unknown Venue: ' . $show['venue']);
        }
    } else {
        $venue = $venueMap[$show['venue']];
    }

    if (! isset($ratingMap[$show['rating']])) {
        die('Unknown Rating: ' . $show['rating']);
    }
    $rating = $ratingMap[$show['rating']];

    $artistName = $show['artist_name'];

    $artistLocation = $show['artist_city'] . ', ' . $show['artist_state'];

    if ($show['artist_country'] !== 'UNITED STATES') {
        if (! isset($countryMap[$show['artist_country']])) {
            die('Unknown Country: ' . $show['artist_country']);
        }

        $artistLocation .= ', ' . $countryMap[$show['artist_country']];
    }

    if ($show['price'] === 'Pay at Door') {
        $show['price'] = 0;
    }
    if (! is_numeric($show['price'])) {
        die('Unknown price: ' . $show['price']);
    }

    $price = $show['price'];

    $duration = $show['length'] * 60;

    $image = '';
    $storeUrl = str_replace('http', 'https', $show['showare_url']);
    $storeUrl = trim($storeUrl, ': ');

    $show_statement->bind_param('ssssiissiiss', $name, $slug, $description, $warnings, $venue, $rating, $artistName, $artistLocation, $price, $duration, $image, $storeUrl);
    $show_statement->execute();
    $showId = $db->insert_id;

    $genres = [$show['genres']];

    foreach (explode(',', $show['categories']) as $category) {
        if (trim($category)) {
            $genres[] = trim($category);
        }
    }

    foreach ($genres as $genre) {
        $db->query('insert into show_genres values(' . $showId . ', ' . $genreMap[$genre] . ')');
    }

    $cheap = strtotime($show['cheap_show']);

    $performances = trim($show['performances']);
    $performances = str_replace('-', '', $performances);
    $performances = str_replace('  ', ' ', $performances);
    $performances = str_replace('9pm', '9:00pm', $performances);
    $performances = str_replace('10pm', '10:00pm', $performances);
    foreach (['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as $day) {
        $performances = str_replace($day, '', $performances);
    }
    $performances = explode("\n", trim($performances, ' ,'));

    foreach ($performances as $pid => $performance) {
        $performance = trim($performance, ', ');
        if ($performance == 'May 17th 8:30pm & 10:30pm') {
            $performances[$pid] = 'May 17th 8:30pm';
            $performances[] = 'May 17th 10:30pm';
        }
        if ($performance == 'May 18th 8:30pm & 10:30pm') {
            $performances[$pid] = 'May 18th 8:30pm';
            $performances[] = 'May 18th 10:30pm';
        }
        if ($performance == 'May 24th 8:30pm & 10:30pm') {
            $performances[$pid] = 'May 24th 8:30pm';
            $performances[] = 'May 24th 10:30pm';
        }
        if ($performance == 'May 25th 8:30pm & 10:30pm') {
            $performances[$pid] = 'May 25th 8:30pm';
            $performances[] = 'May 25th 10:30pm';
        }
    }

    foreach ($performances as $performance) {
        $performance = trim($performance);
        $showId2 = $showId;

        $time = date('Y-m-d H:i:s', strtotime($performance));

        if ($time === '1969-12-31 19:00:00') {
            print_r($performance);
            print_r($performances);
            print_r($show);exit;
        }

        $price = strtotime($performance) == $cheap ? 6 : null;
        $perf_statement->bind_param('isd', $showId2, $time, $price);
        $perf_statement->execute();
    }
}

