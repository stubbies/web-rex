
export default function animate(callback) {
  let lastTime = 0;
  function loop(time) {
    requestAnimationFrame(loop);
    let deltaTime = lastTime ? (time - lastTime) / 1000 : 0;
      callback(deltaTime);
      lastTime = time;
  }
  requestAnimationFrame(loop);
}
