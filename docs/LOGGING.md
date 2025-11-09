# Logging Implementation

## Overview
Professional logging has been implemented using **Winston** - a popular and flexible logging library for Node.js.

## Features

### Log Levels
The logger supports multiple levels (in order of priority):
1. **error** (0) - Error messages and exceptions
2. **warn** (1) - Warning messages
3. **info** (2) - General information
4. **http** (3) - HTTP request/response logs
5. **debug** (4) - Detailed debugging information

### Environment-Based Logging
- **Development:** Shows all logs (debug level and above)
- **Production:** Shows only warnings and errors

### Output Destinations
Logs are written to multiple locations:
1. **Console** - Colored output with timestamps
2. **logs/error.log** - Only error-level messages
3. **logs/combined.log** - All log messages

### Log Format
```
YYYY-MM-DD HH:mm:ss:ms LEVEL: message
```

Example:
```
2025-11-09 23:37:11:3711 info: Server started on port 3000
2025-11-09 23:37:26:3726 debug: Loading recipes list page
2025-11-09 23:37:29:3729 info: Recipe detail loaded successfully
```

## Usage Examples

### In Route Handlers
```javascript
const logger = require('../utils/logger');

// Debug - Detailed information
logger.debug('Loading recipe detail', { recipeName: req.params.name });

// Info - General information
logger.info('Recipe loaded successfully', {
  recipeName: req.params.name,
  ingredientsCount: ingredients.length
});

// Warn - Warning about potential issues
logger.warn('Recipe not found', { recipeName: req.params.name });

// Error - Error occurred
logger.error('Database error', {
  error: err.message,
  recipeName: req.params.name
});

// HTTP - HTTP request logging
logger.http('API: Get recipe by name', { recipeName: req.params.name });
```

### Structured Logging
All logs support structured data (key-value pairs):
```javascript
logger.info('User action', {
  action: 'view_recipe',
  recipeName: 'Waffles',
  userId: 123,
  timestamp: new Date()
});
```

## File Structure

```
server/
├── utils/
│   └── logger.js          # Logger configuration
├── logs/                  # Log files (gitignored)
│   ├── error.log         # Error logs only
│   └── combined.log      # All logs
└── ...
```

## Current Logging Coverage

### Application Startup
- ✅ Server start with port and environment info
- ✅ Database connection info
- ✅ Graceful shutdown messages

### Route Handlers
- ✅ Home page loading and success
- ✅ Recipes list loading and success
- ✅ Recipe detail loading and success
- ✅ Recipe not found warnings
- ✅ Database errors

### API Endpoints
- ✅ API request logging (HTTP level)
- ✅ API success responses
- ✅ API errors and not found

### Error Handler
- ✅ Centralized error logging with context
- ✅ Stack traces in development only
- ✅ HTTP status codes

## Configuration

### Change Log Level
Edit `server/utils/logger.js`:
```javascript
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn'; // Change 'warn' to 'info' for production
};
```

### Disable File Logging
Comment out file transports in `server/utils/logger.js`:
```javascript
const transports = [
  new winston.transports.Console(),
  // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  // new winston.transports.File({ filename: 'logs/combined.log' }),
];
```

### Custom Log Format
Modify the format in `server/utils/logger.js`:
```javascript
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json(), // Use JSON format instead
);
```

## Benefits

### For Development
- **Colored logs** - Easy to spot errors (red) vs info (green)
- **Debug level** - See everything that's happening
- **Structured data** - Easily see context for each log

### For Production
- **Log files** - Permanent record of errors
- **Filtered logs** - Only see important messages (warn/error)
- **No stack traces** - Security - don't leak implementation details
- **Searchable** - Find issues by recipe name, error type, etc.

### For Debugging
- **Timestamps** - Know exactly when something happened
- **Context** - See what data was involved
- **Correlation** - Track a request through multiple functions

## Best Practices

### DO ✅
```javascript
// Log with context
logger.error('Database error', {
  query: 'SELECT * FROM recipes',
  error: err.message,
  timestamp: new Date()
});

// Use appropriate levels
logger.debug('Function entered'); // Development only
logger.info('Action completed');   // Important events
logger.warn('Unusual but handled'); // Potential issues
logger.error('Something failed');   // Actual errors
```

### DON'T ❌
```javascript
// Don't log sensitive data
logger.info('User login', { password: '...' }); // ❌

// Don't use console.log
console.log('User logged in'); // ❌ Use logger.info()

// Don't log massive objects
logger.debug('Full response', { data: hugeObject }); // ❌
```

## Monitoring in Production

### View Logs
```bash
# Last 100 lines
tail -n 100 logs/combined.log

# Follow logs in real-time
tail -f logs/combined.log

# Search for errors
grep "error" logs/combined.log

# View recent errors only
tail -n 100 logs/error.log
```

### Log Rotation (Recommended)
In production, use `winston-daily-rotate-file` to prevent log files from growing too large:
```bash
npm install winston-daily-rotate-file
```

Then configure in `logger.js`:
```javascript
const DailyRotateFile = require('winston-daily-rotate-file');

new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d'
});
```

## Next Steps

### Optional Enhancements
1. **Add request ID** - Track a request across multiple logs
2. **Add user context** - Log which user performed an action
3. **External logging service** - Send logs to Datadog, Loggly, etc.
4. **Performance metrics** - Log response times
5. **Request logging middleware** - Log all HTTP requests automatically

## Troubleshooting

### Logs not appearing?
1. Check `NODE_ENV` environment variable
2. Check if `logs/` directory exists and is writable
3. Look at console output for winston errors

### Too many logs?
1. Change log level to `info` or `warn` in production
2. Remove `debug` logs from code
3. Use log filtering in your viewing tool

### Can't find a log file?
1. Logs are created on first write
2. Check Docker volume mounts if using containers
3. Verify `logs/` directory is not gitignored (it should be!)

## Migration Notes

### What Changed
- ✅ Replaced all `console.log()` with `logger.info()`
- ✅ Replaced all `console.error()` with `logger.error()`
- ✅ Added structured logging with context
- ✅ Added log levels (debug, info, warn, error, http)
- ✅ Added timestamps to all logs
- ✅ Added file-based logging

### Backward Compatibility
- All existing functionality works the same
- Old `console.log` statements were replaced, not removed
- No breaking changes to the API or routes
