<?php
include("php/config.php");


$_SESSION = Array();
session_unset();
session_destroy();
header("location: login.php?logout=1");
?>