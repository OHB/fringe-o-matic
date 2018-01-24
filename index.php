<?php
$build = json_decode(file_get_contents('build.json'));
ob_start("ob_gzhandler");
?><!DOCTYPE html>
<html ng-app="fringeApp">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="google-signin-client_id" content="728570220201-2tkhj9m3stsqgprscc77o256r0f441au.apps.googleusercontent.com">
    <title>Fringe-o-Matic</title>
    <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
    <?php foreach (isset($_REQUEST['compiled']) ? ['compiled.css'] : $build->css as $script) { ?>
        <link rel="stylesheet" type="text/css" href="<?php echo $script; ?>" />
    <?php } ?>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/angular-motion/0.4.4/angular-motion.min.css" />
    <link href="https://fonts.googleapis.com/css?family=Quicksand:500,700" rel="stylesheet">
    <!--<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />-->
    <style>
        [ng-cloak] {
            display: none !important;
        }
        body {
            padding-top: 50px;
            font-family: 'Quicksand', sans-serif;
            font-weight: 500;
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
            <ul class="nav navbar-nav navbar-right" ng-cloak>
                <li style="padding-top:7px" ng-show="! signedIn && loaded"><div id="google-sign-in-button"></div></li>
                <li class="dropdown" ng-show="signedIn && loaded">
                    <a href bs-dropdown>Signed in as {{signedInName}} <span class="caret"></span></a>
                    <ul class="dropdown-menu">
                        <li><a href ng-click="signOut()">Sign Out</a></li>
                    </ul>
                </li>
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
            <br />
            <div class="progress">
                <div class="progress-bar progress-bar-striped active" style="width: 100%">
                </div>
            </div>
        </div>
    </div>
</div>
<div ng-if="! error && loaded" ng-cloak>
    <div ng-view></div>
</div>
<p style="height: 20px">&nbsp;</p>
<?php
if (isset($_REQUEST['compiled'])) {
    echo file_get_contents('compiled.html');
}
foreach (isset($_REQUEST['compiled']) ? [] : $build->templates as $filename) { ?>
    <script type="text/ng-template" id="<?php echo $filename; ?>">
    <?php echo file_get_contents($filename); ?>
    </script>
<?php } ?>
<script type="text/javascript">
    document.body.className += ' js';
</script>
<script src="https://apis.google.com/js/platform.js" data-cfasync="false"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.7/angular.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.7/angular-route.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.7/angular-animate.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/moment.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/store2/2.5.9/store2.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/compiler.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/dimensions.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/debounce.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/parse-options.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/affix.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/button.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/dropdown.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/dropdown.tpl.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/select.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/select.tpl.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/tab.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/tab.tpl.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/tooltip.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/tooltip.tpl.min.js"></script>
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDdE91DU1mNa65N7Utpolt787MKFpFo0z4"></script>
<?php foreach (isset($_REQUEST['compiled']) ? ['compiled.js'] : $build->js as $script) { ?>
<script src="<?php echo $script; ?>"></script>
<?php } ?>
</body>
</html>
<?php file_put_contents('index.html', ob_get_contents());