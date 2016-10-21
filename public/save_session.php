<?php

ini_set('display_errors', 1);
error_reporting(~0);

session_start();
if (!isset($_SESSION["username"])) {
  http_response_code(401);
  die();
}

#get raw json data from POST request:
$jsondata = file_get_contents("php://input");
// $data = json_decode($jsondata, true);

# Session info orinally stored via checkLogin.php
# get filename under which to save:
$game_file = $_SESSION["game_file"];
$backup_prefix = $_SESSION["backup_prefix"];

// echo "KASPER: ".$game_file;

// echo $game_file;

// #var_dump($data, true);
// #echo "\n\t".$data['name']."\n";
// // $filename = $data['filename'];
if ($game_file) {
	// save file:
	$fh = fopen($game_file, 'w') or http_response_code(500);
	fwrite($fh, $jsondata);
	// // save backup:
	$date = new DateTime();
	$backup_file_name = $backup_prefix.($date->format("Y.m.d.His")).".bak.json";
	$fh = fopen($backup_file_name, 'w') or http_response_code(500);
	fwrite($fh, $jsondata);
	http_response_code(200);
} else {
	http_response_code(500);
}

?>
