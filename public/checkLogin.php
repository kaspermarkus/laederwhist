<?php
session_start();
session_destroy();
session_start();

// ob_start();
ini_set('display_errors', 1);
error_reporting(~0);

// Define $myusername and $mypassword
$username = $_POST['username'];
$password = $_POST['password'];

$jsondata = file_get_contents("../data/clubs.json");
$data = json_decode($jsondata, true);

foreach ($data as $clubname => $content) {
    if ($clubname == $username && $content["password"] == $password) {
        $_SESSION["username"] = $username;
        $_SESSION["password"] = $password;
        $_SESSION["game_file"] = "../data/".$clubname.".json";
        $_SESSION["backup_prefix"] = "../data/backups/".$clubname;
        $_SESSION["game_info"]["players"] = $content["players"];
        if (isset($content["bet_types"])) {
            $_SESSION["game_info"]["bet_types"] = $content["bet_types"];
        }
        if (isset($content["costs"])) {
            $_SESSION["game_info"]["costs"] = $content["costs"];
        }
        header("location:index.php");
    }
}

echo "Wrong username and password... Try again: <a href='login.html'>Login</a>";

// ob_end_flush();
?>