onmessage = function(e) {
    function send(to, command, data) {
        postMessage('send', to, command, JSON.stringify(data));
    }
};
