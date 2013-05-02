<?php
	/*Connect to DB*/

	// Create connection
	$con=mysqli_connect("localhost","root","12345","gameStates");

	// Check connection
	if (mysqli_connect_errno($con)) {
	  echo "Failed to connect to MySQL: " . mysqli_connect_error();
	}

	$gameid = mysql_real_escape_string($_POST["gameId"]);
	/* Player facebook id */
	$pid = mysql_real_escape_string($_POST["pid"]);



	/* Get the game you are currently playing */
	/* FUTURE PROBLEM: This DB format / SQL could limit a player to 1 game at a time */
	$check = "SELECT * FROM users WHERE gid = $gameid AND ( p1id = $pid OR p2id = $pid)";
	if(!$result = $db->query($check)){
		die('There was an error running the query [' . $db->error . ']');
	}
	$info = mysqli_fetch_array($result);
	if(isset($info)){
		/*convert varchar to something that i can make a JS array out of... */
		return $info;
	}
?>