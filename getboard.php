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
	$pid = mysql_real_escape_string($_POST["p1"]);
	$pid2 = mysql_real_escape_string($_POST["p2"]);



	/* Get the game you are currently playing */
	/* FUTURE PROBLEM: This DB format / SQL could limit a player to 1 game at a time */
	$check = "SELECT * FROM games WHERE ( p1id = $pid AND p2id = $pid2) OR ( p2id = $pid AND p1id = $pid2) ";
	if(!$result = $db->query($check)){
		die('There was an error running the query [' . $db->error . ']');
	}
	$info = mysqli_fetch_array($result);

	if(isset($info)){
		$arr = array('game' => $info['state'], 'moves' => $info['turn']);

		echo json_encode($arr);
	}
?>