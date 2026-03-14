export const cliOptions = [
{
    groupName: "Server",
    description: "Run the Odoo server",
    options: [
        { key: "-d", name: "database", type: "text", description: "Database(s) used when installing or updating modules." },
        { key: "-i", name: "init", type: "list", description: "Modules to install before running the server." },
        { key: "-u", name: "update", type: "list", description: "Modules to update before running the server." },
        { key: "--reinit", name: "reinit", type: "list", description: "Modules to reinitialize before starting the server." },
        { key: "--addons-path", name: "addons-path", type: "text", description: "Comma-separated list of module directories." },
        { key: "-D", name: "data-dir", type: "text", description: "Directory where Odoo stores data." },
        { key: "-c", name: "config", type: "text", description: "Path to configuration file." },
        { key: "-s", name: "save", type: "boolean", description: "Save server configuration to config file." },
        { key: "--stop-after-init", name: "stop-after-init", type: "boolean", description: "Stop server after initialization." },
        { key: "--pidfile", name: "pidfile", type: "text", description: "Path to file where server PID is stored." },
    ],
},

{
    groupName: "Database",
    description: "Database configuration",
    options: [
        { key: "--db-filter", name: "db-filter", type: "text", description: "Regex filter limiting database visibility." },
        { key: "--db-template", name: "db-template", type: "text", description: "Template used when creating new databases." },
        { key: "--db_sslmode", name: "db_sslmode", type: "text", description: "PostgreSQL SSL mode." },
        { key: "--no-database-list", name: "no-database-list", type: "boolean", description: "Disable listing of databases." },
        { key: "--pg_path", name: "pg_path", type: "text", description: "Path to PostgreSQL binaries." },
    ],
},

{
    groupName: "Demo Data",
    description: "Demo data configuration",
    options: [
        { key: "--with-demo", name: "with-demo", type: "boolean", description: "Install demo data in new databases." },
        { key: "--without-demo", name: "without-demo", type: "boolean", description: "Disable demo data installation." },
        { key: "--skip-auto-install", name: "skip-auto-install", type: "boolean", description: "Skip auto-installing modules." },
    ],
},

{
    groupName: "Testing",
    description: "Testing and QA options",
    options: [
        { key: "--test-enable", name: "test-enable", type: "boolean", description: "Enable unit tests after module installation." },
        { key: "--test-tags", name: "test-tags", type: "text", description: "Run only tests matching specified tags." },
    ],
},

{
    groupName: "Internationalisation",
    description: "Language configuration",
    options: [
        { key: "--load-language", name: "load-language", type: "list", description: "Languages to load." },
        { key: "--i18n-overwrite", name: "i18n-overwrite", type: "boolean", description: "Overwrite existing translations." },
    ],
},

{
    groupName: "Developer",
    description: "Developer features",
    options: [
        { key: "--dev", name: "dev", type: "list", description: "Enable developer features (xml,reload,qweb,...)." },
    ],
},

{
    groupName: "HTTP",
    description: "HTTP server configuration",
    options: [
        { key: "--no-http", name: "no-http", type: "boolean", description: "Disable HTTP server." },
        { key: "--http-interface", name: "http-interface", type: "text", description: "HTTP interface address." },
        { key: "-p", name: "http-port", type: "number", description: "HTTP port." },
        { key: "--proxy-mode", name: "proxy-mode", type: "boolean", description: "Enable proxy mode." },
        { key: "--x-sendfile", name: "x-sendfile", type: "boolean", description: "Use X-Sendfile header." },
    ],
},

{
    groupName: "Email",
    description: "Outgoing email configuration",
    options: [
        { key: "--email-from", name: "email-from", type: "text", description: "Default FROM email address." },
        { key: "--from-filter", name: "from-filter", type: "text", description: "Outgoing mail server filter." },
        { key: "--smtp", name: "smtp", type: "text", description: "SMTP server." },
        { key: "--smtp-port", name: "smtp-port", type: "number", description: "SMTP port." },
        { key: "--smtp-user", name: "smtp-user", type: "text", description: "SMTP username." },
        { key: "--smtp-password", name: "smtp-password", type: "text", description: "SMTP password." },
        { key: "--smtp-ssl", name: "smtp-ssl", type: "boolean", description: "Enable SMTP SSL." },
        { key: "--smtp-ssl-certificate-filename", name: "smtp-ssl-certificate-filename", type: "text", description: "SMTP SSL certificate file." },
        { key: "--smtp-ssl-private-key-filename", name: "smtp-ssl-private-key-filename", type: "text", description: "SMTP SSL private key file." },
    ],
},

{
    groupName: "Multiprocessing",
    description: "Workers and performance tuning",
    options: [
        { key: "--workers", name: "workers", type: "number", description: "Number of HTTP workers." },
        { key: "--limit-request", name: "limit-request", type: "number", description: "Maximum requests per worker." },
        { key: "--limit-memory-soft", name: "limit-memory-soft", type: "number", description: "Soft memory limit per worker." },
        { key: "--limit-memory-hard", name: "limit-memory-hard", type: "number", description: "Hard memory limit per worker." },
        { key: "--limit-time-cpu", name: "limit-time-cpu", type: "number", description: "CPU time limit per request." },
        { key: "--limit-time-real", name: "limit-time-real", type: "number", description: "Real time limit per request." },
        { key: "--max-cron-threads", name: "max-cron-threads", type: "number", description: "Number of cron threads." },
        { key: "--limit-time-worker-cron", name: "limit-time-worker-cron", type: "number", description: "Cron worker time limit." },
    ],
},

{
    groupName: "GeoIP",
    description: "GeoIP database configuration",
    options: [
        { key: "--geoip-city-db", name: "geoip-city-db", type: "text", description: "Path to GeoIP City database." },
        { key: "--geoip-country-db", name: "geoip-country-db", type: "text", description: "Path to GeoIP Country database." },
    ],
},
];
