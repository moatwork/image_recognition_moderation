<template>
<div id="app-2">
  <input type="text" placeholder=".jpg; .png" v-model="imgUrl">
  <button @click="callFindFaceApi">Submit image</button>
  <p>{{echo_FindFace}}</p>

  <p>{{echo_Moderator}}</p>

  <p>{{echo_CV}}</p>

</div>
</template>

<script>
import axios from 'axios'

export default {
    data () {
       return {
       echo_FindFace:null,
       echo_CV:null
     }
   },

    methods:{
//Call Find Face API, which is a function of Azure Content Moderator
//If any face found in the image, return alert
//If no face found, goto next moderation step 
      callFindFaceApi(event){
        var echo_FindFace=[]
        console.log(this.imgUrl)
        var img={
          "DataRepresentation":"URL",
          "Value":  this.imgUrl
        }
        const config={
          headers:{
            'Accept':'*',
            'Ocp-Apim-Subscription-Key':process.env.VUE_APP_FACE_KEY,
            'Content-Type':'application/json'}
          }
        axios.post(process.env.VUE_APP_FACE_ENDPOINT,img,config)
        .then(response => {
          console.log(response.data.Result)
          if (response.data.Result==true) {
            this.echo_FindFace="Please upload only a dish, not a face :)"}
          else {
            this.echo_FindFace="No face",
            this.callModeratorApi()}
        })
      },
//Call Evaluate API, which is a function of Azure Content Moderator
//If any adult/racy content found in the image, return alert
//If not found, goto next step 
      callModeratorApi(imgUrl){
        var echo_Moderator=[]
        var img={
          "DataRepresentation":"URL",
          "Value":  this.imgUrl
        }
        const config={
          headers:{
            'Accept':'*',
            'Ocp-Apim-Subscription-Key':process.env.VUE_APP_MODERATOR_KEY,
            'Content-Type':'application/json'}
          }
        axios.post(process.env.VUE_APP_MODERATOR_ENDPOINT,img,config)
        .then(response => {
          console.log(response.data.IsImageAdultClassified)
          if (response.data.IsImageAdultClassified==true||response.data.IsImageRacyClassified==true) {
            this.echo_FindFace="Please upload only a dish, not improper image"}
          else {
            this.echo_FindFace="No adult nor racy",
            this.callCvUrlApi()}
        })
      },
//Call Azure Custom Vision API, need a pre-trained model
//If the image is negative (not recognized by the trained model), return alert
//If recognized, Return image recognition tag with probability 
      callCvUrlApi(imgUrl){
        var echo_CV=[]
        var img={"url":this.imgUrl} 
        const config={
          headers:{
            'Accept':'*',
            'Prediction-Key':process.env.VUE_APP_VISION_API_KEY,
            'Content-Type':'application/json'}
          }
        axios.post(process.env.VUE_APP_VISION_API_URL_ENDPOINT,img,config)
        .then(response => {
          if (response.data.predictions[0].tagName=="Negative") {
            this.echo_CV="It doesn't look like a pizza or spaghetti :S"}
          else {
            window.imgTag=response.data.predictions[0].tagName
            this.echo_CV="It looks like a "+response.data.predictions[0].tagName
            console.log(response.data.predictions)
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