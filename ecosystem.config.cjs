// PM2 cluster config for zero-downtime reloads.
// Usage: pm2 start ecosystem.config.cjs --env production && pm2 reload headora (not restart).
module.exports = {
  apps: [{
    name: "headora",
    cwd: "./sites/demo-fashion",
    script: "node_modules/next/dist/bin/next",
    args: "start -p 3000",
    instances: 2,
    exec_mode: "cluster",
    wait_ready: true,
    listen_timeout: 15000,
    kill_timeout: 10000,
    max_memory_restart: "1G",
    env_production: { NODE_ENV: "production" },
  }],
};
