function createLookupTable() {
  return ["0", "1", "2", "3", "4", "5", "6", "7"];
}

function geoSotEncode(latCode, lngCode, altCode) {
  const lookupTable = createLookupTable();

  const latIdx = parseInt(latCode, 2);
  const lngIdx = parseInt(lngCode, 2);
  const altIdx = parseInt(altCode, 2);

  const index = (altIdx << 2) | (latIdx << 1) | lngIdx;
  return lookupTable[index];
}

/**
 *
 * @param {纬度} lat 单位为度 (degrees)，范围是从 -90 到 90
 * @param {经度} lon 单位为度 (degrees)，范围是从 -180 到 180
 * @param {高度} height 单位假定为米 (meters)
 * @param {编码等级} level 表示编码的精度。级别越高，精度越高。最大值是31。
 * @returns string 空间网格编码
 */
export function geoSoT_encode_3D_32bits(lat, lon, height, level) {
  if (level > 31) {
    console.log("level too large");
    return 0;
  }

  let encodeStr = "G";
  const strip = BigInt(2 ** level);

  const latNormal = BigInt(Math.floor(((lat + 90) / 180) * Number(strip)));
  const lonNormal = BigInt(Math.floor(((lon + 180) / 360) * Number(strip)));
  const heightNormal = BigInt(Math.floor((height / 50000000) * Number(strip)));

  const latBin = latNormal.toString(2).padStart(level, "0");
  const lonBin = lonNormal.toString(2).padStart(level, "0");
  const heightBin = heightNormal.toString(2).padStart(level, "0");

  for (let i = 0; i < level; i++) {
    if (i === 9 || i === 15) {
      encodeStr += "-";
    } else if (i === 21) {
      encodeStr += ".";
    }

    encodeStr += geoSotEncode(latBin[i], lonBin[i], heightBin[i]);
  }

  return encodeStr;
}

export function geoSoT_encode_2D_96bits(lat, lon, level) {
  const strip = BigInt(2 ** level);
  const latNormal = BigInt(Math.floor(((lat + 90) / 180) * Number(strip)));
  const lonNormal = BigInt(Math.floor(((lon + 180) / 360) * Number(strip)));

  let combined = BigInt(0);
  for (let i = 0; i < 32; i++) {
    combined |=
      ((lonNormal >> BigInt(i)) & BigInt(1)) << (BigInt(3) * BigInt(i));
    combined |=
      ((latNormal >> BigInt(i)) & BigInt(1)) <<
      (BigInt(3) * BigInt(i) + BigInt(1));
  }

  return combined.toString();
}
