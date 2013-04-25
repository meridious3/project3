<?php
	/*Connect to DB*/

	// Create connection
	$con=mysqli_connect("localhost","root","12345","gameStates");

	// Check connection
	if (mysqli_connect_errno($con)) {
	  echo "Failed to connect to MySQL: " . mysqli_connect_error();
	}

	$gameid = mysql_real_escape_string($_POST["gameId"]);
	/* get game state */
	$gameState = mysql_real_escape_string($_POST["gameState"]);



	$check = "SELECT * FROM users WHERE gid = $gameid";
	if(!$result = $db->query($check)){
		die('There was an error running the query [' . $db->error . ']');
	}
	$info = mysqli_fetch_array($result);


	if(isset($info)){
		/* Confirm state */
		/* MAke sure only 1 piece moved, etc... */

		/* update db with state */ 
		$up = " UPDATE games
				SET state = $gameState
				WHERE gid = $gameid ";

		if(!$result = $db->query($up){
			die('There was an error running the query [' . $db->error . ']');
		}
	}
?>