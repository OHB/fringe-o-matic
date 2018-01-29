<?php
$build = json_decode(file_get_contents('build.json'));
ob_start("ob_gzhandler");
?><!DOCTYPE html>
<html ng-app="fringeApp">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <base href="/">
    <title>Fringe-o-Matic</title>
    <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
    <?php foreach (isset($_REQUEST['compiled']) ? ['compiled.css'] : $build->css as $script) { ?>
        <link rel="stylesheet" type="text/css" href="<?php echo $script; ?>" />
    <?php } ?>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/angular-motion/0.4.4/angular-motion.min.css" />
    <link href="https://fonts.googleapis.com/css?family=Quicksand:400,500,700" rel="stylesheet">
    <style>
        [ng-cloak] {
            display: none !important;
        }
    </style>
    <link rel="prefetch" href="img/skulls.png" as="image">
    <link rel="prefetch" href="img/ticket.svg" as="image">
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/manifest.json">
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#337ab7">
    <meta name="msapplication-TileColor" content="#ffc40d">
    <meta name="msapplication-TileImage" content="/mstile-144x144.png">
    <meta name="theme-color" content="#ffffff">
</head>
<body ng-controller="CoreCtrl">
<header class="navbar-primary navbar navbar-fixed-top">
    <div class="container" ng-init="nav = {collapsed: true}">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle" ng-cloak ng-show="loaded" ng-click="nav.collapsed = !nav.collapsed">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a href="/" class="navbar-brand">Fringe-o-Matic</a>
        </div>
        <div class="collapse navbar-collapse" ng-class="{collapse: nav.collapsed}">
            <ul class="nav navbar-nav" ng-cloak>
                <li ng-repeat="item in ::menu" ng-class="{active:currentRoute == '/' + item.route}">
                    <a href="/{{item.route}}" ng-click="nav.collapsed = true">{{item.title}}</a>
                </li>
                <li ng-if="isUserAdmin" ng-class="{active:currentRoute == '/test'}">
                    <a href="/test">Testing</a>
                </li>
                <li><a href ng-click="openHelp()">
                        <i class="glyphicon glyphicon-question-sign" bs-tooltip="{title:'Need help?'}" data-placement="bottom"></i>
                    </a>
                </li>
            </ul>
            <ul class="nav navbar-nav navbar-right" ng-cloak>
                <li ng-show="! signedIn && loaded"><a href ng-click="signIn()">Sign In</a></li>
                <li class="dropdown" ng-show="signedIn && loaded">
                    <a href bs-dropdown>Signed in as {{signedInName}} <span class="caret"></span></a>
                    <ul class="dropdown-menu">
                        <li><a href ng-click="signOut()">Sign Out</a></li>
                    </ul>
                </li>
                <li ng-if="loaded" ng-controller="NotificationsCtrl">
                    <a href ng-if="show" data-template-url="app/core/notifications/popover.html" data-auto-close="1" data-placement="bottom-right" bs-popover><i class="glyphicon glyphicon-bell"></i></a>
                </li>
            </ul>
        </div>
    </div>
</header>
<main inner-height="innerHeight" ng-style="{minHeight:(innerHeight-134)+'px'}">
    <noscript>
        <div class="container" style="padding-top: 8rem">
            <h1>Error</h1>
            <p class="lead">This tool requires JavaScript. Please enable JavaScript and refresh the page.</p>
        </div>
    </noscript>
    <div ng-if="error" ng-cloak>
        <div class="container" style="padding-top: 8rem">
            <h1>Error</h1>
            <p class="lead">{{error.title}}</p>
            <p ng-bind="error.more"></p>
        </div>
    </div>
    <div ng-if="! error && ! loaded" class="js-required">
        <div class="container" style="padding-top: 10rem">
            <div class="spinner"></div>
        </div>
    </div>
    <div ng-if="! error && loaded" ng-cloak>
        <div ng-view></div>
    </div>
</main>
<footer class="text-muted" ng-cloak>
    <div class="container">
        <ul>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/credits">Credits</a></li>
        </ul>
        <p>Built with &hearts; by Lewis Johnston. Not affiliated with <a href="http://orlandofringe.org" target="_blank">Orlando Fringe</a>.<br />
            <em>The web is my stage. This is my performance. <strong>Anyone Can Fringe!</strong></em></p>
    </div>
</footer>
<?php
if (isset($_REQUEST['compiled'])) {
    echo file_get_contents('templates.html');
}
foreach (isset($_REQUEST['compiled']) ? [] : $build->templates as $filename) { ?>
    <script type="text/ng-template" id="<?php echo $filename; ?>">
    <?php echo file_get_contents($filename); ?>
    </script>
<?php } ?>
<script type="text/javascript">
    document.body.className += ' js';
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/moment.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.7/angular.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.7/angular-route.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.7/angular-animate.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/compiler.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/dimensions.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/debounce.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/parse-options.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/affix.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/aside.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/aside.tpl.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/button.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/dropdown.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/dropdown.tpl.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/modal.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/modal.tpl.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/popover.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/popover.tpl.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/select.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/select.tpl.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/tab.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/tab.tpl.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/tooltip.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/tooltip.tpl.min.js"></script>
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD0y40AVRhf_DDSsFCRT0mBXhjdkQZP4Ys"></script>
<script src="https://apis.google.com/js/api.js"></script>
<?php foreach (isset($_REQUEST['compiled']) ? ['compiled.js'] : $build->js as $script) { ?>
<script src="<?php echo $script; ?>"></script>
<?php } ?>
</body>
</html>
<?php file_put_contents('index.html', ob_get_contents());