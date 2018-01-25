angular.module('fringeApp').component('test', {
    templateUrl: 'app/test/test.html',
    controller: ['$scope', 'UserData', function($scope, UserData) {
        $scope.userData = UserData.export();

        $scope.import = function(data) {
            var base = {
                "preferences": [],
                "unavailability": [],
                "schedule": [],
                "maybe": [],
                "settings": {"scheduleMode": "full", "displaySchedulerStats": true}
            };

            data = angular.extend({}, base, data);
            UserData.import(JSON.stringify(data));
            $scope.userData = UserData.export();
        };

        $scope.testData = {
            'New User': {
                settings: {scheduleMode: 'full'}
            },
            'Preferences (all 1s)': {
                preferences:{"1":1,"2":1,"4":1,"5":1,"6":1,"7":1,"8":1,"9":1,"10":1,"11":1,"12":1,"13":1,"14":1,"15":1,"16":1,"17":1,"18":1,"19":1,"20":1,"21":1,"22":1,"23":1,"24":1,"25":1,"26":1,"27":1,"28":1,"29":1,"30":1,"31":1,"32":1,"33":1,"34":1,"35":1,"36":1,"37":1,"38":1,"39":1,"40":1,"41":1,"42":1,"43":1,"44":1,"45":1,"46":1,"47":1,"48":1,"49":1,"50":1,"51":1,"52":1,"53":1,"54":1,"55":1,"56":1,"57":1,"58":1,"59":1,"60":1,"61":1,"62":1,"63":1,"64":1,"65":1,"66":1,"67":1,"68":1,"69":1,"70":1,"71":1,"72":1,"73":1,"74":1,"75":1,"76":1,"77":1,"78":1,"79":1,"80":1,"81":1,"82":1,"83":1,"84":1,"85":1,"86":1,"87":1,"88":1,"89":1,"90":1,"91":1,"92":1,"93":1,"94":1,"95":1,"96":1,"97":1,"98":1,"99":1,"100":1,"101":1,"102":1,"103":1,"104":1,"105":1,"106":1,"107":1,"108":1,"109":1,"110":1,"111":1,"112":1,"113":1,"114":1,"115":1,"116":1,"117":1,"118":1,"119":1,"120":1,"121":1,"122":1,"123":1,"124":1,"125":1,"126":1,"127":1,"128":1,"129":1,"130":1,"131":1,"132":1,"133":1,"134":1,"135":1,"136":1,"137":1,"138":1,"139":1,"140":1,"141":1,"142":1,"143":1,"144":1,"145":1,"146":1,"147":1,"148":1,"149":1,"150":1,"151":1,"152":1,"153":1,"154":1,"155":1,"156":1,"157":1,"158":1,"159":1,"160":1,"161":1,"162":1,"163":1,"186":1},
                settings: {"autoScheduleIntroComplete": true, "scheduleMode": "full", "displaySchedulerStats": true}
            },
            'Preferences': {
                preferences: {"1":1,"2":4,"4":2,"6":3,"7":4,"8":4,"9":2,"10":3,"12":4,"15":4,"22":3,"27":1,"28":2,"29":3,"32":3,"33":2,"34":1,"35":2,"41":2,"46":4,"47":3,"50":4,"51":3,"54":3,"63":2,"68":2,"70":3,"71":1,"72":1,"73":4,"74":4,"77":2,"80":1,"82":2,"83":3,"84":4,"86":4,"87":3,"90":4,"98":1,"99":3,"100":2,"102":2,"103":3,"104":2,"105":3,"106":4,"107":1,"111":2,"112":4,"114":2,"117":4,"119":4,"122":4,"123":1,"126":3,"127":2,"128":4,"129":3,"130":4,"131":3,"138":3,"140":1,"142":1,"146":2,"149":1,"151":1,"153":2,"155":4,"159":1,"186":4},
                settings: {autoScheduleIntroComplete: true, "scheduleMode": "full", "displaySchedulerStats": true}
            },
            'Availability': {},
            'Schedule': {
                schedule: ["715","549","515","817","923","531","451","932"],
                settings: {autoScheduleIntroComplete: true,"scheduleMode": "full", "displaySchedulerStats": true}
            },
            'Preferences and Schedule': {
                preferences: {"1":1,"2":4,"4":2,"6":3,"7":4,"8":4,"9":2,"10":3,"12":4,"15":4,"22":3,"27":1,"28":2,"29":3,"32":3,"33":2,"34":1,"35":2,"41":2,"46":4,"47":3,"50":4,"51":3,"54":3,"63":2,"68":2,"70":3,"71":1,"72":1,"73":4,"74":4,"77":2,"80":1,"82":2,"83":3,"84":4,"86":4,"87":3,"90":4,"98":1,"99":3,"100":2,"102":2,"103":3,"104":2,"105":3,"106":4,"107":1,"111":2,"112":4,"114":2,"117":4,"119":4,"122":4,"123":1,"126":3,"127":2,"128":4,"129":3,"130":4,"131":3,"138":3,"140":1,"142":1,"146":2,"149":1,"151":1,"153":2,"155":4,"159":1,"186":4},
                schedule: ["715","549","515","817","923","531","451","932"],
                settings: {autoScheduleIntroComplete: true, "scheduleMode": "full", "displaySchedulerStats": true}
            },
            'Preferences and Schedule (Full)': {
                preferences: {"1":1,"2":4,"4":2,"6":3,"7":4,"8":4,"9":2,"10":3,"12":4,"15":4,"22":3,"27":1,"28":2,"29":3,"32":3,"33":2,"34":1,"35":2,"41":2,"46":4,"47":3,"50":4,"51":3,"54":3,"63":2,"68":2,"70":3,"71":1,"72":1,"73":4,"74":4,"77":2,"80":1,"82":2,"83":3,"84":4,"86":4,"87":3,"90":4,"98":1,"99":3,"100":2,"102":2,"103":3,"104":2,"105":3,"106":4,"107":1,"111":2,"112":4,"114":2,"117":4,"119":4,"122":4,"123":1,"126":3,"127":2,"128":4,"129":3,"130":4,"131":3,"138":3,"140":1,"142":1,"146":2,"149":1,"151":1,"153":2,"155":4,"159":1,"186":4},
                schedule: ["1","2","3","55","187","211","245","291","438","465","549","594","705","745","811","419","795","265","883","378","901","824","817","31","260","489","898","639","727","756","664","113","808","534","916","183","43","501","156","657","19","195","923","508","74","683","785","515","852","864","875","778","288","715","40","635","678","672","235","927","316","165","531","28","653","430","145","412","330","437","805","451","932"],
                settings: {autoScheduleIntroComplete: true, "scheduleMode": "full", "displaySchedulerStats": true}
            }
        };

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