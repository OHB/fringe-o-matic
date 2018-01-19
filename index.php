<?php ob_start(); ?><!DOCTYPE html>
<html ng-app="fringeApp">
<head>
    <meta charset="utf-8">
    <title>Fringe-o-Matic</title>
    <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="./res/style.css" />
    <!--<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />-->
    <style>
        [ng-cloak] {
            display: none !important;
        }
        body {
            padding-top: 50px;
        }
    </style>
</head>
<body ng-controller="CoreCtrl">
<nav class="navbar-primary navbar navbar-fixed-top">
    <div class="container">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" ng-cloak ng-if="loaded">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <span class="navbar-brand">Fringe-o-Matic</span>
        </div>
        <div class="collapse navbar-collapse">
            <ul class="nav navbar-nav" ng-cloak>
                <li ng-repeat="item in menu" ng-class="{active:currentRoute == '/' + item.route}">
                    <a href="#!/{{item.route}}" >{{item.title}}</a>
                </li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
                <li><a><i class="glyphicon glyphicon-saved" ng-class="{'glyphicon-transfer': !loaded || saving}" bs-tooltip="{title:'Your data is saved automatically.'}" data-placement="bottom"></i></a></li>
            </ul>
        </div>
    </div>
</nav>
<noscript>
    <div class="jumbotron" ng-cloak>
        <div class="container">
            <h1>Error</h1>
            <p>This tool requires JavaScript. Please enable JavaScript and refresh the page.</p>
        </div>
    </div>
</noscript>
<div ng-if="error" ng-cloak>
    <div class="jumbotron">
        <div class="container">
            <h1>Error</h1>
            <p>{{error.title}}</p>
        </div>
    </div>
    <div class="container">
        <p ng-bind="error.more"></p>
    </div>
</div>
<div ng-if="! error && ! loaded" class="js-required">
    <div class="jumbotron" ng-if="! loaded">
        <div class="container">
            <h1>Loading...</h1>
            <p>
            <div class="progress">
                <div class="progress-bar progress-bar-striped active" style="width: 100%">
                </div>
            </div>
            </p>
        </div>
    </div>
</div>
<div ng-if="! error && loaded" ng-cloak>
    <div ng-view></div>
</div>
<p style="height: 20px">&nbsp;</p>
<?php
$templates = [
    'about', 'help', 'venues', 'shows', 'schedule', 'map',
    'myFringe', 'myFringe/availability', 'myFringe/generator', 'myFringe/schedule',
    'myFringe/availability/slotPerformancesModal',
    'myFringe/generate/generateModal',
];
foreach ($templates as $component) { $filename = 'app/' . $component . '/' . basename($component) . '.html'; ?>
    <script type="text/ng-template" id="<?php echo $filename; ?>">
    <?php echo file_get_contents($filename); ?>
    </script>
<?php } ?>
<script type="text/javascript">
    document.body.className += ' js';
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.7/angular.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.7/angular-route.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/moment.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/store2/2.5.9/store2.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/compiler.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/dimensions.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/debounce.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/parse-options.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/affix.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/button.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/select.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/select.tpl.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/tab.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/tab.tpl.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/tooltip.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/tooltip.tpl.min.js"></script>
<script src="res/genetics.js"></script>
<script src="res/ng-map.min.js"></script>
<script src="res/angular-location-update.min.js"></script>
<script src="res/ui-bootstrap-custom-tpls-2.5.0.min.js"></script>
<script src="app/app.js"></script>
<script src="app/app.config.js"></script>
<script src="app/core/filters/highlight.js"></script>
<script src="app/core/filters/price.js"></script>
<script src="app/core/filters/startFrom.js"></script>
<script src="app/core/directives/interest.js"></script>
<script src="app/core/directives/scrollYModel.js"></script>
<script src="app/core/directives/showRating.js"></script>
<script src="app/core/directives/staticMap.js"></script>
<script src="app/core/services/availability.js"></script>
<script src="app/core/services/data.js"></script>
<script src="app/core/services/error.js"></script>
<script src="app/core/services/schedule.js"></script>
<script src="app/core/services/userData.js"></script>
<script src="app/core/core.js"></script>
<script src="app/about/about.js"></script>
<script src="app/help/help.js"></script>
<script src="app/myFringe/myFringe.js"></script>
<script src="app/myFringe/availability/availability.js"></script>
<script src="app/myFringe/availability/slotPerformancesModal/slotPerformancesModal.js"></script>
<script src="app/myFringe/generator/generator.js"></script>
<script src="app/myFringe/generator/generateModal/generateModal.js"></script>
<script src="app/myFringe/generator/services/generatorFactory.js"></script>
<script src="app/myFringe/schedule/schedule.js"></script>
<script src="app/map/map.js"></script>
<script src="app/schedule/schedule.js"></script>
<script src="app/shows/shows.js"></script>
<script src="app/venues/venues.js"></script>
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDdE91DU1mNa65N7Utpolt787MKFpFo0z4"></script>
</body>
</html>
<?php file_put_contents('index.html', ob_get_contents());