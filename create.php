<?php

	/*Connect to DB*/
	/*Create connection*/
	$db=mysqli_connect("localhost","root","12345","gameStates");

	// Check connection
	if (mysqli_connect_errno($db)) {
	  echo "Failed to connect to MySQL: " . mysqli_connect_error();
	}

	/* get game state */
	$gameState = mysqli_real_escape_string($db,'0,1,0,0:0,3,0,0:0,5,0,0:0,7,0,0:1,0,0,0:1,2,0,0:1,4,0,0:1,6,0,0:2,1,0,0:2,3,0,0:2,5,0,0:2,7,0,0|5,0,1,0:5,2,1,0:5,4,1,0:5,6,1,0:6,1,1,0:6,3,1,0:6,5,1,0:6,7,1,0:7,0,1,0:7,2,1,0:7,4,1,0:7,6,1,0');
	$player1   = mysqli_real_escape_string($db,$_GET["player1"]);
	$player2   = mysqli_real_escape_string($db,$_GET["player2"]);

	$exist = "SELECT * FROM games WHERE ((p1id = $player1 AND p2id = $player2) OR (p1id = $player2 AND p2id = $player1))";
	if( !$result = $db->query($exist) ) {
		die('There was an error running the query [' . $db->error . ']');
	}

	/*echo  mysqli_num_rows($result);*/
	/* Dont start 2 games at the same time. */
	if( mysqli_num_rows($result) == 0 ) {
		$check = "INSERT INTO games (p1id,p2id,state,turn) VALUES ('$player1', '$player2', '$gameState', 0)";

		if( !$result = $db->query($check) ) {
			die('There was an error running the query [' . $db->error . ']');
		}
	}	
	/* TODO - Alert player2 via FB wall post, message, or some other communication */


	/* Redirect to main page: */
	echo '<META HTTP-EQUIV="Refresh" Content="0; URL=index.php">';    
?>