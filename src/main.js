import Phaser from 'phaser';

const DEBUG_MODE = false;

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        this.load.image('bg', '/assets/pre.png');
        this.load.spritesheet('player', '/assets/Swordsman_lvl3_Walk_without_shadow.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('cv-icon', '/assets/1 Icons/Icons_29.png');
        this.load.image('projects-icon', '/assets/1 Icons/Icons_34.png');
        this.load.image('mail-icon', '/assets/1 Icons/Icons_28.png');
        this.load.spritesheet('cat', '/assets/3 Cat/Walk.png', { frameWidth: 47, frameHeight: 46 });
        this.load.spritesheet('cat-idle-sheet', '/assets/3 Cat/Idle.png', { frameWidth: 47, frameHeight: 46 });
    }

    create() {
        this.input.addPointer(1);
        this.isTouching = false;
        this.touchTarget = new Phaser.Math.Vector2();

        this.bg = this.add.image(400, 300, 'bg');
        this.bg.setDisplaySize(800, 600);

        this.scale.on('resize', (gameSize) => {
            const { width, height } = gameSize;
            this.cameras.main.setViewport(0, 0, width, height);
            this.bg.setPosition(width / 2, height / 2);
            this.bg.setDisplaySize(width, height);
        });

        const wallCoordinates = [
            { x: 14, y: 521, w: 25, h: 46 }, { x: 189, y: 569, w: 89, h: 54 },
            { x: 239, y: 498, w: 70, h: 29 }, { x: 255, y: 554, w: 36, h: 76 },
            { x: 352, y: 535, w: 148, h: 114 }, { x: 407, y: 467, w: 180, h: 19 },
            { x: 544, y: 408, w: 385, h: 25 }, { x: 362, y: 280, w: 718, h: 158},
            { x: 63, y: 416, w: 121, h: 69 }, { x: 150, y: 377, w: 43, h: 32},
            { x: 481, y: 441, w: 26, h: 35}, { x: 692, y: 376, w: 53, h: 27 },
            { x: 758, y: 289, w: 66, h: 174 }, { x: 48, y: 482, w: 86, h: 51 },
            { x: 14, y: 573, w: 22, h: 48 }, { x: 57, y: 584, w: 53, h: 31 },
            { x: 114, y: 592, w: 49, h: 12 }, { x: 306, y: 453, w: 18, h: 38 },
            { x: 268, y: 440, w: 50, h: 24 }, { x: 158, y: 439, w: 62, h: 22 },
            { x: 121, y: 501, w: 57, h: 9 }, { x: 61, y: 538, w: 64, h: 7 }
        ];

        this.walls = this.physics.add.staticGroup();
        wallCoordinates.forEach((wall, index) => {
            if (wall.w) { 
                let barrier = this.add.rectangle(wall.x, wall.y, wall.w, wall.h, 0x000000, 0.5);
                barrier.setVisible(DEBUG_MODE); 
                this.physics.add.existing(barrier, true);
                this.walls.add(barrier);

                if (DEBUG_MODE) {
                    this.add.text(wall.x, wall.y, (index + 1).toString(), { font: 'bold 11px Arial', fill: '#ffff00', backgroundColor: '#000000' }).setOrigin(0.5).setDepth(105);
                }
            }
        });

        this.cv = this.physics.add.image(643, 362, 'cv-icon').setDisplaySize(38, 38).setImmovable(true).setInteractive();
        this.projects = this.physics.add.image(180, 400, 'projects-icon').setDisplaySize(40, 40).setImmovable(true).setInteractive();
        this.mail = this.physics.add.image(421, 434, 'mail-icon').setDisplaySize(32, 32).setImmovable(true).setInteractive();

        [this.cv, this.projects, this.mail].forEach(icon => {
            icon.isHovered = false;
            icon.on('pointerover', () => {
                icon.isHovered = true;
                icon.setScale(1.75);
            });
            icon.on('pointerout', () => {
                icon.isHovered = false;
            });
        });

        this.cv.on('pointerdown', (p) => { p.event.stopPropagation(); window.open('https://www.linkedin.com/in/nikolaos-gkizis-chatziantoniou-121b83208/', '_blank'); });
        this.projects.on('pointerdown', (p) => { p.event.stopPropagation(); window.open('https://github.com/nickgkizis', '_blank'); });
        this.mail.on('pointerdown', (p) => { p.event.stopPropagation(); window.location.href = 'mailto:nikolaosgkizis@gmail.com'; });

        const createGlow = (icon, baseSize, delayTime) => {
            let glow = this.add.image(icon.x, icon.y, icon.texture.key);
            glow.setDisplaySize(baseSize, baseSize);
            glow.setTint(0x4db8ff); 
            glow.setBlendMode(Phaser.BlendModes.ADD); 
            glow.setAlpha(0.6); 

            this.tweens.add({ targets: [icon, glow], y: '-=6', duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: delayTime });
            this.tweens.add({ targets: glow, scaleX: 1.3, scaleY: 1.3, alpha: 0.1, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: delayTime });
        };

        createGlow(this.cv, 38, 0);
        createGlow(this.projects, 50, 200);
        createGlow(this.mail, 32, 400);

        this.actionPrompt = this.add.text(0, 0, 'SPACE', { 
            font: 'bold 12px Arial', 
            fill: '#cccccc', 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            padding: { x: 6, y: 4 }
        })
        .setOrigin(0.5)
        .setDepth(200)
        .setAlpha(0.7)
        .setVisible(false);

        this.catSpeech = this.add.text(0, 0, '', { 
            font: '11px Arial', 
            fill: '#cccccc', 
            backgroundColor: 'rgba(0, 0, 0, 0.6)', 
            padding: { x: 6, y: 4 },
            align: 'center'
        })
        .setOrigin(0.5, 1)
        .setDepth(200)
        .setAlpha(0.8)
        .setVisible(false);
        
        this.currentCatText = "*Purrrrrr*";

        this.anims.create({ key: 'cat-run', frames: this.anims.generateFrameNumbers('cat', { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'cat-idle', frames: this.anims.generateFrameNumbers('cat-idle-sheet', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: 'walk-down', frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk-left', frames: this.anims.generateFrameNumbers('player', { start: 6, end: 11 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk-right', frames: this.anims.generateFrameNumbers('player', { start: 12, end: 17 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk-up', frames: this.anims.generateFrameNumbers('player', { start: 18, end: 23 }), frameRate: 8, repeat: -1 });

        this.cat = this.physics.add.sprite(450, 380, 'cat').setDisplaySize(32, 32).setCollideWorldBounds(true);
        this.cat.body.setSize(10, 10).setOffset(20, 40); 
        this.cat.isInteracting = false;
        this.changeCatDirection();
        this.time.addEvent({ delay: 2000, callback: () => { if (!this.cat.isInteracting) this.changeCatDirection(); }, loop: true });

        this.player = this.physics.add.sprite(400, 380, 'player').setCollideWorldBounds(true);
        this.player.body.setSize(10, 10).setOffset(27, 35);
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.cat, this.walls);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.activeInteraction = null;
        this.notificationClosed = false;

        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.activeInteraction === 'cv') window.open('https://www.linkedin.com/in/nikolaos-gkizis-chatziantoniou-121b83208/', '_blank');
            else if (this.activeInteraction === 'projects') window.open('https://github.com/nickgkizis', '_blank');
            else if (this.activeInteraction === 'mail') window.location.href = 'mailto:nikolaosgkizis@gmail.com';
        });

        this.uiOverlay = document.getElementById('ui-overlay');
        this.uiTitle = document.getElementById('ui-title');
        this.uiText = document.getElementById('ui-text');
        this.uiLinkContainer = document.getElementById('ui-link-container');

        if (!document.getElementById('fun-font')) {
            const fontLink = document.createElement('link'); fontLink.id = 'fun-font'; fontLink.rel = 'stylesheet';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Kelly+Slab&display=swap'; document.head.appendChild(fontLink);
        }

        if (this.uiOverlay) {
            this.uiOverlay.style.maxWidth = "90vw";
            this.uiOverlay.style.width = "260px";
            this.uiOverlay.style.fontFamily = "'Kelly Slab', cursive";
            this.uiOverlay.style.setProperty('height', '180px', 'important');
            this.uiOverlay.style.setProperty('min-height', '180px', 'important');
            this.uiOverlay.style.setProperty('max-height', '180px', 'important');
            
            this.uiOverlay.style.pointerEvents = 'none'; 
            if(this.uiLinkContainer) this.uiLinkContainer.style.pointerEvents = 'auto'; 
            
            this.uiOverlay.style.top = 'auto';
            this.uiOverlay.style.bottom = '50%';
            this.uiOverlay.style.left = '50%';
            this.uiOverlay.style.transform = 'translateX(-50%)';
            if(this.uiTitle) { this.uiTitle.style.fontWeight = 'normal'; this.uiTitle.style.fontSize = '24px'; this.uiTitle.style.letterSpacing = '1px'; }
            if(this.uiText) { this.uiText.style.opacity = '0.9'; this.uiText.style.fontSize = '18px'; }
        }

        this.input.keyboard.on('keydown-ESC', () => {
            if (this.activeInteraction) {
                this.notificationClosed = true;
                if(this.uiOverlay) this.uiOverlay.style.display = 'none';
            }
        });

        this.input.on('pointerdown', (pointer) => {
            this.isTouching = true;
            this.touchTarget.set(pointer.worldX, pointer.worldY);
            if (this.activeInteraction) {
                this.notificationClosed = true;
                if(this.uiOverlay) this.uiOverlay.style.display = 'none';
            }
        });

        this.input.on('pointermove', (pointer) => { if (this.isTouching) this.touchTarget.set(pointer.worldX, pointer.worldY); });
        this.input.on('pointerup', () => { this.isTouching = false; this.player.setVelocity(0); });
        
        if (DEBUG_MODE) this.debugText = this.add.text(10, 10, 'Cursor: 0, 0', { font: '16px Courier', fill: '#00ff00', backgroundColor: '#000000' }).setDepth(100);
    }

    changeCatDirection() {
        let directions = ['left', 'right', 'up', 'down', 'idle', 'idle'];
        
        if (this.cat.body.blocked.left || this.cat.body.touching.left) directions = directions.filter(d => d !== 'left');
        if (this.cat.body.blocked.right || this.cat.body.touching.right) directions = directions.filter(d => d !== 'right');
        if (this.cat.body.blocked.up || this.cat.body.touching.up) directions = directions.filter(d => d !== 'up');
        if (this.cat.body.blocked.down || this.cat.body.touching.down) directions = directions.filter(d => d !== 'down');
        if (directions.length === 0) directions = ['idle'];

        const currentMove = Phaser.Utils.Array.GetRandom(directions);
        const speed = 25;

        if (currentMove === 'left') { 
            this.cat.setVelocity(-speed, 0); 
            this.cat.setFlipX(true); 
            this.cat.anims.play('cat-run', true); 
        } else if (currentMove === 'right') { 
            this.cat.setVelocity(speed, 0); 
            this.cat.setFlipX(false); 
            this.cat.anims.play('cat-run', true); 
        } else if (currentMove === 'up') { 
            this.cat.setVelocity(0, -speed); 
            this.cat.anims.play('cat-run', true); 
        } else if (currentMove === 'down') { 
            this.cat.setVelocity(0, speed); 
            this.cat.anims.play('cat-run', true); 
        } else { 
            this.cat.setVelocity(0, 0); 
            this.cat.anims.play('cat-idle', true); 
            
            const catMessages = [
                "*Purrrrrr*\n\n(She leans into your hand)",
                "*Meow!*\n\n(She demands a code review)",
                "*Blink*\n\n(She is silently judging your CSS)",
                "*Stretch*\n\n(She ignores you completely)",
                "*Yawn*\n\n(She looks for a sunbeam to sleep in)"
            ];
            this.currentCatText = Phaser.Utils.Array.GetRandom(catMessages);
        }
    }

    update() {
        if (DEBUG_MODE) {
            let pointer = this.input.activePointer;
            this.debugText.setText(`X: ${Math.round(pointer.worldX)}, Y: ${Math.round(pointer.worldY)}`);
        }

        if (!this.cat.isInteracting && ((this.cat.body.velocity.x < 0 && this.cat.body.blocked.left) || (this.cat.body.velocity.x > 0 && this.cat.body.blocked.right) || (this.cat.body.velocity.y < 0 && this.cat.body.blocked.up) || (this.cat.body.velocity.y > 0 && this.cat.body.blocked.down))) {
            this.changeCatDirection();
        }

        this.player.setVelocity(0);
        let moving = false;

        if (this.cursors.left.isDown) { this.player.setVelocityX(-100); this.player.anims.play('walk-left', true); moving = true; } 
        else if (this.cursors.right.isDown) { this.player.setVelocityX(100); this.player.anims.play('walk-right', true); moving = true; }
        if (this.cursors.up.isDown) { this.player.setVelocityY(-100); this.player.anims.play('walk-up', true); moving = true; } 
        else if (this.cursors.down.isDown) { this.player.setVelocityY(100); this.player.anims.play('walk-down', true); moving = true; }

        if (this.isTouching && !moving) {
            const dx = this.touchTarget.x - this.player.x;
            const dy = this.touchTarget.y - this.player.y;
            const angle = Math.atan2(dy, dx);
            this.player.setVelocity(Math.cos(angle) * 75, Math.sin(angle) * 75);
            if (Math.abs(dx) > Math.abs(dy)) this.player.anims.play(dx > 0 ? 'walk-right' : 'walk-left', true);
            else this.player.anims.play(dy > 0 ? 'walk-down' : 'walk-up', true);
            moving = true;
        }

        if (!moving) this.player.anims.stop();

        let isNearAnyIcon = false;

        [this.cv, this.projects, this.mail].forEach(icon => {
            let dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, icon.x, icon.y);
            
            if (dist < 25) {
                isNearAnyIcon = true;
                icon.setTint(0xffffff); 
                
                if (!icon.isHovered) {
                    icon.setScale(1); 
                }
                
                this.actionPrompt.setVisible(true);
                this.actionPrompt.setPosition(icon.x, icon.y - 35 - Math.sin(this.time.now / 200) * 4);
            } else {
                icon.clearTint();
                if (!icon.isHovered) {
                    icon.setScale(1.0);
                }
            }
        });

        if (!isNearAnyIcon) {
            this.actionPrompt.setVisible(false);
        }

        // --- INTERACTION OVERLAPS ---
        let previousInteraction = this.activeInteraction;
        
        this.activeInteraction = null;
        this.cat.isInteracting = false; 

        this.physics.world.overlap(this.player, this.cv, () => this.activeInteraction = 'cv');
        this.physics.world.overlap(this.player, this.projects, () => this.activeInteraction = 'projects');
        this.physics.world.overlap(this.player, this.mail, () => this.activeInteraction = 'mail');
        
        this.physics.world.overlap(this.player, this.cat, () => {
            
            if (previousInteraction !== 'cat') {
                const catMessages = [
                    "*Purrrrrr*\n\n(She leans into your hand)",
                    "*Meow!*\n\n(She demands a code review)",
                    "*Blink*\n\n(She is silently judging your CSS)",
                    "*Stretch*\n\n(She ignores you completely)",
                    "*Yawn*\n\n(She looks for a sunbeam to sleep in)"
                ];
                this.currentCatText = Phaser.Utils.Array.GetRandom(catMessages);
            }

            this.activeInteraction = 'cat';
            this.cat.isInteracting = true; 
            this.cat.setVelocity(0, 0);    
            this.cat.anims.play('cat-idle', true);         
        });

        // --- CAT FLOATING TEXT LOGIC ---
        // Only show if she is idle AND the player is NOT currently interacting with her
        if (this.cat.anims.currentAnim && this.cat.anims.currentAnim.key === 'cat-idle' && this.activeInteraction !== 'cat') {
            this.catSpeech.setText(this.currentCatText);
            this.catSpeech.setPosition(this.cat.x, this.cat.y - 20); 
            this.catSpeech.setVisible(true);
        } else {
            this.catSpeech.setVisible(false);
        }

        // --- UI DISPLAY ---
        if (this.activeInteraction) {
            if (!this.notificationClosed && this.uiOverlay) {
                this.uiOverlay.style.display = 'block';
                if (this.activeInteraction === 'cv') {
                    this.uiTitle.innerText = "Resume & CV";
                    this.uiText.innerText = "My professional journey so far.";
                    if (this.uiLinkContainer) this.uiLinkContainer.innerHTML = `<a href="https://www.linkedin.com/in/nikolaos-gkizis-chatziantoniou-121b83208/" target="_blank" class="action-btn">View LinkedIn</a>`;
                } else if (this.activeInteraction === 'projects') {
                    this.uiTitle.innerText = "Projects";
                    this.uiText.innerText = "Games, apps, and source code.";
                    if (this.uiLinkContainer) this.uiLinkContainer.innerHTML = `<a href="https://github.com/nickgkizis" target="_blank" class="action-btn">Visit GitHub</a>`;
                } else if (this.activeInteraction === 'mail') {
                    this.uiTitle.innerText = "Contact";
                    this.uiText.innerText = "Drop a line! Let's build something.";
                    if (this.uiLinkContainer) this.uiLinkContainer.innerHTML = `<a href="mailto:nikolaosgkizis@gmail.com" class="action-btn">Send Email</a>`;
                } else if (this.activeInteraction === 'cat') {
                    this.uiTitle.innerText = "Grey Cat";
                    this.uiText.innerText = this.currentCatText; 
                    if (this.uiLinkContainer) this.uiLinkContainer.innerHTML = '';
                }
            }
        } else {
            this.notificationClosed = false;
            if (this.uiOverlay) this.uiOverlay.style.display = 'none';
        }
    }
}

const config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    parent: 'game-container',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 800, height: 600 },
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: DEBUG_MODE } },
    scene: [MainScene]
};

const game = new Phaser.Game(config);