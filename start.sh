#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

kill $(lsof -t -i:3000) 2>/dev/null
kill $(lsof -t -i:5173) 2>/dev/null
sleep 1

cd /home/hachem/Downloads/E-Commerce-Maroc/artifacts/api-server
DATABASE_URL=postgresql://hachem:motdepasse123@localhost:5432/soukma SESSION_SECRET=soukma_secret_key_tres_longue_2024 NODE_ENV=development PORT=3000 pnpm dev &
API_PID=$!
echo "API lancée (PID $API_PID)"
sleep 5

cd /home/hachem/Downloads/E-Commerce-Maroc/artifacts/soukma
PORT=5173 BASE_PATH=/soukma/ pnpm dev &
WEB_PID=$!
echo "Frontend lancé (PID $WEB_PID)"

echo ""
echo "Site disponible sur : http://localhost:5173/soukma/"
echo "Pour arrêter : ./stop.sh"
wait
