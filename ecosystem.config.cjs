const { resolve } = require('path')

module.exports = {
  apps: [{
    name: 'ux-dojo',
    script: '.output/server/index.mjs',
    cwd: __dirname,
    // Nitro never reads .env at runtime; --env-file makes node load it on
    // every (re)start, so the webhook's plain `pm2 restart` picks up changes
    node_args: `--env-file=${resolve(__dirname, '.env')}`,
    env: { NODE_ENV: 'production', PORT: 3000, HOST: '127.0.0.1' },
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '300M',
  }]
}
