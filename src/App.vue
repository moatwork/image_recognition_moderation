<template>
  <div id="app">
    <h1>Pizza or Spaghetti?!</h1>
    <img alt="app logo" src="./assets/pizza or spaghetti.jpg">
    <imgModerationUrl/>
    <getRecipes/>
  </div>
</template>

<script>
import imgModerationUrl from './components/callCVwithModerator.vue'
import getRecipes from './components/queryCosmos.vue'

//console.log(process.env)

export default {
  components: {
    imgModerationUrl,
    getRecipes
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
