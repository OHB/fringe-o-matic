angular.module('fringeApp').component('test', {
    templateUrl: 'app/test/test.html',
    controller: ['$scope', function($scope) {

        function WorkerCluster() {
            this.workers = {};
        }
        WorkerCluster.prototype.add = function(id, filename) {
            var self = this,
                worker = this.workers[id] = new Worker(filename);
            worker.onmessage = function(e) {
                self._onmessage(id, e);
            };

            return this;
        };
        WorkerCluster.prototype.send = function(to, command, message, from) {
            this.workers[to].postMessage([
                from,
                command,
                message === null || typeof message === 'string' ? message : JSON.stringify(message)
            ]);

            return this;
        };
        WorkerCluster.prototype._onmessage = function(from, e) {
            var command = e.data[0];

            if (command === 'send') {
                this.send(e.data[1], e.data[2], e.data[3] || null, from);
            } else if (command === 'respond') {
                this.onmessage(e.data[1] && JSON.parse(e.data[1]) || null);
            }
        };
        WorkerCluster.prototype.terminate = function() {
            for (var id in this.workers) {
                if (this.workers.hasOwnProperty(id)) {
                    this.workers[id].terminate();
                }
            }
        };

        var cluster = new WorkerCluster();
        cluster.onmessage = function(response) {
            console.log(response);
            cluster.terminate();
        };

        cluster.add('core', '/app/test/autoScheduler/core.js');
        cluster.add('fitness1', '/app/test/autoScheduler/fitness.js');
        cluster.add('fitness2', '/app/test/autoScheduler/fitness.js');

        var data = {a: 123, b: true, c: 'test', d: [1, 2]};
        for (var i = 0; i < 10000; i ++) {
            data.d.push(i);
        }
        cluster.send('core', 'start', data);
    }]
});