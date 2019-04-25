<?php
$data = json_decode(file_get_contents('../api/cache.json'));
$config = json_decode(file_get_contents('./config.json'));
?>
<!DOCTYPE html>
<html>
<head>
    <title>Fringe-o-Matic: Displays</title>
    <style>
        h1, h2, li, p {
            font-family: Calibri, Arial, sans-serif;
        }
    </style>
    <base href="/display/">
</head>
<body>
    <h1>Fringe-o-Matic: Displays</h1>
    <p>Select a display to launch it. Then, make the browser full-screen by pressing <kbd>F11</kbd>.</p>
    <hr>
    <h2>Multi-Venue Displays</h2>
    <ul>
        <?php foreach ($config->multiVenue as $id => $display) { ?>
            <li><a href="multiVenue.php?id=<?php echo $id; ?>"><?php echo $display->name; ?></a></li>
        <?php } ?>
    </ul>
    <h2>Venue Displays</h2>
    <ul>
        <?php foreach ($data->venues as $venueId => $venue) { ?>
            <li><a href="venue.php?id=<?php echo $venueId; ?>"><?php echo $venue->name; ?></a></li>
        <?php } ?>
    </ul>
</body>
</html>