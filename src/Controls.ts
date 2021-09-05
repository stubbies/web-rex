export enum ControlKey {
  UP = 'UP',
  DOWN = 'DOWN',
  JUMP = 'JUMP',
  CROUCH = 'CROUCH'
}

const keysMap = {
  KeyA: ControlKey.UP,
  KeyD: ControlKey.DOWN,
  KeyW: ControlKey.JUMP,
  KeyS: ControlKey.CROUCH,
  ArrowLeft: ControlKey.UP,
  ArrowRight: ControlKey.DOWN,
  ArrowUp: ControlKey.JUMP,
  ArrowDown: ControlKey.CROUCH
}

export default class Controls {
  listener = null;
  keyDown = null;

  constructor() {
    document.addEventListener("keydown", this.handleKeyDown, true);
    document.addEventListener("keyup", this.handleKeyUp, true);
  }

  sendEvent(move: ControlKey, direction: boolean) {
    const event = new CustomEvent("onmove", {
      detail: {
        move,
        direction
      }
    });
    document.dispatchEvent(event);
  }

  remove() {
    document.removeEventListener("keydown", this.handleKeyDown, true);
    document.removeEventListener("keyup", this.handleKeyUp, true);
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (this.keyDown) return;

    this.keyDown = e.code;
    if (keysMap[this.keyDown]) {
      this.sendEvent(keysMap[this.keyDown], true);
    }
  }

  handleKeyUp = (e: KeyboardEvent) => {
    this.keyDown = null;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') {
      this.sendEvent(ControlKey.CROUCH, false);
    }
  }

}
