#!/bin/bash
kill $(lsof -t -i:3000) 2>/dev/null
kill $(lsof -t -i:5173) 2>/dev/null
echo "Serveurs arrêtés."
