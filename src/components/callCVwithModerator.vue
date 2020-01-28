<template>
<div id="app-2">
  <input type="text" placeholder=".jpg; .png" v-model="imgUrl">
  <button @click="callFindFaceApi">Submit image</button>

<p> {{echo_FindFace}}<br />

  {{echo_echo_HandOcr}}<br />
  {{echo_TextScreen}}<br />
  {{echo_Moderator}}<br />
  {{echo_CV}}</p>

</div>
</template>

<script>
import axios from 'axios'
window.textScreen=0

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
        console.log("Image url: "+this.imgUrl)
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
          console.log("face: "+response.data.Result)
          if (response.data.Result==true) {
            this.echo_FindFace="Please upload only a dish, not a face :)"}
          else {
            this.echo_FindFace="No face found...",
            this.getOcrOptId()}
        })
      },
//Call Batch Read File API, which is a function of Azure Computer Vision
//Initiate a job for handwritten or printed text OCR from the image 
//To get results, need to call Get Read Operation Result API
       getOcrOptId(){
        var img={"url":this.imgUrl}
        const config={
          headers:{
            'Accept':'*',
            'Ocp-Apim-Subscription-Key':process.env.VUE_APP_HANDWRITTEN_API_KEY,
            'Content-Type':'application/json',
            'Access-Control-Expose-Headers': 'Operation-Location'}// Expose headers to get Operation-Location in response
          }
        axios.post(process.env.VUE_APP_HANDWRITTEN_API_URL_ENDPOINT,img,config)
        .then(response => {
            var temp=response.headers["operation-location"].split("/") // operation-location in response headers is needed for the next call
            const operationId=temp[(temp.length-1)]
            console.log("OCR operation id:" +operationId)
            this.getWrittenOcr(operationId)
        })
       },
//Call Get Read Operation Result API, which is a function of Azure Computer Vision
//Get handwritten or printed text result from a job initiated by Batch Read File API
//If found, call Text Screen for text content control
//If not, go to next step
       getWrittenOcr(operationId){
        var echo_HandOcr="" //is a string not array
        var textInput=""
        const sleep = (milliseconds) => {
          return new Promise(resolve => setTimeout(resolve, milliseconds))
        }
        const config={
          headers:{
            'Ocp-Apim-Subscription-Key':process.env.VUE_APP_TEXTOCR_API_KEY,
            'Content-Type':'application/json'}
        }
        const req_url=process.env.VUE_APP_TEXTOCR_API_URL_ENDPOINT+"/"+operationId
        sleep(1000).then(() => {
          axios.get(req_url,config)//data is not a part in GET
          .then(response => {
            if (response.data.status!=="Succeeded"){//text operation takes time 100-500ms to get results
              sleep(1000)
              this.getOcrText(operationId)
            }
            else{
              var lines=response.data.recognitionResults[0].lines
              for (let i = 0; i < lines.length; i++ ) {
                let lineStr = lines[i].text
                textInput = textInput.concat(lineStr)
              }
              if(textInput==""){
                console.log("No text found...")
                this.echo_HandOcr="No text found..."
                this.callModeratorApi()
              }
              else{
                this.echo_HandOcr="Focus on a dish, not newspaper"
                console.log("Text found: "+this.echo_HandOcr)
                this.getTextScreen(textInput)
              }
              
            }
            
          })
        })
      },
//Call Text Screen API, which is a function of Azure Content Moderator
//If any adult/mature/offensive content found in the text, return alert
//If not found, goto next step 
      getTextScreen(textInput){
        console.log("getTextScreen")
        var echo_TextScreen=[] 
        const config={
          headers:{
            'Ocp-Apim-Subscription-Key':process.env.VUE_APP_TEXTSCREEN_KEY,
            'Content-Type':'text/plain'}
          }
        axios.post(process.env.VUE_APP_TEXTSCREEN_ENDPOINT,textInput,config)
        .then(response => {
          console.log(response.data.Classification)
          if (response.data.Classification.ReviewRecommended==true) {
            console.log("Focus on a dish, not newspaper")
            this.echo_TextScreen="Focus on a dish, not newspaper"
          }
          else {
            this.echo_TextScreen="Text screening passed..."
            console.log("Text screening passed...")
            this.callModeratorApi()
          }
        })
    },


//Call Evaluate API, which is a function of Azure Content Moderator
//If any adult/racy content found in the image, return alert
//If not found, goto next step 
      callModeratorApi(){
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
            this.echo_FindFace="Image content control passed...",
            this.callCvUrlApi()}
        })
      },
//Call Azure Custom Vision API, need a pre-trained model
//If the image is negative (not recognized by the trained model), return alert
//If recognized, Return image recognition tag with probability 
      callCvUrlApi(){
        var echo_CV=[]
        var img={"url":this.imgUrl} 
        const config={
          headers:{
            'Accept':'*',
            'Prediction-Key':process.env.VUE_APP_CUSTOMVISION_API_KEY,
            'Content-Type':'application/json'}
          }
        axios.post(process.env.VUE_APP_CUSTOMVISION_API_URL_ENDPOINT,img,config)
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