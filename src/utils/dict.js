/**
 * 获取字典数据
 */
export function useDict(...args) {
  const res = ref({});
  return (() => {
    args.forEach((d, index) => {
      res.value[d] = [];
    })
    return toRefs(res.value);
  })()
}
