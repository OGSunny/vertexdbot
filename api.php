<?php
// api.php - Upload this to your website at unordinariness.xyz
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configuration
$API_KEY = 'UR_dc_rb_8k3m9p2x7q5w1z4n6v8b';
$COMMANDS_FILE = 'commands.json'; // File to store commands

// Authentication
function authenticate() {
    global $API_KEY;
    $headers = getallheaders();
    $auth = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if ($auth !== "Bearer $API_KEY") {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

// Load commands from file
function loadCommands() {
    global $COMMANDS_FILE;
    if (file_exists($COMMANDS_FILE)) {
        $content = file_get_contents($COMMANDS_FILE);
        return json_decode($content, true) ?: [];
    }
    return [];
}

// Save commands to file
function saveCommands($commands) {
    global $COMMANDS_FILE;
    file_put_contents($COMMANDS_FILE, json_encode($commands));
}

// Clean old commands (older than 5 minutes)
function cleanOldCommands($commands) {
    $fiveMinutesAgo = time() - (5 * 60);
    return array_filter($commands, function($cmd) use ($fiveMinutesAgo) {
        return $cmd['timestamp'] > $fiveMinutesAgo;
    });
}

// Get request path
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

// Remove the script name from path
$script_name = basename($_SERVER['SCRIPT_NAME'], '.php');
if (in_array($script_name, $path_parts)) {
    $key = array_search($script_name, $path_parts);
    array_splice($path_parts, 0, $key + 1);
}

$endpoint = implode('/', $path_parts);

// Route requests
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if ($endpoint === '' || $endpoint === 'status') {
            // Health check
            echo json_encode([
                'status' => 'Discord-Roblox Bridge API is running!',
                'website' => 'unordinariness.xyz',
                'version' => '1.0'
            ]);
        } elseif ($endpoint === 'get') {
            // Get pending commands for Roblox
            authenticate();
            
            $commands = loadCommands();
            $commands = cleanOldCommands($commands);
            
            // Get unprocessed commands
            $unprocessed = array_filter($commands, function($cmd) {
                return !isset($cmd['processed']) || !$cmd['processed'];
            });
            
            // Mark as processed
            foreach ($commands as &$cmd) {
                if (!isset($cmd['processed']) || !$cmd['processed']) {
                    $cmd['processed'] = true;
                }
            }
            
            saveCommands($commands);
            
            echo json_encode([
                'commands' => array_values($unprocessed),
                'count' => count($unprocessed)
            ]);
            
        } elseif ($endpoint === 'stats') {
            // Get API stats
            authenticate();
            
            $commands = loadCommands();
            $pending = array_filter($commands, function($cmd) {
                return !isset($cmd['processed']) || !$cmd['processed'];
            });
            
            echo json_encode([
                'pendingCommands' => count($pending),
                'totalCommands' => count($commands),
                'serverTime' => date('Y-m-d H:i:s'),
                'api' => 'unordinariness.xyz Discord-Roblox Bridge'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
        }
        break;
        
    case 'POST':
        authenticate();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if ($endpoint === '' || $endpoint === 'command') {
            // Receive command from Discord
            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON']);
                break;
            }
            
            $commands = loadCommands();
            $commands = cleanOldCommands($commands);
            
            // Generate unique ID
            $commandId = time() . '_' . rand(1000, 9999);
            
            $command = [
                'id' => $commandId,
                'command' => $input['command'],
                'executor' => $input['executor'] ?? 'Unknown',
                'timestamp' => time(),
                'processed' => false
            ];
            
            // Add command-specific data
            if (isset($input['target'])) $command['target'] = $input['target'];
            if (isset($input['location'])) $command['location'] = $input['location'];
            if (isset($input['amount'])) $command['amount'] = $input['amount'];
            if (isset($input['message'])) $command['message'] = $input['message'];
            
            $commands[] = $command;
            saveCommands($commands);
            
            echo json_encode([
                'success' => true,
                'message' => 'Command queued successfully',
                'commandId' => $commandId
            ]);
            
        } elseif ($endpoint === 'confirm') {
            // Receive confirmation from Roblox
            if (!$input || !isset($input['commandId'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing commandId']);
                break;
            }
            
            $commands = loadCommands();
            
            // Remove confirmed command
            $commands = array_filter($commands, function($cmd) use ($input) {
                return $cmd['id'] !== $input['commandId'];
            });
            
            saveCommands($commands);
            
            echo json_encode([
                'success' => true,
                'message' => 'Confirmation received'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
