<?php
/**
 * contact_process.php
 * Handles Contact Form AJAX submission with math CAPTCHA validation.
 * Returns JSON: { "status": "success"|"error", "message": "..." }
 *
 * Place both contact.html and this file in the same directory on your PHP server.
 * Update $to and $from_email below.
 */

header('Content-Type: application/json');

// ── Configuration ─────────────────────────────────────────────────────────────
$to           = 'contact@infynitewatchpro.in';    // <- your email
$from_name    = 'Contact Form';
$from_email   = 'noreply@infynitewatchpro.com';  // <- your domain
$subject_prefix = '[Contact Form] ';

// ── Helpers ───────────────────────────────────────────────────────────────────
function sanitize(string $v): string {
    return htmlspecialchars(strip_tags(trim($v)), ENT_QUOTES, 'UTF-8');
}
function jsonResponse(string $status, string $message): void {
    echo json_encode(['status' => $status, 'message' => $message]);
    exit;
}

// ── Only handle POST ──────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse('error', 'Invalid request method.');
}

// ── CAPTCHA validation ────────────────────────────────────────────────────────
$given    = isset($_POST['captcha_answer'])   ? (int)$_POST['captcha_answer']   : null;
$expected = isset($_POST['captcha_expected']) ? (int)$_POST['captcha_expected'] : null;

if ($given === null || $expected === null || $given !== $expected) {
    jsonResponse('error', 'CAPTCHA verification failed. Please try again.');
}

// ── Required fields ───────────────────────────────────────────────────────────
foreach (['first_name','last_name','email','subject','property','message'] as $f) {
    if (empty(trim($_POST[$f] ?? ''))) {
        jsonResponse('error', "Missing required field: {$f}.");
    }
}

// ── Sanitize ──────────────────────────────────────────────────────────────────
$first = sanitize($_POST['first_name']);
$last  = sanitize($_POST['last_name']);
$email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
$phone = sanitize($_POST['phone'] ?? '');
$subj  = sanitize($_POST['subject']);
$subj  = sanitize($_POST['property']);
$msg   = sanitize($_POST['message']);
$name  = "$first $last";

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse('error', 'Please provide a valid email address.');
}

foreach ([$first, $last, $email, $subj] as $v) {
    if (preg_match('/[\r\n]/', $v)) jsonResponse('error', 'Invalid input detected.');
}

// ── Build & send email ────────────────────────────────────────────────────────
$body = "New contact form submission\n\n"
      . "Name    : $name\n"
      . "Email   : $email\n"
      . "Phone   : $phone\n"
      . "Subject : $subj\n\n"
        "Property : $property\n\n"
      . "Message:\n$msg\n\n"
      . "IP: {$_SERVER['REMOTE_ADDR']} | Time: " . date('Y-m-d H:i:s');

$headers = "From: $from_name <$from_email>\r\n"
         . "Reply-To: $name <$email>\r\n"
         . "MIME-Version: 1.0\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n";

if (mail($to, $subject_prefix . $subj, $body, $headers)) {
    jsonResponse('success', "Thank you, $first! Your message has been sent. We'll be in touch soon.");
} else {
    error_log("[ContactForm] mail() failed for $email");
    jsonResponse('error', 'Sorry, there was a problem sending your message. Please try again later.');
}
