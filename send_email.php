
<?php
// send_email.php
// PHP endpoint that accepts POST requests from contact form and sends email via Gmail API.
// IMPORTANT: You must set up Google API credentials and get a token.json as described in README.md.
// This script uses Google API PHP Client (google/apiclient). Install via composer:
//   composer require google/apiclient:^2.0
//
// Expected files in project root:
// - credentials.json  (OAuth2 client credentials from Google Cloud Console)
// - token.json        (stored access + refresh token)
// - vendor/           (composer autoload)
//
// The script will create a raw RFC822 message and send via Gmail API.
// For production, add additional validation and rate limiting.

require_once __DIR__ . '/vendor/autoload.php';

header('Content-Type: application/json; charset=utf-8');

// Basic validation
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$message = trim($_POST['message'] ?? '');

if(!$name || !$email || !$message){
    echo json_encode(['success'=>false,'message'=>'Vui lòng điền tên, email và nội dung.']);
    exit;
}

// Load credentials and token
$credentialsPath = __DIR__ . '/credentials.json';
$tokenPath = __DIR__ . '/token.json';
if(!file_exists($credentialsPath) || !file_exists($tokenPath)){
    echo json_encode(['success'=>false,'message'=>'Server chưa cấu hình credentials/token. Xem README để thiết lập.']);
    exit;
}

$client = new Google_Client();
$client->setApplicationName('FLOP Studio Contact');
$client->setScopes(Google_Service_Gmail::GMAIL_SEND);
$client->setAuthConfig($credentialsPath);
$client->setAccessType('offline');

// Load token
$token = json_decode(file_get_contents($tokenPath), true);
$client->setAccessToken($token);

// Refresh if expired
if ($client->isAccessTokenExpired()) {
    if ($client->getRefreshToken()) {
        $client->fetchAccessTokenWithRefreshToken($client->getRefreshToken());
        file_put_contents($tokenPath, json_encode($client->getAccessToken()));
    } else {
        echo json_encode(['success'=>false,'message'=>'Token hết hạn và không có refresh token.']);
        exit;
    }
}

$service = new Google_Service_Gmail($client);

// Build message
$to = 'flopstudio@gmail.com'; // change to your destination address
$subject = 'Liên hệ từ website: ' . $name;
$bodyText = "Tên: $name\nEmail: $email\nSĐT: $phone\n\nNội dung:\n$message";

$rawMessageString = "From: $name <$email>\r\n";
$rawMessageString .= "To: $to\r\n";
$rawMessageString .= "Subject: =?UTF-8?B?".base64_encode($subject)."?=\r\n";
$rawMessageString .= "MIME-Version: 1.0\r\n";
$rawMessageString .= "Content-Type: text/plain; charset=utf-8\r\n\r\n";
$rawMessageString .= $bodyText;

$raw = base64_encode($rawMessageString);
$raw = str_replace(array('+','/','='), array('-','_',''), $raw);

$msg = new Google_Service_Gmail_Message();
$msg->setRaw($raw);

try{
    $sent = $service->users_messages->send('me', $msg);
    echo json_encode(['success'=>true,'id'=>$sent->getId()]);
} catch(Exception $e){
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
?>
