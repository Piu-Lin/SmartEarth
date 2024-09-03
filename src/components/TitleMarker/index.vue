<template>
  <div class="title-marker">
    <div class="color-block" :style="{'background-color': (color ? color : 'orange')}"></div>
    <span class="title-marker-label">{{title}}</span>
  </div>
</template>

<script>
export default {
  name: "TitleMarker",
  props: {
    title: String,
    color: String
  }
};
</script>

<style scoped>
.color-block {
  height: 30px;
  width: 15px;
  background-color: orange;
}
.title-marker {
  display: flex;
  margin-bottom: 20px;
}
.title-marker-label {
  line-height: 34px;
  margin-left: 10px;
  font-size: 16px;
  font-weight: bold;
}
</style>
