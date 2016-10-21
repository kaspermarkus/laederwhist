<?php

session_start();
if (!isset($_SESSION["username"])) {
  http_response_code(401);
  die();
}

echo json_encode($_SESSION["players_info"]);
