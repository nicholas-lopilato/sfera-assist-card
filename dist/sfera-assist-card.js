/**
 * Sfera Assist Card
 * A mesmerizing neural sphere that reacts to your voice assistant state.
 * https://github.com/YOUR_USERNAME/sfera-assist-card
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';

const CARD_VERSION = '1.0.0';

/* =====================================================================
   EDITOR CARD — UI configurabile da Lovelace
===================================================================== */
class SferaAssistCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass || this._rendered) return;
    this._rendered = true;

    this.innerHTML = `
      <style>
        .editor-row {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          font-family: var(--primary-font-family, sans-serif);
        }
        .editor-row label {
          font-size: 12px;
          font-weight: 500;
          color: var(--secondary-text-color);
          margin-bottom: 4px;
          display: block;
          letter-spacing: 0.5px;
        }
        .editor-row select,
        .editor-row input[type="number"],
        .editor-row input[type="text"] {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 6px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color);
          font-size: 14px;
          box-sizing: border-box;
        }
        .editor-section-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--primary-text-color);
          border-bottom: 1px solid var(--divider-color, #eee);
          padding-bottom: 6px;
          margin-top: 4px;
        }
        .editor-hint {
          font-size: 11px;
          color: var(--secondary-text-color);
          margin-top: 4px;
        }
        .editor-row .states-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
      </style>
      <div class="editor-row">
        <div class="editor-section-title">Entità</div>

        <div>
          <label>Entità sensore stato assistente *</label>
          <select id="entity">
            <option value="">— seleziona un'entità —</option>
            ${Object.keys(this._hass.states)
              .sort()
              .map(e => `<option value="${e}" ${e === this._config?.entity ? 'selected' : ''}>${e}</option>`)
              .join('')}
          </select>
          <div class="editor-hint">L'entità il cui stato guida l'animazione della sfera (es. sensor.stato_satelliti_voce)</div>
        </div>

        <div class="editor-section-title">Valori degli stati</div>
        <div class="editor-hint">Inserisci i valori esatti che l'entità assume per ogni stato. Lascia vuoto per disabilitare quello stato.</div>

        <div class="states-grid">
          <div>
            <label>Stato "idle"</label>
            <input type="text" id="state_idle" placeholder="idle" value="${this._config?.state_idle ?? 'idle'}">
          </div>
          <div>
            <label>Stato "listening"</label>
            <input type="text" id="state_listening" placeholder="listening" value="${this._config?.state_listening ?? 'listening'}">
          </div>
          <div>
            <label>Stato "processing"</label>
            <input type="text" id="state_processing" placeholder="processing" value="${this._config?.state_processing ?? 'processing'}">
          </div>
          <div>
            <label>Stato "responding"</label>
            <input type="text" id="state_responding" placeholder="responding" value="${this._config?.state_responding ?? 'responding'}">
          </div>
        </div>

        <div class="editor-section-title">Aspetto</div>

        <div>
          <label>Altezza card (px)</label>
          <input type="number" id="height" min="150" max="800" step="10" value="${this._config?.height ?? 300}">
        </div>

        <div>
          <label>Colore sfondo</label>
          <select id="bg_color">
            <option value="#000000" ${(this._config?.bg_color ?? '#000000') === '#000000' ? 'selected' : ''}>Nero (default)</option>
            <option value="#0a0a1a" ${this._config?.bg_color === '#0a0a1a' ? 'selected' : ''}>Blu notte</option>
            <option value="#0d0d0d" ${this._config?.bg_color === '#0d0d0d' ? 'selected' : ''}>Antracite</option>
            <option value="transparent" ${this._config?.bg_color === 'transparent' ? 'selected' : ''}>Trasparente</option>
          </select>
        </div>

        <div>
          <label>Mostra etichetta stato</label>
          <select id="show_label">
            <option value="true" ${(this._config?.show_label ?? 'true') == 'true' ? 'selected' : ''}>Sì</option>
            <option value="false" ${this._config?.show_label == 'false' ? 'selected' : ''}>No</option>
          </select>
        </div>
      </div>
    `;

    // Listener per tutti i campi
    const fields = ['entity', 'height', 'bg_color', 'show_label', 'state_idle', 'state_listening', 'state_processing', 'state_responding'];
    fields.forEach(id => {
      this.querySelector(`#${id}`)?.addEventListener('change', () => this._valueChanged());
    });
  }

  _valueChanged() {
    const newConfig = {
      ...this._config,
      entity:          this.querySelector('#entity')?.value,
      height:          parseInt(this.querySelector('#height')?.value) || 300,
      bg_color:        this.querySelector('#bg_color')?.value,
      show_label:      this.querySelector('#show_label')?.value,
      state_idle:      this.querySelector('#state_idle')?.value || 'idle',
      state_listening: this.querySelector('#state_listening')?.value || 'listening',
      state_processing:this.querySelector('#state_processing')?.value || 'processing',
      state_responding:this.querySelector('#state_responding')?.value || 'responding',
    };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: newConfig }, bubbles: true, composed: true }));
  }
}

customElements.define('sfera-assist-card-editor', SferaAssistCardEditor);

/* =====================================================================
   CARD PRINCIPALE
===================================================================== */
class SferaAssistCard extends HTMLElement {

  static getConfigElement() {
    return document.createElement('sfera-assist-card-editor');
  }

  static getStubConfig(hass) {
    // Suggerisce automaticamente la prima entità "sensor." trovata
    const suggestion = Object.keys(hass.states).find(e => e.startsWith('sensor.')) || '';
    return {
      entity: suggestion,
      height: 300,
      bg_color: '#000000',
      show_label: 'true',
      state_idle: 'idle',
      state_listening: 'listening',
      state_processing: 'processing',
      state_responding: 'responding',
    };
  }

  setConfig(config) {
    if (!config.entity) throw new Error('Specifica un\'entità.');
    this.config = {
      height: 300,
      bg_color: '#000000',
      show_label: 'true',
      state_idle: 'idle',
      state_listening: 'listening',
      state_processing: 'processing',
      state_responding: 'responding',
      ...config,
    };
    // Se la card è già nel DOM, aggiorna sfondo e altezza senza rifare tutto
    if (this._card) {
      this._card.style.height = `${this.config.height}px`;
      this._card.style.background = this.config.bg_color;
      this._label && (this._label.style.display = this.config.show_label === 'false' ? 'none' : 'block');
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) this._init();

    const stateObj = hass.states[this.config.entity];
    const rawState = stateObj ? stateObj.state : 'idle';
    this._assistState = this._mapState(rawState);
  }

  _mapState(raw) {
    if (raw === this.config.state_idle)       return 'idle';
    if (raw === this.config.state_listening)  return 'listening';
    if (raw === this.config.state_processing) return 'processing';
    if (raw === this.config.state_responding) return 'responding';
    return 'idle'; // fallback
  }

  getCardSize() {
    return Math.ceil((this.config.height || 300) / 50);
  }

  _init() {
    this._initialized = true;
    this._assistState = 'idle';

    const height = this.config.height || 300;

    const shadow = this.attachShadow({ mode: 'open' });

    const card = document.createElement('ha-card');
    card.style.cssText = `
      overflow: hidden;
      background: ${this.config.bg_color || '#000'};
      border-radius: 12px;
      height: ${height}px;
      position: relative;
    `;
    this._card = card;

    const label = document.createElement('div');
    label.style.cssText = `
      position: absolute;
      bottom: 14px;
      width: 100%;
      text-align: center;
      color: rgba(255,255,255,0.45);
      font-family: 'Courier New', monospace;
      font-size: 11px;
      letter-spacing: 3px;
      text-transform: uppercase;
      z-index: 10;
      pointer-events: none;
      display: ${this.config.show_label === 'false' ? 'none' : 'block'};
    `;
    label.textContent = 'idle';
    this._label = label;

    shadow.appendChild(card);
    card.appendChild(label);

    this._setupThree(card, height);
  }

  _setupThree(container, height) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, (container.clientWidth || 300) / height, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth || 300, height);
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const baseGeometry = new THREE.SphereGeometry(1, 64, 64);
    const positionAttribute = baseGeometry.attributes.position;
    const originalPositions = positionAttribute.array.slice();
    const vertexCount = positionAttribute.count;

    const light1 = new THREE.PointLight(0xffffff, 1);
    light1.position.set(5, 5, 5); scene.add(light1);
    const light2 = new THREE.PointLight(0x00aaff, 1);
    light2.position.set(-5, -5, -5); scene.add(light2);

    const pointsGeometry = new THREE.BufferGeometry();
    const pointsArray = new Float32Array(vertexCount * 3);
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(pointsArray, 3));
    const pointsMaterial = new THREE.PointsMaterial({ color: 0x66ccff, size: 0.03, transparent: true, opacity: 0.85 });
    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);

    const maxConnections = 5;
    const linesGeometry = new THREE.BufferGeometry();
    const linesArray = new Float32Array(vertexCount * maxConnections * 6);
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linesArray, 3));
    const linesMaterial = new THREE.LineBasicMaterial({ color: 0x3399ff, transparent: true, opacity: 0.3 });
    const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(linesMesh);

    let time = 0, pulse = 0, waveTime = 0, respondingPulse = 0, cameraAngle = 0;
    let currentScale = { x: 1, y: 1, z: 1 };
    const noiseScaleBase = 0.03, noiseSpeed = 4;
    const self = this;

    const animate = () => {
      time += 0.01; waveTime += 0.02; pulse += 0.015;

      const assistState = self._assistState || 'idle';
      if (self._label) self._label.textContent = assistState;

      let targetScale = { x: 1, y: 1, z: 1 };
      switch (assistState) {
        case 'listening':  targetScale = { x: 0.8, y: 1.35, z: 0.8 }; break;
        case 'processing': targetScale = { x: 0.65, y: 0.65, z: 0.65 }; break;
        case 'responding':
          respondingPulse += 0.08;
          const p = 1 + Math.sin(respondingPulse) * 0.15;
          targetScale = { x: p, y: p, z: p };
          break;
      }

      currentScale.x += (targetScale.x - currentScale.x) * 0.05;
      currentScale.y += (targetScale.y - currentScale.y) * 0.05;
      currentScale.z += (targetScale.z - currentScale.z) * 0.05;

      for (let i = 0; i < vertexCount; i++) {
        const ix = i * 3, iy = ix + 1, iz = ix + 2;
        const ox = originalPositions[ix], oy = originalPositions[iy], oz = originalPositions[iz];

        let noiseScale = noiseScaleBase;
        if (assistState === 'processing') noiseScale *= 0.3;

        let offset = Math.sin(time * noiseSpeed + ox * 5 + oy * 5) * noiseScale +
                     Math.cos(time * noiseSpeed + oy * 4 + oz * 4) * (noiseScale / 2);
        let wave = Math.sin(waveTime + ox * 8 + oy * 8 + oz * 8) * 0.01;

        let tx, ty, tz;

        if (assistState === 'idle') {
          const rotSpeed = 0.5;
          tx = ox * Math.cos(time * rotSpeed) - oz * Math.sin(time * rotSpeed);
          ty = oy;
          tz = ox * Math.sin(time * rotSpeed) + oz * Math.cos(time * rotSpeed);
        } else if (assistState === 'listening') {
          const subtle = 0.07;
          const w1 = Math.sin(time * 2 + ox * 5 + oy * 5 + oz * 5) * subtle;
          const w2 = Math.cos(time * 3 + ox * 3 + oy * 4) * subtle * 0.5;
          const pp = Math.sin(time * 1.5) * 0.03;
          tx = ox * (1 + w1); ty = oy * (1 + w2 + pp); tz = oz * (1 + w1);
        } else if (assistState === 'responding') {
          const open = 1.5 + Math.sin(time * 8) * 0.5;
          const r1 = Math.sin(time * 10 + ox * 10 + oy * 10) * 0.2;
          const r2 = Math.cos(time * 12 + oy * 8 + oz * 9) * 0.15;
          const swell = Math.sin(time * 6 + ox * 5 + oz * 7) * 0.1;
          tx = ox * open + ox * r1 + ox * r2;
          ty = oy * open + oy * r1 + oy * r2 + swell;
          tz = oz * open + oz * r1 - oz * r2;
        } else {
          tx = (ox + ox * offset + wave) * currentScale.x;
          ty = (oy + oy * offset + wave) * currentScale.y;
          tz = (oz + oz * offset + wave) * currentScale.z;
        }

        const alpha = 0.05;
        positionAttribute.array[ix] += (tx - positionAttribute.array[ix]) * alpha;
        positionAttribute.array[iy] += (ty - positionAttribute.array[iy]) * alpha;
        positionAttribute.array[iz] += (tz - positionAttribute.array[iz]) * alpha;
        pointsArray[ix] = positionAttribute.array[ix];
        pointsArray[iy] = positionAttribute.array[iy];
        pointsArray[iz] = positionAttribute.array[iz];
      }

      positionAttribute.needsUpdate = true;
      pointsGeometry.attributes.position.needsUpdate = true;

      let lp = 0;
      for (let i = 0; i < vertexCount; i++) {
        const ix = i * 3;
        for (let j = i + 1; j < Math.min(i + maxConnections, vertexCount); j++) {
          const jx = j * 3;
          linesArray[lp++] = pointsArray[ix];     linesArray[lp++] = pointsArray[ix + 1]; linesArray[lp++] = pointsArray[ix + 2];
          linesArray[lp++] = pointsArray[jx];     linesArray[lp++] = pointsArray[jx + 1]; linesArray[lp++] = pointsArray[jx + 2];
        }
      }
      linesGeometry.attributes.position.needsUpdate = true;

      switch (assistState) {
        case 'idle':       points.material.color.setHSL(0.55, 0.8, 0.6); linesMesh.material.color.setHSL(0.55, 0.8, 0.5); break;
        case 'listening':  points.material.color.setHSL(0.6, 0.95, 0.7); linesMesh.material.color.setHSL(0.6, 0.95, 0.6); break;
        case 'processing': points.material.color.setHSL(0.75, 0.6, 0.6); linesMesh.material.color.setHSL(0.75, 0.6, 0.5); break;
        case 'responding':
          const h = 0.15 + Math.sin(time * 4) * 0.05;
          points.material.color.setHSL(h, 0.9, 0.6);
          linesMesh.material.color.setHSL(h, 0.8, 0.5);
          break;
      }

      light1.intensity = 1 + Math.sin(pulse) * 0.4;
      light2.intensity = 1 + Math.cos(pulse) * 0.4;

      cameraAngle += 0.0005;
      camera.position.x = Math.sin(cameraAngle) * 3;
      camera.position.z = Math.cos(cameraAngle) * 3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      if (!w) return;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    });
    ro.observe(container);
  }
}

customElements.define('sfera-assist-card', SferaAssistCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'sfera-assist-card',
  name: 'Sfera Assist Card',
  description: 'Una sfera neurale animata che reagisce allo stato del tuo assistente vocale.',
  preview: true,
  documentationURL: 'https://github.com/nicholas-lopilato/sfera-assist-card',
});

console.info(`%c SFERA-ASSIST-CARD %c v${CARD_VERSION} `, 'background:#1a1a2e;color:#66ccff;font-weight:700;', 'background:#66ccff;color:#000;font-weight:700;');
