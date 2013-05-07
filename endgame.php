<?php
	/* Remove the game from the DB */
	/* To do this, i need p1 & p2 identification */
	/*Connect to DB*/

	/*Create connection*/
	$db = mysqli_connect("localhost","root","12345","gameStates");

	// Check connection
	if (mysqli_connect_errno($db)) {
	  echo "Failed to connect to MySQL: " . mysqli_connect_error();
	}

	$player1   = mysqli_real_escape_string($db,$_POST["player1"]);
	$player2   = mysqli_real_escape_string($db,$_POST["player2"]);

	$remove = "DELETE FROM `games` WHERE (p1id = $player1 AND p2id = $player2) OR (p1id = $player2 AND p2id = $player1)";
	if( !$result = $db->query($remove) ) {
		die('There was an error running the query [' . $db->error . ']');
	}

	/* Redirect to main page: */
	/**/echo '<META HTTP-EQUIV="Refresh" Content="0; URL=index.php">';    

?>