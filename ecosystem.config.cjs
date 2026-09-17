module.exports = {
  apps: [{
    name: 'headora-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/srv/headora/frontend',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/headora/frontend-error.log',
    out_file: '/var/log/headora/frontend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
