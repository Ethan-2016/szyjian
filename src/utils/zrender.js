import moment from 'moment';
import zrender from 'zrender';
import AnesRecord from "@/benchs/sanesthesia/api/AnesRecord";
import { Message } from 'element-ui'
let unitWH = 20;
let allNodeOrPlugTubeLegends = [
  {
    name: "麻醉开始",
    icon: 'charX'
  },
  {
    name: "麻醉结束",
    icon: 'charX',
    iconColor: "red"
  },
  {
    name: "插管",
    icon: 'circleUpArrow'
  },
  {
    name: "拔管",
    icon: 'circleDownArrow'
  },
  {
    name: "控制呼吸",
    icon: 'wavyLine',
    iconColor: '#f701fa'
  },
  {
    name: "自主呼吸",
    icon: 'ring',
    iconColor: '#f701fa'
  },
  {
    name: "手术开始",
    icon: 'doubleCircle'
  },
  {
    name: "手术结束",
    icon: 'circleX'
  },
]
// 绘制图例
function createPathFromString(d, x, y, style) { //宽高只给一个
  const path = zrender.path.createFromString(d);
  const pathRect = path.getBoundingRect();
  let width = style.width;
  let height = style.height;
  if (width && !height) {
    height = width / pathRect.width * pathRect.height;
  }
  if (!width && height) {
    width = height / pathRect.height * pathRect.width;
  }
  // const height = width / pathRect.width * pathRect.height;
  const m = pathRect.calculateTransform(new zrender.BoundingRect(x, y, width, height));
  path.applyTransform(m);
  return path;
}

let createIcon = {
  iconWH: 12,
  // charX
  charX(x, y, color) {
    let pathEls = []
    let centerX = x - this.iconWH / 2
    let centerY = y - this.iconWH / 2
    pathEls[0] = createPathFromString(
      'M242.2784 717.056l452.1984-452.1984 75.3664 75.3664-452.1984 452.2496z',
      centerX, centerY,
      {
        height: this.iconWH
      }
    )
    pathEls[1] = createPathFromString(
      'M694.528 792.4736L242.2784 340.224l75.3664-75.3664 452.2496 452.2496z',
      centerX, centerY,
      {
        height: this.iconWH
      }
    )
    return zrender.path.mergePath(pathEls, {
      rectHover: true,
      origin: [centerX + this.iconWH / 1.5, centerY + this.iconWH / 1.5],
      style: {
        stroke: 'none',
        fill: color
      },
      z: 2
    })
  },
  // circleX
  circleX(x, y, color) {
    let pathEls = []
    let centerX = x - this.iconWH / 2
    let centerY = y - this.iconWH / 2

    pathEls[0] = createPathFromString(
      'M242.2784 717.056l452.1984-452.1984 75.3664 75.3664-452.1984 452.2496z',
      centerX + this.iconWH / 4, centerY + this.iconWH / 4,
      {
        height: this.iconWH / 2
      }
    )
    pathEls[1] = createPathFromString(
      'M694.528 792.4736L242.2784 340.224l75.3664-75.3664 452.2496 452.2496z',
      centerX + this.iconWH / 4, centerY + this.iconWH / 4,
      {
        height: this.iconWH / 2
      }
    )
    pathEls[2] = createPathFromString(
      'M524.8 861.4912c-183.5008 0-332.8-149.2992-332.8-332.8s149.2992-332.8 332.8-332.8 332.8 149.2992 332.8 332.8-149.2992 332.8-332.8 332.8z m0-614.4c-155.2896 0-281.6 126.3104-281.6 281.6s126.3104 281.6 281.6 281.6 281.6-126.3104 281.6-281.6-126.3104-281.6-281.6-281.6z',
      centerX, centerY,
      {
        height: this.iconWH
      }
    )
    return zrender.path.mergePath(pathEls, {
      rectHover: true,
      origin: [centerX + this.iconWH / 1.5, centerY + this.iconWH / 1.5],
      coordinate: [],
      style: {
        stroke: 'none',
        fill: color
      },
      z: 2
    })
  },
  //circleUpArrow
  circleUpArrow(x, y, color) {
    let pathEls = []
    let centerX = x - this.iconWH / 2
    let centerY = y - this.iconWH / 2
    pathEls[0] = createPathFromString(
      'M857.6 508.0064c0 183.5008-149.2992 332.8-332.8 332.8s-332.8-149.2992-332.8-332.8 149.2992-332.8 332.8-332.8 332.8 149.2992 332.8 332.8z m-51.2 0c0-155.2896-126.3104-281.6-281.6-281.6s-281.6 126.3104-281.6 281.6 126.3104 281.6 281.6 281.6 281.6-126.3104 281.6-281.6z',
      centerX, centerY,
      {
        height: this.iconWH
      }
    )
    pathEls[1] = createPathFromString(
      'M768.256 545.9456l0-42.2912-13.7216-7.2192c-17.91999999-9.4208-33.7408-19.6096-47.0528-30.3616-13.6704-10.9568-30.4128-27.4944-49.8688-48.9984l-7.62879999-8.448-71.11680001 0 17.5104 36.60800001c6.0928 12.7488 11.5712 23.3984 16.384 31.89759999l-341.0432-1e-8 0 95.28320001L612.6592 572.416c-4.7616 8.3968-10.1888 19.0464-16.2816 32l-17.2544 36.50560001L649.984 640.92160001l7.6288-8.44800001c19.8656-21.9136 36.7104-38.5024 50.1248-49.2544a284.2624 284.2624 0 0 1 46.848-30.1056l13.6704-7.168z',
      centerX + this.iconWH / 4.2, centerY + this.iconWH * 0.35,
      {
        height: this.iconWH * 0.3
      }
    )
    return zrender.path.mergePath(pathEls, {
      rectHover: true,
      origin: [centerX + this.iconWH / 1.5, centerY + this.iconWH / 1.5],
      style: {
        stroke: 'none',
        fill: color
      },
      z: 2
    })
  },

  //circleUpArrow
  circleDownArrow(x, y, color) {
    let pathEls = []
    let centerX = x - this.iconWH / 2
    let centerY = y - this.iconWH / 2
    pathEls[0] = createPathFromString(
      'M857.6 508.0064c0 183.5008-149.2992 332.8-332.8 332.8s-332.8-149.2992-332.8-332.8 149.2992-332.8 332.8-332.8 332.8 149.2992 332.8 332.8z m-51.2 0c0-155.2896-126.3104-281.6-281.6-281.6s-281.6 126.3104-281.6 281.6 126.3104 281.6 281.6 281.6 281.6-126.3104 281.6-281.6z',
      centerX, centerY,
      {
        height: this.iconWH
      }
    )
    pathEls[1] = createPathFromString(
      'M545.9456 760.2688h-42.2912l-7.2192-13.7216a289.1776 289.1776 0 0 0-30.3616-47.0528 468.1728 468.1728 0 0 0-48.9984-49.8688l-8.448-7.6288V570.88l36.608 17.5104c12.7488 6.0928 23.3984 11.5712 31.8976 16.384V263.7312h95.2832v340.8896a483.84 483.84 0 0 1 32-16.2816l36.5056-17.2544v70.8608l-8.448 7.6288c-21.9136 19.8656-38.5024 36.7104-49.2544 50.1248a284.2624 284.2624 0 0 0-30.1056 46.848l-7.168 13.7216z',
      centerX + this.iconWH / 3, centerY + this.iconWH * 0.2,
      {
        height: this.iconWH * 0.6
      }
    )
    return zrender.path.mergePath(pathEls, {
      rectHover: true,
      origin: [centerX + this.iconWH / 1.5, centerY + this.iconWH / 1.5],
      style: {
        stroke: 'none',
        fill: color
      },
      z: 2
    })
  },
  //plus
  plus(x, y, color) {
    let pathEls = []
    let centerX = x - this.iconWH / 2
    let centerY = y - this.iconWH / 2
    pathEls[0] = createPathFromString(
      'M789.1968 568.3712h-221.0816v221.0816h-111.104v-221.0816h-222.208V456.704h222.1568V234.5472h111.0528V456.704h221.0816v111.6672z',
      centerX, centerY,
      {
        height: this.iconWH
      }
    )
    return zrender.path.mergePath(pathEls, {
      rectHover: true,
      origin: [centerX + this.iconWH / 1.5, centerY + this.iconWH / 1.5],
      style: {
        stroke: 'none',
        fill: color
      },
      z: 2
    })
  },
  //bigCircle
  bigCircle(x, y, color) {
    let iconWH = this.iconWH - 4
    let pathEls = []
    let centerX = x - iconWH / 2
    let centerY = y - iconWH / 2
    pathEls[0] = createPathFromString(
      'M506.0608 505.6m-307.2 0a307.2 307.2 0 1 0 614.4 0 307.2 307.2 0 1 0-614.4 0Z',
      centerX, centerY,
      {
        height: iconWH
      }
    )
    return zrender.path.mergePath(pathEls, {
      rectHover: true,
      origin: [centerX + iconWH/1.5, centerY + iconWH/1.5],
      style: {
        stroke: 'none',
        fill: color
      },
      z: 2
    })
  },
  //smallCircle
  smallCircle(x, y, color) {
    let iconWH = this.iconWH / 2
    let pathEls = []
    let centerX = x - iconWH / 2
    let centerY = y - iconWH / 2
    pathEls[0] = createPathFromString(
      'M506.0608 505.6m-307.2 0a307.2 307.2 0 1 0 614.4 0 307.2 307.2 0 1 0-614.4 0Z',
      centerX, centerY,
      {
        height: iconWH
      }
    )
    return zrender.path.mergePath(pathEls, {
      rectHover: true,
      origin: [centerX + iconWH / 1.5, centerY + iconWH / 1.5],
      style: {
        stroke: 'none',
        fill: color
      },
      z: 2
    })
  },
  //wavyLine
  wavyLine(x, y, color) {
    let iconWH = this.iconWH - 2
    let pathEls = []
    let centerX = x - iconWH / 1.5
    let centerY = y - iconWH / 2
    pathEls[0] = createPathFromString(
      'M798.21528178 825.17469867l-195.73418667-345.09801245-155.01448533 341.48625067-233.36641423-354.76821334-104.91585422 202.02564267-103.40124445-53.65213867 196.43323734-378.36117333 226.492416 344.28245333 162.23800889-357.564416 200.74404977 353.95265423 125.59610312-251.71649423 104.21680355 52.07927467z',
      centerX, centerY,
      {
        height: iconWH
      }
    )
    return zrender.path.mergePath(pathEls, {
      rectHover: true,
      origin: [centerX + iconWH / 1.5, centerY + iconWH / 1.5],
      style: {
        stroke: 'none',
        fill: color
      },
      z: 2
    })
  },
  //goOutIcon
  goOutIcon(x, y, color) {
    let iconWH = this.iconWH
    let pathEls = []
    let centerX = x - iconWH / 1.5
    let centerY = y - iconWH / 2
    pathEls[0] = createPathFromString(
      'M403.6608 861.4912c-183.5008 0-332.8-149.2992-332.8-332.8s149.2992-332.8 332.8-332.8 332.8 149.2992 332.8 332.8-149.2992 332.8-332.8 332.8z m0-614.4c-155.2896 0-281.6 126.3104-281.6 281.6s126.3104 281.6 281.6 281.6 281.6-126.3104 281.6-281.6-126.3104-281.6-281.6-281.6z',
      centerX + 2, centerY,
      {
        height: iconWH
      }
    )
    pathEls[1] = createPathFromString(
      'M932.4544 606.0544c4.7616-16.128 8.8576-28.672 12.288-37.632 3.4304-9.0112 7.936-19.2512 13.5168-30.8736h-224.4096v-44.0832h224.4096c-5.7856-12.0832-10.3424-22.4256-13.6704-31.0784s-7.3728-21.0944-12.1344-37.376h11.8272c12.8 22.9888 23.7056 40.3456 32.6656 52.0192 8.96 11.6736 19.456 22.6304 31.4368 32.8704v11.3664c-11.9808 10.24-22.528 21.2992-31.5904 33.0752a440.064 440.064 0 0 0-32.512 51.7632h-11.8272zM576.1536 729.7536H510.5152l-71.4752-119.6032c-14.2848-23.9104-27.3408-40.192-39.2192-48.7936a70.656 70.656 0 0 0-42.5472-12.9536h-40.0384v181.3504H261.5808V298.9568h131.2768c41.8816 0 74.7008 10.0864 98.4576 30.3104 23.7056 20.2752 35.584 48.4864 35.584 84.8384 0 59.6992-31.8976 98.4576-95.6928 116.2752v1.3824c11.8272 5.0176 22.1184 12.1344 30.72 21.4016s19.8144 25.088 33.536 47.5648l80.6912 129.024zM317.2352 347.5968v152.1664h65.6384c25.3952 0 46.0288-7.424 61.8496-22.272s23.808-34.304 23.808-58.4192c0-22.4256-7.2704-39.936-21.7088-52.5312-14.4896-12.5952-35.4816-18.944-63.1296-18.944H317.2352z',
      centerX + 2 + this.iconWH / 4, centerY + 2,
      {
        height: this.iconWH * 0.7
      }
    )
    return zrender.path.mergePath(pathEls, {
      rectHover: true,
      origin: [centerX + iconWH / 1.5, centerY + iconWH / 1.5],
      style: {
        stroke: 'none',
        fill: color
      },
      z: 2
    })
  },
  //enterIcon
  enterIcon(x, y, color) {
    let iconWH = this.iconWH
    let pathEls = []
    let centerX = x - iconWH / 1.5
    let centerY = y - iconWH / 2
    pathEls[0] = createPathFromString(
      'M506.0608 861.4912c-183.5008 0-332.8-149.2992-332.8-332.8s149.2992-332.8 332.8-332.8 332.8 149.2992 332.8 332.8-149.2992 332.8-332.8 332.8z m0-614.4c-155.2896 0-281.6 126.3104-281.6 281.6s126.3104 281.6 281.6 281.6 281.6-126.3104 281.6-281.6-126.3104-281.6-281.6-281.6z',
      centerX + 2, centerY,
      {
        height: iconWH
      }
    )
    pathEls[1] = createPathFromString(
      'M684.4928 716.9536h-65.6384l-71.4752-119.6032c-14.2848-23.9104-27.3408-40.192-39.2192-48.7936a70.656 70.656 0 0 0-42.5472-12.9536h-40.0384v181.3504H369.92V286.1568h131.2768c41.8816 0 74.7008 10.0864 98.4576 30.3104 23.7056 20.2752 35.584 48.4864 35.584 84.8384 0 59.6992-31.8976 98.4576-95.6928 116.2752v1.3824c11.8272 5.0176 22.1184 12.1344 30.72 21.4016s19.8144 25.088 33.536 47.5648l80.6912 129.024zM425.5744 334.7968v152.1664h65.6384c25.3952 0 46.0288-7.424 61.8496-22.272s23.808-34.304 23.808-58.4192c0-22.4256-7.2704-39.936-21.7088-52.5312-14.4896-12.5952-35.4816-18.944-63.1296-18.944H425.5744z',
      centerX + this.iconWH / 4 + 2, centerY + 2,
      {
        height: this.iconWH * 0.7
      }
    )
    return zrender.path.mergePath(pathEls, {
      rectHover: true,
      origin: [centerX + iconWH / 1.5, centerY + iconWH / 1.5],
      style: {
        stroke: 'none',
        fill: color
      },
      z: 2
    })
  },
  //doubleCircle
  doubleCircle(x, y, color) {
    let iconWH = this.iconWH - 2
    let pathEls = []
    let centerX = x - iconWH / 1.5
    let centerY = y - iconWH / 2
    pathEls[0] = createPathFromString(
      'M524.8 861.4912c-183.5008 0-332.8-149.2992-332.8-332.8s149.2992-332.8 332.8-332.8 332.8 149.2992 332.8 332.8-149.2992 332.8-332.8 332.8z m0-614.4c-155.2896 0-281.6 126.3104-281.6 281.6s126.3104 281.6 281.6 281.6 281.6-126.3104 281.6-281.6-126.3104-281.6-281.6-281.6z',
      centerX + 2, centerY,
      {
        height: iconWH
      }
    )
    pathEls[1] = createPathFromString(
      'M520.5504 528.64m-149.3504 0a149.3504 149.3504 0 1 0 298.7008 0 149.3504 149.3504 0 1 0-298.7008 0Z',
      centerX + 1 + this.iconWH / 4, centerY - 1 + this.iconWH / 4,
      {
        height: this.iconWH / 2
      }
    )
    return zrender.path.mergePath(pathEls, {
      rectHover: true,
      origin: [centerX + iconWH / 1.5, centerY + iconWH / 1.5],
      style: {
        stroke: 'none',
        fill: color
      },
      z: 2
    })
  },
  //upTriangle
  upTriangle(x, y, color) {
    let iconWH = this.iconWH - 2
    let pathEls = []
    let centerX = x - iconWH / 1.5
    let centerY = y - iconWH / 2
    pathEls[0] = createPathFromString(
      'M800.36227417 1005.21085608H215.03543091L507.69885253 498.30579627 800.36227417 1005.21085608zM279.29309082 968.13199867h456.8486023L507.69885253 572.4635111 279.29309082 968.13199867z',
      centerX + 1, centerY + iconWH / 2,
      {
        height: iconWH
      }
    )
    return zrender.path.mergePath(pathEls, {
      rectHover: true,
      origin: [centerX + iconWH / 1.5, centerY + iconWH / 1.5],
      style: {
        stroke: 'none',
        fill: color
      },
      z: 2
    })
  },
  //downTriangle
  downTriangle(x, y, color) {
    let iconWH = this.iconWH - 2
    let pathEls = []
    let centerX = x - iconWH / 1.5
    let centerY = y - iconWH / 2
    pathEls[0] = createPathFromString(
      'M512 510.51972457L219.33657837 3.61466475h585.32684326L512 510.51972457zM283.55715942 40.69352217L512 436.36200972 740.44284058 40.69352217H283.55715942z',
      centerX + 1, centerY - iconWH / 2,
      {
        height: iconWH
      }
    )
    return zrender.path.mergePath(pathEls, {
      rectHover: true,
      origin: [centerX + iconWH / 1.5, centerY + iconWH / 1.5],
      style: {
        stroke: 'none',
        fill: color
      },
      z: 2
    })
  },
  //V字
  downV(x, y, color) {
    let iconWH = this.iconWH - 2
    let pathEls = []
    let centerX = x - iconWH / 1.5
    let centerY = y - iconWH / 2
    pathEls[0] = createPathFromString(
      'M560.336 509.13066663l193.92 531.072h-95.712l-144.816-425.472-148.272 425.472H269.744L465.632 509.13066663h94.704z',
      centerX + 2, centerY + iconWH / 2,
      {
        height: iconWH
      }
    )
    return zrender.path.mergePath(pathEls, {
      rectHover: true,
      origin: [centerX + iconWH / 1.5, centerY + iconWH / 1.5],
      style: {
        stroke: 'none',
        fill: color
      },
      z: 2
    })
  },
  //倒V字
  upV(x, y, color) {
    let iconWH = this.iconWH - 2
    let pathEls = []
    let centerX = x - iconWH / 1.5
    let centerY = y - iconWH / 2
    pathEls[0] = createPathFromString(
      'M465.632 514.86933337L269.744-16.20266663h95.712l148.272 425.424 144.816-425.424h95.712l-193.92 531.072H465.632z',
      centerX + 2, centerY - iconWH / 2,
      {
        height: iconWH
      }
    )
    return zrender.path.mergePath(pathEls, {
      rectHover: true,
      origin: [centerX + iconWH / 1.5, centerY + iconWH / 1.5],
      style: {
        stroke: 'none',
        fill: color
      },
      z: 2
    })
  },
  //ring
  ring(x, y, color) {
    let iconWH = this.iconWH - 2
    let pathEls = []
    let centerX = x - iconWH / 1.5
    let centerY = y - iconWH / 2
    pathEls[0] = createPathFromString(
      'M506.0608 505.6m-307.2 0a307.2 307.2 0 1 0 614.4 0 307.2 307.2 0 1 0-614.4 0Z',
      centerX + 2, centerY,
      {
        height: iconWH
      }
    )
    return zrender.path.mergePath(pathEls, {
      rectHover: true,
      origin: [centerX + iconWH / 1.5, centerY + iconWH / 1.5],
      style: {
        stroke: color,
        fill: 'none'
      },
      z: 2
    })
  },
  //createIE
  createIE(x, y, color) {
    let iconWH = this.iconWH
    let pathEls = []
    let centerX = x - iconWH / 1.5
    let centerY = y - iconWH / 2
    pathEls[0] = createPathFromString(
      'M565.0944 106.0864v480.4608l415.6928 240.2304-52.6848 91.136-416.4608-239.4624-415.744 239.4624-52.6848-91.136 415.6928-240.2304V106.0864z',
      centerX, centerY,
      {
        height: iconWH
      }
    )
    return zrender.path.mergePath(pathEls, {
      rectHover: true,
      origin: [centerX + iconWH / 1.5, centerY + iconWH / 1.5],
      style: {
        stroke: 'none',
        fill: color
      },
      z: 2
    })
  }
}

// 绘制线段
export function createLine(x1, y1, x2, y2, style, index) {
  return new zrender.Line({
    name: "L" + index,
    shape: {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2
    },
    style: style,
  });
}

//显示弹窗
function showTipsBox(config, x, y, that) {
  const domTips = document.getElementsByClassName("zrender-tips")
  let name = config.name
  let time = moment(config.time).format("YYYY-MM-DD HH:mm")
  let value = config.value
  let str = ``;
  if (value) {
    str += `<p>${name}: ${value}</p>`;
  } else if (name) {
    str += `<p>${name}</p>`;
  }
  str += `<p>${time}</p>`;
  domTips[0].innerHTML = str;
  let len = (name + value).length > time.length ? (name + value).length : time.length
  let textWidth = len * 8
  let top = y - 50;
  let left = x - textWidth / 2
  let cavaseWidth = 960 * (config.page) + 20
  if (left < 20) { // 画布左侧影藏20像素
    left = 20
  } else if (left + textWidth > cavaseWidth) {
    left = 960 * (config.page) + 20 - textWidth
  }
  domTips[0].setAttribute("style", `position:absolute;top:${top}px;left:${left}px;display:block;font-size:10px;background-color:rgba(0,0,0,.7);padding:3px 2px;border-radius:2px;color:#fff;width:${textWidth}px;text-align:center`)
  that.$store.commit("setShowTimeBox", false);
}

//显示弹窗
function showBloodGasTipsBox(config, x, y, that) {
  const domTips = document.getElementsByClassName("zrender-tips")
  let name = config.name
  let time = moment(config.time).format("YYYY-MM-DD HH:mm")
  let value = config.value
  let str = `<p>${name}</p>`;
  str += `<p>${time}</p>`;
  let count = 2;
  for (let key in config.bloodGas) {
    count++
    str += `<p>${key}: ${config.bloodGas[key]}</p>`;
  }
  domTips[0].innerHTML = str;
  let textWidth = (time).length * 8
  let lineHeight = 20;
  let top = y - lineHeight * count;
  let left = x - textWidth / 2
  if (left < 20) { //画布左侧影藏20像素
    left = 20
  } else if (left > 980) {
    left = 980
  }
  domTips[0].setAttribute("style", `position:absolute;top:${top}px;left:${left}px;display:block;font-size:10px;background-color:rgba(0,0,0,.7);padding:3px 2px;border-radius:2px;color:#fff;width:${textWidth}px;text-align:center`)
  that.$store.commit("setShowTimeBox", false);
}

//隐藏弹窗
function hideTipsBox(that) {
  const domTips = document.getElementsByClassName("zrender-tips")
  domTips[0].setAttribute("style", `display:none`)
  that.$store.commit("setShowTimeBox", true);
}

const createImage = (x, y, style, other) => {
  return new zrender.Image({
    z: other.z || 0,
    style: {
      image: style.image,
      width: 16,
      height: 16
    },
    position: [x, y]
  })
}

const createText = (str, x, y, style = {}) => {
  return new zrender.Text({
    style: {
      text: str,
      fontSize: style.fontSize || 11,
      textFill: style.textFill || '#000'
    },
    position: [x, y]
  })
}

const createBloodGasText = (str, x, y, textAlign) => {
  let lineHeight = 18
  let fontSize = 14
  return new zrender.Text({
    style: {
      text: str,
      textAlign: textAlign,
      textFill: "blue",
      fontSize: fontSize,
      textLineHeight: lineHeight
    },
    position: [x, y],
    z: 2
  })
}
//添加horver事件 el 元素对象 config 一些配置项 x x轴坐标 y y轴坐标 optOver鼠标移入一些属性配置 optOut鼠标移出一些属性配置 
function addLineEvent(zrenderObj, el, config, position, style, index, that) {
  // let positionTemp; 
  // let originTemp; //图形拖拽前的中心点，保存失败时，可回退
  let translatePositionTemp = null; //图形拖拽前的偏移点，保存失败时，可回退
  let posY = null;
  let diffY;
  let initVal;
  let leftLine, rightLine, initLeftShape, initRightShape;
  let isMouseDown = false;
  let ratio = config.ratio;
  el.on('mouseover', function () {
    if (isMouseDown) {
      return;
    }
    // console.log(el)
    diffY = 0;
    leftLine = el.parent.childOfName("L" + index)
    if (leftLine) {
      initLeftShape = Object.assign({}, leftLine.shape)
    }
    rightLine = el.parent.childOfName("L" + (index + 1))
    if (rightLine) {
      initRightShape = Object.assign({}, rightLine.shape)
    }
    // positionTemp = [...position];
    // originTemp = [...el.origin];
    translatePositionTemp = [...el.position];
    showTipsBox(config, position[0], position[1] + translatePositionTemp[1], that);
    el.attr('scale', [1.2, 1.2]);
  }).on('mousedown', function () {
    // console.log("-------------------->config.drag, isMouseDown", config.drag, isMouseDown)
    if (!config.drag || isMouseDown) {
      return
    }
    isMouseDown = true
    initVal = config.value
    zrenderObj.on('mousemove', function (e) {
      let offsetY = e.offsetY;
      if (posY === null) {
        posY = offsetY
      }
      if (e.offsetY < 0) {
        offsetY = 0
      }
      diffY = Math.round(offsetY - posY)
      config.value = config.itemName === "Temp" ? Math.round((initVal - diffY / ratio / 2) * 10) / 10
        : Math.round((initVal - diffY / ratio / 2))
      showTipsBox(config, position[0], position[1] + translatePositionTemp[1] + diffY, that);
      // console.log("----------------diffY", e, initVal, offsetY, posY, diffY)
      // console.log("-------------", translatePositionTemp[1] + diffY, translatePositionTemp[1], diffY)
      el.attr('position', [0, translatePositionTemp[1] + diffY]);
      if (leftLine) {
        leftLine.attr({
          shape: {
            y2: initLeftShape.y2 + diffY
          }
        })
      }
      if (rightLine) {
        rightLine.attr({
          shape: {
            y1: initRightShape.y1 + diffY
          }
        })
      }
    })
    zrenderObj.on('mouseup', function (e) {
      // console.log("----------------mouseup", diffY)
      zrenderObj.off("mousemove");
      zrenderObj.off("mouseup");
      hideTipsBox(that);
      posY = null
      if (!diffY) {
        isMouseDown = false
        return;
      }
      let patientInfo = JSON.parse(localStorage.getItem("patientInfo"));
      let operId = patientInfo.operId;
      AnesRecord.oneMonitoringTimeData({
        operId: operId,
        timepoint: moment(config.time).format("YYYY-MM-DD HH:mm:ss"),
        itemname: config.itemName,
        value: config.itemName === "Temp" ? Math.round((initVal - diffY / ratio / 2) * 10) / 10
        : Math.round((initVal - diffY / ratio / 2))
        //Math.round((initVal - diffY / ratio / 2) * 10) / 10
      }).then((res) => {
        if (res.code === 200) {
          Message.success(res.msg);
          // 防止鼠标没有移出再按下
          translatePositionTemp = [...el.position];
          if (leftLine) {
            initLeftShape = Object.assign({}, leftLine.shape)
          }
          if (rightLine) {
            initRightShape = Object.assign({}, rightLine.shape)
          }
        } else {
          el.attr('position', [0, translatePositionTemp[1]]);
          if (leftLine) {
            leftLine.attr({
              shape: {
                y2: initLeftShape.y2
              }
            })
          }
          if (rightLine) {
            rightLine.attr({
              shape: {
                y1: initRightShape.y1
              }
            })
          }
          Message.error(res.msg);
        }
      }).catch(() => {
      }).finally(() => {
        isMouseDown = false
        el.attr('scale', [1, 1]);
      })
    })
  }).on('mouseout', function () {
    if (isMouseDown) {
      return;
    }
    hideTipsBox(that);
    el.attr('scale', [1, 1]);
  })

}

function addNumberEvent(zrenderObj, el, config, position, that) {
  el.on('mouseover', function () {
    showTipsBox(config, position[0], position[1], that);
  }).on('mouseout', function () {
    hideTipsBox(that);
  })
}

function addBloodGasEvent(zrenderObj, el, config, position, that) {
  el.on('mouseover', function () {
    showBloodGasTipsBox(config, position[0], position[1], that);
  }).on('mouseout', function () {
    hideTipsBox(that);
  })
}

function minutesDiff(startTime, endTime) {
  // 开始时间
  let date1 = +startTime?+startTime:+new Date(startTime);
  // 结束时间
  let date2 = +new Date(endTime);
  let dateDiff = date2 - date1;
  return Math.round(dateDiff / 1000 / 60)
}

export const createLineChart = (zrenderObj, chartData, option, that) => {
  let startTime = new Date(chartData.inRoomDateTime)
  let gridGroup = new zrender.Group();
  let curLineInfo = {
    dot1: null,
    dot2: null
  };//存储一对点
  option.allMonitorInforData && option.allMonitorInforData.forEach((dot, index) => {

    if (dot.value && dot.value != 0) {
      let minutes = minutesDiff(startTime, dot.time);
      let imageWH = 18 // 图片为正方形
      let canvasHeight = 580 + chartData.numberCount * unitWH
      let position;
      let ratio = 1
      if (option.orignalName === "Temp") {
        ratio = 5
        position = [minutes * 4 + unitWH, canvasHeight - dot.value * 10]; //每分钟间隔4像素 初始化时有20像素被隐藏 图片向左移，原心居中 位置 [x, y]
      } else {
        ratio = 1
        position = [minutes * 4 + unitWH, canvasHeight - dot.value * 2]; //每分钟间隔4像素 初始化时有20像素被隐藏 图片向左移，原心居中 位置 [x, y]
      }
      let style = option.styles || {}
      curLineInfo.dot1 = curLineInfo.dot2
      curLineInfo.dot2 = [[...position], dot.isShow]
      style['width'] = imageWH;
      style['height'] = imageWH;
      style['stroke'] = style.curveColor || "#000";

      if (curLineInfo.dot1) {
        if (chartData.connectNulls || (curLineInfo.dot1[1] && curLineInfo.dot2[1])) {
          gridGroup.add(createLine(...curLineInfo.dot1[0], ...curLineInfo.dot2[0], style, index));
        }
      }
      if (dot.isShow) {
        if (createIcon[style.icon]) {
          let iconObj = createIcon[style.icon](position[0], position[1], style.iconColor || '#000')
          let args = [zrenderObj, iconObj, {
            ratio,
            name: option.showName,
            itemName: option.orignalName,
            time: dot.time,
            isShow: dot.isShow,
            value: dot.value,
            drag: option.drag,
            page: chartData.page,
            canvasHeight: canvasHeight
          }, position, style, index];
          addLineEvent(...args, that)
          gridGroup.add(iconObj);
        }
      }
    }
  })
  zrenderObj.add(gridGroup);
}


export const createNumberChart = (zrenderObj, chartData, option, numberSort, that) => {
  let startTime = new Date(chartData.inRoomDateTime)
  let gridGroup = new zrender.Group();
  let style = option.styles || {}

  let allMonitorInforDataLen = option.allMonitorInforData.length
  option.allMonitorInforData && option.allMonitorInforData.forEach((dot, index) => {
    if (dot.value && dot.value != 0) {
      let minutes = minutesDiff(startTime, dot.time);
      let fontSize = 14;
      if (style.intervalTime <= 5) {
        fontSize = 10
      } else {
        fontSize = 14
      }
      // if (index < allMonitorInforDataLen - 1) {
      //   let nextDot = option.allMonitorInforData[index + 1];
      //   let minutes = minutesDiff(dot.time, nextDot.time);
      //   if (minutes > 5 || nextDot.value === null) {
      //     fontSize = 14
      //   } else {
      //     if ((dot.value + '').length > 2) {
      //       fontSize = 10
      //     } else {
      //       fontSize = 14;
      //     }
      //   }
      // }
      style['width'] = dot.value.toString().length * 12;
      let position = [minutes * 4 + unitWH + style['width'] / 2, unitWH * (numberSort - 1) + 5]; //每分钟间隔4像素 初始化时有20像素被隐藏 图片向左移，原心居中 位置 [x, y]
      if (dot.isShow) {
        let textOject = createText(dot.value, position[0] - style['width'] / 2, position[1], {
          textFill: style.curveColor,
          fontSize: fontSize
        })
        gridGroup.add(textOject);
        let args = [zrenderObj, textOject, {
          name: option.showName,
          time: dot.time,
          isShow: dot.isShow,
          value: dot.value
        }, position];
        addNumberEvent(...args, that)
      }
    }
  })
  zrenderObj.add(gridGroup);
}

export const createBloodGasChart = (zrenderObj, chartData, option) => {
  let startTime = new Date(chartData.inRoomDateTime)
  let gridGroup = new zrender.Group();
  let style = option.styles || {}
  option.allBloodGasData && option.allBloodGasData.forEach((dot, index) => {
    let minutes = minutesDiff(startTime, dot.time);
    let str = '';
    let position = [minutes * 4 + unitWH, unitWH * chartData.numberCount + 5]; //每分钟间隔4像素 初始化时有20像素被隐藏 图片向左移，原心居中 位置 [x, y]
    let strWidth = 0
    let lineCount = 4;
    for (let key in dot.bloodGas) {
      lineCount++;
      let val = key + "：" + dot.bloodGas[key]
      strWidth = val.length > strWidth ? val.length : strWidth;
      str += val + '\n'
    }
    let preStr = `${option.showName}\n`;
    // preStr += "-".padStart(strWidth*1.6, '-') + '\n';
    let timeStr = `时间：${moment(dot.time).format("HH:mm")}\n`
    preStr += timeStr;
    strWidth = timeStr.length > strWidth ? timeStr.length : strWidth;
    str = preStr + str;
    let posX = position[0] // - strWidth * 18 / 2
    let textAlign = "left"
    // console.log(moment(dot.time).format("HH:mm"), posX, strWidth, dot.bloodGas, Math.floor((posX - 20) / 960), Math.floor((posX + strWidth * 18 - 20) / 960))
    if (Math.floor((posX - 20) / 960) != Math.floor((posX + strWidth * 18 - 20) / 960)) {
      // position[0] = 960 * Math.floor((posX + strWidth * 18 - 20) / 960) - strWidth * 14 + 20
      textAlign = "right"
    }
    let textOject = createBloodGasText(str, position[0], position[1], textAlign)
    gridGroup.add(textOject);
  })
  zrenderObj.add(gridGroup);
}

export const createNodeOrPlugTubeChart = (zrenderObj, chartData, allNodeOrPlugTube, that) => {
  let startTime = new Date(chartData.inRoomDateTime)
  let gridGroup = new zrender.Group();
  let style = {}
  let imageWH = 18 // 图片为正方形
  let canvasHeight;
  // if (chartData.page > 1) {
  //   canvasHeight = 645 + chartData.numberCount * unitWH - 5 //chartData.numberCount * unitWH
  // } else {
  canvasHeight = 625 + chartData.numberCount * unitWH
  // }
  allNodeOrPlugTube && allNodeOrPlugTube.forEach((dot, index) => {
    if (!dot.isNode) {
      // console.log('-------------------------', dot)
      let minutes = minutesDiff(startTime, dot.startTime);
      let iconHeight = 0;
      iconHeight = 12 * (dot.sort - 1);
      let position = [minutes * 4 + unitWH, canvasHeight - iconHeight];
      style['width'] = imageWH;
      style['height'] = imageWH;
      style['icon'] = '';
      style['iconColor'] = '';
      style['icon'] = dot.style && dot.style.icon;
      style['iconColor'] = dot.style && dot.style.iconColor || "#000";
      allNodeOrPlugTubeLegends.forEach(item => {
        if (item.name == dot.name) {
          style['icon'] = item.icon
          style['iconColor'] = item.iconColor
        }
      })
      if (position[0] < 8 + unitWH && style['icon']) {
        position[0] = 8 + unitWH
      }
      let iconObj
      if (style.icon) {
        iconObj = createIcon[style.icon](position[0], position[1], style.iconColor || "#000")
        let args = [zrenderObj, iconObj, {
          name: dot.itemName || dot.name,
          time: dot.startTime,
          value: '',
          drag: false,
          page: chartData.page
        }, position, style, index];
        addLineEvent(...args, that)
      } else {
        // style['width'] = (index+1).toString().length * 12;
        iconObj = createText(dot.remarkSort, position[0], position[1], {
          textFill: '#000',
          fontSize: '14'
        })
        let args = [zrenderObj, iconObj, {
          name: dot.itemName || dot.name,
          time: dot.startTime,
          isShow: dot.isShow,
          value: dot.remarkSort
        }, position];
        addNumberEvent(...args, that)
      }
      gridGroup.add(iconObj);
    }
  })
  zrenderObj.add(gridGroup);
}

export const createBreathEventChart = (zrenderObj, chartData, option, that) => {
  let startTime = new Date(chartData.inRoomDateTime)
  let gridGroup = new zrender.Group();
  let curLineInfo = {
    dot1: null,
    dot2: null
  };//存储一对点
  let breathStyles = option.breathStyles;
  option.allBreath && option.allBreath.forEach((dot, index) => {
    let minutes = minutesDiff(startTime, dot.time);
    let imageWH = 18 // 图片为正方形
    let canvasHeight = 560 + chartData.numberCount * unitWH
    let position = [minutes * 4 + unitWH, canvasHeight + 20 - dot.frequency * 2]; //每分钟间隔4像素 初始化时有20像素被隐藏 图片向左移，原心居中 位置 [x, y]
    let style;
    breathStyles.forEach(styleItem => {
      if (styleItem.id == dot.itemCode) {
        style = styleItem
      }
    })
    curLineInfo.dot1 = curLineInfo.dot2
    curLineInfo.dot2 = [[...position], dot.isShow]
    style['width'] = imageWH;
    style['height'] = imageWH;
    style['stroke'] = style.curveColor || "#000";
    if (curLineInfo.dot1) {
      if (chartData.connectNulls || (curLineInfo.dot1[1] && curLineInfo.dot2[1])) {
        gridGroup.add(createLine(...curLineInfo.dot1[0], ...curLineInfo.dot2[0], style, index));
      }
    }
    if (dot.isShow) {
      if (createIcon[style.icon]) {
        let iconObj = createIcon[style.icon](position[0], position[1], style.iconColor || '#000')
        let args = [zrenderObj, iconObj, {
          name: dot.name,
          itemName: option.orignalName,
          time: dot.time,
          isShow: dot.isShow,
          value: dot.frequency,
          drag: false,
          page: chartData.page
        }, position, style, index];
        addLineEvent(...args, that)
        gridGroup.add(iconObj);
      }
    }
  })
  zrenderObj.add(gridGroup);
}

//createIE
export const createAnesBreathChart = (zrenderObj, chartData, option, that) => {
  let startTime = new Date(chartData.inRoomDateTime)
  let cavaseWidth = 960 * (chartData.page) + 20
  let posHeight = 552 + chartData.numberCount * unitWH - 60

  option && option.forEach(dot => {
    let minutes = minutesDiff(startTime, dot.time);
    let allBreathChart = dot.allBreathChart
    let gridGroup = new zrender.Group();
    let textOjectIE = createText(allBreathChart[1].value, minutes * 4 + unitWH - allBreathChart[1].value.split(":")[0].length * 5, posHeight - 15 + 20, {
      fontSize: 16,
      textFill: '#000'
    })
    gridGroup.add(textOjectIE);
    let iconObj = createIcon["createIE"](minutes * 4 + unitWH + 6, posHeight + 5 + 20, "#000")
    gridGroup.add(iconObj);
    let textOjectTVE = createText(allBreathChart[0].value, minutes * 4 + unitWH - 10 - allBreathChart[0].value.length * 2, posHeight + 15 + 20, {
      fontSize: 16,
      textFill: '#000'
    })
    gridGroup.add(textOjectTVE);
    let textOjectf = createText(allBreathChart[2].value, minutes * 4 + unitWH + 10, posHeight + 15 + 20, {
      fontSize: 16,
      textFill: '#000'
    })
    gridGroup.add(textOjectf);
    let args = [zrenderObj, gridGroup, {
      time: dot.time
    }, [minutes * 4 + unitWH, posHeight]];
    gridGroup.on('click', function () {
      that.$store.commit("reportCommon/activeAnesBreathChart", dot);
      const domTips = document.getElementsByClassName("zrender-btn-grp")
      let left = minutes * 4 + unitWH + 30
      if (left < 20) { // 画布左侧影藏20像素
        left = 20
      } else if (left > cavaseWidth) {
        left = 960 * (config.page) + 20
      }
      domTips[0].setAttribute("style", `position:absolute;top:${posHeight - 15}px;left:${left}px;display:block;font-size:10px;background-color:rgba(0,0,0,.7);padding:3px 2px;border-radius:2px;color:#fff;text-align:center`)
    })
    addNumberEvent(...args, that)
    zrenderObj.add(gridGroup);
  })
}
