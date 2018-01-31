<?php
$build = json_decode(file_get_contents(__DIR__ . '/build.json'));

header('Content-type: text/plain');
//
//echo "Clearing target...\n";
//rrmdir(__DIR__ . '/../deploy');
//
//echo "Cleaning vendor...\n";
//rrmdir(__DIR__ . '/../vendor/google/apiclient-services');
//rrmdir(__DIR__ . '/../vendor/google/auth/tests');
//rrmdir(__DIR__ . '/../vendor/monolog/monolog/docs');
//rrmdir(__DIR__ . '/../vendor/monolog/monolog/tests');
//
//foreach ($build->copyFolders as $folder) {
//    echo "Copying folder {$folder}...\n";
//    rcopy(__DIR__ . '/../' . $folder, __DIR__ . '/../deploy/' . $folder);
//}
//
//echo "Copying root files...\n";
//foreach (scandir(__DIR__ . '/../') as $file) {
//    if (! in_array($file, $build->rootIgnoreFiles) && is_file(__DIR__ . '/../' . $file)) {
//        copy(__DIR__ . '/../' . $file, __DIR__ . '/../deploy/' . $file);
//    }
//}
//
echo "Minifying templates...\n";
$templates = "angular.module('fringeApp').run(['\$templateCache',function(\$templateCache){"
    . getFiles($build->templates, function($filename, $file) {
        $html = json_encode(post('http://html-minifier.com/raw?', ['input' => $file]));
        return "\$templateCache.put('{$filename}', {$html});\n";
    })
    . '}]);';
//
//echo "Minifying CSS...\n";
//put('deploy/compiled.css', getFiles($build->css));
//
//echo "Minifying JavaScript...\n";
//minify('deploy/compiled.js', 'https://closure-compiler.appspot.com/compile', [
//    'js_code' => getFiles($build->js) . $templates,
//    'compilation_level' => 'SIMPLE_OPTIMIZATIONS',
//    'output_format' => 'text',
//    'output_info' => 'compiled_code'
//]);

echo "Minifying index.html...\n";
ob_start();
$COMPILE = true;
include_once (__DIR__ . '/../index.php');
minify('deploy/index.html', 'http://html-minifier.com/raw?', ['input' => ob_get_clean()]);

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