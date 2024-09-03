<template>
  <div id="player" @click="wholeFullScreen()"></div>
</template>

<script setup>
import {useRouter} from 'vue-router';

const router = useRouter();

let player = null;
let playURL = null;

onMounted(() => {
  nextTick(() => {
    if (router.currentRoute.value.query.url) {
      playURL = router.currentRoute.value.query.url;
      createPlayer();
      realplay();
    }
  })
})
onUnmounted(() => {
  stopPlay();
})

function createPlayer() {
  const IS_MOVE_DEVICE = document.body.clientWidth < 992 // 是否移动设备
  player = new window.JSPlugin({
    szId: 'player',
    szBasePath: "/static/js/",
    iMaxSplit: 1,
    iCurrentSplit: IS_MOVE_DEVICE ? 1 : 2,
    openDebug: true,
    oStyle: {
      borderSelect: IS_MOVE_DEVICE ? '#000' : '#000',
    }
  })
  // 事件回调绑定
  player.JS_SetWindowControlCallback({
    pluginErrorHandler: function (iWndIndex, iErrorCode, oError) {  //插件错误回调
      console.log('pluginError callback: ', iWndIndex, iErrorCode, oError);
    },
    performanceLack: function () {  //性能不足回调
      console.log('performanceLack callback: ');
    }
  });
}

function wholeFullScreen() {
  player.JS_FullScreenDisplay(true).then(
      () => {
        console.log(`wholeFullScreen success`)
      },
      e => {
        console.error(e)
      }
  )
}

/* 预览&对讲 */
function realplay() {
  let index = player.currentWindowIndex;
  player.JS_Play(playURL, {playURL, mode: 1}, index).then(
      () => {
        console.log('realplay success')
      },
      e => {
        console.error(e)
      }
  )
}

function stopPlay() {
  player.JS_Stop().then(
      () => {
        console.log('stop realplay success')
      },
      e => {
        console.error(e)
      }
  )
}
</script>

<style scoped lang="scss">
#player {
  width: 100vw;
  height: 100vh;
}
</style>
