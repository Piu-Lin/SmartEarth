<template>
  <div class="panel-wrapper">
    <component ref="dialog" :is="key"/>
  </div>
</template>

<script>
const path = require('path');

const files = require.context('./components', false, /\.vue$/);
const components = {};
files.keys().forEach((key) => {
  const name = path.basename(key, '.vue');
  components[name] = files(key).default || files(key);
});

export default {
  name: 'index',
  components,
  data() {
    return {
      key: '',
    };
  },
  mounted() {
    // 监听打开本对话框事件（根据action名称判断打开哪个对话框）
    this.$bus.$on('open-dialog', (data) => {
      console.log(">>>>>>>>>>>>")
      const {
        action,
      } = data;
      this.key = action;
      this.$nextTick(() => {
        if (this.$refs.dialog) {
          this.$refs.dialog.show(data);
        }
      });
    });
  },
  methods: {
    move(e) {
      let odiv = e.target; //获取目标元素
      //算出鼠标相对元素的位置
      let disX = e.clientX - odiv.parentElement.offsetLeft;
      let disY = e.clientY - odiv.parentElement.offsetTop;
      document.onmousemove = (e) => { //鼠标按下并移动的事件
        //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
        let left = e.clientX - disX;
        let top = e.clientY - disY;
        //移动当前元素
        odiv.parentElement.style.left = left + "px";
        odiv.parentElement.style.top = top + "px";
      };
      document.onmouseup = (e) => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    },
    close() {
      this.$emit("close");
    },
    miniaturized() {
      this.$emit("miniaturized");
    }
  }
};
</script>

<style>
  .xt-panel {
    position: absolute;
    background: rgba(15, 31, 64, 0.72);
    border: 1px solid #176FA377;
    color: white;
    top: 60px;
    left: 50px;
    margin: 0;
    padding: 0;
    border-radius: 4px;
    box-shadow: 1px 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 2;
    /*不选中文本*/
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .xt-panel-title {
    padding: 0 0 0 22px;
    text-align: left;
    color: #fff;
    height: 40px;
    line-height: 40px;
    border: none;
    border-radius: 0;
    cursor: move;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAeoAAAAqCAYAAAB88hg6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjJEQzJGNEMzNjQ5RDExRThBMzlGRjE0MDFDNTA2MTM3IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjJEQzJGNEM0NjQ5RDExRThBMzlGRjE0MDFDNTA2MTM3Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MkRDMkY0QzE2NDlEMTFFOEEzOUZGMTQwMUM1MDYxMzciIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MkRDMkY0QzI2NDlEMTFFOEEzOUZGMTQwMUM1MDYxMzciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6ORPwiAAADkklEQVR42uzcO4hcVQAG4LNrkjVxNXF8P1AbH/hqxHehIIiFjRZioy4BESOiRMX3ilHXB2KRwkJUUlgIohYipjBoIwYfmMagginURiMqGAiKJP6He4NB5s7sbsjsQL4P/mJ3z8zA2YV/z73nnom9O68uB+DiZC5ZnTySfDhk/IXJ88nJyYPJ5t7Gua6xq5JTkqMKACy9L3/bcHnpzX667+svRvGhyxb5unOSp5Nzk8eTd5K9A8bXYn4quTZ5ItmU7OkYe3g7/mh/EwAc6iYXOP605NXk/eSDdoX89oCSnm4LfVuyIzkreb2jpFckp7flr6QBYAFFfWzyUvJJ8nVyXvJa8s+Alfq65Ju2dC9Inkl2d4w9tX3P+jkTfi0A8F9JDlJXxPcldySvtKvdP4e85oZ2Ff1taS51b+83qLdxrv6TcEKbw/wqAGD+RT2V3Jncn7xVmkvcvw55r0tKs1GsbgK7K/m4o6Drivm45KSy+HvkAHBIFnVd2d5amg1itWivSH4Y8h5nlGbn92XJo8mbpeOedUr6mNJsFFth6gFg/kVdV7n1kvWG0lyyvr50XLLez5rkseSW5IVkJvm7o6DXtAW90pQDwMKK+pp2RVzvPa9NPhvymroavjt5IHmjNI9q/d5R0EeW5lnoI0w1ACyuqLckl85jbF1139yuuj9Prky+7yjoVe0KerUpBoADK+r5uCp5LvmrNJe6t3YU9FS7gvYcNACMoKjPTp4tzWNZDyfvdhT08tLs4vYcNACMoKhr4T6Z3Fiaoz9vKn0ON0lB113iJybHl4WfcgYALLCo667s9ck9pTng5MxkV5+CnmzLuZa0w0oA4CAXdS3emWS2NJvLLkp+7FPQE+1qu17mXm76AODgF/V1pXk86+fSPEv9Vb+BKeleaXZyT5k2ABhdUW9uUzoKuj5iVXdyO6wEAEZd1Cnirp9NtwU9bZoAYOlW1P+3si1oh5UAwBgVdb33XO9B90wLAIxPUTusBADGuKjPLw4rAYCxNKmkAWC8ixoAUNQAgKIGAEUNAChqAFDUAICiBgAUNQAoagBgJJaZAgAYS3uSFxU1AIyfXclDyVZFDQDj5adkfbKjfuEeNQCMj23JzL6SVtQAMD7eS9Ylf+z/TZe+AWBp1U1jLyeb+v1QUQPA0tmdzCYfdQ1Q1ACwNH5J7k2+GzTIPWoAGL3tyW3DSlpRA8DobUluT3bOZ/C/AgwA3v57DPDz1+oAAAAASUVORK5CYII=) top left no-repeat;
    background-size: 120% 100%;
  }
  .xt-panel-close {
    cursor: pointer;
    border: 0;
    background: transparent;
    position: absolute;
    right: 5px;
    top: 3px;
    z-index: 10;
    font-size: 1.8rem;
    line-height: 1;
    text-decoration: none;
    transition: color 0.3s;
    color: rgba(255, 255, 255, 0.8);
    outline: 0;
    padding: 0;
  }
  .xt-panel-close:hover {
    color: rgba(255, 255, 255, 0.3);
  }
  .xt-panel-miniaturized {
    cursor: pointer;
    border: 0;
    background: transparent;
    position: absolute;
    right: 30px;
    top: 3px;
    z-index: 10;
    font-size: 1.6rem;
    line-height: 1;
    text-decoration: none;
    transition: color 0.3s;
    color: rgba(255, 255, 255, 0.8);
    outline: 0;
    padding: 0;
  }
  .xt-panel-miniaturized:hover {
    color: rgba(255, 255, 255, 0.3);
  }
  .xt-panel-content {
    padding: 9px 24px;
    /*min-height: 200px;*/
  }
</style>

<style scoped>
</style>
