# Database Configuration Setup

## How It Works

This application uses environment variables for database configuration that can vary between different computers. The installer handles this automatically.

## Installation Process

### NSIS Installer (Windows)

When users install the application using the Windows installer, they will see a custom page asking for database configuration:

1. **Database Host** - PostgreSQL server address (default: localhost)
2. **Database Port** - PostgreSQL server port (default: 5432)
3. **Database Name** - Name of the database (default: hardware-pos)
4. **Username** - PostgreSQL username (default: postgres)
5. **Password** - PostgreSQL password

The installer will automatically create a `.env` file in the user's AppData directory:
```
C:\Users\<Username>\AppData\Roaming\hardware-pos\.env
```

## Environment Variables

The following environment variables are supported:

- `DB_HOST` - Database host address
- `DB_PORT` - Database port number
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `NODE_ENV` - Environment (development/production)
- `DB_LOGGING` - Enable database query logging (true/false)

## Configuration Locations

### Development
In development mode, the application reads from `.env` in the project root directory.

### Production
In production (installed app), the application reads from:
- Windows: `%APPDATA%\hardware-pos\.env`
- macOS: `~/Library/Application Support/hardware-pos/.env`
- Linux: `~/.config/hardware-pos/.env`

## Changing Configuration After Installation

Users can modify their database settings by editing the `.env` file in their AppData directory. After making changes, they need to restart the application.

## Security Notes

- The `.env` file contains sensitive information (database password)
- It's stored in the user's AppData folder with appropriate permissions
- Never commit the production `.env` file to version control
- The development `.env` file should be in `.gitignore`

## Troubleshooting

If the application cannot connect to the database:

1. Verify PostgreSQL is running
2. Check the `.env` file exists in the correct location
3. Verify the credentials in the `.env` file are correct
4. Ensure the database exists and is accessible
5. Check firewall settings if connecting to a remote database

## Building the Installer

To build the Windows installer with the custom database configuration page:

```bash
npm run build-win
```

The installer will be created in the `release` directory.
