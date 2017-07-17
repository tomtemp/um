### Initialise

npm i

### Run

node .

### FYI

If you change the service-areas.json file, you must restart the server.

### TODO

Only hitting one location provider (Google Maps). Add support for more.

Add caching with redis.


Create a hash of service-areas.json string on application load and then write it to file. On subsequent application
loads rehash and compare with hash on disk to check if there has been changes to the service areas.
If there has been a change then wipe redis.

Load all service areas into mongodb as GeoJSON data. Query against mongo. Replace hashing as described above with hooks to
wipe redis on change of service areas.



