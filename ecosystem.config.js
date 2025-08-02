module.exports = {
  apps: [
    {
      name: 'kamikaya-backend',
      script: 'backend/venv/bin/python',
      args: '-m uvicorn main:app --host 0.0.0.0 --port 8001',
      cwd: '/var/www/kamikaya',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PYTHONPATH: '/var/www/kamikaya/backend'
      },
      error_file: './logs/backend-err.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    }
  ]
};