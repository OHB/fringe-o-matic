angular.module('fringeApp').component('show', {
    templateUrl: 'app/show/show.html',
    controller: ['$scope', '$routeParams', 'Data', 'Schedule', '$sce', function($scope, $routeParams, Data, Schedule, $sce) {
        $scope.moment = moment;
        $scope.now = Date.now() / 1000;
        $scope.showId = Data.findShowIdBySlug($routeParams.show);
        $scope.show = Data.getShow($scope.showId);
        $scope.firstPerformance = Data.getPerformance($scope.show.performances[0]);
        $scope.performances = Data.getPerformances();
        $scope.venues = Data.getVenues();
        $scope.ratings = Data.getRatings();
        $scope.isUserAttendingPerformance = Schedule.isUserAttendingPerformance;
        $scope.trustAsHtml = $sce.trustAsHtml;

        var img = document.createElement('img');
        img.setAttribute('src', 'img/show/' + $scope.show.image);
        img.addEventListener('load', function() {
            var swatches = new Vibrant(img).swatches();

            $scope.$apply(function() {
                $scope.backgroundColor = swatches.DarkVibrant.getHex();
                $scope.titleColor = swatches.DarkVibrant.getTitleTextColor();
                $scope.textColor = swatches.DarkVibrant.getBodyTextColor();
                $scope.loaded = true;
            });
        });
    }]
});