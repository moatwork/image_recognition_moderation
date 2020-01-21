<template>
  <div id="db">
      <Button @click="queryCosmos">Query CosmosDB</button>
  {{echo_DB}}
  </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'

export default {
    data () {
      return {
        echo_DB: null
     }
   },
    methods:{
//Call Azure CosmosDB query container API
//'TypeError: Failed to fetch' is caused by CORS in local test. --disable-web-security browser can be a solution
      queryCosmos(event){
        var echo_DB=[]
        const masterKey=process.env.VUE_APP_COSMOST_MASTERKEY//Read-only key
        const CosmosClient = require('@azure/cosmos').CosmosClient

        var cosmos_config = {}
        cosmos_config.endpoint = process.env.VUE_APP_COSMOS_ENDPOINT
        cosmos_config.key = process.env.VUE_APP_COSMOS_MASTERKEY
        const client = new CosmosClient(cosmos_config)

        async function queryContainer() {
          var results=[]
          const querySpec = {
            query: "SELECT * FROM root WHERE (root.recipe_key_words ='"+window.imgTag+"')", 
            parameters: []
          }
          console.log(querySpec)
          const { resources } = await client.database(process.env.VUE_APP_COSMOS_DB)
                                            .container(process.env.VUE_APP_COSMOS_CONTAINER).items
                                            .query(querySpec, {enableCrossPartitionQuery:true})
                                            .fetchAll()
          for (var queryResult of resources) {
              let resultString = queryResult.recipe_url
              console.log(`\tQuery returned ${resultString}\n`)
              results = results.concat(resultString);
          }
          return results
        }
        queryContainer()        
        .then(results => {
                this.echo_DB=results})
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