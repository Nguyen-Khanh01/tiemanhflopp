
<?php
// oauth_get_token.php
// Run this once in a browser to generate token.json after creating credentials.json.
// After visiting this script it will redirect you to Google's OAuth consent screen and then save token.json.
//
// Requirements: composer require google/apiclient
require_once __DIR__ . '/vendor/autoload.php';

session_start();

$credentialsPath = __DIR__ . '/credentials.json';
$tokenPath = __DIR__ . '/token.json';

if(!file_exists($credentialsPath)){
    echo 'Missing credentials.json - download from Google Cloud Console and place here.';
    exit;
}

$client = new Google_Client();
$client->setAuthConfig($credentialsPath);
$client->setRedirectUri((isset($_SERVER['HTTPS'])? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/oauth_get_token.php');
$client->setAccessType('offline');
$client->setScopes([Google_Service_Gmail::GMAIL_SEND]);

if(!isset($_GET['code'])){
    $authUrl = $client->createAuthUrl();
    header('Location: ' . filter_var($authUrl, FILTER_SANITIZE_URL));
    exit;
} else {
    $code = $_GET['code'];
    $accessToken = $client->fetchAccessTokenWithAuthCode($code);
    if(array_key_exists('error', $accessToken)){
        echo 'Error retrieving access token: ' . htmlspecialchars($accessToken['error']);
        exit;
    }
    file_put_contents($tokenPath, json_encode($accessToken));
    echo 'Token saved to token.json. You can now remove this script for security.';
}
?>
