<?php
$template = file_get_contents('index.html');

$template = str_replace('{{CANONICAL}}', $_SERVER['REDIRECT_SCRIPT_URL'], $template);

echo $template;
