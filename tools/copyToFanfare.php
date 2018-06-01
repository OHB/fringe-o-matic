<?php
$data = json_decode(file_get_contents('../api/cache.json'));

foreach ($data->shows as $showId => $show) {
    echo 'update `show` set warningText="';
    echo addslashes($show->warnings);
    echo '" where name="' . addslashes($show->name) . '";';
    echo "\n";
}
