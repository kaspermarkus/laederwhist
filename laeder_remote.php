<?php
#get json data:
$jsondata = file_get_contents("php://input");
$data = json_decode($jsondata, true);

#var_dump($data, true);
#echo "\n\t".$data['name']."\n";
$filename = $data['filename'];
if ($filename) {
	$fh = fopen("data/".$filename, 'w') or die("can't open file");
	fwrite($fh, $jsondata);
	echo "Oki Doki";
} else {
	die("unable to save the game");
}

#save backup:
if ($filename) {
	$fh = fopen("data/".$filename.".bak", 'w') or die("can't open file");
	fwrite($fh, $jsondata);
	echo "Oki Doki";
} else {
	die("unable to save the game");
}
?>
