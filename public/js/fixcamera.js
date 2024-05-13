if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Super Hands component for A-Frame.
 */
AFRAME.registerComponent('fixcamera', {
  enabled: false,
  init: function () {
    if (navigator.userAgent.includes('Chrome') && navigator.userAgent.includes('Windows')) {
        this.enabled = true;
        const sceneEl = this.el.sceneEl;
        this.onEnterVR = AFRAME.utils.bind(this.onEnterVR, this);
        this.onExitVR = AFRAME.utils.bind(this.onExitVR, this);
        sceneEl.addEventListener('enter-vr', this.onEnterVR);
        sceneEl.addEventListener('exit-vr', this.onExitVR);
        if (sceneEl.is('vr-mode')) {
          onEnterVR();
        }
    }
  },
  remove: function () {
    if (this.enabled) {
        const sceneEl = this.el.sceneEl;
        sceneEl.removeEventListener('enter-vr', this.onEnterVR);
        sceneEl.removeEventListener('exit-vr', this.onExitVR);
    }
  },
  onEnterVR: function () {
    this.el.setAttribute('position', '0 -0.9 0');
  },
  onExitVR: function () {
    this.el.setAttribute('position', '0 0 0');
  }
});
