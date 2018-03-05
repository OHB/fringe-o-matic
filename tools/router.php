<?php
if (preg_match('/\.(?:css|js|php|png|jpg|jpeg|gif|map|html|svg|json|woff|woff2|otf|ttf)$/i', $_SERVER["REQUEST_URI"])) {
    return false;
} else if (strpos($_SERVER["REQUEST_URI"], '.php') !== false) {
    return false;
} else {
    include('index.php');
}
