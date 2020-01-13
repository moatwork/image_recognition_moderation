<template>
  <div id="app">
    <Button @click="callUrlApi">Click</button>
  {{ info }}
  </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
const VISION_API_KEY = '61b82cd30f7742e49b94cb61b685c7fe' //process.env.VISION_API_KEY;
//const VISION_API_URL_ENDPOINT = 'https://dish1.cognitiveservices.azure.com/customvision/v3.0/Prediction/28d8ff9b-1770-4b47-ac91-e24128a6b36d/classify/iterations/Iteration1/url?projectId=28d8ff9b-1770-4b47-ac91-e24128a6b36d&publishedName=Iteration1'
const VISION_API_URL_ENDPOINT = 'https://dish1.cognitiveservices.azure.com/customvision/v3.0/Prediction/28d8ff9b-1770-4b47-ac91-e24128a6b36d/classify/iterations/Iteration1/url/'
export default {
  name: 'echo',
    data () {
      return {
        info: null
     }
   },
    methods:{
      callUrlApi(event){
        const session_url='http://webservices.ns.nl/ns-api-avt?station=delft'
        const username='p.kecman@tudelft.nl'
        const password='8NYtYnrTlQCFP7LX33EI-e8lZKj7gcUuqLJf8uHs4vk8_kvWAKoO_g'
        
        axios.post(session_url,[], {headers:{
    crossDomain: true,
    'Access-Control-Allow-Origin': '*',  
    withCredentials: true,
    auth: {
      username: 'p.kecman@tudelft.nl',
      password: '8NYtYnrTlQCFP7LX33EI-e8lZKj7gcUuqLJf8uHs4vk8_kvWAKoO_g'
    }
    }
  })

      }
    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>