<?php include ("php/funciones.php"); ?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Farmacia Los Llanos - Login</title>
<link rel="preconnect" href="https://fonts.gstatic.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet"> 
<link rel="stylesheet" href="estilos.css">
</head>

<body>

<header class="topbar">
  <div class="brand">
    <img src="img/logo.png" alt="Logo">
    <h1 style="font-size:20px; margin:0;">Farmacia Los Llanos</h1>
  </div>
  <nav>
    <ul>
      <li><a href="index.html">Home</a></li>
      <li><a href="productos.html">Productos</a></li>
      <li><a href="contacto.html">Contacto</a></li>
    </ul>
  </nav>
</header>

<div class="login-wrapper">
  <div class="login-left">
    <h2>Iniciar Sesión</h2>
    <?php if(isset($_GET['logout'])) { ?>
        <div id="logout-box" class="success-msg">Has cerrado sesión correctamente.</div>
    <?php }else{ ?>
        <p style="margin-bottom: 25px; color: #666; font-size: 15px;">¡Nos alegra verte otra vez! Por favor, introduce tus datos.</p>
    <?php } ?>
    <div id="error-box" class="error-msg"></div>

    <form id="login-form" method="POST" action="php/verifylogin.php">
      <div class="input-group">
        <label>Email</label>
        <input type="email" name="login-email" id="login-email" placeholder="ejemplo@correo.com" required>
      </div>
      <div class="input-group">
        <label>Contraseña</label>
        <input type="password" name="login-pass" id="login-pass" placeholder="••••••••" required>
      </div>
        
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 14px;">
          <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; color: #666;">
              <input type="checkbox" style="width: auto;"> Recordar contraseña
          </label>
          <a href="#" id="forgot-pass-link" style="color: var(--teal); text-decoration: none; font-weight: 600;">¿Olvidaste tu contraseña?</a>
      </div>

      <button type="submit" class="login-btn">Iniciar sesión</button>
    </form>
    
    <p style="margin-top:20px; font-size:14px; text-align: center; color: #666;">
        ¿No tienes cuenta? <a href="signup.html" style="color:var(--teal); font-weight:bold; text-decoration: none;">Regístrate gratis</a>
    </p>
  </div>

  <div class="login-right">
    <!-- Usamos la imagen abstracta de tu referencia o la del login -->
    <img src="img/imagenlogin.png" alt="Bienvenido">
  </div>
</div>

</body>
</html>