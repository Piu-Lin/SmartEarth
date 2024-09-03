<template>
  <div class="xt-grid-panel" v-if="show">
    <div class="xt-grid-panel-left">
        <img src="/static/images/epidemicControl/close.png" @click="close()">
       {{ data.name }}
       <p>网格长：{{ data.info.gridLeader }}</p>
       <p>联系电话：{{ data.info.gridPhone }}</p>
       <p>楼幢数量：<span @click="clickBuildings()">{{ data.info.buildingsNumber }}幢</span></p>
       <p>房屋数量：<span @click="clickHouses()">{{ data.info.housesNumber }}户</span></p>
       <p>居民数量：<span @click="clickResidents(data.info.residents)">{{ data.info.residentsNumber }}人</span></p>
    </div>
    <div class="xt-grid-panel-right panel-building" v-if="showBuildings">
        <img src="/static/images/epidemicControl/close.png" @click="showBuildings = false">
        <div class="list_title">
            <div>楼幢</div>
            <div>居民数量</div>
        </div>
        <div class="right-list-top transition-box">
            <div :class="listRowClassName(index)" class="right-list"
                v-for="(item, index) in data.info.buildings"
                :key="index"
            >
                <div>{{ item.name }}</div>
                <div @click="clickResidents(item.residents)">{{ item.residentsNumber }}</div>
            </div>
        </div>
    </div>
      <div class="xt-grid-panel-right panel-houses" v-if="showHouses">
          <img src="/static/images/epidemicControl/close.png" @click="showHouses = false">
          <div class="list_title">
              <div>地址</div>
              <div @click="showResidents">居民数量</div>
          </div>
          <div class="right-list-top transition-box">
              <div :class="listRowClassName(index)" class="right-list"
                   v-for="(item, index) in data.info.houses"
                   :key="index"
              >
                  <div :title="item.address">{{ item.address }}</div>
                  <div @click="clickResidents(item.residents)">{{ item.residentsNumber }}</div>
              </div>
          </div>
      </div>
      <div class="xt-grid-panel-resident" v-if="showResidents">
          <img src="/static/images/epidemicControl/close.png" @click="showResidents = false">
          <div class="list_title">
              <div>姓名</div>
              <div>地址</div>
              <div>联系电话</div>
              <div>健康码颜色</div>
              <div>行程码是否带星</div>
              <div>疫苗接种情况</div>
          </div>
          <div class="right-list-top transition-box">
              <div :class="listRowClassName(index)" class="right-list"
                   v-for="(item, index) in residentsInfo"
                   :key="index"
              >
                  <div>{{ item.name }}</div>
                  <div :title="item.address">{{ item.address }}</div>
                  <div :title="item.phone">{{ item.phone }}</div>
                  <div>{{ item.HealthCode }}</div>
                  <div>{{ item.isStars }}</div>
                  <div>{{ item.VaccinationStatus }}</div>
              </div>
          </div>
      </div>
  </div>
</template>

<script setup>
import { inject, ref, nextTick } from "vue";

const show = ref(false);
const showBuildings = ref(false);
const showHouses = ref(false);
const showResidents = ref(false);
const residentsInfo = ref([]);
const data = ref(null);
const gisViewer = inject("epidemicControlMap");

nextTick(() => {
    gisViewer.value.emitter.on("openGrid", (res) => {
        show.value = true;
        data.value = res;
    });
})
function close() {
    show.value = false;
    showBuildings.value = false;
    showHouses.value = false;
    showResidents.value = false;
}
function clickBuildings() {
    showBuildings.value = !showBuildings.value;
}
function clickHouses() {
    showHouses.value = !showHouses.value;
}
function clickResidents(data) {
    showResidents.value = true;
    residentsInfo.value = data;
}
function listRowClassName(index) {
    if (index % 2 === 0) {
        return "background-row";
    } else {
        return "";
    }
}
</script>

<style scoped lang="scss">
.xt-grid-panel {
    position: absolute;
    left: calc(50% - 35vw);
    top: 200px;
    display: flex;
}
.xt-grid-panel-left {
    background: url("/static/images/epidemicControl/bg.png");
    background-size: 100% 100%;
    /*opacity: 0.8;*/
    width: 20vw;
    height: 30vh;
    text-align: center;
    padding-top: 3vh;
    color: white;
    img {
        position: relative;
        top: -6.5vh;
        right: -12.2vw;
        width: 30px;
        cursor: pointer;
    }
    p {
        span {
            cursor: pointer;
            color: #1d5dc6;
        }
    }
}
.panel-building {
    width: 20vw!important;
    img {
        position: relative;
        top: -3.5vh;
        right: -18.5vw!important;
        width: 30px;
        cursor: pointer;
    }
    .right-list-top {
        .right-list {
            & > div:nth-child(2) {
                cursor: pointer;
                color: #1d5dc6;
            }
        }
    }
}
.panel-houses {
    width: 24vw!important;
    img {
        position: relative;
        top: -3.5vh;
        right: -22.5vw!important;
        width: 30px;
        cursor: pointer;
    }
    .list_title {
        & > div:nth-child(1) {
            width: 15vw!important;
        }
    }
    .right-list-top {
        .right-list {
            & > div:nth-child(1) {
                width: 15vw!important;
            }
            & > div:nth-child(2) {
                cursor: pointer;
                color: #1d5dc6;
            }
        }
    }
}
.xt-grid-panel-right {
    background: url("/static/images/epidemicControl/bg.png");
    background-size: 100% 100%;
    /*opacity: 0.9;*/
    width: 30vw;
    height: 30vh;
    margin-left: 1vw;
    padding-bottom: 2vh;
    img {
        position: relative;
        top: -3.5vh;
        right: -28.5vw;
        width: 30px;
        cursor: pointer;
    }
    .list_title {
        height: 3vh;
        color: white;
        display: flex;
        text-align: center;
        div {
            width: 10vw;
        }
    }
    .right-list-top {
        height: 21vh;
        .right-list {
            color: white;
            background-image: linear-gradient(96deg, rgba(27, 98, 153, 0.2) 0%, rgba(12, 56, 106, 0.2));
            display: flex;
            text-align: center;
            height: 4vh;
            line-height: 4vh;
            div {
                width: 10vw;
                overflow: hidden; //超出的文本隐藏
                text-overflow: ellipsis; //用省略号显示
                white-space: nowrap; //不换行
            }
        }
        .background-row {
            background-image: linear-gradient(94deg, rgba(27, 98, 153, 0.45) 0%, rgba(12, 56, 106, 0.45) 100%);
        }
    }
}
.xt-grid-panel-resident {
    background: url("/static/images/epidemicControl/bg.png");
    background-size: 100% 100%;
    /*opacity: 0.9;*/
    width: 37vw;
    height: 30vh;
    margin-left: 1vw;
    img {
        position: relative;
        top: -3.5vh;
        right: -35.5vw;
        width: 30px;
        cursor: pointer;
    }
    .list_title {
        height: 3vh;
        color: white;
        display: flex;
        text-align: center;
        div {
            width: 5vw;
        }
        & > div:nth-child(5) {
            width: 8vw;
        }
        & > div:nth-child(6) {
            width: 10vw;
        }
    }
    .right-list-top {
        height: 21vh;
        .right-list {
            color: white;
            background-image: linear-gradient(96deg, rgba(27, 98, 153, 0.2) 0%, rgba(12, 56, 106, 0.2));
            display: flex;
            text-align: center;
            height: 4vh;
            line-height: 4vh;
            div {
                width: 5vw;
                overflow: hidden; //超出的文本隐藏
                text-overflow: ellipsis; //用省略号显示
                white-space: nowrap; //不换行
            }
            & > div:nth-child(5) {
                width: 8vw;
            }
            & > div:nth-child(6) {
                width: 10vw;
            }
        }
        .background-row {
            background-image: linear-gradient(94deg, rgba(27, 98, 153, 0.45) 0%, rgba(12, 56, 106, 0.45) 100%);
        }
    }
}
</style>
