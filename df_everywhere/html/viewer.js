//Set up variable to use to publish events from other functions
var wamp_session = false;
var ctx;



function Tileset(tile_x, tile_y){
    
    this.tileset_x;
    this.tileset_y;
    this.tiles_x;
    this.tiles_y;
    this.tile_x = tile_x;
    this.tile_y = tile_y;
    this.tileImageName = "none";
    this.loaded = false;
    
    this.drawTile = function (tileNum, drawPos){
        if (tileNum === -2){
            //tile didn't change, pass
        }
        else {
            //drawPos is [row, column]
            var t_row = Math.floor(tileNum / this.tiles_x);
            var t_column = tileNum % this.tiles_x;
                    
            var sx = t_column * this.tile_x;
            var sy = t_row * this.tile_y;
            var swidth = this.tile_x;
            var sheight = this.tile_y;
            var x = drawPos[1] * this.tile_x;
            var y = drawPos[0] * this.tile_y;
            var width = this.tile_x;
            var height = this.tile_y;
            
            ctx.drawImage(this.img,sx,sy,swidth,sheight,x,y,width,height);
        }
    }
}

var tileset_image = new Image;
var tileset = new Tileset(16, 16);

$(document).ready( function(){
    
    tileset_image.onload = function(){
        tileset.tileset_x = this.width;
        tileset.tileset_y = this.height;
        tileset.tiles_x = this.width / tileset.tile_x;
        tileset.tiles_y = this.height / tileset.tile_y;
        tileset.loaded = true;
        tileset.img = this;
    }   
        
    ctx = $('#gameboard')[0].getContext("2d");
    ctx.canvas.width = 80 * 16;
    ctx.canvas.height = 25 * 16;

});

//Set up loading spinner
var spinOpts = {
    lines: 11, // The number of lines to draw
    length: 15, // The length of each line
    width: 11, // The line thickness
    radius: 30, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#0f0f0f', // #rgb or #rrggbb or array of colors
    speed: 0.6, // Rounds per second
    trail: 30, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: true, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: '20%', // Top position relative to parent
    left: '10%' // Left position relative to parent
};
var spinTarget = document.getElementById('DfDisplay');
var spinner = new Spinner(spinOpts).spin(spinTarget);

function draw_image(tile_map){
    if (tileset.loaded){
        //stop spinner
        spinner.stop();
        //console.log("Drawing map.");
        var row = 0;
        var column = 0;
        tile_map = tile_map[0];
        for (elem in tile_map){
            for (elem2 in tile_map[elem]){
                tileset.drawTile(tile_map[elem][elem2], [row, column]);
                column++;
            }
            row++;
            column = 0;
        }
    } else {
        console.log("Waiting for tileset to load.");
    }    
}

function update_tileset(fname){
    if (tileset.tileImageName === fname[0]){
        //console.log("Tileset name update not needed.");
    }
    else {
        console.log("Updating tileset name:" + fname[0]);
        tileset.tileImageName = fname[0];
        //Request tileset image via websockets
        wamp_session.call('df_everywhere.g1.tilesetimage').then(
            function (str) {
                console.log("Receiving image data");
                //tileset_image.src = "data:image/png;base64," + window.btoa(str);
                tileset_image.src = "data:image/png;base64," + str;
            },
            function (error) {
                console.log("Call failed:", error);
            }
        );
    }
}

function update_tilesize(dims){    
    //dims is [x_pixels, y_pixels]
    tile_x = dims[0][0];
    tile_y = dims[0][1];
    
    if (tile_x != tileset.tile_x || tile_y != tileset.tile_y){
        //Update tileset with new tile size
        console.log("Tile size updating.");
        tileset = new Tileset(tile_x, tile_y); 
    }
    else {
        //console.log("Tile size update not needed.");
    }
}

function update_screensize(dims) {
    //dims is [x_pixels, y_pixels]
    screen_x = dims[0][0];
    screen_y = dims[0][1];
    
    if (screen_x != ctx.canvas.width || screen_y != ctx.canvas.height){
        console.log("Updating screen size.");
        console.log("x:" + screen_x + " y:" + screen_y);
        ctx.canvas.width = screen_x;
        ctx.canvas.height = screen_y;
    }
    else {
        //console.log("Screen size update not needed.");
    }    
}

try {
   var autobahn = require('autobahn');
} catch (e) {
   // when running in browser, AutobahnJS will
   // be included without a module system
}

var connection = new autobahn.Connection({
   url: 'ws://dfeverywhere.com:7081/ws',
   realm: 'realm1'}
);

//Setup Autobahn for WAMP connection
connection.onopen = function (session) {
    console.log("WAMP connection open...");
    
    //wamp_session = true;
    wamp_session = session;

   //subscribe to tilemap
   session.subscribe("df_everywhere.g1.map", draw_image);
   
   //subscribe to tileset updates
   session.subscribe("df_everywhere.g1.tileset", update_tileset);
   
   //subscribe to tile size updates
   session.subscribe("df_everywhere.g1.tilesize", update_tilesize);
   
   //subscribe to screensize updates
   session.subscribe("df_everywhere.g1.screensize", update_screensize);
   
   //send heartbeats every 30 seconds
   session.publish("df_everywhere.g1.heartbeats", ['beat']);
   setInterval(function(){session.publish("df_everywhere.g1.heartbeats", ['beat']);}, 30 * 1000);
};

connection.open();

