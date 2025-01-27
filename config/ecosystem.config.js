module.exports = {
  apps: [
    {
      name: 'user-app',
      cwd: './apps/user',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
      max_restarts: 10,
      restart_delay: 4000,
      exp_backoff_restart_delay: 100
    },
    {
      name: 'admin-app',
      cwd: './apps/admin',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      exp_backoff_restart_delay: 100
    }
  ]
};
