module.exports = {
  apps: [
    {
      name: 'user-app',
      script: 'node',
      args: '-r dotenv/config .next/standalone/server.js',
      cwd: './apps/user',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DOTENV_CONFIG_PATH: '../../.env.production'
      }
    },
    {
      name: 'admin-app',
      script: 'node',
      args: '-r dotenv/config .next/standalone/server.js',
      cwd: './apps/admin',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DOTENV_CONFIG_PATH: '../../.env.production'
      }
    }
  ]
};