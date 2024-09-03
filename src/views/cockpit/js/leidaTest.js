let range = 450000

export function satelliteRangeFun(val) {

  if (val === '加') {
    range += 50000
  } else if (val === '减') {
    range -= 50000
  }
  startFunc()
}

function startFunc() {
  for (var i = 0; i < arrStates.length; i++) {
    getStatePath(arrStates[i]);
  }
}
