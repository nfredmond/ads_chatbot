module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
async function createClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://pfatayebacwjehlfxipx.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmYXRheWViYWN3amVobGZ4aXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjMyOTMsImV4cCI6MjA3NjczOTI5M30.Q-MfA4eqteLtKAqEtZadEBNw3ak8OESTDFnBv0RXwzI"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // The `setAll` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
                }
            }
        }
    });
}
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/string_decoder [external] (string_decoder, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[project]/lib/logging/logger.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Winston Structured Logging Configuration
 * Provides comprehensive logging for all API operations
 */ __turbopack_context__.s([
    "PlatformAPIError",
    ()=>PlatformAPIError,
    "default",
    ()=>__TURBOPACK__default__export__,
    "logAPISuccess",
    ()=>logAPISuccess,
    "logCacheOperation",
    ()=>logCacheOperation,
    "logOAuthEvent",
    ()=>logOAuthEvent,
    "logRateLimit",
    ()=>logRateLimit,
    "logSyncOperation",
    ()=>logSyncOperation,
    "logTokenRefresh",
    ()=>logTokenRefresh
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$winston$2f$lib$2f$winston$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/winston/lib/winston.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};
// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white'
};
// Tell winston about our colors
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$winston$2f$lib$2f$winston$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].addColors(colors);
// Define log format
const format = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$winston$2f$lib$2f$winston$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].format.combine(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$winston$2f$lib$2f$winston$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss:ms'
}), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$winston$2f$lib$2f$winston$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].format.colorize({
    all: true
}), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$winston$2f$lib$2f$winston$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].format.printf((info)=>`${info.timestamp} ${info.level}: ${info.message}`));
// Define log format for files (JSON)
const fileFormat = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$winston$2f$lib$2f$winston$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].format.combine(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$winston$2f$lib$2f$winston$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss:ms'
}), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$winston$2f$lib$2f$winston$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].format.json());
// Define which transports the logger must use
const transports = [
    // Console transport
    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$winston$2f$lib$2f$winston$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].transports.Console({
        format: format
    }),
    // Error log file
    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$winston$2f$lib$2f$winston$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].transports.File({
        filename: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
        format: fileFormat
    }),
    // Combined log file
    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$winston$2f$lib$2f$winston$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].transports.File({
        filename: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'logs', 'combined.log'),
        format: fileFormat
    }),
    // API-specific log file
    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$winston$2f$lib$2f$winston$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].transports.File({
        filename: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'logs', 'api.log'),
        level: 'http',
        format: fileFormat
    })
];
// Create the logger
const logger = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$winston$2f$lib$2f$winston$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createLogger({
    level: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 'debug',
    levels,
    transports
});
class PlatformAPIError extends Error {
    platform;
    operation;
    originalError;
    timestamp;
    statusCode;
    errorCode;
    constructor(platform, operation, originalError, statusCode, errorCode){
        super(`${platform} API error during ${operation}`);
        this.platform = platform;
        this.operation = operation;
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.name = 'PlatformAPIError';
        // Log the error
        logger.error('Platform API Error', {
            platform,
            operation,
            error: originalError.message || originalError,
            stack: originalError.stack,
            statusCode,
            errorCode,
            timestamp: this.timestamp
        });
    }
}
function logAPISuccess(platform, operation, details) {
    logger.http('API Success', {
        platform,
        operation,
        timestamp: new Date().toISOString(),
        ...details
    });
}
function logOAuthEvent(platform, event, userId, error) {
    const level = event === 'failure' ? 'error' : 'info';
    logger.log(level, 'OAuth Event', {
        platform,
        event,
        userId,
        error: error?.message,
        timestamp: new Date().toISOString()
    });
}
function logSyncOperation(platform, status, details) {
    const level = status === 'failed' ? 'error' : 'info';
    logger.log(level, 'Data Sync', {
        platform,
        status,
        timestamp: new Date().toISOString(),
        ...details
    });
}
function logTokenRefresh(platform, success, userId, error) {
    const level = success ? 'info' : 'error';
    logger.log(level, 'Token Refresh', {
        platform,
        success,
        userId,
        error: error?.message,
        timestamp: new Date().toISOString()
    });
}
function logRateLimit(platform, rateLimitInfo) {
    logger.warn('Rate Limit Warning', {
        platform,
        ...rateLimitInfo,
        timestamp: new Date().toISOString()
    });
}
function logCacheOperation(operation, key, details) {
    logger.debug('Cache Operation', {
        operation,
        key,
        timestamp: new Date().toISOString(),
        ...details
    });
}
const __TURBOPACK__default__export__ = logger;
}),
"[project]/lib/security/encryption.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Token Encryption Utilities
 * Uses AES-256-GCM for secure token storage
 */ __turbopack_context__.s([
    "decryptFields",
    ()=>decryptFields,
    "decryptToken",
    ()=>decryptToken,
    "encryptFields",
    ()=>encryptFields,
    "encryptToken",
    ()=>encryptToken,
    "generateEncryptionKey",
    ()=>generateEncryptionKey,
    "testEncryption",
    ()=>testEncryption
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
/**
 * Get encryption key from environment variable
 * In production, this should be stored in a secure key management service
 */ function getEncryptionKey() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is not set. ' + 'Generate one using: openssl rand -hex 32');
    }
    // Ensure key is 32 bytes (64 hex characters)
    if (key.length !== 64) {
        throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
    }
    return Buffer.from(key, 'hex');
}
function encryptToken(plaintext) {
    try {
        const key = getEncryptionKey();
        const iv = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(IV_LENGTH);
        const cipher = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        return {
            encrypted: encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    } catch (error) {
        throw new Error(`Token encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
function decryptToken(encryptedData) {
    try {
        const key = getEncryptionKey();
        const decipher = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createDecipheriv(ALGORITHM, key, Buffer.from(encryptedData.iv, 'hex'));
        decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        throw new Error(`Token decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
function generateEncryptionKey() {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString('hex');
}
function encryptFields(data, fieldsToEncrypt) {
    const encrypted = {
        ...data
    };
    for (const field of fieldsToEncrypt){
        const fieldStr = String(field);
        const value = data[field];
        if (value && typeof value === 'string') {
            const encryptedData = encryptToken(value);
            encrypted[`${fieldStr}_encrypted`] = encryptedData.encrypted;
            encrypted[`${fieldStr}_iv`] = encryptedData.iv;
            encrypted[`${fieldStr}_auth_tag`] = encryptedData.authTag;
            delete encrypted[fieldStr];
        }
    }
    return encrypted;
}
function decryptFields(data, fieldsToDecrypt) {
    const decrypted = {
        ...data
    };
    for (const field of fieldsToDecrypt){
        const encryptedField = `${field}_encrypted`;
        const ivField = `${field}_iv`;
        const authTagField = `${field}_auth_tag`;
        if (data[encryptedField] && data[ivField] && data[authTagField]) {
            try {
                const encryptedData = {
                    encrypted: data[encryptedField],
                    iv: data[ivField],
                    authTag: data[authTagField]
                };
                decrypted[field] = decryptToken(encryptedData);
                delete decrypted[encryptedField];
                delete decrypted[ivField];
                delete decrypted[authTagField];
            } catch (error) {
                console.error(`Failed to decrypt field ${field}:`, error);
            // Keep encrypted fields if decryption fails
            }
        }
    }
    return decrypted;
}
function testEncryption() {
    try {
        const testData = 'test-token-12345';
        const encrypted = encryptToken(testData);
        const decrypted = decryptToken(encrypted);
        return decrypted === testData;
    } catch (error) {
        console.error('Encryption test failed:', error);
        return false;
    }
}
}),
"[project]/lib/supabase/service-role.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createServiceRoleClient",
    ()=>createServiceRoleClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
function createServiceRoleClient() {
    const supabaseUrl = ("TURBOPACK compile-time value", "https://pfatayebacwjehlfxipx.supabase.co");
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (!supabaseServiceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set. ' + 'Please add it to your .env.local file.');
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            persistSession: false
        }
    });
}
}),
"[project]/lib/security/ad-account-tokens.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildEncryptedTokenUpdate",
    ()=>buildEncryptedTokenUpdate,
    "decryptAccountTokens",
    ()=>decryptAccountTokens,
    "migratePlaintextTokens",
    ()=>migratePlaintextTokens
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logging$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/logging/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/security/encryption.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$service$2d$role$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/service-role.ts [app-route] (ecmascript)");
;
;
;
function buildEncryptedFields(token) {
    if (!token) {
        return null;
    }
    const encrypted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encryptToken"])(token);
    return {
        encrypted: encrypted.encrypted,
        iv: encrypted.iv,
        authTag: encrypted.authTag
    };
}
function buildEncryptedTokenUpdate(tokens) {
    const update = {};
    const access = buildEncryptedFields(tokens.accessToken);
    if (access) {
        update.access_token_encrypted = access.encrypted;
        update.access_token_iv = access.iv;
        update.access_token_auth_tag = access.authTag;
        update.access_token = null;
    }
    const refresh = buildEncryptedFields(tokens.refreshToken);
    if (refresh) {
        update.refresh_token_encrypted = refresh.encrypted;
        update.refresh_token_iv = refresh.iv;
        update.refresh_token_auth_tag = refresh.authTag;
        update.refresh_token = null;
    }
    return update;
}
function decryptAccountTokens(account) {
    let accessToken = null;
    let refreshToken = null;
    if (account?.access_token_encrypted && account?.access_token_iv && account?.access_token_auth_tag) {
        try {
            accessToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decryptToken"])({
                encrypted: account.access_token_encrypted,
                iv: account.access_token_iv,
                authTag: account.access_token_auth_tag
            });
        } catch (error) {
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logging$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].error('Failed to decrypt access token', {
                accountId: account?.id,
                platform: account?.platform,
                error
            });
        }
    } else if (account?.access_token) {
        accessToken = account.access_token;
    }
    if (account?.refresh_token_encrypted && account?.refresh_token_iv && account?.refresh_token_auth_tag) {
        try {
            refreshToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decryptToken"])({
                encrypted: account.refresh_token_encrypted,
                iv: account.refresh_token_iv,
                authTag: account.refresh_token_auth_tag
            });
        } catch (error) {
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logging$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].error('Failed to decrypt refresh token', {
                accountId: account?.id,
                platform: account?.platform,
                error
            });
        }
    } else if (account?.refresh_token) {
        refreshToken = account.refresh_token;
    }
    return {
        accessToken,
        refreshToken
    };
}
async function migratePlaintextTokens() {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$service$2d$role$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServiceRoleClient"])();
        const { data: accounts, error } = await supabase.from('ad_accounts').select('id, platform, access_token, refresh_token, access_token_encrypted, refresh_token_encrypted').or('access_token.not.is.null,refresh_token.not.is.null');
        if (error) {
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logging$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].error('Failed to query ad accounts for token migration', {
                error
            });
            return;
        }
        if (!accounts || accounts.length === 0) {
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logging$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].info('No plaintext tokens found to migrate');
            return;
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logging$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].info('Migrating plaintext ad account tokens', {
            accounts: accounts.length
        });
        for (const account of accounts){
            const update = buildEncryptedTokenUpdate({
                accessToken: account.access_token,
                refreshToken: account.refresh_token
            });
            if (Object.keys(update).length === 0) {
                continue;
            }
            update.updated_at = new Date().toISOString();
            const { error: updateError } = await supabase.from('ad_accounts').update(update).eq('id', account.id);
            if (updateError) {
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logging$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].error('Failed to migrate tokens for ad account', {
                    accountId: account.id,
                    platform: account.platform,
                    error: updateError
                });
            }
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logging$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].info('Plaintext token migration completed');
    } catch (error) {
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logging$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].error('Token migration failed', {
            error
        });
    }
}
}),
"[project]/app/auth/google/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logging$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/logging/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2f$ad$2d$account$2d$tokens$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/security/ad-account-tokens.ts [app-route] (ecmascript)");
;
;
;
;
;
const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
async function GET(request) {
    let user = null;
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    // Handle OAuth errors
    if (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(`/dashboard/settings?error=${encodeURIComponent(error)}`, request.url));
    }
    // Initiating OAuth flow
    if (!code) {
        const authResponse = await supabase.auth.getUser();
        user = authResponse.data.user;
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/login', request.url));
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logging$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logOAuthEvent"])('google_ads', 'initiated', user.id);
        // Get profile with tenant_id
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile?.tenant_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/dashboard/settings?error=No tenant found', request.url));
        }
        // Get Google Ads credentials from ad_accounts
        const { data: adAccount } = await supabase.from('ad_accounts').select('metadata').eq('tenant_id', profile.tenant_id).eq('platform', 'google_ads').single();
        if (!adAccount?.metadata?.client_id || !adAccount?.metadata?.client_secret) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/dashboard/settings?error=Google Ads credentials not configured', request.url));
        }
        // Generate state for CSRF protection
        const stateToken = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString('hex');
        // Store state in session (using cookies for simplicity)
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(`${GOOGLE_OAUTH_URL}?` + new URLSearchParams({
            client_id: adAccount.metadata.client_id,
            redirect_uri: `${request.nextUrl.origin}/auth/google`,
            response_type: 'code',
            scope: 'https://www.googleapis.com/auth/adwords',
            access_type: 'offline',
            include_granted_scopes: 'true',
            state: stateToken,
            prompt: 'consent'
        }).toString(), request.url));
        response.cookies.set('google_oauth_state', stateToken, {
            httpOnly: true,
            secure: ("TURBOPACK compile-time value", "development") === 'production',
            sameSite: 'lax',
            maxAge: 600
        });
        return response;
    }
    // Handle OAuth callback
    try {
        const storedState = request.cookies.get('google_oauth_state')?.value;
        if (!state || state !== storedState) {
            throw new Error('Invalid state parameter - possible CSRF attack');
        }
        const authResponse = await supabase.auth.getUser();
        user = authResponse.data.user;
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/login', request.url));
        }
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile?.tenant_id) {
            throw new Error('No tenant found');
        }
        // Get credentials again - query by (tenant_id, platform) to find the account
        // This ensures we update the same account even if credentials were changed
        const { data: adAccount } = await supabase.from('ad_accounts').select('id, metadata, account_id').eq('tenant_id', profile.tenant_id).eq('platform', 'google_ads').maybeSingle();
        if (!adAccount) {
            throw new Error('Google Ads account not found. Please configure credentials in Settings first.');
        }
        // Exchange code for tokens
        const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: adAccount.metadata.client_id,
                client_secret: adAccount.metadata.client_secret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: `${request.nextUrl.origin}/auth/google`
            })
        });
        if (!tokenResponse.ok) {
            const error = await tokenResponse.json();
            throw new Error(error.error_description || 'Failed to exchange code for tokens');
        }
        const tokens = await tokenResponse.json();
        if (!tokens.refresh_token) {
            throw new Error('No refresh token received. Please revoke access and try again.');
        }
        const tokenUpdate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2f$ad$2d$account$2d$tokens$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildEncryptedTokenUpdate"])({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token
        });
        // Update ad_accounts with refresh token
        // Note: We update by (tenant_id, platform) to ensure we always update the correct record
        const { error: updateError } = await supabase.from('ad_accounts').update({
            ...tokenUpdate,
            token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
            status: 'active',
            last_synced_at: null,
            updated_at: new Date().toISOString()
        }).eq('tenant_id', profile.tenant_id).eq('platform', 'google_ads');
        if (updateError) throw updateError;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logging$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logOAuthEvent"])('google_ads', 'success', user.id);
        // Clear state cookie
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/dashboard/settings?success=Google Ads connected successfully', request.url));
        response.cookies.delete('google_oauth_state');
        return response;
    } catch (error) {
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logging$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].error('Google OAuth error:', error);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logging$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logOAuthEvent"])('google_ads', 'failure', user?.id, error);
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(`/dashboard/settings?error=${encodeURIComponent(error.message)}`, request.url));
        response.cookies.delete('google_oauth_state');
        return response;
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__25f35b99._.js.map