// imports
import Phaser from "phaser";

// plugins
import SoundFade from "phaser3-rex-plugins/plugins/soundfade";

// internal
import { Head } from "./Head";

/**
 * General mechanics that are common to main scenes.
 */
export class Core extends Phaser.Scene {
	sceneHead!: Head;
	music: Phaser.Sound.WebAudioSound | undefined = undefined;

	constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
		super(config);
	}

	init(data: sceneData | gameSceneData) {
		// save head scene
		this.sceneHead = data.sceneHead;

		// save as current main scene
		data.sceneHead.sceneMain = this;
	}

	preload() {
		// turn off default debug lines when game first launches
		this.matter.world.drawDebug = false;

		// reset average fps
		this.game.loop.resetDelta();

		// update event
		this.events.on("update", this.detectMenu, this);

		// shutdown event
		this.events.once("shutdown", this.shutdown, this);
	}

	detectMenu() {
		// open pause menu
		if (
			this.sceneHead.playerInput.interaction_mapped.pressed.includes(
				"SELECT"
			)
		)
			this.launchMenuOverlay();
	}

	shutdown() {
		// remove listeners
		this.events.removeListener("update", this.detectMenu, this);

		// fade out music
		if (this.music) SoundFade.fadeOut(this.music, 500);
	}

	playMusic(title: string) {
		// set up audio
		this.sound.pauseOnBlur = false;
		this.music = this.sound.add(title, {
			loop: true,
			volume: this.sceneHead.audio.music.volume.value,
			mute: !this.sceneHead.audio.music.volume.value,
		}) as Phaser.Sound.WebAudioSound;

		// fade music in
		SoundFade.fadeIn(
			this.music,
			500,
			this.sceneHead.audio.music.volume.value
		);
	}

	launchMenuOverlay() {
		// pause current scene
		this.scene.pause();

		// sfx
		this.sound.play("ui_open", {
			volume: this.sceneHead.audio.sfx.volume.value,
		});

		// launch pause menu
		this.scene.launch("Pause", {
			sceneHead: this.sceneHead,
			scenePaused: this,
		});
	}

	changeScene(
		scene: string,
		data?: sceneData | gameSceneData | overlaySceneData
	) {
		// stop scene
		this.scene.stop();

		// start next scene
		this.scene.start(scene, data);
	}
}
