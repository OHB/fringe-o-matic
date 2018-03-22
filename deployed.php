<?php
$template = file_get_contents('index.html');

$path = isset($_SERVER['REDIRECT_SCRIPT_URL']) ? $_SERVER['REDIRECT_SCRIPT_URL'] : '';

$template = str_replace('<!--CANONICAL-->', '<link rel=canonical href="https://fringeomatic.com' . $path . '">', $template);

echo $template;
