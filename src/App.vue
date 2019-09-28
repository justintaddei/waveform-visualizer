<template>
  <div id="app">
    <a class="logo" target="_blank" href="http://justintaddei.com">
      <img src="@/assets/logo.png" alt="Justin Taddei's logo" />
    </a>
    <h1>Waveform Visualizer</h1>
    <h2>Master settings</h2>
    <div class="flex">
      <label>
        Height
        <input type="number" v-model="height" placeholder="Canvas height" />
      </label>
      <label>
        Scale
        <input type="number" v-model="scale" placeholder="Scale" />
      </label>
      <div class="switches">
        <label class="switch">
          <input hidden type="checkbox" v-model="grid" />
          <div class="thumb"></div>
          <span>Grid {{ grid ? "enabled" : "disabled" }}</span>
        </label>
        <label class="switch">
          <input hidden type="checkbox" v-model="showWaves" />
          <div class="thumb"></div>
          <span>Waveform display {{ showWaves ? "enabled" : "disabled" }}</span>
        </label>
        <label class="switch">
          <input hidden type="checkbox" v-model="showSum" />
          <div class="thumb"></div>
          <span>Waveform sum {{ showSum ? "enabled" : "disabled" }}</span>
        </label>
      </div>
    </div>
    <hr />
    <h2>Waveform settings</h2>
    <ul>
      <li class="wave" v-if="!waves.length">
        No waves created yet
      </li>
      <li class="wave" v-for="(wave, i) in waves" :key="wave._id">
        <select v-model="wave.type">
          <option value="sin">Sine</option>
          <option value="cos">Cosine</option>
        </select>
        <label>
          <span>Wavelength</span>
          <input
            min="0.01"
            step="0.01"
            type="number"
            v-model.number="wave.wavelength"
            placeholder="Wavelength"
          />
        </label>
        <label>
          <span>Amplitude</span>
          <input
            min="0.01"
            step="0.01"
            type="number"
            v-model.number="wave.amplitude"
            placeholder="Amplitude"
          />
        </label>
        <label>
          <span>Phase</span>
          <input
            step="1"
            type="number"
            v-model.number="wave.phase"
            placeholder="Phase"
          />
        </label>
        <svg
          @click="waves.splice(i, 1)"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
          />
        </svg>
      </li>
      <li>
        <button
          @click="
            waves.push({
              amplitude: 1,
              wavelength: 1,
              phase: 0,
              type: 'sin',
              _id: Date.now()
            })
          "
        >
          New wave
        </button>
      </li>
    </ul>
    <canvas></canvas>

    <div class="small">
      Created by
      <a target="_blank" href="http://justintaddei.com">Justin Taddei</a>
    </div>
  </div>
</template>

<script>
import { Vector } from "jraw.js/releases/esnext/js/Vector.js";
import Jraw from "jraw.js";

export default {
  name: "app",

  data() {
    return {
      canvas: undefined,
      /**
       * @type Jraw
       */
      jraw: undefined,
      height: 500,
      scale: 100,
      grid: true,
      mouseX: -100,
      mouseY: -100,
      showSum: true,
      showWaves: true,
      waves: [
        {
          amplitude: 1,
          wavelength: 1,
          phase: 0,
          type: "sin",
          _id: Date.now()
        }
      ]
    };
  },

  watch: {
    height() {
      this.resize();
    }
  },

  created() {
    this.animate = this.animate.bind(this);

    document.addEventListener("mousemove", e => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.x - rect.x;
      this.mouseY = e.y - rect.y;
    });

    window.addEventListener("resize", () => this.resize());
  },

  mounted() {
    this.canvas = document.querySelector("canvas");
    this.jraw = new Jraw(this.canvas);

    this.resize();

    this.jraw.animation = this.animate;
    this.jraw.startAnimation();
  },

  beforeDestroy() {
    this.jraw.stopAnimation();
  },

  methods: {
    resize() {
      this.jraw.resizeCanvas(
        this.canvas.getBoundingClientRect().width,
        this.height
      );
    },

    animate() {
      this.jraw.clear();

      this.drawGrid();

      const yOffset = this.jraw.height / 2;

      const yPoints = [];

      for (let i = 0, l = this.waves.length; i < l; i++) {
        this.jraw.newPath();
        const wave = this.waves[i];

        for (let x = 1, w = this.jraw.width; x < w; x++) {
          let y;
          if (wave.type === "sin") {
            y =
              Math.sin(
                (x / this.scale + wave.phase * 0.017453292519943295) /
                  wave.wavelength
              ) *
              this.scale *
              wave.amplitude;
          } else {
            y =
              (Math.cos(x / this.scale + wave.phase * 0.017453292519943295) /
                -wave.wavelength) *
              this.scale *
              wave.amplitude;
          }

          if (this.showWaves)
            if (x === 0) this.jraw.moveTo(x, yOffset + y);
            else this.jraw.lineTo(x, yOffset + y);

          if (!yPoints[x]) yPoints[x] = 0;
          yPoints[x] += y;
        }

        if (this.showWaves) this.jraw.stroke("#fafafa");
      }

      this.jraw.newPath();

      if (this.showSum) {
        for (let x = 0; x < this.jraw.width; x++) {
          if (x === 0) {
            this.jraw.moveTo(x, yOffset + yPoints[x]);
          } else {
            this.jraw.lineTo(x, yOffset + yPoints[x]);
          }
        }
        this.jraw.stroke("#29ADC5");
      }

      this.drawMouse();
    },

    drawGrid() {
      if (!this.grid) return;

      this.jraw
        .line(0, this.jraw.height / 2, this.jraw.width, this.jraw.height / 2)
        .stroke("#d55fde");

      for (let x = 0; x < this.jraw.width; x += Math.PI / 4) {
        this.jraw
          .line(x * this.scale, 0, x * this.scale, this.jraw.height)
          .stroke("rgba(255,255,255,0.2)");

        this.jraw.setFont("15px sans-serif");
        this.jraw.setFill("#aaa");
        this.jraw.context.fillText(
          `${parseFloat((x / 3.14).toFixed(2))}π`,
          x * this.scale + 2,
          this.jraw.height - 10
        );
      }

      const yScale = -Math.floor(this.jraw.height / this.scale);
      const startY = this.scale * yScale;

      for (let y = startY; y < this.jraw.height; y += this.scale / 2) {
        this.jraw
          .line(
            0,
            this.jraw.height / 2 + y,
            this.jraw.width,
            this.jraw.height / 2 + y
          )
          .stroke("rgba(255,255,255,0.2)");

        this.jraw.setFont("15px sans-serif");
        this.jraw.setFill("#bbb");

        this.jraw.context.fillText(
          (y / this.scale) * -1,
          10,
          this.jraw.height / 2 + y + 2
        );
      }
    },

    drawMouse() {
      this.jraw.line(this.mouseX, 0, this.mouseX, this.jraw.height);
      this.jraw.stroke("#41B883");
      this.jraw.line(0, this.mouseY, this.jraw.width, this.mouseY);
      this.jraw.stroke("#41B883");

      this.jraw.setFont("bold 20px sans-serif");
      this.jraw.setFill("#fff");

      const y = -parseFloat(
        (Math.round(this.mouseY - this.jraw.height / 2) / this.scale).toFixed(2)
      );

      this.jraw.context.fillText(
        `(${parseFloat((this.mouseX / this.scale / 3.14).toFixed(2))}π, ${y})`,
        this.mouseX + 20,
        this.mouseY - 20
      );
    }
  }
};
</script>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
  color: #fafafa;
  background: #35495e;
  background: #282c34;
}

.small {
  margin: 30px 0 50px 0;
  font-size: 25px;
  opacity: 0.25;
  transition: opacity 0.5s;
  cursor: default;
  &:hover {
    opacity: 1;
  }
  a {
    color: #fff;
    text-decoration: none;
    border-bottom: 1px solid #fff;
    &:hover {
      opacity: 0.7;
    }
  }
}

.logo {
  display: block;
  position: absolute;
  top: -200px;
  left: -200px;
  width: 400px;
  height: 400px;
  transform: rotate(45deg);
  display: flex;
  justify-content: center;
  align-items: center;
  background: #41b883;
  transition: transform 0.2s ease;

  &:hover {
    transform: rotate(45deg) scale(1.2);
  }

  img {
    transform: translate(100px, 0) rotate(-45deg);
    top: 20px;
    left: 20px;
    width: 100px;
  }
}

.flex {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 20px;
  label {
    margin: 5px 0;
  }
}

hr {
  border: 0;
  width: 75%;
  height: 2px;
  margin: 16px auto;
  background: #35495e;
}

canvas {
  background: #21252b;
  margin: 24px 0;
  width: 100%;
}

input[type="number"] {
  background: #35495e;
  border: none;
  padding: 0 16px;
  border-radius: 17px;
  width: 100px;
  outline: none;
  color: #fafafa;
  font-size: 20px;
  margin: 10px;
  height: 35px;

  &:focus {
    // box-shadow: 0 0 5px 0 #29adc5;
    color: #29adc5;
  }
}

.switch {
  height: 35px;
  padding: 0 16px;
  border-radius: 17px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #41b883;
  position: relative;
  overflow: hidden;
  cursor: pointer;

  .thumb {
    content: "";
    position: absolute;
    display: block;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    transition: transform 0.3s ease;
    transform: none;
    background: #ef596f;
  }

  span {
    position: relative;
  }

  input:checked + .thumb {
    transform: translate(-100%, 0);
  }
}

button {
  height: 45px;
  background: #35495e;
  color: #fafafa;
  font-size: 20px;
  padding: 0 16px;
  border-radius: 17px;
  border: 0;
  cursor: pointer;
  outline: none;

  &:hover {
    background: #41b883;
  }
}

select {
  @extend button;
  position: relative;
  height: 35px;
  padding: 0 16px;
  appearance: none;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;

  li.wave {
    display: flex;
    width: 50%;
    justify-content: center;
    align-items: center;
    margin: 16px auto;
    border-radius: 17px;
    padding: 16px;
    border: 2px solid #29adc5;
    min-width: 800px;

    > * {
      margin: 0 16px;
    }
    label {
      display: inline-flex;
      flex-direction: column;
    }

    svg {
      width: 40px;
      height: 40px;
      cursor: pointer;
      fill: #29adc5;
      &:hover {
        fill: #ef596f;
      }
    }
  }
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>
