export default class EntityEdit {
  constructor(viewer) {}

  fnCreatLine(oPositions, isSave = true, id_ = undefined, color_ = undefined) {
    if (!oPositions) return
    var color = 'rgba(255,255,255,0.5)'
    var borderColor = 'rgba(255,255,255,1)'
    switch (color_) {
      case 'RED':
        color = 'rgba(255,0,0,0.5)'
        borderColor = 'rgba(255,0,0,1)'
        break

      case 'BLUE':
        color = 'rgba(0,0,255,0.5)'
        borderColor = 'rgba(0,0,255,1)'
        break

      case 'YELLOW':
        color = 'rgba(255, 255, 0,0.5)'
        borderColor = 'rgba(255, 255 ,0,1)'
        break

      case 'GREEN':
        color = 'rgba(0, 255, 0,0.5)'
        borderColor = 'rgba(0,255, 0,1)'
        break589748
    }
    var { lon, lat, h } = getLatLonPositon(oPositions[0])
    var tempID = new Date().getTime()
    window.tempPolygonId = tempID
    var oEntity = window.drawDataSource.entities.add({
      // 特殊字段该字段会保存下来，可以是字符串也可以是个对象
      name: '标绘面',
      // 线的唯一标识会存储下来，再次加载也不改变,用于查找
      id: id_ || tempID,
      // 标注的坐标 x,y,z 经度纬度和高度的值
      position: new LSGlobe.Cartesian3.fromDegrees(lon, lat, h + 20),
      label: {
        text: '威胁范围',
        font: '20px Microsoft YaHei',
        fillColor: new LSGlobe.Color(),
        backgroundColor: new LSGlobe.Color.fromCssColorString(color),
        outlineColor: new LSGlobe.Color.fromCssColorString(borderColor),
        outlineWidth: 6,
        showBackground: true,
        // 点的显隐距离
        distanceDisplayCondition: new LSGlobe.DistanceDisplayCondition(30, 2000)
      },
      billboard: {
        image: '',
        // 标注图标路径
        width: 64,
        height: 64,
        disableDepthTestDistance: 0,
        // 标注的遮挡距离设置为100则视角与标注的距离大于100米时会有遮挡
        scale: 0.5,
        translucencyByDistance: new LSGlobe.NearFarScalar(1.5e2, 1.0, 1.5e15, 0),
        // 当视角在1500米时候透明度为1,15000米时候为0
        show: false
      },
      polygon: {
        hierarchy: {
          // 面的点集合
          positions: oPositions
        },
        // 面的材质
        material: LSGlobe.Color.fromCssColorString(color),
        // 是否填充面
        fill: true,
        // 是否显示面的外边框（仅空间面有效）
        outline: true,
        // 面的外边框的宽度（暂不支持非1）
        outlineWidth: 1,
        // 面的类型
        classificationType: LSGlobe.ClassificationType.BOTH,
        // 是否绝对高度（当设置非空间面时候一定要设置false，空间面一定要设置true）
        perPositionHeight: false
      },
      polyline: {
        // 线点的集合
        positions: oPositions,
        // 线宽
        width: 2,
        // 线的材质
        material: new LSGlobe.PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: LSGlobe.Color[color_]
        }),
        // 线的类型
        type: LSGlobe.PolylineType.GLOSSY,
        // 空间线被遮挡部分样式，仅适用空间线
        depthFailMaterial: new LSGlobe.PolylineDashMaterialProperty({
          color: LSGlobe.Color.fromCssColorString('rgba(0,186,255,0.5)')
        }),
        // 是否贴地（空间线必须为false，贴地形、贴模型、贴地表模型必须为true）
        clampToGround: true,
        // TERRAIN:贴地表，CESIUM_3D_TILE：贴模型，BOTH贴模型贴地表，undefined：空间线
        classificationType: LSGlobe.ClassificationType.BOTH
      }
    })
    window.oPositionsEnit.push(oEntity)

    if (isSave) {
      try {
        regionPos.push({
          type: window.writeTools.isWritRegionType,
          id: tempID,
          value: window.oPositions.map(item => getLatLonPositon(item))
        })
        var saveSource = JSON.stringify(regionPos)
        localStorage.setItem('regionPos', saveSource)
        // 请求接口保存到服务器
        // $.ajax({
        //   url: 'http://139.159.139.174:3000/fileApi/savePolygon',
        //   type: 'POST',
        //   dataType: 'json',
        //   data: {
        //     saveData: regionPos
        //   },
        //   success: function(data) {
        //     console.log('data', data)
        //   },
        //   error: function(err) {
        //     console.log(err)
        //   }
        // })
      } catch (err) {
        console.log(err)
      }
    }

    window.oPositions = []
    window.writeTools.isWrite = false
  }
}
