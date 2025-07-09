#!/bin/sh

python ./signaling/manage.py collectstatic --noinput
python ./signaling/manage.py migrate --noinput

exec "$@"
