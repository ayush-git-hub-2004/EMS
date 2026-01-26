module.exports = {
  apps: [
    {
      name: 'ems-api',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000,
        MONGODB_URI: process.env.MONGODB_URI,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
        CORS_ORIGIN: process.env.CORS_ORIGIN || '',
      },
    },
  ],
};
