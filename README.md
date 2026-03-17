# Odoo Dev Kit

VS Code sidebar to configure and run Odoo quickly with a generated command, server controls, and helpful presets.

## Features

- Configure Odoo addons, CLI options, and environment paths.
- Generate a ready-to-run Odoo command.
- Run/stop the server from the sidebar.
- Drop the current database and re-run the server in one click.
- Auto-detect a default database name from the first addon branch (optional).

### Screenshots
| Config | Server |
| --- | --- |
| <img src="assets/images/config.png" alt="Config" width="360" /> | <img src="assets/images/server.png" alt="Server" width="360" /> |

## Requirements

- Python venv for your Odoo instance (optional but recommended).
- Odoo source directory and addons paths.
- PostgreSQL tools if you use the Drop DB action.

## Server Actions

- **Run server**: runs Odoo and includes `-u` only (update mode).
- **Drop DB and run**: drops the current database and runs Odoo with `-i` only (init mode).

## Library Usage

- **owl**: used to build the sidebar UI.

## License

MIT
