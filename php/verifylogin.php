<?php
require 'config.php';
include("funciones.php");

function verifylogin($mysqli,$login,$pwd){
    if (emailValidation($login)) {
        $query = 
        "SELECT iduser, role
        FROM user 
        WHERE email = ? AND password = ? AND isdeleted = 0";
        $result = $mysqli->prepare($query, array($login, sha1($pwd)));
        if (mysqli_num_rows($result) > 0){
            $row = mysqli_fetch_array($result);
            $_SESSION["usercode"] = $row["iduser"];
            $_SESSION["usertype"] = $row["role"];
            return TRUE;
        }
    }
    return FALSE;
}


$login = trim($_POST["login-email"]);
$pwd = trim($_POST["login-pass"]);
$error = "";

if (verifylogin($mysqli,$login,$pwd)){
        header("location: ../index.php");
} else {
    header("location: ../login.php?error=1");
}




?>