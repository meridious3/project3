<?
  // Remember to copy files from the SDK's src/ directory to a
  // directory in your application on the server, such as php-sdk/
  require 'facebook-php-sdk-master/src/facebook.php';

    // CHANGE ME BETWEEN HOSTS

  $config = array(
    'appId'  => '627872940559966',
    'secret' => 'b60c9ec277821046d62e733ff692f14f',
    'cookie' => true
  );

  $facebook = new Facebook($config);
  $user_id = $facebook->getUser();
  
  if(isset($_REQUEST["action"]))
    $action = $_REQUEST["action"];
  else
    $action = "none";
?>
<html>
	<body>
		<?php 
			setcookie('fbs_'.$facebook->getAppId(), '', time()-100, '/', 'localhost');
			session_destroy();
			
		?>
		<script>
			//kill localstorage here
			//kill cookies here
		</script>

		<?php
			header('Location: ./index.php'); 
		?>
	</body>
</html>