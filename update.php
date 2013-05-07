<?php
	/*Connect to DB*/

	// Create connection
	$db=mysqli_connect("localhost","root","12345","gameStates");

	// Check connection
	if (mysqli_connect_errno($db)) {
	  echo "Failed to connect to MySQL: " . mysqli_connect_error();
	}

	/* get game state */
	$p1 = mysql_real_escape_string($_POST["player1"]);
	$p2 = mysql_real_escape_string($_POST["player2"]);

	$gameState = mysql_real_escape_string($_POST["gameState"]);
	$movecount = mysql_real_escape_string($_POST["movecount"]);



	$check = "SELECT * FROM games WHERE (p1id = $p1 AND p2id = $p2) OR (p1id = $p2 AND p2id = $p1)";
	if(!$result = $db->query($check)){
		die('There was an error running the query 1 [' . $db->error . ']');
	}
	$info = mysqli_fetch_array($result);


	if(isset($info)){
		/* Confirm state */
		/* Make sure only 1 piece moved, etc... */

		/* update db with state */ 
		// echo $p1;
		// echo $p2;
		// echo $gameState;
		// echo $movecount;
		$up = " UPDATE games
				SET state = '$gameState', turn = '$movecount'
				WHERE (p1id = '$p1' AND p2id = '$p2') OR (p1id = '$p2' AND p2id = '$p1')";

		if(!$result = $db->query($up)){
			die('There was an error running the query 2 [' . $db->error . ']');
		}

	}
?>