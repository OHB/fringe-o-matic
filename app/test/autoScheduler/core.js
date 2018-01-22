function send(to, command, data) {
    postMessage('send', to, command, JSON.stringify(data));
}
function respond(data) {
    postMessage('respond', JSON.stringify(data));
}

var got1, got2;
onmessage = function(e) {
    var from = e.data[0],
        command = e.data[1],
        data = JSON.parse(e.data[2]);

    if (command === 'start') {
        postMessage(['send', 'fitness1', 'go1', JSON.stringify(data)]);
        postMessage(['send', 'fitness2', 'go2', JSON.stringify(data)]);
    } else if (command === 'complete') {
        if (from === 'fitness1') {
            got1 = true;
            check();
        }
        if (from === 'fitness2') {
            got2 = true;
            check();
        }
    }
};

var check = function() {
    if (got1 && got2) {
        postMessage(['respond', JSON.stringify('success')]);
    }
};