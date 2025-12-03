<?php
include_once("config.php");
include_once("protect.php");

//include the autoloader
// require_once('../vendor/autoload.php');

header("Cache-Control: max-age=300, public");

//Función personalizada que permite validar un email pasado por parametro
function emailValidation($email) {
    $regex = "/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,10})$/";
    $email = strtolower($email);

    return preg_match ($regex, $email);
}
