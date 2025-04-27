<?php
// --- CONFIGURACIONES --- //

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'config/config.php';

// --- FUNCIONES AUXILIARES --- //

function limpiar($cadena) {
    return htmlspecialchars(strip_tags(trim($cadena)));
}

// --- LOGS DE CONTACTO --- //

function guardarLog($datos) {
    $fecha = date("Y-m-d H:i:s");
    $ip = $_SERVER['REMOTE_ADDR'];
    $registro = "[{$fecha}] IP: {$ip} | Nombre: {$datos['nombre']} | Email: {$datos['email']} | Teléfono: {$datos['telefono']} | Servicio: {$datos['servicio']} | Prioridad: {$datos['prioridad']} | Mensaje: {$datos['mensaje']}\n";
    
    // Asegurarse de que exista la carpeta logs
    if (!file_exists('logs')) {
        mkdir('logs', 0755, true);
    }
    
    file_put_contents("logs/contactos_" . date("Y-m") . ".log", $registro, FILE_APPEND);
}

// --- VALIDACIÓN DE CAMPOS --- //

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Inicializa el array de errores
    $errores = [];
    
    // Validación básica de campos
    $nombre = isset($_POST['nombre']) ? limpiar($_POST['nombre']) : '';
    $email = isset($_POST['email']) ? limpiar($_POST['email']) : '';
    $telefono = isset($_POST['telefono']) ? limpiar($_POST['telefono']) : '';
    $empresa = isset($_POST['empresa']) ? limpiar($_POST['empresa']) : '';
    $servicio = isset($_POST['servicio']) ? limpiar($_POST['servicio']) : '';
    $prioridad = isset($_POST['prioridad']) ? limpiar($_POST['prioridad']) : '';
    $mensaje = isset($_POST['mensaje']) ? limpiar($_POST['mensaje']) : '';
    
    // Validar campos obligatorios
    if (empty($nombre)) {
        $errores[] = "El nombre es obligatorio.";
    }
    
    if (empty($email)) {
        $errores[] = "El correo electrónico es obligatorio.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errores[] = "El formato del correo electrónico es inválido.";
    }
    
    if (empty($servicio)) {
        $errores[] = "Debe seleccionar un servicio.";
    }
    
    if (empty($mensaje)) {
        $errores[] = "El mensaje es obligatorio.";
    }
    
    // Validar longitud del mensaje
    if (strlen($mensaje) < 10) {
        $errores[] = "El mensaje debe tener al menos 10 caracteres.";
    }
    
    // --- VALIDACIÓN reCAPTCHA --- //
    
    if (isset($_POST['g-recaptcha-response'])) {
        $recaptcha_response = $_POST['g-recaptcha-response'];
        $respuesta = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=" . $recaptchaSecretKey . "&response=" . $recaptcha_response);
        $respuesta = json_decode($respuesta);
        
        if ($respuesta->success != true) {
            $errores[] = "La verificación reCAPTCHA ha fallado. Intenta de nuevo.";
        }
    } else {
        $errores[] = "Por favor, verifica que no eres un robot.";
    }
    
    // Si hay errores, devolver JSON con errores
    if (!empty($errores)) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'errores' => $errores]);
        exit;
    }
    
    // --- CREAR MENSAJE CON PHPMailer --- //
    
    $mail = new PHPMailer(true);
    
    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = $smtp_host;
        $mail->SMTPAuth   = true;
        $mail->Username   = $smtp_usuario;
        $mail->Password   = $smtp_contra;
        $mail->SMTPSecure = $smtp_secure;
        $mail->Port       = $smtp_puerto;
        $mail->CharSet    = 'UTF-8';
        
        // Recipients
        $mail->setFrom($smtp_usuario, 'Formulario Web - Design Sistemas');
        $mail->addAddress($destino);
        $mail->addReplyTo($email, $nombre);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = $asunto . ' - ' . $servicio; // Añadir el servicio al asunto
        
        // Crear cuerpo del mensaje HTML más elaborado y seguro
        $mail->Body = "<!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Mensaje de Contacto</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                .header { background-color: #3498db; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { background-color: #f5f5f5; padding: 15px; font-size: 12px; color: #777; text-align: center; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #3498db; }
                .mensaje { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0; }
                .prioridad { display: inline-block; padding: 5px 10px; border-radius: 3px; font-size: 12px; }
                .prioridad-alta { background-color: #e74c3c; color: white; }
                .prioridad-normal { background-color: #f39c12; color: white; }
                .prioridad-baja { background-color: #2ecc71; color: white; }
            </style>
        </head>
        <body>
            <div class='header'>
                <h1>Nuevo Mensaje de Contacto</h1>
                <p>Recibido el " . date('d/m/Y H:i') . "</p>
            </div>
            <div class='content'>
                <div class='field'>
                    <span class='label'>Nombre:</span> $nombre
                </div>
                <div class='field'>
                    <span class='label'>Email:</span> <a href='mailto:$email'>$email</a>
                </div>";
                
        if (!empty($telefono)) {
            $mail->Body .= "<div class='field'>
                    <span class='label'>Teléfono:</span> $telefono
                </div>";
        }
        
        if (!empty($empresa)) {
            $mail->Body .= "<div class='field'>
                    <span class='label'>Empresa:</span> $empresa
                </div>";
        }
        
        $mail->Body .= "<div class='field'>
                    <span class='label'>Servicio:</span> $servicio
                </div>
                <div class='field'>
                    <span class='label'>Prioridad:</span> 
                    <span class='prioridad prioridad-" . strtolower($prioridad) . "'>$prioridad</span>
                </div>
                <div class='field'>
                    <span class='label'>Mensaje:</span>
                    <div class='mensaje'>" . nl2br($mensaje) . "</div>
                </div>
            </div>
            <div class='footer'>
                <p>Este mensaje fue enviado desde el formulario de contacto de Design Sistemas.</p>
                <p>IP del remitente: " . $_SERVER['REMOTE_ADDR'] . "</p>
            </div>
        </body>
        </html>";
        
        // Versión en texto plano como alternativa
        $mail->AltBody = "Nuevo mensaje de contacto\n\n" .
                         "Nombre: $nombre\n" .
                         "Email: $email\n" .
                         "Teléfono: $telefono\n" .
                         "Empresa: $empresa\n" .
                         "Servicio: $servicio\n" .
                         "Prioridad: $prioridad\n\n" .
                         "Mensaje:\n$mensaje\n\n" .
                         "Enviado desde el formulario de contacto de Design Sistemas.";
        
        // Guardar en el log antes de enviar
        guardarLog([
            'nombre' => $nombre,
            'email' => $email,
            'telefono' => $telefono,
            'empresa' => $empresa,
            'servicio' => $servicio,
            'prioridad' => $prioridad,
            'mensaje' => $mensaje
        ]);
        
        // Enviar
        $mail->send();
        
        // Envío de confirmación al cliente
        $mailCliente = new PHPMailer(true);
        $mailCliente->isSMTP();
        $mailCliente->Host       = $smtp_host;
        $mailCliente->SMTPAuth   = true;
        $mailCliente->Username   = $smtp_usuario;
        $mailCliente->Password   = $smtp_contra;
        $mailCliente->SMTPSecure = $smtp_secure;
        $mailCliente->Port       = $smtp_puerto;
        $mailCliente->CharSet    = 'UTF-8';
        
        $mailCliente->setFrom($smtp_usuario, 'Design Sistemas');
        $mailCliente->addAddress($email, $nombre);
        
        $mailCliente->isHTML(true);
        $mailCliente->Subject = 'Hemos recibido tu mensaje - Design Sistemas';
        
        $mailCliente->Body = "<!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Confirmación de recepción</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                .header { background-color: #3498db; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { background-color: #f5f5f5; padding: 15px; font-size: 12px; color: #777; text-align: center; }
                .button { display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class='header'>
                <h1>¡Gracias por contactarnos!</h1>
            </div>
            <div class='content'>
                <p>Hola <strong>$nombre</strong>,</p>
                <p>Hemos recibido tu mensaje y queremos agradecerte por contactarnos. Un miembro de nuestro equipo revisará tu solicitud y se pondrá en contacto contigo a la brevedad posible.</p>
                <p>Estos son los detalles que nos has proporcionado:</p>
                <ul>
                    <li><strong>Servicio:</strong> $servicio</li>
                    <li><strong>Prioridad:</strong> $prioridad</li>
                </ul>
                <p>Si necesitas comunicarte con nosotros de inmediato, puedes llamarnos al siguiente número:</p>
                <p style='text-align:center; font-size:18px;'><strong>+52 720 421 9912</strong></p>
                <p style='text-align:center;'>
                    <a href='https://www.designsistemas.com' class='button'>Visitar nuestro sitio web</a>
                </p>
            </div>
            <div class='footer'>
                <p>&copy; " . date('Y') . " Design Sistemas. Todos los derechos reservados.</p>
                <p>
                    <a href='https://www.facebook.com/designsistemas'>Facebook</a> |
                    <a href='https://www.instagram.com/designsistemas'>Instagram</a> |
                    <a href='https://www.linkedin.com/company/designsistemas'>LinkedIn</a>
                </p>
            </div>
        </body>
        </html>";
        
        $mailCliente->AltBody = "¡Gracias por contactarnos!\n\n" .
                               "Hola $nombre,\n\n" .
                               "Hemos recibido tu mensaje y queremos agradecerte por contactarnos. Un miembro de nuestro equipo revisará tu solicitud y se pondrá en contacto contigo a la brevedad posible.\n\n" .
                               "Estos son los detalles que nos has proporcionado:\n" .
                               "- Servicio: $servicio\n" .
                               "- Prioridad: $prioridad\n\n" .
                               "Si necesitas comunicarte con nosotros de inmediato, puedes llamarnos al +52 720 421 9912\n\n" .
                               "Atentamente,\n" .
                               "Equipo de Design Sistemas\n" .
                               "www.designsistemas.com";
        
        // Enviar el correo de confirmación al cliente
        $mailCliente->send();
        
        // Responder con éxito en formato JSON
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'mensaje' => 'Gracias, hemos recibido tu mensaje. Nos pondremos en contacto pronto.']);
        
    } catch (Exception $e) {
        // Loguear el error
        error_log("Error al enviar email: " . $mail->ErrorInfo . " - Fecha: " . date("Y-m-d H:i:s"));
        
        // Responder con error en formato JSON
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'errores' => ['Hubo un problema al enviar tu mensaje. Por favor, intenta de nuevo o contáctanos directamente por teléfono.']]);
    }
    
} else {
    // Acceso directo al script
    header('HTTP/1.1 403 Forbidden');
    echo "Acceso no permitido.";
}
?>