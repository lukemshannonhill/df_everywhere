
    
    
if __name__ == "__main__":
    """
    When run directly, it finds Dwarf Fortress window
    """  
    from sys import platform as _platform
    from twisted.internet import reactor
    from twisted.web.static import File
    from twisted.web.server import Site
    import utils
    import tileset
    import sendInput
    
    from twisted.internet.defer import inlineCallbacks
    
    from twisted.python import log
    import sys
    log.startLogging(sys.stdout)        
    
    import wamp_local
    
    debug_all = False
    need_wamp_server = False
    
    if need_wamp_server:
        #Start WAMP server
        wamp_local.wampServ("ws://localhost:7081/ws", "tcp:7081", False)
    
    ## Set up webserver to tileset image    
    resource = File('./')    
    site = Site(resource)
    reactor.listenTCP(7080, site)
    
    #Start WAMP client
    client = wamp_local.WampHolder()
    if need_wamp_server:
        #Connect to local server
        client.connection = wamp_local.wampClient("ws://192.168.0.20:7081/ws", "tcp:192.168.0.20:7081")
    else:
        client.connection = wamp_local.wampClient("ws://dfeverywhere.com:7081/ws", "tcp:dfeverywhere.com:7081")
            
    #Change screenshot method based on operating system    
    if _platform == "linux" or _platform == "linux2":
        print("Linux unsuported at this time. Exiting...")
        exit()
    elif _platform == "darwin":
        print("OS X unsuported at this time. Exiting...")
        exit()
    elif _platform == "win32":
        # Windows..
        window_handle = utils.get_windows_bytitle("Dwarf Fortress")
        shot = utils.screenshot(window_handle[0], debug = False)
    else:
        print("Unsuported platform detected. Exiting...")
        exit()
    
    shot = utils.trim(shot, debug = False)
    tile_x, tile_y = utils.findTileSize(shot)
    local_file = utils.findLocalImg(tile_x, tile_y)
    tset = tileset.Tileset(local_file, tile_x, tile_y, debug = False)
    
    localCommands = sendInput.SendInput(window_handle)
    
    tickMax = 80
    
    @inlineCallbacks
    def keepGoing(tick):
        shot = utils.screenshot(window_handle[0], debug = False)
        shot = utils.trim(shot, debug = False)
        tileMap = tset.parseImage(shot)
        if debug_all:
            print("tileMap created.")
        
        if len(client.connection) > 0 and len(client.subscriptions) < 1:
            #add a subscription once
            d = yield client.connection[0].subscribe(localCommands.receiveCommand, 'df_everywhere.g1.commands')
            client.subscriptions.append(d)
            
        if len(client.connection) > 0:
            client.connection[0].publish("df_anywhere.g1.map",tileMap)
            if debug_all:
                print("Published tilemap.")
        else:
            print("Waiting for WAMP connection.")
        
                    
        #Periodically publish the latest tileset filename
        if tick % 5 == 0:
            if len(client.connection) > 0:
                client.connection[0].publish("df_anywhere.g1.tileset", tset.filename)
                if debug_all:
                    print("Published tileset.")
        
        #Periodically publish the screen size and tile size
        if tick % 5 == 1:
            if len(client.connection) > 0:
                client.connection[0].publish("df_anywhere.g1.screensize", [tset.screen_x, tset.screen_y])
                client.connection[0].publish("df_anywhere.g1.tilesize", [tset.tile_x, tset.tile_y])
                if debug_all:
                    print("Published tileset.")
        
        if (tick < tickMax):
            print("Tick...")
            reactor.callLater(.2, keepGoing, tick + 1)
        else:
            print("Tick limit reached. Exiting...")
            reactor.stop()
        
    reactor.callWhenRunning(keepGoing, 0)
    reactor.run()
    