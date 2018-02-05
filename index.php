<?php
$COMPILING = isset($_REQUEST['compile']) || isset($COMPILE);
if ($COMPILING) {
    $css = ['compiled.css'];
    $js = ['compiled.js'];
} else {
    $build = json_decode(file_get_contents('tools/build.json'));
    $css = $build->css;
    $js = $build->js;
}
?><!DOCTYPE html>
<html ng-app="fringeApp">
<head itemscope="" itemtype="http://schema.org/WebPage" lang="en">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <base href="/">
    <meta name="description" content="Automatically create your perfect Fringe schedule.">
    <meta name="keyords" content="Orlando Fringe Festival, Fringeomatic">
    <meta name="author" content="Lewis Johnston">
    <title>Fringe-o-Matic · Automatically create your perfect Fringe schedule.</title>

    <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
    <?php foreach ($css as $filename) { ?>
        <link rel="stylesheet" type="text/css" href="<?php echo $filename; ?>" />
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

    <meta name="twitter:title" content="Fringe-o-Matic">
    <meta name="twitter:description" content="Automatically create your perfect Fringe schedule.">

    <meta property="og:url" content="https://fringeomatic.com">
    <meta property="og:title" content="Fringe-o-Matic">
    <meta property="og:description" content="Automatically create your perfect Fringe schedule.">
    <meta property="og:type" content="website">

    <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-113297473-1', '<?php echo $COMPILING ? 'auto' : 'none'; ?>');
    </script>
</head>
<body ng-controller="CoreCtrl" ng-class="{'online': isOnline, 'offline': !isOnline, 'syncing': isSyncing}">
<header class="navbar-primary navbar navbar-fixed-top" offset-height="navHeight">
    <div class="container" ng-init="nav = {collapsed: true}">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle" ng-cloak ng-show="loaded" ng-click="nav.collapsed = !nav.collapsed">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a href="/" class="navbar-brand pointer">Fringe-o-Matic</a>
            <ul class="nav navbar-nav visible-xs-block" ng-cloak style="margin:0">
                <li class="navbar-text cloud-icon" ng-if="signedIn">
                    <i class="glyphicon glyphicon-cloud"></i>
                    <i class="glyphicon glyphicon-ok"></i>
                    <i class="glyphicon glyphicon-refresh"></i>
                </li>
            </ul>
        </div>
        <div class="collapse navbar-collapse" ng-class="{collapse: nav.collapsed}" ng-if="! error">
            <ul class="nav navbar-nav" ng-cloak>
                <li ng-repeat="item in ::menu" ng-class="{active:currentRoute == '/' + item.route, 'hidden-sm': item.route == ''}">
                    <a href="/{{item.route}}" ng-click="nav.collapsed = true">{{item.title}}</a>
                </li>
                <li ng-if="isUserAdmin" ng-class="{active:currentRoute == '/test'}">
                    <a href="/test">T</a>
                </li>
            </ul>
            <ul class="nav navbar-nav navbar-right" ng-cloak ng-if="!isOnline">
                <li class="navbar-text">Offline</li>
            </ul>
            <ul class="nav navbar-nav navbar-right" ng-cloak ng-if="isOnline">
                <li ng-show="! signedIn && loaded"><a href ng-click="signIn()">Sign In</a></li>
                <li class="dropdown" ng-show="signedIn && loaded">
                    <a href bs-dropdown>Signed in <span class="hidden-sm">as {{signedInName}}</span> <span class="caret"></span></a>
                    <ul class="dropdown-menu" style="border-radius: 4px">
                        <li><a href ng-click="signOut()">Sign Out</a></li>
                    </ul>
                </li>
                <li ng-if="loaded" ng-controller="NotificationsCtrl">
                    <a href ng-if="show" data-template-url="app/core/notifications/popover.html" data-auto-close="1" data-placement="bottom-right" bs-popover analytics-on analytics-event="Open" analytics-category="Notifications"><i class="glyphicon glyphicon-bell"></i></a>
                </li>
                <li class="navbar-text cloud-icon hidden-xs" ng-if="signedIn">
                    <i class="glyphicon glyphicon-cloud"></i>
                    <i class="glyphicon glyphicon-ok"></i>
                    <i class="glyphicon glyphicon-refresh"></i>
                </li>
            </ul>
        </div>
    </div>
</header>
<main ng-style="{paddingTop: navHeight + 'px', minHeight:'calc(100vh - ' + (footerHeight + 1) + 'px)'}">
    <noscript>
        <div class="container" style="padding-top: 8rem">
            <h1>Error</h1>
            <p class="lead">This tool requires JavaScript. Please enable JavaScript and refresh the page.</p>
        </div>
    </noscript>
    <div ng-if="error" ng-cloak>
        <div class="container" style="padding-top: 8rem">
            <div class="page-header">
                <h1>Error</h1>
            </div>
            <p class="lead">{{error.title}}</p>
            <p ng-bind="error.more"></p>
        </div>
    </div>
    <div ng-if="! error && ! loaded" class="js-required">
        <div class="container" style="padding-top: 10rem">
            <div class="spinner"></div>
            <p class="text-center lead" ng-cloak><strong>{{loadingMessage[0]}}</strong><br>{{loadingMessage[1]}}</p>
        </div>
    </div>
    <div ng-if="! error && loaded" ng-cloak>
        <div ng-view></div>
    </div>
</main>
<footer class="text-muted hidden-print" ng-cloak offset-height="footerHeight">
    <div class="container">
        <ul class="hidden-offline">
            <li><a href="/policies/terms">Terms of Service</a></li>
            <li><a href="/policies/privacy">Privacy Policy</a></li>
            <li><a href="/about/credits">Credits</a></li>
        </ul>
        <p style="margin:0">Made with <span class="text-danger">&hearts;</span> by Lewis Johnston. &copy; 2018. Not affiliated with <a href="http://orlandofringe.org" target="_blank">Orlando Fringe</a>.<br />
            <em>The web is my stage. This is my performance. <strong>Anyone Can Fringe!</strong></em></p>
    </div>
</footer>
<?php
if (! $COMPILING) {
    foreach ($build->templates as $filename) {
        echo '<script type="text/ng-template" id="' . $filename . '">'
            . file_get_contents(__DIR__ . '/' . $filename)
            . '</script>';
    }
}
?>
<script type="text/javascript">
    document.body.className += ' js';
    ENVIRONMENT = '<?php echo $COMPILING ? 'prod' : 'dev'; ?>';
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/vibrant.js/1.0.0/Vibrant.min.js" integrity="sha256-qAQzBOPFUA4u8LLFha4hHBcGZoKk4Q8NtWqYa4K2b7g=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/moment.min.js" integrity="sha256-ABVkpwb9K9PxubvRrHMkk6wmWcIHUE9eBxNZLXYQ84k=" crossorigin="anonymous"></script>


<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.5/angular.min.js" integrity="sha256-zBy1l2WBAh2vPF8rnjFMUXujsfkKjya0Jy5j6yKj0+Q=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.5/angular-animate.min.js" integrity="sha256-1XBp/KwjxhvrtZiQ+ecAScAyLPe4OStn2lMX0vxTq9U=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.5/angular-route.min.js" integrity="sha256-E6XubcgT4a601977ZZP4Yw/0UCB2/Ex+Bazst+JRw1U=" crossorigin="anonymous"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/compiler.min.js" integrity="sha256-92KF7d4tvPPCKvTRnV+OorcMRxrmaXJQxv6i5Vd1kEM=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/dimensions.min.js" integrity="sha256-gW6ZXGiEQAE0lqfWfso2xfjzA5jqkEeM2hcMl0+32cQ=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/debounce.min.js" integrity="sha256-rsLOkGBtBb7taPde9REPBC9H4YaAphSsNF8EpZdix/g=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/parse-options.min.js" integrity="sha256-tHOOow8ICj4DjOuMlo46xNRummEu75AV7pRgg1qFk5Q=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/affix.min.js" integrity="sha256-MAd1EYJG15HLN1OiQleYoJq4ROK+R4Fi0EVJtziJXm0=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/alert.min.js" integrity="sha256-q2EdjdwUJgoBLZ2xPHnxjwTf1uP9mzUPQ5ZKGUABdJA=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/alert.tpl.min.js" integrity="sha256-gYlmV53tPJ13BVNe8MbotY9qp6vc7PQJS61ys+TtmBc=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/button.js" integrity="sha256-BPKtSLXAqv0eQEPlrrkICpknj2+Xkvfn2x1k+VOw4Fk=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/dropdown.min.js" integrity="sha256-lxvk+40PsmX0ZF7xr8GKtTZR4wmuarMNCdH2Ngxls0s=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/dropdown.tpl.min.js" integrity="sha256-GS9Jkqgr5jCKq8oe7jrGYsZwuq3xvfNOStdPHuL3n4Q=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/modal.min.js" integrity="sha256-gshpom8oJG7Vsk1pnEc0hyHzVkrQxypbumMekjN/V7w=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/modal.tpl.min.js" integrity="sha256-4Ww5t6Np4qvHdp63dSxHdZoBshaMHYH0CzfXS/iKm8A=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/popover.min.js" integrity="sha256-yJPwDjZhFf+DnJDyOHGFxksVL8hHBWIe6udGVB+eMLc=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/popover.tpl.min.js" integrity="sha256-P9Ha300ygh8sqxJEikoyHT27UkUg1o2C+u+qRWAl2QM=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/select.min.js" integrity="sha256-5VtqMT2D/JTsJ2QV/iauUf6KPE433sktBbra/Sq4SjA=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/select.tpl.min.js" integrity="sha256-Ys3ZiC61bdJGs5zsy0go6ULzX52QO/O9UgKBVr6hmzo=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/tab.min.js" integrity="sha256-daNxn3f09twg4+GlxaS7jYZsB7G7Zn4Pl1Y91SYKbec=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/tab.tpl.min.js" integrity="sha256-yAaIhk1sHc/pBOfufFWBpNO1RtBQ3wblevqGdNiZIsg=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/tooltip.min.js" integrity="sha256-y1n1NczNyRGWUUp2UlpFGCoUxklwauzxaorlabScIAo=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-strap/2.3.12/modules/tooltip.tpl.min.js" integrity="sha256-w52zTXyT3KOBiDaC3PJ1+7NdiIPCJd8yugyEovunS40=" crossorigin="anonymous"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/ngInfiniteScroll/1.3.0/ng-infinite-scroll.min.js" integrity="sha256-nUL1iPqMsX6n0f19hNGgkMsUgqQmP5k8PUWbDc1R/jU=" crossorigin="anonymous"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/angulartics/1.5.0/angulartics.min.js" integrity="sha256-ySl5/+EcmYgxuebBmVID1Gcl554CUuWNQKYeN4RvNMw=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angulartics-google-analytics/0.4.0/angulartics-ga.min.js" integrity="sha256-oibUTmLtPCt1kIEnhit4mvjv0msZqEFE1C7decTsmfA=" crossorigin="anonymous"></script>
<?php if (! $COMPILING) { ?>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/angulartics/1.5.0/angulartics-debug.min.js" integrity="sha256-VjruztIujgMOl/RgcUpb2HpOKbCjmo5Q7p6WT4EKRDs=" crossorigin="anonymous"></script>
<?php } ?>

<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD0y40AVRhf_DDSsFCRT0mBXhjdkQZP4Ys"></script>
<script src="https://apis.google.com/js/api.js"></script>

<?php foreach ($js as $script) { ?>
    <script src="<?php echo $script; ?>"></script>
<?php } ?>
</body>
</html>
