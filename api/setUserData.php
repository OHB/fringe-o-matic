<?php
$data = file_get_contents('php://input');

if (strlen($data) > 4000) {
    exit;
}

$json = json_decode($data);

if (! is_object($json) || ! isset($json->id) || ! isset($json->data)) {
    exit;
}

if (strlen($json->id) > 32 || preg_match('/[^a-zA-Z0-9]/', $json->id)) {
    exit;
}

$filename = __DIR__ . '/../userData/' . $json->id . '.json';

file_put_contents($filename, json_encode($json->data));