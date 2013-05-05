<!-- Initial help from http://diveintohtml5.info/canvas.html, but the majority has changed -->
<?
  // Remember to copy files from the SDK's src/ directory to a
  // directory in your application on the server, such as php-sdk/
  require 'facebook-php-sdk-master/src/facebook.php';

    // CHANGE ME BETWEEN HOSTS

  $config = array(
    'appId'  => '560482677326050',
    'secret' => '2f5d4d0449a68fd43034b93a4a5c1004'
  );

  $facebook = new Facebook($config);
  $user_id = $facebook->getUser();
  
  if(isset($_REQUEST["action"]))
    $action = $_REQUEST["action"];
  else
    $action = "none";
?>


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
        <?php

        if($user_id) {

          // We have a user ID, so probably a logged in user.
          // If not, we'll get an exception, which we handle below.
          try {

            $friends = $facebook->api('/me/friends','GET');
            $me = $facebook->api('/me');

             /* give JS the persons fb profile id */
            echo "<script> var playerID = ".$me['id']."</script>";
            
            echo "<h3>Welcome ".$me['first_name']." :) </h3>" ;
            echo "<a href="."./logout.php".">Log out</a>";

            /* Check to see if there are any games the person is playing */
            $db=mysqli_connect("localhost","root","12345","gameStates");

            // Check connection
            if (mysqli_connect_errno($db)) {
              echo "Failed to connect to MySQL: " . mysqli_connect_error();
            }
            $pid = $me['id'];
            $check = "SELECT * FROM games WHERE ( p1id = $pid OR p2id = $pid)";
            if(!$result = $db->query($check) ){
                die('There was an error running the query [' . $db->error . ']');
            }
            /*fetch result so we know who the other player is*/
            $info = mysqli_fetch_array($result);
            $p1id = $info['p1id'];
            $p2id = $info['p2id'];

            if( mysqli_num_rows($result) == 0 /* No game in progress*/ ) {
                echo '<div id="friendslist">';
                foreach($friends['data'] as $f){
                    $img = 'https://graph.facebook.com/'.$f['id'].'/picture';

                    // change this to init a game between the two ppl
                    $play = './create.php?player1='.$me['id'].'&player2='.$f['id'];

                    $email = $f;             
                    echo '<li>';
                    echo '<img src="'.$img.'">';
                    echo '<a href="'.$play.'">'.'Play '.$f['name'].'</a>';
                    echo '</li>';   
                }
                echo '</div>';
            } else if (mysqli_num_rows($result) == 1) {
                echo "<br /> Game in progress against ".$p1id;
            } else {
                echo "Multiple DB game entries. This is bad";
            }
            

        } catch(FacebookApiException $e) {
            // If the user is logged out, you can have a 
            // user ID even though the access token is invalid.
            // In this case, we'll get an exception, so we'll
            // just ask the user to login again here.
            $login_url = $facebook->getLoginUrl(); 
            print('User, but no token. Please <a href="' . $login_url . '">login.</a>');
            error_log($e->getType());
            error_log($e->getMessage());
          }   
        } else {
          // No user, print a link for the user to login
          $login_url = $facebook->getLoginUrl();
          print 'Please <a href="' . $login_url . '">login.</a>';
        }    
        ?>   
        <br />
        <br />
        <button id="endGame" onclick="endGame()" type="submit" formaction="endgame.php?<?php echo 'player1='.'$p1id'.'&player2=$p2id'?>">End Game</button>         
        </div>
    </body>
  <style>
        #border {
            width:  400px;           
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

        #friendslist {
            width: 190px;
            height: auto;
        }

        body {
            background-image:url("img/background.jpg");
            background-size: 100%;
        }

        h1 {
            font-family: "Palatino";
            font-size: 48px;
            color: white;
        }
        </style>
</html>