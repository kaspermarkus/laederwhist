<?php

session_start();
if (!isset($_SESSION["username"])) {
  http_response_code(401);
  die();
}

$game_file = $_SESSION["game_file"];
$jsondata = file_get_contents($game_file);

echo $jsondata;
