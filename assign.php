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
	$check = "SELECT * FROM games WHERE ( p1id = '$pid' AND p2id = '$pid2')";
	if(!$result = $db->query($check)){
		die('There was an error running the query [' . $db->error . ']');
	}
	
	$info = mysqli_fetch_array($result);

	// print_r($info);
	// print($pid." ".$info['p1id']."\n");
	// print($pid2." ".$info['p2id']);


	if($pid == $info['p1id']){
		echo "0";
	} else {
		$check = "SELECT * FROM games WHERE ( p1id = '$pid2' AND p2id = '$pid')";
		if(!$result = $db->query($check)){
			die('There was an error running the query [' . $db->error . ']');
		}
		if(mysqli_num_rows($result) == 1){
			echo "1";
		} else {
			// echo "A locigal error in assign.php occured";
		}
	}
?>