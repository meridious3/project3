<?php
	/*Connect to DB*/

	// Create connection
	$db = mysqli_connect("localhost","root","12345","gameStates");

	// Check connection
	if (mysqli_connect_errno($db)) {
	  echo "Failed to connect to MySQL: " . mysqli_connect_error();
	}

	// $gameid = mysql_real_escape_string($_POST["gameId"]);
	/* Players facebook id */
	$pid = mysql_real_escape_string($_GET["pid"]);



	/* Get the game you are currently playing */
	/* FUTURE PROBLEM: This DB format / SQL could limit a player to 1 game at a time */
	$check = "SELECT * FROM games WHERE ( p1id = $pid OR p2id = $pid)";
	if(!$result = $db->query($check)){
		die('There was an error running the query [' . $db->error . ']');
	}
	$info = mysqli_fetch_array($result);

	if(isset($info)){
/*		echo "<pre>";
		print_r($info);
		echo "</pre>";*/

		return $info['state'];
	}
?>