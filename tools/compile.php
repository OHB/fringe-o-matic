<?php
namespace OHBoy\FringeOMatic;

use SitemapPHP\Sitemap;

require_once 'vendor/autoload.php';

$build = json_decode(file_get_contents(__DIR__ . '/build.json'));
$data = json_decode(file_get_contents(__DIR__ . '/../api/data.json'));

header('Content-type: text/plain');


echo "Clearing target...\n";
rrmdir(__DIR__ . '/../deploy');


echo "Cleaning vendor...\n";
rrmdir(__DIR__ . '/../vendor/google/apiclient-services');
rrmdir(__DIR__ . '/../vendor/google/auth/tests');
rrmdir(__DIR__ . '/../vendor/monolog/monolog/docs');
rrmdir(__DIR__ . '/../vendor/monolog/monolog/tests');

foreach ($build->copyFolders as $folder) {
    echo "Copying folder {$folder}...\n";
    rcopy(__DIR__ . '/../' . $folder, __DIR__ . '/../deploy/' . $folder);
}


echo "Copying root files...\n";
foreach (scandir(__DIR__ . '/../') as $file) {
    if (! in_array($file, $build->rootIgnoreFiles) && is_file(__DIR__ . '/../' . $file)) {
        copy(__DIR__ . '/../' . $file, __DIR__ . '/../deploy/' . $file);
    }
}


echo "Minifying templates...\n";
$templates = "angular.module('fringeApp').run(['\$templateCache',function(\$templateCache){"
    . getFiles($build->templates, function($filename, $file) {
        $html = json_encode(post('http://html-minifier.com/raw?', ['input' => $file]));
        return "\$templateCache.put('{$filename}', {$html});\n";
    })
    . '}]);';


echo "Minifying CSS...\n";
put('deploy/compiled.css', getFiles($build->css));


echo "Minifying JavaScript...\n";
minify('deploy/compiled.js', 'https://closure-compiler.appspot.com/compile', [
    'js_code' => getFiles($build->js) . $templates,
    'compilation_level' => 'SIMPLE_OPTIMIZATIONS',
    'output_format' => 'text',
    'output_info' => 'compiled_code'
]);


echo "Minifying index.html...\n";
ob_start();
$COMPILE = true;
include_once (__DIR__ . '/../index.php');
minify('deploy/index.html', 'http://html-minifier.com/raw?', ['input' => ob_get_clean()]);


echo "Creating sitemap.xml...\n";
$sitemap = new Sitemap('https://fringeomatic.com');
$sitemap
    ->setPath(__DIR__ . '/../deploy/')
    ->addItem('/', 1.0)
    ->addItem('/home', 0.9)
    ->addItem('/my-fringe/', 0.5)
    ->addItem('/shows', 0.9)
    ->addItem('/schedule', 0.5)
    ->addItem('/venues', 0.8)
    ->addItem('/map', 0.7)
    ->addItem('/about/credits', 0.5)
    ->addItem('/policies/privacy', 0.5)
    ->addItem('/policies/terms', 0.5);

foreach ($data->shows as $show) {
    $sitemap->addItem('/show/' . $show->slug, 0.9);
}
foreach ($data->venues as $venue) {
    $sitemap->addItem('/shows/venue/' . $venue->slug, 0.8);
    $sitemap->addItem('/map/venue/' . $venue->slug, 0.7);
}
foreach ($data->venueHosts as $venueHost) {
    $sitemap->addItem('/map/host/' . $venueHost->slug, 0.7);
}
foreach ($data->availabilitySlots as $day => $slots) {
    $sitemap->addItem('/schedule/full/' . date('Y-m-d', $day), 0.9);

}
$sitemap->createSitemapIndex('http://example.com/sitemap/', 'Today');

echo "\nDone!\n\n";






function getFiles($arr, callable $cb = null) {
    return implode('', array_map(function($filename) use ($cb) {
        $file = file_get_contents(__DIR__ . '/../' . $filename);
        if ($cb) {
            $file = $cb($filename, $file);
        }

        return $file;
    }, $arr));
}

function minify($filename, $url, $fields) {
    put($filename, post($url, $fields));
}

function put($filename, $content) {
    file_put_contents(__DIR__ . '/../' . $filename, $content);
}


function post($url, $fields) {
    $fields_string = '';
    foreach ($fields as $key => $value) {
        $fields_string .= $key . '=' . urlencode($value) . '&';
    }

    $ch = curl_init();
    curl_setopt($ch,CURLOPT_URL, $url);
    curl_setopt($ch,CURLOPT_POST, count($fields));
    curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_string);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    return curl_exec($ch);
}

// removes files and non-empty directories
function rrmdir($dir) {
    if (is_dir($dir)) {
        $files = scandir($dir);
        foreach ($files as $file) {
            if ($file != "." && $file != "..") {
                rrmdir("$dir/$file");
            }
        }
        rmdir($dir);
    } else if (file_exists($dir)) {
        unlink($dir);
    }
}

// copies files and non-empty directories
function rcopy($src, $dst) {
    if (file_exists($dst)) {
        rrmdir($dst);
    }
    if (is_dir($src)) {
        mkdir($dst, 0777, true);
        $files = scandir($src);
        foreach ($files as $file) {
            if ($file != "." && $file != "..") rcopy("$src/$file", "$dst/$file");
        }
    } else if (file_exists($src)) {
        copy($src, $dst);
    }
}