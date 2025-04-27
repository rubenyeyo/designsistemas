<?php
// Configuración de correo
$smtp_host = 'smtp.designsistemas.com';
$smtp_usuario = 'contacto@designsistemas.com';
$smtp_contra = '-Soporte.5000';
$smtp_secure = 'tls'; // tls o ssl
$smtp_puerto = 587; // 587 para TLS, 465 para SSL

// Destinatario del formulario
$destino = 'contacto@designsistemas.com';
$asunto = 'Nuevo mensaje de contacto';

// reCAPTCHA
$recaptchaSecretKey = 'tu_clave_secreta_recaptcha';
$recaptchaSiteKey = '6Lex9yUrAAAAAA89qIA1cJzDSYHNNo8XmKzAUCp5';

// Configuración de tiempos de respuesta (en horas)
$tiemposRespuesta = array(
    'Baja' => 48,
    'Normal' => 24,
    'Alta' => 12
);
?>