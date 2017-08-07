
#GOT API

npm install

npm start

http://localhost:8088/

Try these apis through ui provided.

Or

Use below APIs

GET /search?your_q=your_data  API 
Matches provided keys  with keys from database and database keys are used for search query
@params- /search?{king=Robb Stark || defender=Robb Stark || defe=Robb Stark}&battle_ty=ambush&region=The Riverlands&major_death=1

GET /createlist API
Adds entries to database for once using the file "mock-battles.json".  

GET /list API
returns list(array) of all the places where battle has taken place.

GET /getcount API
Give total number of battles

GET /stats API
Gives Stats



