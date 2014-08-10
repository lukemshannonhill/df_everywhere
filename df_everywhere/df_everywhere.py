
    
    
if __name__ == "__main__":
    """
    When run directly, it finds Dwarf Fortress window
    """  
    from sys import platform as _platform
    import ConfigParser
    from twisted.internet import reactor
    from twisted.internet.defer import inlineCallbacks    
    
    from util import wamp_local, utils, tileset, sendInput    
    
    from twisted.python import log
    import sys
    log.startLogging(sys.stdout)    
    
    #Uncomment the two lines below to get more detailed errors
    #from twisted.internet.defer import setDebugging
    #setDebugging(True)
    
    #If 'localTest' file is present, use separate configuration
    import os.path
    localTest = os.path.isfile('localTest')
    if localTest:
        print("localTest file found. Proceeding appropriately.")
    
    Config = ConfigParser.ConfigParser()
    try:
        if localTest:
            Config.read(".\localTest")
        else:
            Config.read(".\dfeverywhere.conf")
        web_username = Config.get('dfeverywhere', 'USERNAME')
        web_key = Config.get('dfeverywhere', 'KEY')
        need_wamp_server = False
        topicPrefix = "df_everywhere.%s" % web_username
    except:
        #If file is missing, start local server
        web_username = ''
        web_key = ''
        need_wamp_server = True
    
    if (web_username == '') and (web_key == ''):
        #No credentials entered, ask for credentials to be entered
        print("No configuration details entered. Please add your credentials to 'dfeverywhere.conf'.")
        exit()
        
    if need_wamp_server:
        #Start WAMP server
        wamp_local.wampServ("ws://localhost:7081/ws", "tcp:7081", False)
    
    #Start WAMP client
    client = wamp_local.WampHolder()
    if need_wamp_server:
        #Connect to local server
        client.connection = wamp_local.wampClient("ws://192.168.0.20:7081/ws", "tcp:192.168.0.20:7081")
    else:
        client.connection = wamp_local.wampClient("ws://dfeverywhere.com:7081/ws", "tcp:dfeverywhere.com:7081")
            
    #Change screenshot method based on operating system    
    if _platform == "linux" or _platform == "linux2":
        print("Linux unsupported at this time. Exiting...")
        exit()
    elif _platform == "darwin":
        print("OS X unsupported at this time. Exiting...")
        exit()
    elif _platform == "win32":
        # Windows..
        window_handle = utils.get_windows_bytitle("Dwarf Fortress")            
        try:
            shot = utils.screenshot(window_handle[0], debug = False)
        except:
            print("Unable to find Dwarf Fortress window. Ensure that it is running.")
            exit()
    else:
        print("Unsupported platform detected. Exiting...")
        exit()
    
    
    trimmedShot = utils.trim(shot, debug = False)
    tile_x, tile_y = utils.findTileSize(trimmedShot)
    local_file = utils.findLocalImg(tile_x, tile_y)
    tset = tileset.Tileset(local_file, tile_x, tile_y, debug = False)
    
    localCommands = sendInput.SendInput(window_handle[0])
        
    @inlineCallbacks
    def keepGoing(tick):
        try:
            shot = utils.screenshot(window_handle[0], debug = False)
            shot_x, shot_y = shot.size
        except:
            print("Error getting screen shot. Exiting.")
            shot = None
            reactor.stop()
        
        trimmedShot = utils.trim(shot, debug = False)       
        
        if trimmedShot is not None:
            trimmedShot_x, trimmedShot_y = trimmedShot.size
            if (trimmedShot_x != tset.screen_x) or (trimmedShot_y != tset.screen_y):
                #print("Error with screen dimensions.")
                #shot.save('screenerror%d.png' % tick)
                #trimmedShot.save('screenerror%da.png' % tick)
                pass
                
            #Only send a full tile map every 5 ticks, otherwise just send changes
            if (tick + 1) % 20 == 0:
                tileMap = tset.parseImage(trimmedShot, returnFullMap = True)
            else:
                tileMap = tset.parseImage(trimmedShot, returnFullMap = False)
        else:
            #If there was an error getting the tilemap, fake one.
            print("Faking tileMap.")
            tileMap = []
                
        if len(client.connection) > 0 and len(client.subscriptions) < 1:
            #add a subscription once
            d = yield client.connection[0].subscribe(localCommands.receiveCommand, '%s.commands' % topicPrefix)
            d1 = yield client.connection[0].subscribe(client.receiveHeartbeats, '%s.heartbeats' % topicPrefix)
            
            client.subscriptions.append(d)
            print("WAMP connected...")
            
        if len(client.connection) > 0 and len(client.rpcs) < 1:
            #register a rpc once
            d = yield client.connection[0].register(tset.wampSend, '%s.tilesetimage' % topicPrefix)
            
            client.rpcs.append(d)
            
        if len(client.connection) > 0:
            client.connection[0].publish("%s.map" % topicPrefix,tileMap)
            
        else:
            print("Waiting for WAMP connection.")
        
                    
        #Periodically publish the latest tileset filename
        if tick % 10 == 0:
            if len(client.connection) > 0:
                client.connection[0].publish("%s.tileset" % topicPrefix, tset.filename)
                
        
        #Periodically publish the screen size and tile size
        if tick % 50 == 1:
            if len(client.connection) > 0:
                client.connection[0].publish("%s.tilesize" % topicPrefix, [tset.tile_x, tset.tile_y])
                #Only send screen size update if it makes sense
                if (tset.screen_x % tset.tile_x == 0) and (tset.screen_y % tset.tile_y == 0):
                    client.connection[0].publish("%s.screensize" % topicPrefix, [tset.screen_x, tset.screen_y])
        
        #Deal with heartbeats
        if client.heartbeatCounter > 0:
                client.heartbeatCounter -= 1
                reactor.callLater(0.1, keepGoing, tick + 1)            
        else:
            #No clients have connected recently, slow processing
            if not client.slowed:
                print("No hearbeats received, slowing...")
                client.slowed = True
            reactor.callLater(0.5, keepGoing, tick + 1)
            
    
    reactor.callLater(0, keepGoing, 0)
    reactor.run()
    