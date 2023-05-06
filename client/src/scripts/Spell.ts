// scenes
import { Game } from "../scenes/Game";

// components
import { Enemy } from "./Enemy";
import Utility from "./Utility";

export class Spell extends Phaser.Physics.Matter.Sprite {
	// id
	spellID: string;

	// visual
	depth: number = 11;

	// stats
	speed!: number;
	lifespan!: number;
	state: number = 0;
	damage: number;

	constructor(scene: Game, x: number, y: number, spellID: string) {
		// get spell data
		let spellData = scene.cache.json.get("game").spells;

		// pass values
		super(scene.matter.world, x, y, spellData[spellID].texture);

		// save values
		this.scene = scene;
		this.x = x;
		this.y = y;
		this.spellID = spellID;
		this.lifespan = spellData[spellID].lifespan;
		this.speed = spellData[spellID].speed;
		this.damage = spellData[spellID].damage;

		// trigger collisions, but don't actually collide
		this.setSensor(true);

		// detect specific collisions
		this.setOnCollide(
			(entities: Phaser.Types.Physics.Matter.MatterCollisionData) => {
				// if not active, ignore
				if (!this.active || !this.visible) return;

				// collided with enemy
				if (entities.bodyA.gameObject instanceof Enemy) {
					this.collideEnemy(entities.bodyA);
				}
				// collided with wall
				else if (
					entities.bodyA.gameObject instanceof
					Phaser.Physics.Matter.TileBody
				) {
					this.collideWall();
				}
			}
		);

		// set depth (renders under/over other sprites)
		this.setDepth(this.depth);

		// rotate with camera rotation
		scene.fixedObjectsGroup.add(this);

		// hide
		this.hide();

		// events
		scene.matter.world.on("afterupdate", this.afterupdate, this);
		this.once("destroy", this.onDestroy, this);
	}

	// runs on spells after physics have been applied
	afterupdate() {
		let delta = this.scene.matter.world.getDelta();
		if (this.state > 0) {
			// lower lifespan
			this.state -= delta;

			// hide spell when its reached the end of its lifespan
			if (this.state <= 0) {
				// reset velocity
				this.setPosition(this.x, this.y);
				this.setVelocity(0, 0);

				// pop
				this.pop();
			}
		}
	}

	onDestroy() {
		// remove listeners
		this.scene.matter.world.removeListener(
			"afterupdate",
			this.afterupdate,
			this
		);
	}

	// fire spell towards given coords
	fire(
		originX: number,
		originY: number,
		destinationX: number,
		destinationY: number
	) {
		// reset velocity
		this.setPosition(originX, originY);
		this.setVelocity(0, 0);

		// get angle
		let angle = Phaser.Math.Angle.Between(
			originX,
			originY,
			destinationX,
			destinationY
		);

		// get vector
		let vector = this.scene.matter.vector.rotate(
			new Phaser.Math.Vector2(this.speed, 0),
			angle
		);

		// apply force
		this.applyForce(vector as Phaser.Math.Vector2);

		// reset lifespan
		this.setState(this.lifespan);

		// reset to normal look
		this.setFrame(0);

		// show spell
		this.show();
	}

	// collided with enemy
	collideEnemy(enemyBody: MatterJS.BodyType) {
		// sfx
		this.scene.sound.play(
			this.scene.cache.json.get("game").spells[this.spellID].sounds
				.success,
			{ detune: Utility.random.int(-300, 300) }
		);

		// get enemy
		let enemy: Enemy = enemyBody.gameObject;

		// damage enemy
		enemy.changeHealth(-this.damage);

		// DEBUG
		console.log("Collided with Enemy: " + enemy.name);

		// hide spell
		this.pop();
	}

	// collided with wall
	collideWall() {
		// sfx
		this.scene.sound.play(
			this.scene.cache.json.get("game").spells[this.spellID].sounds.fail,
			{ detune: Utility.random.int(-300, 300) }
		);

		// DEBUG
		console.log("Collided with Wall");

		// hide spell
		this.pop();
	}

	// spell has collided/ended
	pop() {
		// change to popped look
		this.setFrame(1);

		// stop movement
		this.setVelocity(0, 0);

		setTimeout(() => {
			this.hide();
		}, 80);
	}

	// show and activate spell
	show() {
		this.setActive(true);
		this.setVisible(true);
	}

	// hide and de-activate spell
	hide() {
		this.setActive(false);
		this.setVisible(false);
	}
}

// group of spells. its better to spawn a ton of spells, hide them all, then show them one at a time as needed and hide them again when done.
export class Spells extends Phaser.GameObjects.Group {
	spellID: string;

	constructor(scene: Game, spellID: string) {
		// get spell data
		let spellData = scene.cache.json.get("game").spells;

		// pass values
		super(scene);

		// save values
		this.scene = scene;
		this.spellID = spellID;

		// create spells and hide them
		this.createMultiple({
			quantity: 10,
			key: spellData[spellID].texture,
			setOrigin: { x: 0.5, y: 0.5 },
			setScale: {
				x: spellData[spellID].scale,
				y: spellData[spellID].scale,
			},
			active: false,
			visible: false,
			classType: Spell,
		});
	}

	// fire spell. this finds a hidden spell and fires it.
	fire(
		originX: number,
		originY: number,
		destinationX: number,
		destinationY: number
	) {
		// find hidden spell
		let spell: Spell = this.getFirstDead();

		// found spell
		if (spell) {
			// sfx
			this.scene.sound.play(
				this.scene.cache.json.get("game").spells[this.spellID].sounds
					.start,
				{ detune: Utility.random.int(-300, 300) }
			);

			// fire
			spell.fire(originX, originY, destinationX, destinationY);
		}
	}
}
