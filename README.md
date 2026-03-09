# 🔮 Sfera Assist Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/nicholas-lopilato/sfera-assist-card.svg)](https://github.com/nicholas-lopilato/sfera-assist-card/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Una **sfera neurale 3D animata** per Home Assistant che reagisce in tempo reale allo stato del tuo assistente vocale — o di qualsiasi entità sensor.

| idle | listening | processing | responding |
|------|-----------|------------|------------|
| 🔵 Sfera che ruota lentamente | 🔵 Forma viva allungata | 🟣 Sfera compressa | 🟡 Esplosione pulsante |

---

## Installazione tramite HACS (consigliata)

1. Apri HACS → **Frontend** → menu `⋮` → **Repository personalizzati**
2. Aggiungi `https://github.com/nicholas-lopilato/sfera-assist-card` come tipo **Lovelace**
3. Installa **Sfera Assist Card**
4. Ricarica la pagina

## Installazione manuale

1. Scarica `sfera-assist-card.js` dalla [pagina releases](https://github.com/nicholas-lopilato/sfera-assist-card/releases)
2. Copia il file in `/config/www/sfera-assist-card.js`
3. In Home Assistant vai su **Impostazioni → Dashboard → Risorse** e aggiungi:
   - URL: `/local/sfera-assist-card.js`
   - Tipo: `JavaScript Module`
4. Ricarica la pagina

---

## Configurazione

La card è completamente configurabile dall'**editor visuale** di Lovelace. Clicca su *Aggiungi Card* → cerca **Sfera Assist Card**.

### Opzioni YAML

```yaml
type: custom:sfera-assist-card

# Obbligatorio
entity: sensor.stato_assistente_vocale

# Opzionali
height: 300              # Altezza in pixel (default: 300)
bg_color: "#000000"      # Colore sfondo: hex o "transparent"
show_label: "true"       # Mostra etichetta stato: "true" / "false"

# Valori degli stati (personalizzabili per qualsiasi entità)
state_idle: "idle"
state_listening: "listening"
state_processing: "processing"
state_responding: "responding"
```

### Esempio con Wyoming / Assist Pipeline

```yaml
type: custom:sfera-assist-card
entity: sensor.assist_pipeline_state
height: 350
bg_color: "#0a0a1a"
state_idle: "idle"
state_listening: "listening"
state_processing: "processing"
state_responding: "responding"
```

### Esempio con entità generica (es. input_select)

```yaml
type: custom:sfera-assist-card
entity: input_select.voice_state
height: 300
state_idle: "standby"
state_listening: "ascolto"
state_processing: "elaborazione"
state_responding: "risposta"
```

---

## Animazioni per stato

| Stato | Animazione | Colore |
|-------|-----------|--------|
| `idle` | Rotazione lenta, sfera quasi perfetta | 🔵 Azzurro |
| `listening` | Forma viva, allungamento verticale | 🔵 Blu brillante |
| `processing` | Sfera compressa e quasi ferma | 🟣 Viola |
| `responding` | Esplosione, mutaforma caotico | 🟡 Giallo pulsante |

---

## Requisiti

- Home Assistant 2023.x o successivo
- Browser moderno con supporto WebGL

---

## Contribuire

Pull request benvenute! Apri prima una issue per discutere modifiche importanti.

---

## Licenza

MIT — vedi [LICENSE](LICENSE)
