/* global Phaser */
$.ajaxSetup({
  cache:false
});

var level = "levels/"+getParameterByName('level', window.location.href)+".json";
if(getParameterByName('external', window.location.href) === "") level = getParameterByName('level', window.location.href);

$.getJSON( level, function( room ) {
    var game = new Phaser.Game($(window).width(), $(window).height(), Phaser.AUTO, '', { preload: preload, create: create, update: update });
    var first = true;
    var bounds_x = 0;
    var bounds_y = 0;
    var player;
    var goal;
    var platforms;
    var platforms_fall;
    var damage;
    var glue;
    var texts;
    var keyboard;
    var vgc;
    var left;
    var right;
    var jump;
    
    function preload() {
        game.stage.backgroundColor = '#B0BEC5';
        game.load.baseURL = 'assets/';
        game.load.crossOrigin = 'anonymous';
        game.load.spritesheet('player', 'sprites/player.png', 24, 20, 24);
        game.load.image('platform', 'sprites/platform.png');
        game.load.image('damage', 'sprites/damage.png');
        game.load.image('goal', 'sprites/goal.png');
        game.load.image('glue', 'sprites/glue.png');
        game.load.image('platform_fall', 'sprites/platform_fall.png');
        game.load.image('vgc_button', 'sprites/vgc_button.png');
    }

    function create() {
        platforms = game.add.physicsGroup();
        platforms_fall = game.add.physicsGroup();
        damage = game.add.physicsGroup();
        glue = game.add.physicsGroup();
        texts = game.add.group();
        vgc = game.add.group();
        
        room['objects'].forEach(function(item, index){
            var type = item['type'];
            var position = item['position'];
            var size = item['size'];
            var depth = item['depth'];
            if(size === undefined) size = [0, 0];
            if(depth === undefined) depth = 0;
            var sprite = game.add.sprite(position[0], position[1], type);
            if(position[0] + size[0] > bounds_x) bounds_x = position[0] + size[0];
            if(position[1] + size[1] > bounds_y) bounds_y = position[1] + size[1];
            if(size[0] !== 0) sprite.scale.setTo(size[0], size[1]);
            if(depth !== 0) sprite.z = depth;
            switch(type){
                case 'player': player = sprite; break;
                case 'platform': platforms.add(sprite); break;
                case 'platform_fall': platforms_fall.add(sprite); break;
                case 'glue': glue.add(sprite); break;
                case 'damage': damage.add(sprite); break;
                case 'goal': goal = sprite;
            }
        });

        game.world.setBounds(0, 0, bounds_x, bounds_y);
        game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON);
        game.physics.arcade.enable(player);
        player.body.collideWorldBounds = true;
        player.body.gravity.y = 1000;
        keyboard = new Object();
        keyboard['left'] = game.input.keyboard.addKey(Phaser.Keyboard.A);
        keyboard['right'] = game.input.keyboard.addKey(Phaser.Keyboard.D);
        keyboard['up'] = game.input.keyboard.addKey(Phaser.Keyboard.W);
        platforms.setAll('body.immovable', true);
        platforms_fall.setAll('body.immovable', true);
        damage.setAll('body.immovable', true);
        glue.setAll('body.immovable', true);
        game.physics.enable(goal, Phaser.Physics.ARCADE);
        goal.body.immovable = true;
        
        if(first){
            /* Virtual game controller */
            vgc_left = game.add.button(10, game.height-50, 'vgc_button', null, this);
            vgc_left.fixedToCamera = true;
            vgc_left.events.onInputOver.add(function(){left=true;});
            vgc_left.events.onInputOut.add(function(){left=false;});
            vgc_left.events.onInputDown.add(function(){left=true;});
            vgc_left.events.onInputUp.add(function(){left=false;});
            vgc.add(vgc_left);

            vgc_left_jump = game.add.button(10, game.height-100, 'vgc_button', null, this);
            vgc_left_jump.fixedToCamera = true;
            vgc_left_jump.events.onInputOver.add(function(){left=true; jump=true;});
            vgc_left_jump.events.onInputOut.add(function(){left=false; jump=false;});
            vgc_left_jump.events.onInputDown.add(function(){left=true; jump=true;});
            vgc_left_jump.events.onInputUp.add(function(){left=false; jump=false;});
            vgc.add(vgc_left_jump);

            vgc_jump = game.add.button(60, game.height-100, 'vgc_button', null, this);
            vgc_jump.fixedToCamera = true;
            vgc_jump.events.onInputOver.add(function(){jump=true;});
            vgc_jump.events.onInputOut.add(function(){jump=false;});
            vgc_jump.events.onInputDown.add(function(){jump=true;});
            vgc_jump.events.onInputUp.add(function(){jump=false;});
            vgc.add(vgc_jump);

            vgc_right_jump = game.add.button(110, game.height-100, 'vgc_button', null, this);
            vgc_right_jump.fixedToCamera = true;
            vgc_right_jump.events.onInputOver.add(function(){right=true; jump=true;});
            vgc_right_jump.events.onInputOut.add(function(){right=false; jump=false;});
            vgc_right_jump.events.onInputDown.add(function(){right=true; jump=true;});
            vgc_right_jump.events.onInputUp.add(function(){right=false; jump=false;});
            vgc.add(vgc_right_jump);

            vgc_right = game.add.button(110, game.height-50, 'vgc_button', null, this);
            vgc_right.fixedToCamera = true;
            vgc_right.events.onInputOver.add(function(){right=true;});
            vgc_right.events.onInputOut.add(function(){right=false;});
            vgc_right.events.onInputDown.add(function(){right=true;});
            vgc_right.events.onInputUp.add(function(){right=false;});
            vgc.add(vgc_right);
        }
        first = false;
    }
    
    function restart(){
        player.kill();
        goal.kill();
        platforms.removeAll();
        platforms_fall.removeAll();
        damage.removeAll();
        glue.removeAll();
        texts.removeAll();
        create();
    }

    function update () {
        game.physics.arcade.collide(player, platforms);
        game.physics.arcade.collide(player, platforms_fall, platformFall);
        game.physics.arcade.collide(player, glue, playerGlue);
        game.physics.arcade.collide(player, goal, playerWin);
        game.physics.arcade.collide(player, damage, playerDeath);

        player.body.velocity.x = 0;

        if (keyboard['left'].isDown || left) player.body.velocity.x = -240;
        else if (keyboard['right'].isDown || right) player.body.velocity.x = 240;

        if ((keyboard['up'].isDown || jump) && (player.body.onFloor() || player.body.touching.down))
            player.body.velocity.y = -600;
        
        
        
        if(player.body.velocity.x > 0) player.frame = 1;
        else if (player.body.velocity.x < 0)  player.frame = 2;
        else player.frame = 0;
        if (player.body.velocity.y < 0) player.frame = 3;
        else if (player.body.velocity.y > 0) player.frame = 4;
    }
    
    function platformFall(player, platform_fall){
        platform_fall.body.velocity.y = 50;
    }
    
    function playerGlue(player, glue){
        player.body.velocity.y = 0;
        if (keyboard['up'].isDown || jump) player.body.velocity.y = -300;
    }
    
    function playerWin(player, goal){
        var win_text = game.add.text(game.width/2,game.height/2,'You won!', { font: '40px Arial', fill: '#2E7D32', align: 'center' });
        win_text.anchor.setTo(0.5, 0.5);
        win_text.fixedToCamera = true;
        texts.add(win_text);
        goal.kill();
    }
    
    function playerDeath(player, damage){
        restart();
    }
    
    $( window ).resize(function() {
        game.scale.setGameSize($(window).width(), $(window).height());
    });
});

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}