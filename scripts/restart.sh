#!/bin/bash
docker-compose down && docker-compose up -d --build && docker ps | head -n 2 | tail -n 1
