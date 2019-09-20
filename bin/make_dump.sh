#!/bin/bash

node /home/cloudscalers/betsApi/update.js

sudo rm -r /home/cloudscalers/backups/
sudo mongo
use newBets
db.notes.remove({})

node /home/cloudscalers/betsApi/copyLightDB.js

sudo mongodump --db newBets --out /home/cloudscalers/backups
cd /home/cloudscalers/backups
sudo tar -zcvf newBets.tar.gz newBets
