// entities the player is aware of and their associated updates

class LocalEntities {
    constructor(player) {
        this.player = player;

        // side length of the square for entity viewports
        this.viewports = {
            players: 16,
            npcs: 16,
            gameObjects: 48,
            wallObjects: 48,
            groundItems: 48
        };

        // all the entities player is currently aware of
        this.known = {
            players: new Set(),
            npcs: new Set(),
            gameObjects: new Set(),
            wallObjects: new Set(),
            groundItems: new Set()
        };

        // entities player will know about next tick
        this.added = {
            players: new Set(),
            npcs: new Set(),
            gameObjects: new Set(),
            wallObjects: new Set(),
            groundItems: new Set()
        };

        // entity instances player can't see anymore
        this.removed = {
            players: new Set(),
            npcs: new Set(),
            gameObjects: new Set(),
            wallObjects: new Set(),
            groundItems: new Set()
        };

        // characters that have changed position
        this.moved = {
            players: new Set(),
            npcs: new Set()
        };

        // used when character changes sprite angle but not direction (for
        // entering combat or facing a different direction)
        this.spriteChanged = {
            players: new Set(),
            npcs: new Set()
        };

        this.characterUpdates = {
            playerAppearances: [],
            playerChat: [],
            playerBubbles: [],
            playerHits: [],
            npcChat: [],
            npcHits: [],
            projectiles: []
        };
    }

    // used when world wants to add an entity that may or may not be in our
    // viewport
    add(type, entity) {
        if (entity.withinRange(this.player, this.viewports[type])) {
            if (type === 'groundItems') {
                if (entity.owner && entity.owner !== this.player.id) {
                    return;
                }

                // add gameobjects before the grounditem so they appear on top
                const [gameObject] = this.player.world.gameObjects.getAtPoint(
                    entity.x,
                    entity.y
                );

                if (gameObject && !this.known.gameObjects.has(gameObject)) {
                    this.add('gameObjects', gameObject);
                }
            }

            this.added[type].add(entity);
        }
    }

    // used for teleporting or going up/down stairs
    clear() {
        for (const type of Object.keys(this.known)) {
            for (const entity of this.known[type]) {
                this.removed[type].add(entity);
            }
        }
    }

    // mark out-of-range entities as removed and queue new ones
    updateNearby(type) {
        for (const entity of this.known[type]) {
            if (!entity.withinRange(this.player, this.viewports[type])) {
                this.removed[type].add(entity);
            }
        }

        for (const entity of this.player.getNearbyEntities(
            type,
            this.viewports[type]
        )) {
            if (!this.known[type].has(entity)) {
                this.add(type, entity);

                if (type === 'players') {
                    this.characterUpdates.playerAppearances.push(
                        entity.getAppearanceUpdate()
                    );
                }
            }
        }
    }

    // move entities from added to known, and clear removed from known
    updateKnown(type) {
        for (const entity of this.added[type]) {
            this.known[type].add(entity);
        }

        this.added[type].clear();

        for (const entity of this.removed[type]) {
            this.known[type].delete(entity);
        }

        this.removed[type].clear();
    }

    // format the message for sendRegionEntity
    formatAdded(type) {
        const added = [];

        for (const entity of this.added[type]) {
            const { offsetX, offsetY } = this.player.getEntityOffsets(entity);

            added.push({
                index: entity.index,
                x: offsetX,
                y: offsetY,
                sprite: entity.direction,
                id: entity.id,
                direction: entity.direction
            });
        }

        return added;
    }

    // format the message for sendRegionNPCs and sendRegionPlayers
    formatKnownCharacters(type) {
        const known = [];

        for (const entity of this.known[type]) {
            if (this.removed[type].has(entity)) {
                known.push({ removing: true });
            } else if (this.moved[type].has(entity)) {
                known.push({
                    moved: true,
                    sprite: entity.direction
                });
            } else if (this.spriteChanged[type].has(entity)) {
                known.push({ spriteChanged: true, sprite: entity.direction });
            } else {
                known.push({});
            }
        }

        return known;
    }

    // send the positions of this player and the new/removed players
    sendRegionPlayers() {
        this.player.send({
            type: 'regionPlayers',
            player: {
                x: this.player.x,
                y: this.player.y,
                sprite: this.player.direction
            },
            adding: this.formatAdded('players'),
            known: this.formatKnownCharacters('players')
        });

        this.updateKnown('players');

        this.moved.players.clear();
        this.spriteChanged.players.clear();
    }

    // send updates regarding the currently known player entities
    sendRegionPlayerUpdate() {
        const updates = this.characterUpdates;

        if (
            !updates.playerAppearances.length &&
            !updates.playerChat.length &&
            !updates.playerHits.length &&
            !updates.playerBubbles.length &&
            !updates.projectiles.length
        ) {
            return;
        }

        const { world } = this.player;

        this.player.send({
            type: 'regionPlayerUpdate',
            bubbles: updates.playerBubbles,
            chats: updates.playerChat,
            hits: updates.playerHits,
            projectiles: updates.projectiles,
            appearances: updates.playerAppearances
        });

        world.nextTick(() => {
            updates.playerBubbles.length = 0;
            updates.playerChat.length = 0;
            updates.playerAppearances.length = 0;
            updates.playerHits.length = 0;
            updates.projectiles.length = 0;
        });
    }

    // send the position of new and removed NPCs
    sendRegionNPCs() {
        this.player.send({
            type: 'regionNPCs',
            adding: this.formatAdded('npcs'),
            known: this.formatKnownCharacters('npcs')
        });

        for (const addedNPC of this.added.npcs) {
            addedNPC.knownPlayers.add(this.player);
        }

        for (const removedNPC of this.removed.npcs) {
            removedNPC.knownPlayers.delete(this.player);
        }

        this.updateKnown('npcs');
        this.moved.npcs.clear();
        this.spriteChanged.npcs.clear();
    }

    sendRegionNPCUpdates() {
        const updates = this.characterUpdates;

        if (!updates.npcChat.length && !updates.npcHits.length) {
            return;
        }

        const { world } = this.player;

        this.player.send({
            type: 'regionNPCUpdate',
            chats: updates.npcChat,
            hits: updates.npcHits
        });

        world.nextTick(() => {
            updates.npcChat.length = 0;
            updates.npcHits.length = 0;
        });
    }

    sendRegionObjects() {
        if (!this.added.gameObjects.size && !this.removed.gameObjects.size) {
            return;
        }

        const removing = [];

        for (const gameObject of this.removed.gameObjects) {
            const { offsetX, offsetY } = this.player.getEntityOffsets(
                gameObject
            );

            removing.push({ x: offsetX, y: offsetY });
        }

        this.player.send({
            type: 'regionObjects',
            removing,
            adding: this.formatAdded('gameObjects')
        });

        this.updateKnown('gameObjects');
    }

    sendRegionWallObjects() {
        if (!this.added.wallObjects.size && !this.removed.wallObjects.size) {
            return;
        }

        this.player.send({
            type: 'regionWallObjects',
            removing: [],
            adding: this.formatAdded('wallObjects')
        });

        this.updateKnown('wallObjects');
    }

    sendRegionGroundItems() {
        if (!this.added.groundItems.size && !this.removed.groundItems.size) {
            return;
        }

        const removing = [];

        for (const groundItem of this.removed.groundItems) {
            const { offsetX, offsetY } = this.player.getEntityOffsets(
                groundItem
            );

            removing.push({ id: groundItem.id, x: offsetX, y: offsetY });
        }

        this.player.send({
            type: 'regionGroundItems',
            removing,
            adding: this.formatAdded('groundItems')
        });

        this.updateKnown('groundItems');
    }

    sendRegions() {
        this.sendRegionPlayers();
        this.sendRegionObjects();
        this.sendRegionWallObjects();
        this.sendRegionNPCs();
        this.sendRegionNPCUpdates();
        this.sendRegionGroundItems();
        this.sendRegionPlayerUpdate();
    }
}

module.exports = LocalEntities;
