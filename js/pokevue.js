Vue.component('pokemoncard', {
    props: ['pokemon', 'over', 'smashed'],
    computed: {
        name: function() {
            return this.pokemon.name.substr(0,1).toUpperCase() + this.pokemon.name.substr(1).split("-")[0];
        }
    },
    template: `
    <div class="col-6 col-sm-4 col-md-3 col-lg-2 pokemoncard">
        <div class="border rounded-3 m-1 p-2" :style="(smashed) ? 'background-color: #93ebc4' : ''" @click="$emit('goto', pokemon.id)">
          <img loading="lazy" v-bind:id="'img-' + pokemon.id" class="img img-fluid" :src="pokemon.image">
          <p class="text-center">#{{pokemon.id}}: {{name}}</p>
        </div>
    </div>`,
});

Vue.component('navbar', {
  props:['smash', 'about'],
  template:
  `
  <div class="navbar navbar-light bg-light mb-5">
    <div class="container-fluid">
      <a class="navbar-brand" href="#" @click="$emit('close-smash')">PokeSmash!</a>
      <ul class="navbar-nav">
        <li :class="(about) ? 'bg-secondary nav-item p-1' : 'nav-item p-1'">
          <a class="nav-link" href="#" @click="$emit('toggle-about')" :class="(about) ? 'text-light' : ''">About</a>
        </li>
      </ul>
      <button v-if="smash" class="btn btn-outline-secondary" @click="$emit('close-smash')">X</button>
      <button v-if="smash==false" class="btn btn-warning"@click="$emit('reset')">Reset</button>
    </div>
  </div>
  `
});

Vue.component('pokemonpage', {
  props: ['pokemon'],
  computed: {
    name: function() {
        return this.pokemon.name.substr(0,1).toUpperCase() + this.pokemon.name.substr(1).split("-")[0];
    }
  },
  template:
  `
  <div class="row justify-content-center d-flex">
    <div class="col-12 col-lg-6 d-grid gap-2 mx-auto mb-4">
      <button v-on:click="$emit('next', true)" class="btn btn-outline-success"><h3>Smash!</h3></button>
      <button v-on:click="$emit('next', false)" class="btn btn-outline-danger"><h3>Pass.</h3></button>
    </div>
    <div class="col-12 col-lg-6">
      <div class="row d-flex justify-content-center align-items-center">
        <div class="col-12 col-lg-6 border rounded p-3">
          <img class="img img-fluid" :src="pokemon.image">
          <p>#{{pokemon.id}}: {{name}}</p>
          <div class="row">
            <pokemontype v-for="type in pokemon.types"
                  v-bind:type="type"
                  :key="type.slot">
            </pokemontype>
          </div>
          <p>Height: {{pokemon.height}}</p>
          <p>Weight: {{pokemon.weight}}</p>
        </div>
      </div>
    </div>
  </div>
  `
});

Vue.component('pokemontype', {
  props: ['type'],
  computed: {
    color: function()
    {
      const name = this.type.type.name;
      switch(name)
      {
        case "grass":
          return "#78C850";
        case "normal":
          return "#A8A878";
        case "fire":
          return "#F08030";
        case "water":
          return "#6890F0";
        case "electric":
          return "#F8D030";
        case "ice":
          return "#98D8D8";
        case "fighting":
          return "#C03028";
        case "poison":
          return "#A040A0";
        case "ground":
          return "#E0C068";
        case "flying":
          return "#A890F0";
        case "psychic":
          return "#F85888";
        case "bug":
          return "#A8B820";
        case "rock":
          return "#B8A038";
        case "ghost":
          return "#705898";
        case "dark":
          return "#705848";
        case "dragon":
          return "#7038F8";
        case "steel":
          return "#B8B8D0";
        case "fairy":
          return "#F0B6BC";
      }
    }
  },
  template:
  `
  <div class="col-6 text-center">
    <p class="rounded p-1 text-light" :style="'background-color: ' + color">{{type.type.name}}</p>
  </div>
  `
});

var app = new Vue({
  el: '#app',
  data: {
    pokemondata: [],
    smashdata: new Set(),
    smashdatabase64: "",
    generation: "",
    generationdata: [
      {text: "", value: ""},
      {text: "Gen 1 (Red/Blue)", value: 1},
      {text: "Gen 2 (Gold/Silver)", value: 152},
      {text: "Gen 3 (Ruby/Sapphire)", value: 252},
      {text: "Gen 4 (Diamond/Pearl)", value: 390},
      {text: "Gen 5 (Black/White)", value: 494},
      {text: "Gen 6 (X/Y)", value: 650},
      {text: "Gen 7 (Sun/Moon)", value: 722},
      {text: "Gen 8 (Sword/Shield)", value: 810}
    ],
    smash: false,
    about: false,
    currentpokemon: {},
    over: false,
    smashedamount: 0,
    arbitrary: false
  },
  watch: {
    arbitrary: function() {
      this.smashedamount = this.smashdata.size;
    },
    smash: function() {
      this.smashdatabase64 = this.encodeSmashDataBits();
      this.generation = "";
    }
  },
  computed: {
    smashedPercent: function()
    {
      return (this.smashedamount / this.pokemondata.length * 100).toFixed(2) + "%";
    }
  },
  methods: {
    generatePokemon: async function() {
        //Data cached from pokeapi.co
        return fetch("https://www.cactusdan.com/pages/pokemondata.json")
    .then(response => response.json())
    .then(data => {
        this.pokemondata = data;
        this.loadStorage();
        this.loadCode();
      });
    },
    begin: function() {
      if(this.generation) {
        this.currentpokemon = this.pokemondata[this.generation - 1];
      }
      else if (!this.currentpokemon.id)
      {
        this.currentpokemon = this.pokemondata[0];
      }
      this.smash = true;
    },
    goToPokemon: function(id)
    {
      this.currentpokemon = this.pokemondata[id - 1];
      this.smash = true;
    },
    onNext: function(value)
    {
      this.arbitrary = !this.arbitrary;
      if(value)
      {
        this.smashdata.add(this.currentpokemon.id);
      }else
      {
        this.smashdata.delete(this.currentpokemon.id);
      }

      this.currentpokemon.smashed = value;

      if (this.currentpokemon.id == this.pokemondata.length)
      {
        this.resolve();
      }else {
        this.currentpokemon = this.pokemondata[this.currentpokemon.id];
      }
      sessionStorage.setItem("smashdata", [...this.smashdata].join(","));
    },
    startFrom: function(id)
    {
      this.currentpokemon = this.pokemondata[id - 1];
      this.smash = true;
    },
    resolve: function()
    {
      this.smash = false;
      this.over = true;
      this.currentpokemon = {};
    },
    reset: function()
    {
      sessionStorage.clear();
      window.history.pushState({}, document.title, "/");
      this.smashdata = new Set();
      this.currentpokemon = {};
      this.smashdatabase64 = "";
      this.over = false;
      this.arbitrary = !this.arbitrary;
      for (let pokemon of this.pokemondata)
      {
        pokemon.smashed = false;
      }
    },
    encodeSmashDataBits: function()
    {
      let bits = "";
      for(let pokemon of this.pokemondata)
      {
        bits += pokemon.smashed ? "1" : "0";
      }
      //stackoverflow lol
      let len = 8;
      var splitInto8 = new RegExp('.{' + len + '}|.{1,' + Number(len-1) + '}', 'g');
      let bytes = bits.match(splitInto8);
      let hex = [];
      for (let num of bytes)
      {
        let hexnum = parseInt(num, 2).toString(16);
        if (hexnum.length == 1)
        {
          hexnum = "0" + hexnum;
        }
        hex.push(hexnum);
      }
      //remove trailing 0s
      for (let i = hex.length - 1; i >= 0; i--)
      {
        if (hex[i] == "00")
        {
          hex.pop();
        }else {
          break;
        }
      }
      return hex.join("");
    },
    decodeSmashDataBits: function(data)
    {
      let len = 2;
      var splitInto2 = new RegExp('.{' + len + '}|.{1,' + Number(len-1) + '}', 'g');
      const hex = data.match(splitInto2);
      const bytes = hex.map(num => {
        return pad(parseInt(num, 16).toString(2), 8);
      });
      //Assume the last set of bytes was not originally a group of 8.
      bytes[bytes.length - 1] = pad(parseInt(hex[hex.length - 1], 16).toString(2), this.pokemondata.length % 8);
      const bits = bytes.join("");
      for (let i = 0; i < bits.length && i < this.pokemondata.length; i++)
      {
        this.pokemondata[i].smashed = (bits.charAt(i) == "1") ? true : false;
        if (bits.charAt(i) == "1")
        {
          this.smashdata.add(this.pokemondata[i].id);
        }
      }
      this.arbitrary = !this.arbitrary;
    },
    loadCode: function()
    {
      const params = new URLSearchParams(window.location.search);
      if (params.get('code'))
      {
        this.decodeSmashDataBits(params.get('code'));
      }
      this.smashdatabase64 = this.encodeSmashDataBits();
    },
    selectCode: function()
    {
      window.getSelection().selectAllChildren(document.querySelector("#code"));
    },
    loadStorage: function() 
    {
      if (sessionStorage.getItem("smashdata") && !window.location.search.includes("code="))
      {
        this.smashdata = new Set(sessionStorage.getItem("smashdata").split(","));
        for (let item of this.smashdata)
        {
          this.pokemondata[item - 1].smashed = true;
        }
        this.arbitrary = !this.arbitrary;
      }
    }
  },
  mounted: function() {
    this.generatePokemon();
  },
});

// stackoverflow :highfive:
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}