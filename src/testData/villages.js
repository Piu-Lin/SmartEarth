const villages = [
    {
        coordinate: { x: 120.42410849957865, y: 30.90805710880161, z: 12.884181129071958 },
        Type: '村',
        id: 1,
        name: '富强村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.33900389476102, y: 30.820662603546293, z: 10.789756145863063 },
        Type: '村',
        id: 2,
        name: '西阳村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.36093318731609, y: 30.820645142803443, z: 12.357502394237573 },
        Type: '村',
        id: 3,
        name: '庠上村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.36450557579367, y: 30.836124843289387, z: 12.780751931996079 },
        Type: '村',
        id: 4,
        name: '马嘶村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.379306267296, y: 30.839196670613223, z: 11.716055748080803 },
        Type: '村',
        id: 5,
        name: '洋南村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.39135475583414, y: 30.856738852621877, z: 15.107466194462262 },
        Type: '村',
        id: 6,
        name: '直港巷村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.3737631114686, y: 30.851829330754885, z: 12.204604736430763 },
        Type: '村',
        id: 7,
        name: '江蒋漾村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.35009299529858, y: 30.847408992967036, z: 17.511221842034995 },
        Type: '村',
        id: 8,
        name: '戴家桥村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.32732847647695, y: 30.832938045540065, z: 11.656497897683495 },
        Type: '村',
        id: 9,
        name: '坞仁村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.32522845793304, y: 30.847953375751406, z: 11.974228206858218 },
        Type: '村',
        id: 10,
        name: '三田洋村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.33772589901821, y: 30.864464862606052, z: 17.932047754901877 },
        Type: '村',
        id: 11,
        name: '祜村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.35434117856451, y: 30.85850390056696, z: 12.644296126910879 },
        Type: '村',
        id: 12,
        name: '宝山村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.34433518702767, y: 30.884831242595872, z: 10.411254811888467 },
        Type: '村',
        id: 13,
        name: '东上林村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.36168544274284, y: 30.868113435972887, z: 12.476508863468345 },
        Type: '村',
        id: 14,
        name: '东迁村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.37563508030736, y: 30.88457166594467, z: 11.949147377993583 },
        Type: '村',
        id: 15,
        name: '圣驾桥村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.38718046806642, y: 30.87408377522107, z: 12.128718933783338 },
        Type: '村',
        id: 16,
        name: '方丈港村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.39641989666536, y: 30.884557149042305, z: 12.530662240346535 },
        Type: '村',
        id: 17,
        name: '同心村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.40615707839972, y: 30.8881460077926, z: 13.177159741879642 },
        Type: '村',
        id: 18,
        name: '丁家港村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.42192207594931, y: 30.88847953556792, z: 16.23647790694986 },
        Type: '村',
        id: 19,
        name: '浔北村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.41447312318125, y: 30.896821805888774, z: 14.637852266768345 },
        Type: '村',
        id: 20,
        name: '李家河村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.41873269697923, y: 30.924457767036397, z: 14.488187364206068 },
        Type: '村',
        id: 21,
        name: '英雄村',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    },
    {
        coordinate: { x: 120.38120312389718, y: 30.86028694274556, z: 11.503919793126641 },
        Type: '村',
        id: 22,
        name: '南林社区',
        positionType: 1,
        image: '/static/images/marker/mark_bg11.png'
    }
]
export default villages
