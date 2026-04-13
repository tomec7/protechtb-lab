<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = [
  'https://protechtb.sk',
  'https://www.protechtb.sk',
  'https://tomec7.github.io',
];
if ($origin && in_array($origin, $allowed, true)) {
  header('Access-Control-Allow-Origin: ' . $origin);
  header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS, GET');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  echo json_encode(['ok' => true, 'service' => 'protechtb-contact-endpoint']);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
  exit;
}

$honeypot = trim((string)($_POST['website'] ?? ''));
if ($honeypot !== '') {
  echo json_encode(['ok' => true]);
  exit;
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rlFile = sys_get_temp_dir() . '/protechtb_contact_rl_' . preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $ip);
$now = time();
if (is_file($rlFile)) {
  $last = (int)@file_get_contents($rlFile);
  if ($last > 0 && ($now - $last) < 15) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'error' => 'rate_limited']);
    exit;
  }
}
@file_put_contents($rlFile, (string)$now, LOCK_EX);

$name = trim((string)($_POST['name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$topic = trim((string)($_POST['topic'] ?? 'general'));
$message = trim((string)($_POST['message'] ?? ''));

if ($name === '' || $email === '' || $message === '') {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'missing_fields']);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'invalid_email']);
  exit;
}

$topicMap = [
  'general' => 'Všeobecný dopyt',
  'pc-build' => 'PC Build & Performance',
  'home-assistant' => 'Home Assistant & Smart Home',
  'nas-backup' => 'NAS & Backup',
  'it-care' => 'IT Care',
  'multi-hub' => 'Multi-Hub Integrácie',
];
$topicLabel = $topicMap[$topic] ?? $topic;

$to = 'protechtbsupport@gmail.com';
$subject = 'Nový dopyt z ProTechTB webu — ' . $topicLabel;
$cleanName = str_replace(["", "
"], ' ', $name);
$cleanEmail = str_replace(["", "
"], '', $email);

$body = "Meno: {$cleanName}
"
      . "Email: {$cleanEmail}
"
      . "Téma: {$topicLabel} ({$topic})
"
      . "IP: {$ip}
"
      . "Origin: {$origin}
"
      . "
Správa:
{$message}
";

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: ProTechTB Web <noreply@protechtb.sk>';
$headers[] = 'Reply-To: ' . $cleanEmail;
$headers[] = 'X-Mailer: PHP/' . phpversion();

$ok = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("
", $headers));
if (!$ok) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'mail_failed']);
  exit;
}

echo json_encode(['ok' => true]);
