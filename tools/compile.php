<?php
$build = json_decode(file_get_contents('../build.json'));

put('templates.html', getFiles($build->templates, function($filename, $file) {;
    return "<script type=\"text/ng-template\" id=\"{$filename}\">\n" .
        post('http://html-minifier.com/raw?', ['input' => $file]) .
        "\n</script>\n";
}));

minify('compiled.css', 'https://cssminifier.com/raw?', [
    'input' => getFiles($build->css)
]);

minify('compiled.js', 'https://closure-compiler.appspot.com/compile', [
    'js_code' => getFiles($build->js),
    'compilation_level' => 'SIMPLE_OPTIMIZATIONS',
    'output_format' => 'text',
    'output_info' => 'compiled_code'
]);

function getFiles($arr, callable $cb = null) {
    return implode('', array_map(function($filename) use ($cb) {
        $file = file_get_contents(__DIR__ . '/../' . $filename);
        if ($cb) {
            $file = $cb($filename, $file);
        }

        return $file;
    }, $arr));
};

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