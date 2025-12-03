<?php
require 'database.class.php';
$table_perm = "permisos"; // nombre de la tabla que contiene los permisos de la web
$root = root();
$location_accessdenied = $root."403error"; // página de denegación de acceso
$location_accessdenied_default = $root."login?message=expire"; // página de denegación de acceso por defecto
$location_403 = $root."403error"; // página de error 403
$location_404 = $root."404error"; // página de error 404
$location_500 = $root."500error"; // página de error 500
$location_loginuser = $root."areapersonal"; //página de login usuario por defecto
$location_loginerror = $root."login?error=invalidlogin"; // pagina de login invalido
$location_logout = $root."login?message=logout"; // el usuario será redireccionado a esta página cuando cierre sesion
$location_logout_expire = $root."login?message=expire"; // el usuario será redireccionado a esta página cuando expire la sesion
$location_already_logged = $root."redirectlogin"; // el usuario será redireccionado a esta página si ya está logueado
$expireTime = 30; // tiempo de expiración de la sesión en minutos

$session_name = "llanosfarmacia"; // nombre de la sesion

if (is_null($location_accessdenied))
$location_accessdenied = $location_accessdenied_default;

$mysqli=Db::getInstance();

// Solo iniciar sesión si no está activa
if (session_status() === PHP_SESSION_NONE) {
    session_name('llanosfarmacia');
    
    // Detectar si estamos en HTTPS o HTTP
    $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') 
                || $_SERVER['SERVER_PORT'] == 443
                || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
    
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => $isSecure,  // Solo secure en HTTPS
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

function root(){
    $relativeurl = "/";
    if($_SERVER["HTTP_HOST"]=="cuberty.ddns.net" || $_SERVER["HTTP_HOST"]=="cuberty.ddns.net:8080" || $_SERVER['HTTP_HOST'] == "localhost"){
        $relativeurl = "/llanosfarmacia/";
    }
    return $relativeurl;
}

function baseurl(){
    if (!empty($_SERVER['HTTPS']) && ('on' == $_SERVER['HTTPS'])) {
        $server = 'https://';
      } else {
        $server = 'http://';
      }
      $relativeurl = "";
      if($_SERVER["HTTP_HOST"]=="cuberty.ddns.net:8080" || $_SERVER["HTTP_HOST"]=="cuberty.ddns.net" || $_SERVER['HTTP_HOST'] == "localhost"){
          $relativeurl = "/llanosfarmacia";
      }
      return $server.$_SERVER['HTTP_HOST'].$relativeurl;
}

?>