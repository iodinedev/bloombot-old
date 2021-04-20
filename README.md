# Bot for Meditation & Mindfulness
<hr>

## Setup
### Install requirements 
* Install FFMPEG (https://www.ffmpeg.org/download.html#build-linux)
* This should help ttps://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg
* restart your PC
* open the Linux terminal
* go the the folder from the bot (cd /home/user/Chrisson  -- smt like this it should look like)
* execute pip install -r requirements.txt

### Edit Bots settings
* copy the config.json.example file and create a new file called config.json
* insert all the data for your guild (to get the guilds/channel id you need to activate the developer mode in discord)
* to get the token you need to generate an bot account here: https://discordapp.com/developers/applications/ - there first generate an application with the name from your bot and then create a bot account under the application

### Run the bot
* stay in the bots folder with the terminal
* then execute ``python3 main.py`` to test everything
* if the bots run probably like this you should run him in a screen so that you can disconnect from the server and the bot would be still running
* to start a screen ``screen -S namefromthescreen python3 main.py``
* then press STRG + A and STRG + D do detach from the screen 

##### thats it!

## Meta
Bot by zmontgo#0001 - https://codingprojects.org/
