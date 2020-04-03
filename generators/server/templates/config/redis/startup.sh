# Redis startup

mkdir -p /tmp/logs
exec /mon/start "redis-server /redis.conf" >> /tmp/logs/stdout.log 2>>/tmp/logs/stderr.log
