<html>
<script>
(function main() {
    // Create enabled event
    function fireEnabledEvent() {
        // If gli exists, then we are already present and shouldn't do anything
        if (!window.gli) {
            setTimeout(function () {
                var enabledEvent = document.createEvent("Event");
                enabledEvent.initEvent("WebGLEnabledEvent", true, true);
                document.dispatchEvent(enabledEvent);
            }, 0);
        } else {
            //console.log("WebGL Inspector already embedded on the page - disabling extension");
        }
    };

    // Grab the path root from the extension
    document.addEventListener("WebGLInspectorReadyEvent", function (e) {
        var pathElement = document.getElementById("__webglpathroot");
        if (window["gliloader"]) {
            gliloader.pathRoot = pathElement.innerText;
        } else {
            // TODO: more?
            window.gliCssUrl = pathElement.innerText + "gli.all.css";
        }
    }, false);

    // Rewrite getContext to snoop for webgl
    var originalGetContext = HTMLCanvasElement.prototype.getContext;
    if (!HTMLCanvasElement.prototype.getContextRaw) {
        HTMLCanvasElement.prototype.getContextRaw = originalGetContext;
    }
    HTMLCanvasElement.prototype.getContext = function () {
        var ignoreCanvas = this.internalInspectorSurface;
        if (ignoreCanvas) {
            return originalGetContext.apply(this, arguments);
        }

        var result = originalGetContext.apply(this, arguments);
        if (result == null) {
            return null;
        }

        var contextNames = ["moz-webgl", "webkit-3d", "experimental-webgl", "webgl", "3d"];
        var requestingWebGL = contextNames.indexOf(arguments[0]) != -1;
        if (requestingWebGL) {
            // Page is requesting a WebGL context!
            fireEnabledEvent(this);

            // If we are injected, inspect this context
            if (window.gli) {
                if (gli.host.inspectContext) {
                    // TODO: pull options from extension
                    result = gli.host.inspectContext(this, result);
                    // NOTE: execute in a timeout so that if the dom is not yet
                    // loaded this won't error out.
                    window.setTimeout(function() {
                        var hostUI = new gli.host.HostUI(result);
                        result.hostUI = hostUI; // just so we can access it later for debugging
                    }, 0);
                }
            }
        }

        return result;
    };
})();
</script>
<head>
    <link rel="stylesheet" type="text/css" href="css/conform.css"/>
	<script src="js/board-localstorage.js"></script>
	<script src="js/board.js"></script>

</head>
	<body>
        <br />
		<h1>Ye Olde English Draughts</h1>
		<!-- <p id="moves">Moves: <span id="movecount"></span></p> -->
        <div id="border" >
	       <script>initGame(null,document.getElementById('movecount'));</script>
        </div>
        <div id="stats">

        <div>
	</body>
    <style>
        /**/
        #border {
            width:  400px;
            /*height: 450px;*/
            margin: 0px auto;
        }

        /*Style goes at bottom so the background is applied */
        #checkers_canvas {
            background-image:url('img/checkerboard.jpg');
            background-size: cover;
            margin: auto auto;
            border-style: solid;
            border-width: 10px;
        }

        body {
            background-image:url("img/background.jpg");
            background-size: 100%;
        }

        h1 {
            font-family: "Palatino";
            font-size: 48px;
        }

    </style>
</html>